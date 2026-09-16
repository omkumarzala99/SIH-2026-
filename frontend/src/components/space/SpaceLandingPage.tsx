import React, { useState } from 'react';
import { GlobeCanvas, MOIL_MINES_DATA, MineLocation } from './GlobeCanvas';
import { LocationExplorerModal } from './LocationExplorerModal';
import { MapPin, Compass, Pickaxe, ArrowRight, ShieldCheck, Sparkles, Orbit } from 'lucide-react';

interface SpaceLandingPageProps {
  onEnterWorkspace: (lat: number, lng: number, mineName: string, mineId: string, directTab?: string) => void;
}

export const SpaceLandingPage: React.FC<SpaceLandingPageProps> = ({ onEnterWorkspace }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMine] = useState<{ lat: number; lng: number; name: string; id: string }>({
    lat: 21.8502,
    lng: 80.2274,
    name: 'Balaghat Mine (Bharveli)',
    id: 'MINE_BALAGHAT_01'
  });
  const [initialModalTab, setInitialModalTab] = useState<'coords' | 'mines'>('coords');

  const handleOpenCoords = () => {
    setInitialModalTab('coords');
    setIsModalOpen(true);
  };

  const handleOpenMines = () => {
    setInitialModalTab('mines');
    setIsModalOpen(true);
  };

  const handleSelectOnMap = () => {
    setIsModalOpen(false);
    onEnterWorkspace(21.8502, 80.2274, 'Balaghat Concession (Full GIS Map)', 'MINE_BALAGHAT_01', 'map');
  };

  const handleConfirmLocation = (lat: number, lng: number, mineName?: string, mineId?: string) => {
    setIsModalOpen(false);
    onEnterWorkspace(lat, lng, mineName || 'Balaghat Mine', mineId || 'MINE_BALAGHAT_01');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 3D Canvas Earth & Starfield (Full Screen Background) */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas
          selectedMineId={targetMine.id}
          isZooming={false}
        />
      </div>

      {/* Top Subtle Brand Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-amber-500/30 border border-amber-400">
            M
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base tracking-wider">MOIL LIMITED</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Enterprise DSS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Ministry of Steel &bull; Government of India Undertaking</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sentinel-2 MSI Active
          </span>
          <span>&bull;</span>
          <span>Sausar Manganese Orogen</span>
        </div>
      </header>

      {/* Hero Narrative Overlay */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 pb-10 pt-4 text-center pointer-events-none">
        {/* Title Area */}
        <div className="max-w-2xl mt-4 space-y-3 pointer-events-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-300 text-xs font-mono backdrop-blur-md shadow-lg">
            <Orbit className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Autonomous Earth Observation & ML Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            MOIL Mining <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">Intelligence</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
            AI + Space Technology for Manganese Intelligence
          </p>

          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Multiscale spatial kriging, Sentinel-2 surface analytics, operational production forecasting, and transparent prescriptive risk mitigation.
          </p>
        </div>

        {/* Central Exploration Actions */}
        <div className="w-full max-w-3xl pointer-events-auto mt-auto space-y-4">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
            &mdash; Explore Mining Intelligence &mdash;
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Coordinates */}
            <button
              onClick={handleOpenCoords}
              className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-800/95 border border-slate-800 hover:border-amber-500/60 transition-all duration-200 group shadow-xl hover:shadow-amber-500/10 backdrop-blur-md text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  📍 Coordinates
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Input target latitude & longitude
                </div>
              </div>
            </button>

            {/* Option 2: Select on Map */}
            <button
              onClick={handleSelectOnMap}
              className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-800/95 border border-slate-800 hover:border-sky-500/60 transition-all duration-200 group shadow-xl hover:shadow-sky-500/10 backdrop-blur-md text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  🗺️ Select on Map
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Open Leaflet GIS Concession Map
                </div>
              </div>
            </button>

            {/* Option 3: Select MOIL Mine */}
            <button
              onClick={handleOpenMines}
              className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-800/95 border border-slate-800 hover:border-emerald-500/60 transition-all duration-200 group shadow-xl hover:shadow-emerald-500/10 backdrop-blur-md text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Pickaxe className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  ⛏️ Select MOIL Mine
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Balaghat, Tirodi, Dongri Buzurg
                </div>
              </div>
            </button>
          </div>

          {/* Quick Start Direct Launch Button */}
          <div className="pt-1">
            <button
              onClick={() => handleConfirmLocation(21.8502, 80.2274, 'Balaghat Mine (Bharveli)', 'M01')}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all inline-flex items-center justify-center space-x-2 border border-amber-300"
            >
              <span>🚀 Launch Balaghat Mine Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Location Explorer Modal */}
      <LocationExplorerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmLocation={handleConfirmLocation}
        onSelectOnMap={handleSelectOnMap}
      />
    </div>
  );
};
