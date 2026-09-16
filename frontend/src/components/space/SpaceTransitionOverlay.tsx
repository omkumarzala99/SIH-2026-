import React, { useEffect, useState } from 'react';
import { Compass, Satellite, Navigation, ArrowDown } from 'lucide-react';

interface SpaceTransitionOverlayProps {
  targetName: string;
  targetLat: number;
  targetLng: number;
  onTransitionComplete: () => void;
}

export const SpaceTransitionOverlay: React.FC<SpaceTransitionOverlayProps> = ({
  targetName,
  targetLat,
  targetLng,
  onTransitionComplete
}) => {
  const [stage, setStage] = useState<number>(0);
  const stages = [
    { label: 'SPACE ORBIT', detail: 'Orbital altitude 650km • Sentinel-2 constellation locked' },
    { label: 'EARTH TRANSIT', detail: 'Descending atmospheric ingress • Sub-continent vector active' },
    { label: 'INDIA OVERFLIGHT', detail: 'Central Mining Province • Sausar Orogenic Belt detected' },
    { label: 'REGIONAL VECTOR', detail: 'Balaghat Concession • Pit benchmarks acquired' },
    { label: targetName.toUpperCase(), detail: `Target Coordinates: ${targetLat.toFixed(4)}°N, ${targetLng.toFixed(4)}°E • Initializing GIS telemetry` }
  ];

  useEffect(() => {
    // 5-stage sequential zoom flight animation
    const t1 = setTimeout(() => setStage(1), 250);
    const t2 = setTimeout(() => setStage(2), 550);
    const t3 = setTimeout(() => setStage(3), 850);
    const t4 = setTimeout(() => setStage(4), 1150);
    const tFinal = setTimeout(() => {
      onTransitionComplete();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tFinal);
    };
  }, [onTransitionComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg select-none pointer-events-none">
      <div className="text-center max-w-lg px-6 py-8">
        {/* Animated Radar Reticle */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border border-sky-400/40 animate-spin" style={{ animationDuration: '4s' }}></div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/20 to-sky-500/20 border border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Satellite className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* HUD Stages Progression */}
        <div className="flex items-center justify-center space-x-2 text-xs font-mono text-slate-400 mb-4">
          {stages.map((s, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  idx === stage
                    ? 'bg-amber-500 text-slate-950 scale-110'
                    : idx < stage
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {s.label.split(' ')[0]}
              </span>
              {idx < stages.length - 1 && <span className="text-slate-600">&rarr;</span>}
            </div>
          ))}
        </div>

        {/* Current Active Stage Text */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-wider">
            {stages[stage].label}
          </h2>
          <p className="text-xs text-amber-300 font-mono">
            {stages[stage].detail}
          </p>
        </div>

        {/* Telemetry Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-6 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((stage + 1) / stages.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
