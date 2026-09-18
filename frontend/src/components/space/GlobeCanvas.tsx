import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MOIL_MINES } from '../../data/constants';

export interface MineLocation {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  type: string;
  status: string;
  annualCapacity?: string;
}

export const MOIL_MINES_DATA: MineLocation[] = MOIL_MINES.map((m) => ({
  id: m.id,
  name: m.name,
  state: m.state,
  district: m.district,
  lat: m.lat,
  lng: m.lon,
  type: m.type,
  status: m.status,
  annualCapacity: m.annual_capacity
}));

interface GlobeCanvasProps {
  selectedMineId?: string;
  onSelectMine?: (mine: MineLocation) => void;
  isZooming?: boolean;
}

// WebGL Shaders for Realistic Textured 3D Earth
const VS_SOURCE = `
  attribute vec3 a_position;
  attribute vec2 a_texcoord;
  attribute vec3 a_normal;

  uniform mat4 u_mvpMatrix;
  uniform mat3 u_normalMatrix;

  varying vec2 v_texcoord;
  varying vec3 v_normal;

  void main() {
    v_texcoord = a_texcoord;
    v_normal = normalize(u_normalMatrix * a_normal);
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
  }
`;

const FS_SOURCE = `
  precision mediump float;

  varying vec2 v_texcoord;
  varying vec3 v_normal;

  uniform sampler2D u_dayTexture;
  uniform sampler2D u_nightTexture;
  uniform vec3 u_lightDirection;
  uniform float u_dayReady;
  uniform float u_nightReady;

  void main() {
    vec3 normal = normalize(v_normal);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 lightDir = normalize(u_lightDirection);

    float NdotL = dot(normal, lightDir);
    float dayFactor = smoothstep(-0.15, 0.25, NdotL);

    vec4 dayColor = u_dayReady > 0.5 ? texture2D(u_dayTexture, v_texcoord) : vec4(0.06, 0.12, 0.22, 1.0);
    vec4 nightColor = u_nightReady > 0.5 ? texture2D(u_nightTexture, v_texcoord) : vec4(0.0, 0.0, 0.0, 1.0);

    // Natural sunlight illumination: slightly brighter sunlit hemisphere, natural darker night hemisphere
    vec3 sunColor = vec3(1.14, 1.08, 1.02);
    vec3 ambientColor = vec3(0.05, 0.06, 0.08);
    float diffuse = max(0.0, NdotL);
    vec3 dayLit = dayColor.rgb * (ambientColor + sunColor * diffuse);

    // Ocean Specular Glint
    float isWater = step(dayColor.r, 0.24) * step(dayColor.g, 0.35);
    vec3 halfVec = normalize(lightDir + viewDir);
    float NdotH = max(0.0, dot(normal, halfVec));
    float specular = pow(NdotH, 24.0) * isWater * dayFactor * 0.40;

    // Night city lights (warm amber glow on dark hemisphere)
    vec3 nightLit = nightColor.rgb * vec3(1.15, 0.95, 0.65) * (1.0 - dayFactor) * 1.5;

    // Day & night mix
    vec3 surface = mix(nightLit, dayLit, dayFactor) + vec3(specular * 0.8, specular * 0.9, specular);

    // Natural atmospheric edge:
    // Razor-thin rim hugging only the sunlit limb, tapering to zero on dark night side
    float rim = 1.0 - max(0.0, dot(normal, viewDir));
    float fresnel = pow(rim, 4.5);
    float sunLimb = smoothstep(-0.1, 0.35, NdotL);

    // Subtle daytime atmospheric Rayleigh scattering on illuminated edge only
    vec3 dayAtmos = vec3(0.18, 0.48, 0.88) * fresnel * 0.55;
    // Faint warm terminator rim light right at the sun-shade boundary
    float terminator = smoothstep(0.18, 0.0, abs(NdotL)) * fresnel;
    vec3 warmRim = vec3(0.85, 0.55, 0.25) * terminator * 0.22;

    vec3 atmosphere = dayAtmos * sunLimb + warmRim;

    gl_FragColor = vec4(surface + atmosphere, 1.0);
  }
`;

interface RealisticStar {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  alpha: number;
  dAlpha: number;
  color: string;
  hasSpike?: boolean;
}

// Procedural Pre-Rendered Milky Way & Deep Space Cosmic Dust Layer
function createMilkyWayCanvas(w: number, h: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.floor(w * dpr);
  c.height = Math.floor(h * dpr);
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.scale(dpr, dpr);

  // 1. Deep Space Cosmic Foundation (Deep obsidian and midnight navy space)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
  baseGrad.addColorStop(0, '#010308');
  baseGrad.addColorStop(0.5, '#010206');
  baseGrad.addColorStop(1, '#010308');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Very Restrained Warm Light Near Earth's Illuminated Edge (Upper Right, Sunward Direction)
  // Earth center is at (w * 0.5, h * 0.5), illuminated edge points towards upper right (Sun vector: 0.55, 0.45)
  const baseRadius = Math.min(w, h) * 0.38;
  const sunWarmX = w * 0.5 + baseRadius * 0.72;
  const sunWarmY = h * 0.5 - baseRadius * 0.65;
  const sunGlowRadius = Math.max(w, h) * 0.42;
  const sunGlow = ctx.createRadialGradient(sunWarmX, sunWarmY, 0, sunWarmX, sunWarmY, sunGlowRadius);
  sunGlow.addColorStop(0, 'rgba(255, 230, 195, 0.035)');
  sunGlow.addColorStop(0.35, 'rgba(255, 210, 160, 0.015)');
  sunGlow.addColorStop(0.70, 'rgba(2, 4, 10, 0.003)');
  sunGlow.addColorStop(1, 'rgba(1, 3, 8, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, w, h);

  // 3. Cinematic Milky Way Galactic Plane (Subtle, distant diagonal cosmic dust texture)
  ctx.save();
  ctx.translate(w * 0.52, h * 0.48);
  ctx.rotate(-0.58); // ~ -33 degrees diagonal

  const bandLength = Math.sqrt(w * w + h * h) * 1.35;
  const halfLen = bandLength / 2;

  // Layer 3A: Broad galactic mist (subtle midnight slate & deep indigo)
  const broadDust = ctx.createLinearGradient(0, -220, 0, 220);
  broadDust.addColorStop(0, 'rgba(1, 3, 8, 0)');
  broadDust.addColorStop(0.3, 'rgba(10, 20, 42, 0.05)');
  broadDust.addColorStop(0.5, 'rgba(14, 30, 62, 0.08)');
  broadDust.addColorStop(0.7, 'rgba(10, 22, 46, 0.05)');
  broadDust.addColorStop(1, 'rgba(1, 3, 8, 0)');
  ctx.fillStyle = broadDust;
  ctx.fillRect(-halfLen, -220, bandLength, 440);

  // Layer 3B: Core subtle cosmic dust rift (restrained cyan/slate tones)
  const coreGlow = ctx.createLinearGradient(0, -80, 0, 80);
  coreGlow.addColorStop(0, 'rgba(1, 3, 8, 0)');
  coreGlow.addColorStop(0.35, 'rgba(16, 42, 74, 0.06)');
  coreGlow.addColorStop(0.5, 'rgba(22, 54, 90, 0.08)');
  coreGlow.addColorStop(0.65, 'rgba(16, 40, 70, 0.05)');
  coreGlow.addColorStop(1, 'rgba(1, 3, 8, 0)');
  ctx.fillStyle = coreGlow;
  ctx.fillRect(-halfLen, -80, bandLength, 160);

  // Layer 3C: Interstellar Dark Dust Filament (carves organic depth)
  const darkRift = ctx.createLinearGradient(0, -18, 0, 18);
  darkRift.addColorStop(0, 'rgba(1, 3, 8, 0)');
  darkRift.addColorStop(0.5, 'rgba(1, 3, 8, 0.22)');
  darkRift.addColorStop(1, 'rgba(1, 3, 8, 0)');
  ctx.fillStyle = darkRift;
  ctx.fillRect(-halfLen * 0.85, -18, bandLength * 0.85, 36);

  // Layer 3D: Faint, distant micro-stellar dust along the band
  let seed = 42;
  const pseudoRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const microStarCount = 110;
  for (let i = 0; i < microStarCount; i++) {
    const px = (pseudoRand() - 0.5) * bandLength;
    const py = (pseudoRand() - 0.5 + (pseudoRand() - 0.5) * 0.5) * 140;
    const pr = pseudoRand() * 0.5 + 0.25;
    const pa = pseudoRand() * 0.12 + 0.05;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(215, 230, 255, ${pa.toFixed(3)})`;
    ctx.fill();
  }

  ctx.restore();

  // 4. Readability Protection Vignettes (100% crisp title & CTA contrast)
  const topVignette = ctx.createLinearGradient(0, 0, 0, h * 0.35);
  topVignette.addColorStop(0, 'rgba(1, 3, 8, 0.88)');
  topVignette.addColorStop(0.65, 'rgba(1, 3, 8, 0.40)');
  topVignette.addColorStop(1, 'rgba(1, 3, 8, 0)');
  ctx.fillStyle = topVignette;
  ctx.fillRect(0, 0, w, h * 0.35);

  const bottomVignette = ctx.createLinearGradient(0, h * 0.68, 0, h);
  bottomVignette.addColorStop(0, 'rgba(1, 3, 8, 0)');
  bottomVignette.addColorStop(0.45, 'rgba(1, 3, 8, 0.45)');
  bottomVignette.addColorStop(1, 'rgba(1, 3, 8, 0.90)');
  ctx.fillStyle = bottomVignette;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  return c;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  selectedMineId = 'MINE_BALAGHAT_01',
  onSelectMine,
  isZooming = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);

  // Rotation angles in radians
  // -80.2° yaw aligns India (~80°E) directly facing the user along +Z
  // +20° pitch tilts India (~22°N) into the vertical optical center
  const yawRef = useRef<number>(-80.2 * (Math.PI / 180));
  const pitchRef = useRef<number>(20.0 * (Math.PI / 180));

  // Interaction & Velocity
  const isDraggingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const idleFramesRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Pre-rendered Milky Way canvas cache
  const milkyWayCacheRef = useRef<HTMLCanvasElement | null>(null);

  // WebGL Resources Ref
  const webglStateRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    vertexBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    indexCount: number;
    dayTexture: WebGLTexture;
    nightTexture: WebGLTexture;
    dayReady: boolean;
    nightReady: boolean;
    locations: {
      mvpMatrix: WebGLUniformLocation;
      normalMatrix: WebGLUniformLocation;
      lightDirection: WebGLUniformLocation;
      dayTexture: WebGLUniformLocation;
      nightTexture: WebGLUniformLocation;
      dayReady: WebGLUniformLocation;
      nightReady: WebGLUniformLocation;
      position: number;
      texcoord: number;
      normal: number;
    };
  } | null>(null);

  // Realistic Stars Field
  const starsRef = useRef<RealisticStar[]>([]);

  // Initialize WebGL for 3D Earth
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (!glCanvas) return;

    const gl = glCanvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      depth: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false
    });

    if (!gl) {
      console.warn('WebGL not available in browser');
      return;
    }

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const locations = {
      mvpMatrix: gl.getUniformLocation(program, 'u_mvpMatrix')!,
      normalMatrix: gl.getUniformLocation(program, 'u_normalMatrix')!,
      lightDirection: gl.getUniformLocation(program, 'u_lightDirection')!,
      dayTexture: gl.getUniformLocation(program, 'u_dayTexture')!,
      nightTexture: gl.getUniformLocation(program, 'u_nightTexture')!,
      dayReady: gl.getUniformLocation(program, 'u_dayReady')!,
      nightReady: gl.getUniformLocation(program, 'u_nightReady')!,
      position: gl.getAttribLocation(program, 'a_position'),
      texcoord: gl.getAttribLocation(program, 'a_texcoord'),
      normal: gl.getAttribLocation(program, 'a_normal')
    };

    // Generate Sphere Mesh (64 x 64 grid)
    const latBands = 64;
    const longBands = 64;
    const vertexData: number[] = [];

    for (let i = 0; i <= latBands; i++) {
      const lat = (0.5 - i / latBands) * Math.PI;
      const sinLat = Math.sin(lat);
      const cosLat = Math.cos(lat);

      for (let j = 0; j <= longBands; j++) {
        const lng = (j / longBands) * 2 * Math.PI - Math.PI;
        const sinLng = Math.sin(lng);
        const cosLng = Math.cos(lng);

        const x = cosLat * sinLng;
        const y = sinLat;
        const z = cosLat * cosLng;

        const u = j / longBands;
        const v = 1.0 - i / latBands;

        vertexData.push(x, y, z, u, v, x, y, z);
      }
    }

    const indexData: number[] = [];
    for (let i = 0; i < latBands; i++) {
      for (let j = 0; j < longBands; j++) {
        const first = i * (longBands + 1) + j;
        const second = first + (longBands + 1);
        indexData.push(first, second, first + 1);
        indexData.push(second, second + 1, first + 1);
      }
    }

    const vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

    const dayTexture = gl.createTexture()!;
    const nightTexture = gl.createTexture()!;

    const state = {
      gl,
      program,
      vertexBuffer,
      indexBuffer,
      indexCount: indexData.length,
      dayTexture,
      nightTexture,
      dayReady: false,
      nightReady: false,
      locations
    };
    webglStateRef.current = state;

    // Load Earth day texture
    const dayImg = new Image();
    dayImg.crossOrigin = 'anonymous';
    dayImg.src = '/earth.jpg';
    dayImg.onload = () => {
      if (!webglStateRef.current) return;
      gl.bindTexture(gl.TEXTURE_2D, dayTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dayImg);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      state.dayReady = true;
    };

    // Load Earth night lights texture
    const nightImg = new Image();
    nightImg.crossOrigin = 'anonymous';
    nightImg.src = '/earth_lights.png';
    nightImg.onload = () => {
      if (!webglStateRef.current) return;
      gl.bindTexture(gl.TEXTURE_2D, nightTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nightImg);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      state.nightReady = true;
    };

    return () => {
      webglStateRef.current = null;
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteTexture(dayTexture);
      gl.deleteTexture(nightTexture);
      gl.deleteProgram(program);
    };
  }, []);

  // Main Render Loop: Deep Space Background + 3D Earth + Interactive HUD
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const glCanvas = glCanvasRef.current;
    const hudCanvas = hudCanvasRef.current;
    if (!bgCanvas || !glCanvas || !hudCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const hudCtx = hudCanvas.getContext('2d');
    if (!bgCtx || !hudCtx) return;

    let animId: number;

    // Generate realistic stars with natural spectral color temperatures
    const initStars = (w: number, h: number) => {
      const stars: RealisticStar[] = [];
      const count = Math.min(120, Math.floor((w * h) / 8000));

      const spectralColors = [
        '215, 235, 255', // 40% cool blue-white (O/B type)
        '215, 235, 255',
        '245, 248, 255', // 35% pure white (A/F type)
        '245, 248, 255',
        '255, 238, 205', // 20% warm solar amber (G/K type)
        '255, 195, 175'  // 5% faint red giant (M type)
      ];

      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        const col = spectralColors[Math.floor(Math.random() * spectralColors.length)];
        const isBright = rand > 0.96;
        const isMedium = rand > 0.80;

        const r = isBright
          ? Math.random() * 0.4 + 0.95
          : isMedium
          ? Math.random() * 0.3 + 0.60
          : Math.random() * 0.25 + 0.35;

        const baseAlpha = isBright
          ? Math.random() * 0.20 + 0.55
          : isMedium
          ? Math.random() * 0.20 + 0.30
          : Math.random() * 0.15 + 0.12;

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          baseAlpha,
          alpha: baseAlpha,
          dAlpha: (Math.random() - 0.5) * 0.004,
          color: col,
          hasSpike: isBright && Math.random() > 0.65
        });
      }
      starsRef.current = stars;
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = glCanvas.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      bgCanvas.width = w * dpr;
      bgCanvas.height = h * dpr;
      glCanvas.width = w * dpr;
      glCanvas.height = h * dpr;
      hudCanvas.width = w * dpr;
      hudCanvas.height = h * dpr;

      initStars(w, h);

      // Pre-render Milky Way canvas on resize
      milkyWayCacheRef.current = createMilkyWayCanvas(w, h, dpr);

      const state = webglStateRef.current;
      if (state) {
        state.gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = glCanvas.clientWidth;
      const h = glCanvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.38;
      const radius = isZooming ? baseRadius * 1.45 : baseRadius;

      // 1. Handle Inertia & Idle Auto-Rotation
      if (!isDraggingRef.current) {
        if (Math.abs(velRef.current.x) > 0.0001 || Math.abs(velRef.current.y) > 0.0001) {
          yawRef.current += velRef.current.x;
          pitchRef.current = Math.max(-1.1, Math.min(1.1, pitchRef.current + velRef.current.y));
          velRef.current.x *= 0.92;
          velRef.current.y *= 0.92;
        } else {
          idleFramesRef.current += 1;
          if (idleFramesRef.current > 45 && !isZooming) {
            yawRef.current += 0.0008; // Gentle prograde rotation (0.046°/frame)
          }
        }
      }

      const yaw = yawRef.current;
      const pitch = pitchRef.current;

      // 2. LAYER 1: Deep Space Background (Milky Way + Stars + Earth Rim Lighting)
      bgCtx.save();
      bgCtx.scale(dpr, dpr);
      bgCtx.clearRect(0, 0, w, h);

      // 2A. Draw Pre-Rendered Milky Way Cosmic Canvas
      if (milkyWayCacheRef.current) {
        bgCtx.drawImage(milkyWayCacheRef.current, 0, 0, w, h);
      }

      // 2B. Twinkling Field Stars
      for (const s of starsRef.current) {
        s.alpha += s.dAlpha;
        if (s.alpha > s.baseAlpha * 1.25 || s.alpha < s.baseAlpha * 0.75) {
          s.dAlpha = -s.dAlpha;
        }

        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(${s.color}, ${s.alpha.toFixed(3)})`;
        bgCtx.fill();

        // Subtle diffraction spikes on rare bright stars
        if (s.hasSpike && s.alpha > 0.70) {
          bgCtx.strokeStyle = `rgba(${s.color}, ${(s.alpha * 0.45).toFixed(3)})`;
          bgCtx.lineWidth = 0.75;
          bgCtx.beginPath();
          bgCtx.moveTo(s.x - 4, s.y);
          bgCtx.lineTo(s.x + 4, s.y);
          bgCtx.moveTo(s.x, s.y - 4);
          bgCtx.lineTo(s.x, s.y + 4);
          bgCtx.stroke();
        }
      }

      bgCtx.restore();

      // 3. LAYER 2: 3D WebGL Realistic Earth (Preserved 100% Unchanged)
      const state = webglStateRef.current;
      if (state) {
        const { gl, program, vertexBuffer, indexBuffer, indexCount, dayTexture, nightTexture, locations } = state;

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.useProgram(program);

        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);

        const normalMatrix = new Float32Array([
          cosY, -sinY * -sinP, -sinY * cosP,
          0, cosP, sinP,
          sinY, cosY * -sinP, cosY * cosP
        ]);
        gl.uniformMatrix3fv(locations.normalMatrix, false, normalMatrix);

        const sx = radius / cx;
        const sy = radius / cy;
        const mvpMatrix = new Float32Array([
          cosY * sx, (-sinY * -sinP) * sy, (-sinY * cosP) * 0.5, 0,
          0, cosP * sy, sinP * 0.5, 0,
          sinY * sx, (cosY * -sinP) * sy, (cosY * cosP) * 0.5, 0,
          0, 0, 0, 1
        ]);
        gl.uniformMatrix4fv(locations.mvpMatrix, false, mvpMatrix);

        gl.uniform3f(locations.lightDirection, 0.55, 0.45, 0.70);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, dayTexture);
        gl.uniform1i(locations.dayTexture, 0);
        gl.uniform1f(locations.dayReady, state.dayReady ? 1.0 : 0.0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, nightTexture);
        gl.uniform1i(locations.nightTexture, 1);
        gl.uniform1f(locations.nightReady, state.nightReady ? 1.0 : 0.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        const stride = 32;
        gl.enableVertexAttribArray(locations.position);
        gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(locations.texcoord);
        gl.vertexAttribPointer(locations.texcoord, 2, gl.FLOAT, false, stride, 12);

        gl.enableVertexAttribArray(locations.normal);
        gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, stride, 20);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
      }

      // 4. LAYER 3: 2D HUD (Concession Markers & Labels on India)
      hudCtx.save();
      hudCtx.scale(dpr, dpr);
      hudCtx.clearRect(0, 0, w, h);

      // Project 3D Lat/Lng to Screen
      const projectCoords = (latDeg: number, lngDeg: number) => {
        const phi = (latDeg * Math.PI) / 180;
        const lambda = (lngDeg * Math.PI) / 180;

        const x = Math.cos(phi) * Math.sin(lambda);
        const y = Math.sin(phi);
        const z = Math.cos(phi) * Math.cos(lambda);

        const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
        const y1 = y;
        const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);

        const x2 = x1;
        const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);

        const screenX = cx + x2 * radius;
        const screenY = cy - y2 * radius;
        const isVisible = z2 > 0.05;

        return { x: screenX, y: screenY, visible: isVisible, depth: z2 };
      };

      // Render all 8 official MOIL concession locations as consistent, elegant gold circular markers
      let hoveredMine: MineLocation | null = null;
      let hoveredPt: { x: number; y: number } | null = null;
      const mousePos = mousePosRef.current;

      MOIL_MINES_DATA.forEach((mine) => {
        const pt = projectCoords(mine.lat, mine.lng);
        if (!pt.visible) return;

        // Check if cursor is hovering near this concession (hit radius: 10px)
        if (mousePos && !isDraggingRef.current) {
          const dx = mousePos.x - pt.x;
          const dy = mousePos.y - pt.y;
          if (dx * dx + dy * dy <= 100) {
            hoveredMine = mine;
            hoveredPt = pt;
          }
        }

        // 1. Subtle restrained warm ambient glow
        hudCtx.beginPath();
        hudCtx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
        hudCtx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        hudCtx.fill();

        // 2. Subtle dark outline for clean contrast against the Earth's surface
        hudCtx.beginPath();
        hudCtx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        hudCtx.fillStyle = '#090d16';
        hudCtx.fill();

        // 3. Small gold/yellow circular center
        hudCtx.beginPath();
        hudCtx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        hudCtx.fillStyle = '#f59e0b'; // Amber-500 gold
        hudCtx.fill();

        // 4. Crisp micro-core
        hudCtx.beginPath();
        hudCtx.arc(pt.x, pt.y, 1, 0, Math.PI * 2);
        hudCtx.fillStyle = '#fef3c7'; // Amber-100
        hudCtx.fill();
      });

      // Optional Unobtrusive Hover Tooltip: shows ONLY the concession name
      if (hoveredMine && hoveredPt) {
        const cleanName = (hoveredMine as MineLocation).name
          .replace(/Manganese|Mine|\(.*\)/gi, '')
          .trim();

        hudCtx.font = '500 10px system-ui, -apple-system, sans-serif';
        const textWidth = hudCtx.measureText(cleanName).width;
        const padX = 7;
        const boxWidth = textWidth + padX * 2;
        const boxHeight = 18;
        const boxX = (hoveredPt as { x: number; y: number }).x - boxWidth / 2;
        const boxY = (hoveredPt as { x: number; y: number }).y - boxHeight - 6;

        // Subtle dark pill container
        hudCtx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        hudCtx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        hudCtx.lineWidth = 1;

        const cr = 4;
        hudCtx.beginPath();
        hudCtx.moveTo(boxX + cr, boxY);
        hudCtx.lineTo(boxX + boxWidth - cr, boxY);
        hudCtx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + cr);
        hudCtx.lineTo(boxX + boxWidth, boxY + boxHeight - cr);
        hudCtx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - cr, boxY + boxHeight);
        hudCtx.lineTo(boxX + cr, boxY + boxHeight);
        hudCtx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - cr);
        hudCtx.lineTo(boxX, boxY + cr);
        hudCtx.quadraticCurveTo(boxX, boxY, boxX + cr, boxY);
        hudCtx.closePath();
        hudCtx.fill();
        hudCtx.stroke();

        // Concession name only (NO coordinates, NO priority, NO telemetry)
        hudCtx.fillStyle = '#fbbf24';
        hudCtx.fillText(cleanName, boxX + padX, boxY + 12.5);
      }

      hudCanvas.style.cursor = isDraggingRef.current
        ? 'grabbing'
        : hoveredMine
        ? 'pointer'
        : 'grab';

      hudCtx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedMineId, isZooming]);

  // Pointer Interaction Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0 };
    idleFramesRef.current = 0;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const target = hudCanvasRef.current;
    if (target) {
      const rect = target.getBoundingClientRect();
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    const sens = 0.005;
    yawRef.current += dx * sens;
    pitchRef.current = Math.max(-1.1, Math.min(1.1, pitchRef.current + dy * sens));

    velRef.current = { x: dx * 0.0035, y: dy * 0.0035 };
    idleFramesRef.current = 0;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    try {
      target.releasePointerCapture(e.pointerId);
    } catch {}
    isDraggingRef.current = false;
    idleFramesRef.current = 0;
  }, []);

  const handlePointerLeave = useCallback(() => {
    mousePosRef.current = null;
    isDraggingRef.current = false;
    idleFramesRef.current = 0;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-none"
    >
      {/* 1. Deep Space Cosmic Background Canvas (Milky Way Dust, Nebulae, Stars, Earth Rim Glow) */}
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* 2. 3D WebGL Realistic Earth Canvas (Solid Sphere Naturally Occludes Background) */}
      <canvas
        ref={glCanvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* 3. 2D Interactive HUD Canvas (MOIL Concession Markers & Pointer Drag Controls) */}
      <canvas
        ref={hudCanvasRef}
        className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
};
