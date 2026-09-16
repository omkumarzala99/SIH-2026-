import React from 'react';
import { Pickaxe, Radio, AlertOctagon, Sparkles, Satellite, RefreshCw } from 'lucide-react';

import { MOIL_MINES } from '../../data/constants';

interface NavbarProps {
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  onTriggerCrisisDemo: () => void;
  selectedMine: string;
  onSelectMine: (mine: string) => void;
  apiOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDemoMode,
  onToggleDemoMode,
  onTriggerCrisisDemo,
  selectedMine,
  onSelectMine,
  apiOnline
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Pickaxe className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">MOIL</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Enterprise DSS
                </span>
              </div>
              <p className="text-xs text-slate-400">AI/ML & Space Mining Intelligence Platform</p>
            </div>
          </div>

          {/* Controls: Mine Selector, Crisis Demo Button, Mode Switch */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mine Selector */}
            <select
              value={selectedMine}
              onChange={(e) => onSelectMine(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {MOIL_MINES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>

            {/* Operational Crisis Scenario Button */}
            <button
              onClick={onTriggerCrisisDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all shadow-sm group"
              title="Loads heavy monsoon + equipment downtime crisis scenario"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 group-hover:animate-pulse" />
              <span className="hidden md:inline">Run Crisis Simulation</span>
              <span className="md:hidden">Crisis</span>
            </button>

            {/* Live / Demo Mode Toggle */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => onToggleDemoMode(false)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  !isDemoMode
                    ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live API
              </button>
              <button
                onClick={() => onToggleDemoMode(true)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  isDemoMode
                    ? 'bg-amber-500 text-slate-950 shadow font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Demo Mode
              </button>
            </div>

            {/* Status Indicator */}
            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800 text-xs">
              <div className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="text-slate-400">{apiOnline ? 'Online' : 'Offline (Mock)'}</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-400">
                <Satellite className="w-3.5 h-3.5" />
                <span className="text-slate-400">Sentinel-2 Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
