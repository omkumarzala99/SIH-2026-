import React from 'react';
import {
  Pickaxe,
  Globe,
  Zap,
  LayoutDashboard,
  Map as MapIcon,
  Satellite,
  Layers,
  Lightbulb,
  Sliders,
  CheckCircle2,
  Users,
  AlertOctagon
} from 'lucide-react';

import { MOIL_MINES_DATA } from '../space/GlobeCanvas';

export type WorkspaceTab =
  | 'overview'
  | 'map'
  | 'satellite'
  | 'results'
  | 'recommendations'
  | 'simulation'
  | 'quality'
  | 'system';

interface WorkspaceHeaderProps {
  selectedMineId?: string;
  selectedMineName: string;
  selectedMineCoords: { lat: number; lng: number };
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onReturnToSpace: () => void;
  onRunAiAnalysis: () => void;
  onSelectMineId?: (id: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  onTriggerCrisisDemo: () => void;
  apiOnline: boolean;
  pendingRecsCount?: number;
  currentRiskTier?: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  selectedMineId,
  selectedMineName,
  selectedMineCoords,
  activeTab,
  onSelectTab,
  onReturnToSpace,
  onRunAiAnalysis,
  onSelectMineId,
  isDemoMode,
  onToggleDemoMode,
  onTriggerCrisisDemo,
  apiOnline,
  pendingRecsCount = 2,
  currentRiskTier = 'CRITICAL'
}) => {
  const tabs: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Spatial GIS Map', icon: MapIcon },
    { id: 'satellite', label: 'Satellite Telemetry', icon: Satellite },
    { id: 'results', label: 'AI Mining Intelligence', icon: Layers, badge: currentRiskTier },
    { id: 'recommendations', label: 'Decision Support', icon: Lightbulb, badge: `${pendingRecsCount} Action${pendingRecsCount !== 1 ? 's' : ''}` },
    { id: 'simulation', label: 'What-If Simulator', icon: Sliders },
    { id: 'quality', label: 'Data Quality', icon: CheckCircle2 },
    { id: 'system', label: 'Architecture', icon: Users }
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner: Location Telemetry & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 gap-3 border-b border-slate-800/80">
          {/* Brand & Location Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Pickaxe className="w-5 h-5 text-slate-950" />
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                {onSelectMineId ? (
                  <select
                    aria-label="Select MOIL Mine"
                    value={selectedMineId || 'MINE_BALAGHAT_01'}
                    onChange={(e) => onSelectMineId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-white font-bold text-sm rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer"
                  >
                    {MOIL_MINES_DATA.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-lg font-bold tracking-tight text-white">{selectedMineName}</span>
                )}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {selectedMineCoords.lat.toFixed(4)}° N, {selectedMineCoords.lng.toFixed(4)}° E
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  MOIL Concession
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Spatial Mine Telemetry &amp; AI Intelligence Workspace
              </p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center space-x-2.5 flex-wrap">
            {/* Global Earth View Button */}
            <button
              onClick={onReturnToSpace}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
              title="Return to Space 3D Globe"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Global View</span>
            </button>

            {/* SIH Crisis Trigger Button */}
            <button
              onClick={onTriggerCrisisDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all group"
              title="Load heavy monsoon + equipment downtime crisis scenario"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 group-hover:animate-pulse" />
              <span className="hidden sm:inline">Crisis Demo</span>
            </button>

            {/* RUN AI ANALYSIS - PRIMARY CTA */}
            <button
              onClick={onRunAiAnalysis}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>RUN AI ANALYSIS</span>
            </button>

            {/* Mode Switch */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => onToggleDemoMode(false)}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all ${
                  !isDemoMode
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => onToggleDemoMode(true)}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all ${
                  isDemoMode
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Demo
              </button>
            </div>

            {/* Status indicator */}
            <div className="hidden sm:flex items-center space-x-1 text-xs pl-2 border-l border-slate-800">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-[11px] text-slate-400">{apiOnline ? 'API Active' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      tab.badge === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : tab.badge === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
