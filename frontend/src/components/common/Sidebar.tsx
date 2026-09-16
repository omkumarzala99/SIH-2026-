import React from 'react';
import {
  LayoutDashboard,
  Layers,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sliders,
  CheckCircle2,
  Users
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'reserves'
  | 'production'
  | 'risk'
  | 'recommendations'
  | 'simulation'
  | 'quality'
  | 'system';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingRecsCount: number;
  currentRiskTier: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingRecsCount,
  currentRiskTier
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'reserves', label: 'Reserve Intelligence', icon: Layers, badge: 'AI/GIS' },
    { id: 'production', label: 'Production Forecast', icon: TrendingUp },
    { id: 'risk', label: 'Risk Monitoring', icon: AlertTriangle, riskBadge: currentRiskTier },
    { id: 'recommendations', label: 'Decision Support', icon: Lightbulb, countBadge: pendingRecsCount },
    { id: 'simulation', label: 'What-If Simulation', icon: Sliders },
    { id: 'quality', label: 'Data Quality & Health', icon: CheckCircle2 },
    { id: 'system', label: 'System Architecture', icon: Layers, badge: 'Specs' },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Mining Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {item.badge}
                </span>
              )}

              {item.countBadge !== undefined && item.countBadge > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                  {item.countBadge}
                </span>
              )}

              {item.riskBadge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    item.riskBadge === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : item.riskBadge === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.riskBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 space-y-1">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <span>Mine Concession</span>
          <span className="text-amber-400">Balaghat (MP)</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Target Ore Grade</span>
          <span className="text-slate-200 font-mono">42.5% Mn</span>
        </div>
        <div className="pt-2 text-[10px] text-slate-400 text-center">
          MOIL Limited &copy; Mining Intelligence Platform
        </div>
      </div>
    </aside>
  );
};
