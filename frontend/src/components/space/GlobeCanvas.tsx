import React, { useEffect, useRef, useState } from 'react';

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

export const MOIL_MINES_DATA: MineLocation[] = [
  {
    id: 'MINE_BALAGHAT_01',
    name: 'Balaghat Mine (Bharveli)',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.8502,
    lng: 80.2274,
    type: 'Underground (Deepest in Asia)',
    status: 'Operational — Priority Concession',
    annualCapacity: '650,000 Tonnes/Yr'
  },
  {
    id: 'MINE_TIRODI_03',
    name: 'Tirodi Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.6836,
    lng: 79.7247,
    type: 'Underground / Open Cast',
    status: 'Operational',
    annualCapacity: '280,000 Tonnes/Yr'
  },
  {
    id: 'MINE_DONGRI_04',
    name: 'Dongri Buzurg Mine',
    state: 'Maharashtra',
    district: 'Bhandara',
    lat: 21.5500,
    lng: 79.6833,
    type: 'Open Cast / Beneficiation Plant',
    status: 'Operational',
    annualCapacity: '420,000 Tonnes/Yr'
  },
  {
    id: 'MINE_GUMGAON_02',
    name: 'Gumgaon Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.3833,
    lng: 78.9833,
    type: 'Underground',
    status: 'Operational',
    annualCapacity: '180,000 Tonnes/Yr'
  },
  {
    id: 'MINE_KANDRI_05',
    name: 'Kandri Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.4167,
    lng: 79.2667,
    type: 'Underground',
    status: 'Operational',
    annualCapacity: '210,000 Tonnes/Yr'
  },
  {
    id: 'MINE_MANSAR_06',
    name: 'Mansar Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.4000,
    lng: 79.2500,
    type: 'Open Cast',
    status: 'Operational',
    annualCapacity: '150,000 Tonnes/Yr'
  },
  {
    id: 'MINE_UKWA_08',
    name: 'Ukwa Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.9667,
    lng: 80.4667,
    type: 'Underground',
    status: 'Operational',
    annualCapacity: '140,000 Tonnes/Yr'
  },
  {
    id: 'MINE_CHIKLA_07',
    name: 'Chikla Mine',
    state: 'Maharashtra',
    district: 'Bhandara',
    lat: 21.5667,
    lng: 79.7500,
    type: 'Underground',
    status: 'Operational',
    annualCapacity: '240,000 Tonnes/Yr'
  },
  {
    id: 'MINE_SITAPATORE_09',
    name: 'Sitapatore Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.7000,
    lng: 79.6667,
    type: 'Underground',
    status: 'Operational',
    annualCapacity: '120,000 Tonnes/Yr'
  },
  {
    id: 'MINE_BELDONGRI_10',
    name: 'Beldongri Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.3833,
    lng: 79.1500,
    type: 'Underground',
    status: 'Operational',
    annualCapacity: '110,000 Tonnes/Yr'
  }
];

// Simplified polygon outlines of major continents (lat, lng in degrees)
const CONTINENT_POLYGONS: number[][][] = [
  // India & South Asia sub-continent contour
  [
    [35, 75], [32, 79], [28, 88], [26, 90], [22, 89], [20, 86],
    [16, 82], [13, 80], [10, 80], [8, 77], [10, 76], [15, 74],
    [19, 73], [23, 69], [24, 68], [28, 70], [32, 72], [35, 75]
  ],
  // Eurasia outline
  [
    [70, 30], [68, 60], [65, 100], [60, 140], [50, 140], [40, 120],
    [30, 105], [20, 100], [10, 100], [20, 85], [30, 65], [35, 50],
    [40, 30], [45, 15], [55, 10], [65, 15], [70, 30]
  ],
  // Africa
  [
    [35, -5], [30, 30], [10, 50], [0, 42], [-15, 40], [-34, 20],
    [-30, 15], [-10, 10], [5, 2], [15, -17], [30, -10], [35, -5]
  ],
  // Australia
  [
    [-15, 130], [-12, 136], [-15, 145], [-25, 152], [-35, 150],
    [-38, 140], [-34, 118], [-25, 114], [-20, 118], [-15, 130]
  ],
  // North America
  [
    [70, -160], [60, -140], [50, -125], [30, -115], [20, -105],
    [15, -90], [25, -80], [35, -75], [45, -65], [55, -60],
    [65, -65], [70, -100], [70, -160]
  ],
  // South America
  [
    [10, -75], [5, -50], [-10, -35], [-25, -45], [-40, -60],
    [-55, -68], [-50, -75], [-30, -72], [-15, -75], [0, -80], [10, -75]
  ]
];

interface GlobeCanvasProps {
  selectedMineId?: string;
  onSelectMine?: (mine: MineLocation) => void;
  isZooming?: boolean;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  selectedMineId = 'M01',
  onSelectMine,
  isZooming = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(-75); // Center India towards user initially
  const pitchRef = useRef<number>(18);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredMine, setHoveredMine] = useState<MineLocation | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let stars: { x: number; y: number; r: number; alpha: number; dAlpha: number }[] = [];

    // Initialize stars
    const initStars = (width: number, height: number) => {
      stars = [];
      const count = Math.min(220, Math.floor((width * height) / 4500));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.7 + 0.2,
          dAlpha: (Math.random() - 0.5) * 0.015
        });
      }
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initStars(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Auto-rotation when not dragging or zooming
      if (!isDraggingRef.current && !isZooming) {
        rotationRef.current += 0.12;
        if (rotationRef.current > 180) rotationRef.current -= 360;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Starfield
      for (const s of stars) {
        s.alpha += s.dAlpha;
        if (s.alpha > 0.9 || s.alpha < 0.2) s.dAlpha = -s.dAlpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${s.alpha})`;
        ctx.fill();
      }

      // Globe center & radius
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;

      // 2. Deep Space Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.35);
      glowGrad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
      glowGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 3. Globe Base Sphere (Dark Obsidian Ocean)
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
      oceanGrad.addColorStop(0, '#0f2942');
      oceanGrad.addColorStop(0.6, '#081726');
      oceanGrad.addColorStop(1, '#020617');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Helper function to project lat/lng to 3D sphere -> 2D screen
      const project = (lat: number, lng: number): { x: number; y: number; visible: boolean; depth: number } => {
        const phi = (lat * Math.PI) / 180;
        const theta = ((lng + rotationRef.current) * Math.PI) / 180;
        const pitchRad = (pitchRef.current * Math.PI) / 180;

        // 3D coordinates on unit sphere
        const x3 = Math.cos(phi) * Math.sin(theta);
        let y3 = Math.sin(phi);
        let z3 = Math.cos(phi) * Math.cos(theta);

        // Pitch tilt around X axis
        const y3_tilted = y3 * Math.cos(pitchRad) - z3 * Math.sin(pitchRad);
        const z3_tilted = y3 * Math.sin(pitchRad) + z3 * Math.cos(pitchRad);

        const x = cx + x3 * radius;
        const y = cy - y3_tilted * radius;
        const visible = z3_tilted > 0; // facing viewer

        return { x, y, visible, depth: z3_tilted };
      };

      // 4. Latitude & Longitude Meridians (Grid Lines)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;

      // Parallels
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 10) {
          const pt = project(lat, lng);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Meridians
      for (let lng = -180; lng < 180; lng += 45) {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = project(lat, lng);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 5. Continents
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1.2;

      for (const poly of CONTINENT_POLYGONS) {
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < poly.length; i++) {
          const pt = project(poly[i][0], poly[i][1]);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        if (started) {
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      // 6. Highlight India Region with Warm Manganese Tint
      const indiaCenter = project(21.5, 80.0);
      if (indiaCenter.visible) {
        const indiaGlow = ctx.createRadialGradient(
          indiaCenter.x,
          indiaCenter.y,
          5,
          indiaCenter.x,
          indiaCenter.y,
          radius * 0.38
        );
        indiaGlow.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        indiaGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
        indiaGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = indiaGlow;
        ctx.beginPath();
        ctx.arc(indiaCenter.x, indiaCenter.y, radius * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. MOIL Concession Markers
      for (const mine of MOIL_MINES_DATA) {
        const pt = project(mine.lat, mine.lng);
        if (!pt.visible) continue;

        const isSelected = mine.id === selectedMineId;
        const isHovered = hoveredMine?.id === mine.id;

        // Outer Target Ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 9 : 6, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#f59e0b' : (isHovered ? '#38bdf8' : 'rgba(245, 158, 11, 0.7)');
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.stroke();

        // Inner Core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#fbbf24' : '#38bdf8';
        ctx.fill();

        // Label for Selected Concession
        if (isSelected || isHovered) {
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 4;
          ctx.fillText(mine.name, pt.x + 12, pt.y + 4);
          ctx.shadowBlur = 0;
        }
      }

      // 8. Globe Horizon / Rim Shading
      const rimShade = ctx.createRadialGradient(cx, cy, radius * 0.88, cx, cy, radius);
      rimShade.addColorStop(0, 'rgba(0,0,0,0)');
      rimShade.addColorStop(1, 'rgba(2, 6, 23, 0.75)');
      ctx.fillStyle = rimShade;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore();

      // Outer Specular Rim
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedMineId, hoveredMine, isZooming]);

  // Interactive Dragging Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      rotationRef.current += dx * 0.45;
      pitchRef.current = Math.max(-45, Math.min(65, pitchRef.current - dy * 0.35));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};
