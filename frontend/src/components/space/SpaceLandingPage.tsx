import React, { useState } from 'react';
import { GlobeCanvas } from './GlobeCanvas';
import { SpaceTransitionOverlay } from './SpaceTransitionOverlay';
import { ArrowRight } from 'lucide-react';

interface SpaceLandingPageProps {
  onEnterWorkspace: (lat: number, lng: number, mineName: string, mineId: string, directTab?: string) => void;
}

export const SpaceLandingPage: React.FC<SpaceLandingPageProps> = ({ onEnterWorkspace }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLaunchWorkspace = () => {
    setIsTransitioning(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 3D Earth & Starfield (Interactive Full Screen Background) */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas
          selectedMineId="MINE_BALAGHAT_01"
          isZooming={isTransitioning}
        />
      </div>

      {/* Top Brand Bar - Dignified & Professional */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-md border border-amber-400">
            M
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-sm tracking-wider">MOIL LIMITED</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                Govt. of India
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Ministry of Steel &bull; A Miniratna Category-I CPSE</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/70 px-3.5 py-1.5 rounded-full border border-slate-800/80 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Earth Observation Telemetry Active</span>
        </div>
      </header>

      {/* Minimal Hero: Title Top, Open Globe Center, Single Primary CTA Bottom */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 pt-3 pb-10 text-center pointer-events-none">
        {/* Title Hierarchy - Minimal, High Contrast & Dignified */}
        <div className="max-w-2xl space-y-2 pointer-events-auto mt-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            MOIL Mining <span className="text-amber-400">Intelligence</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
            AI + Space Technology for Manganese Mining Intelligence
          </p>
        </div>

        {/* Generous empty space lets the 3D Earth breathe in the center */}
        <div className="flex-1 min-h-[100px]" />

        {/* Bottom Single Primary CTA */}
        <div className="w-full max-w-md pointer-events-auto space-y-3">
          <button
            onClick={handleLaunchWorkspace}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center space-x-2.5 border border-amber-300 cursor-pointer"
          >
            <span>🚀 Launch Mining Intelligence</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>

          <p className="text-[11px] font-mono text-slate-400 tracking-wide">
            Central India Manganese Province &bull; 8 Authorized Concessions
          </p>
        </div>
      </main>

      {/* Space Flight Ingress Transition Overlay */}
      {isTransitioning && (
        <SpaceTransitionOverlay
          targetName="Balaghat Mine (Bharveli)"
          targetLat={21.8502}
          targetLng={80.2274}
          onTransitionComplete={() => {
            onEnterWorkspace(21.8502, 80.2274, 'Balaghat Mine (Bharveli)', 'MINE_BALAGHAT_01');
            setIsTransitioning(false);
          }}
        />
      )}
    </div>
  );
};
