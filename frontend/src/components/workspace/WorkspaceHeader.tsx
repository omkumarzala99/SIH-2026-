import React, { useState, useEffect, useRef } from 'react';
import {
  Pickaxe,
  Globe,
  Zap,
  Search,
  Bell,
  User,
  LogOut,
  AlertOctagon,
  ChevronDown,
  Menu,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Satellite
} from 'lucide-react';
import { MOIL_MINES } from '../../data/constants';

export type WorkspaceTab =
  | 'overview'
  | 'map'
  | 'production'
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
  onSignOut?: () => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  selectedMineId = 'MINE_BALAGHAT_01',
  selectedMineName,
  onSelectTab,
  onReturnToSpace,
  onRunAiAnalysis,
  onSelectMineId,
  isDemoMode,
  onToggleDemoMode,
  onTriggerCrisisDemo,
  apiOnline,
  pendingRecsCount = 2,
  onSignOut,
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [notificationsCleared, setNotificationsCleared] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  // Close all popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
        setIsAdminOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotifOpen(false);
        setIsAdminOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleNotif = () => {
    setIsNotifOpen((prev) => !prev);
    setIsAdminOpen(false);
  };

  const toggleAdmin = () => {
    setIsAdminOpen((prev) => !prev);
    setIsNotifOpen(false);
  };

  return (
    <header ref={headerRef} className="bg-[#F8FBFD] border-b border-[#D5E3ED] sticky top-0 z-40 shadow-[0_1px_3px_rgba(18,59,99,0.05)]">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* ── LEFT SIDE: Brand & Mine Selector ── */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 rounded-lg bg-[#F4F9FC] border border-[#D5E3ED] text-[#55738F] hover:text-[#123B63]"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* MOIL Brand */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#E5A000] flex items-center justify-center shrink-0 shadow-xs">
                <Pickaxe className="w-4 h-4 text-[#123B63]" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs">
                <span className="font-bold text-[#123B63] tracking-tight text-sm">MOIL LIMITED</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EEF5F9] text-[#55738F] font-medium border border-[#D5E3ED] hidden sm:inline-block">
                  Govt. of India
                </span>
              </div>
            </div>

            <div className="h-5 w-px bg-[#D5E3ED] hidden sm:block" />

            {/* Active Mine Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedMineId}
                onChange={(e) => onSelectMineId && onSelectMineId(e.target.value)}
                className="bg-[#FFFFFF] border border-[#D5E3ED] text-[#123B63] text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1677B8] cursor-pointer shadow-2xs pr-7 appearance-none"
              >
                {MOIL_MINES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.district})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#55738F] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ── CENTER: Search Bar & Status Pill ── */}
          <div className="hidden lg:flex items-center space-x-3 flex-1 max-w-md mx-4">
            {/* Integrated Search Input */}
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#7890A0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mines, HEMM fleet, stope assays, recommendations..."
                className="w-full bg-[#FFFFFF] border border-[#D5E3ED] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#123B63] placeholder-[#7890A0] focus:outline-none focus:border-[#1677B8] shadow-2xs"
              />
            </div>
          </div>

          {/* ── RIGHT SIDE: Controls, Notifications, Settings, Admin & Sign Out ── */}
          <div className="flex items-center space-x-2 shrink-0 text-xs">

            {/* Operational Status Pill */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#E6F4EF] text-[#159A78] border border-[#159A78]/30 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A78] animate-pulse" />
              <span>Operational Status: ACTIVE</span>
            </div>

            {/* Crisis Scenario Simulation */}
            <button
              onClick={onTriggerCrisisDemo}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FAEAEA] text-[#D94B4B] border border-[#D94B4B]/30 font-medium hover:bg-[#D94B4B] hover:text-white transition-colors"
              title="Simulate monsoon & equipment breakdown crisis"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Crisis Demo</span>
            </button>

            {/* Run AI Analysis */}
            <button
              onClick={onRunAiAnalysis}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#E5A000] hover:bg-[#C78B00] active:bg-[#AA7600] text-[#123B63] font-bold shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-[#123B63]" />
              <span className="hidden sm:inline">Run AI Analysis</span>
            </button>

            <div className="h-4 w-px bg-[#D5E3ED] hidden sm:block" />

            {/* Live / Demo Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#EEF5F9] p-0.5 rounded-lg border border-[#D5E3ED]">
              <button
                onClick={() => onToggleDemoMode(false)}
                className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                  !isDemoMode
                    ? 'bg-[#FFFFFF] text-[#159A78] font-bold shadow-xs'
                    : 'text-[#55738F] hover:text-[#123B63]'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => onToggleDemoMode(true)}
                className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                  isDemoMode
                    ? 'bg-[#FFFFFF] text-[#E5A000] font-bold shadow-xs'
                    : 'text-[#55738F] hover:text-[#123B63]'
                }`}
              >
                Demo
              </button>
            </div>

            {/* ── NOTIFICATIONS BUTTON & POPOVER 🔔 ── */}
            <div className="relative">
              <button
                onClick={toggleNotif}
                className={`p-1.5 rounded-lg border transition-colors relative ${
                  isNotifOpen
                    ? 'bg-[#E1F1FA] border-[#1677B8] text-[#1677B8]'
                    : 'bg-[#F4F9FC] hover:bg-[#EEF5F9] border-[#D5E3ED] text-[#55738F] hover:text-[#123B63]'
                }`}
                title="Operational Alerts & Notifications"
              >
                <Bell className="w-4 h-4" />
                {!notificationsCleared && pendingRecsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D94B4B] text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingRecsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] border border-[#D5E3ED] rounded-xl shadow-xl z-50 animate-fadeIn overflow-hidden">
                  <div className="px-4 py-3 bg-[#F4F9FC] border-b border-[#D5E3ED] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#123B63] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#1677B8]" />
                        Notifications
                      </h3>
                      <p className="text-[10px] text-[#7890A0]">Balaghat Manganese Concession</p>
                    </div>
                    {!notificationsCleared ? (
                      <button
                        onClick={() => setNotificationsCleared(true)}
                        className="text-[11px] font-semibold text-[#55738F] hover:text-[#D94B4B] transition-colors"
                      >
                        Clear all
                      </button>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#159A78] font-bold border border-[#159A78]/20">
                        0 Items
                      </span>
                    )}
                  </div>

                  {!notificationsCleared ? (
                    <>
                      <div className="max-h-80 overflow-y-auto divide-y divide-[#EEF5F9] text-xs">
                        {/* Item 1: Production Shortfall */}
                        <div
                          onClick={() => {
                            onSelectTab('recommendations');
                            setIsNotifOpen(false);
                          }}
                          className="p-3 hover:bg-[#EEF5F9] transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#D94B4B] flex items-center gap-1">
                              <AlertOctagon className="w-3.5 h-3.5 text-[#D94B4B]" />
                              Shift Deficit (-180 tonnes)
                            </span>
                            <span className="text-[10px] text-[#7890A0]">10m ago</span>
                          </div>
                          <p className="text-[#55738F] text-[11px] leading-snug">
                            Daily extraction is 18.0% below target due to pit saturation and CAT-349 breakdown.
                          </p>
                        </div>

                        {/* Item 2: Decision Support Item */}
                        <div
                          onClick={() => {
                            onSelectTab('recommendations');
                            setIsNotifOpen(false);
                          }}
                          className="p-3 hover:bg-[#EEF5F9] transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#E5A000] flex items-center gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-[#E5A000]" />
                              2 Managerial Reviews Pending
                            </span>
                            <span className="text-[10px] text-[#7890A0]">15m ago</span>
                          </div>
                          <p className="text-[#55738F] text-[11px] leading-snug">
                            Re-deploy Haul Dumper Fleet to Pit A Upper Bench (+110t estimated recovery).
                          </p>
                        </div>

                        {/* Item 3: Operational Risk */}
                        <div
                          onClick={() => {
                            onSelectTab('results');
                            setIsNotifOpen(false);
                          }}
                          className="p-3 hover:bg-[#EEF5F9] transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#123B63] flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-[#1677B8]" />
                              CRITICAL Risk Score (68.5/100)
                            </span>
                            <span className="text-[10px] text-[#7890A0]">22m ago</span>
                          </div>
                          <p className="text-[#55738F] text-[11px] leading-snug">
                            Pit C sump water saturation at 58.4%. Mine Risk Engine flagged flood risk.
                          </p>
                        </div>

                        {/* Item 4: Satellite Telemetry Sync */}
                        <div
                          onClick={() => {
                            onSelectTab('satellite');
                            setIsNotifOpen(false);
                          }}
                          className="p-3 hover:bg-[#EEF5F9] transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#159A78] flex items-center gap-1">
                              <Satellite className="w-3.5 h-3.5 text-[#159A78]" />
                              Sentinel-2 &amp; FIRMS Synced
                            </span>
                            <span className="text-[10px] text-[#7890A0]">1h ago</span>
                          </div>
                          <p className="text-[#55738F] text-[11px] leading-snug">
                            NDVI 0.21, NDWI -0.06, LST 39.6°C. Zero thermal hotspots within 20km perimeter.
                          </p>
                        </div>
                      </div>

                      <div className="p-2 bg-[#F4F9FC] border-t border-[#D5E3ED] text-center">
                        <button
                          onClick={() => {
                            onSelectTab('recommendations');
                            setIsNotifOpen(false);
                          }}
                          className="text-[11px] font-bold text-[#1677B8] hover:text-[#123B63] transition-colors"
                        >
                          View All Decision Support Actions &rarr;
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-[#7890A0] text-xs space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#159A78] mx-auto opacity-80" />
                      <p className="font-semibold text-[#123B63]">No new notifications</p>
                      <p className="text-[11px] text-[#7890A0]">All operational alerts have been cleared.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Globe View Toggle */}
            <button
              onClick={onReturnToSpace}
              className="p-1.5 rounded-lg bg-[#F4F9FC] hover:bg-[#EEF5F9] border border-[#D5E3ED] text-[#55738F] hover:text-[#123B63] transition-colors"
              title="Planetary Globe View"
            >
              <Globe className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-[#D5E3ED]" />

            {/* Admin User Menu */}
            <div className="relative">
              <button
                onClick={toggleAdmin}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#F4F9FC] hover:bg-[#EEF5F9] border border-[#D5E3ED] text-[#123B63] font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#1677B8]" />
                <span>Admin</span>
                <ChevronDown className="w-3 h-3 text-[#7890A0]" />
              </button>

              {/* Admin Dropdown Menu */}
              {isAdminOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#FFFFFF] border border-[#D5E3ED] rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-[#EEF5F9]">
                    <div className="font-bold text-[#123B63] text-xs">MOIL Admin</div>
                    <div className="text-[10px] text-[#7890A0]">admin@moil.gov.in</div>
                  </div>
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#55738F] hover:bg-[#EEF5F9] hover:text-[#123B63]"
                  >
                    User Profile
                  </button>
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#55738F] hover:bg-[#EEF5F9] hover:text-[#123B63]"
                  >
                    Security Logs
                  </button>
                </div>
              )}
            </div>

            {/* Clearly Visible Sign Out Button */}
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#FAEAEA] hover:bg-[#D94B4B] text-[#D94B4B] hover:text-white border border-[#D94B4B]/30 text-xs font-bold transition-colors"
              title="Sign Out of MOIL Intelligence Workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
