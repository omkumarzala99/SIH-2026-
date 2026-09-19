import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  TrendingUp,
  Satellite,
  Layers,
  Lightbulb,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { WorkspaceTab } from './WorkspaceHeader';

interface WorkspaceSidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  pendingRecsCount?: number;
  currentRiskTier?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingRecsCount = 2,
  currentRiskTier = 'CRITICAL',
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  // Navigation list containing exactly 7 operational modules (System and Data Quality removed)
  const navItems: {
    id: WorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { id: 'overview',         label: 'Executive',        icon: LayoutDashboard },
    { id: 'map',              label: 'Spatial GIS',      icon: MapIcon },
    { id: 'production',       label: 'Production',       icon: TrendingUp },
    { id: 'satellite',        label: 'Telemetry',        icon: Satellite },
    { id: 'results',          label: 'AI Intelligence',  icon: Layers },
    { id: 'recommendations',  label: 'Decision Support', icon: Lightbulb, badgeCount: pendingRecsCount },
    { id: 'simulation',       label: 'What-If Simulator', icon: Sliders },
  ];

  const content = (
    <aside
      className={`
        bg-[#F4F9FC] border-r border-[#D5E3ED] flex flex-col justify-between shrink-0 h-full select-none shadow-[1px_0_4px_rgba(18,59,99,0.03)] transition-all duration-200 ease-in-out relative
        ${isCollapsed ? 'w-16' : 'w-64 sm:w-72'}
      `}
    >
      <div className="py-3 px-2 space-y-1 overflow-y-auto">
        
        {/* Top Controls: Section Label & Collapse/Expand Toggle */}
        <div className={`px-2 py-1 flex items-center justify-between text-[10px] font-bold text-[#7890A0] uppercase tracking-wider ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && <span>Operational Modules</span>}
          
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md bg-[#EEF5F9] hover:bg-[#E1F1FA] text-[#55738F] hover:text-[#123B63] border border-[#D5E3ED] transition-colors"
            title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#1677B8]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-[#55738F]" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={item.label}
                className={`
                  w-full flex items-center rounded-lg text-xs font-medium transition-all relative group
                  ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'}
                  ${isActive
                    ? 'bg-[#E1F1FA] text-[#123B63] font-bold shadow-sm'
                    : 'text-[#55738F] hover:text-[#123B63] hover:bg-[#EEF5F9]'
                  }
                `}
              >
                {/* Active Left Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#1677B8]" />
                )}

                <div className={`flex items-center space-x-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#1677B8]' : 'text-[#7890A0] group-hover:text-[#1677B8]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#FAEAEA] text-[#D94B4B] border border-[#D94B4B]/20 font-bold leading-4">
                        {item.badgeCount}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#1677B8]" />
                    )}
                  </div>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D94B4B]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Operational Status Block */}
        {!isCollapsed ? (
          <div className="pt-4 px-1">
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D5E3ED] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#55738F] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D99000]" />
                  Mine Risk Engine
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAEAEA] text-[#D94B4B] border border-[#D94B4B]/20 uppercase font-mono">
                  {currentRiskTier}
                </span>
              </div>
              <div className="w-full bg-[#EEF5F9] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#D94B4B] h-full rounded-full w-[72%]" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#7890A0]">
                <span>Score: <strong className="text-[#123B63] font-mono">68.5 / 100</strong></span>
                <span className="text-[#1677B8] font-semibold">4 Factors</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 flex justify-center" title={`Risk Engine: ${currentRiskTier} (68.5/100)`}>
            <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#D5E3ED] flex items-center justify-center text-[#D94B4B] shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#D5E3ED] bg-[#F4F9FC] text-[11px] text-[#55738F] space-y-1">
        {!isCollapsed ? (
          <>
            <div className="flex justify-between items-center font-medium">
              <span>Enterprise Concession</span>
              <span className="text-[#1677B8] font-bold">MOIL Limited</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span>Target Ore Grade</span>
              <span className="text-[#123B63] font-mono font-semibold">42.5% Mn</span>
            </div>
            <div className="pt-1.5 text-[9.5px] text-[#7890A0] text-center font-mono">
              MOIL &copy; 2026 Mining Intelligence
            </div>
          </>
        ) : (
          <div className="text-[9px] text-[#7890A0] text-center font-mono py-1">
            MOIL
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        {content}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#123B63]/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#F4F9FC] shadow-xl z-50 animate-slideInRight">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
