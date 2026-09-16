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
  Cpu,
  AlertOctagon,
  ChevronDown
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
  selectedMineId = 'MINE_BALAGHAT_01',
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
    { id: 'recommendations', label: 'Decision Support', icon: Lightbulb, badge: `${pendingRecsCount}` },
    { id: 'simulation', label: 'What-If Simulator', icon: Sliders },
    { id: 'quality', label: 'Data Quality', icon: CheckCircle2 },
    { id: 'system', label: 'Architecture', icon: Cpu }
  ];

  const currentMine = MOIL_MINES_DATA.find((m) => m.id === selectedMineId);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar: Branding, Mine Switcher & Quick Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3 border-b border-slate-800/80">
          {/* Brand & Location Info */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-sm">
              <Pickaxe className="w-5 h-5 text-slate-950" />
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-extrabold text-white text-sm tracking-tight">MOIL LIMITED</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Govt. of India
                </span>

                {/* Fast Accessible Mine Selector */}
                {onSelectMineId ? (
                  <div className="relative inline-flex items-center ml-1">
                    <select
                      aria-label="Select MOIL Mine"
                      value={selectedMineId}
                      onChange={(e) => onSelectMineId(e.target.value)}
                      className="bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs rounded-md pl-2.5 pr-7 py-1 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer appearance-none"
                    >
                      {MOIL_MINES_DATA.map((m) => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                          {m.name} ({m.district}, {m.state})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-white">{selectedMineName}</span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                <span className="tabular-nums text-slate-300">
                  {selectedMineCoords.lat.toFixed(4)}°N, {selectedMineCoords.lng.toFixed(4)}°E
                </span>
                <span>&bull;</span>
                <span className="text-slate-400 font-sans">
                  {currentMine?.type || 'Underground & Opencast'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Crisis Scenario Trigger */}
            <button
              onClick={onTriggerCrisisDemo}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
              title="Inject monsoon & equipment downtime scenario"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Simulate Crisis</span>
            </button>

            {/* Run AI Analysis CTA */}
            <button
              onClick={onRunAiAnalysis}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>Run AI Analysis</span>
            </button>

            {/* Mode Switch: Live vs Demo */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
              <button
                onClick={() => onToggleDemoMode(false)}
                className={`px-2 py-0.5 text-[11px] rounded font-medium ${
                  !isDemoMode
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => onToggleDemoMode(true)}
                className={`px-2 py-0.5 text-[11px] rounded font-medium ${
                  isDemoMode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Demo
              </button>
            </div>

            {/* API Health Status */}
            <div className="flex items-center space-x-1.5 text-[11px] px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{apiOnline ? 'API Active' : 'Offline'}</span>
            </div>

            {/* Optional 3D View Toggle */}
            <button
              onClick={onReturnToSpace}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs"
              title="Switch to 3D Concession View"
            >
              <Globe className="w-4 h-4 text-slate-400" />
            </button>
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
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      tab.badge === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : tab.badge === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-slate-700 text-slate-300'
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
