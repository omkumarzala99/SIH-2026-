import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { SpaceLandingPage } from './components/space/SpaceLandingPage';
import { WorkspaceHeader, WorkspaceTab } from './components/workspace/WorkspaceHeader';
import { WorkspaceSidebar } from './components/workspace/WorkspaceSidebar';
import { SatellitePanel } from './components/workspace/SatellitePanel';
import { AiAnalysisModal } from './components/workspace/AiAnalysisModal';
import { MiningResultsView } from './components/workspace/MiningResultsView';
import { MineMap } from './components/map/MineMap';

import { DashboardPage } from './pages/DashboardPage';
import { ReservePage } from './pages/ReservePage';
import { ProductionPage } from './pages/ProductionPage';
import { RiskPage } from './pages/RiskPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SimulationPage } from './pages/SimulationPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { SystemInfoPage } from './pages/SystemInfoPage';

import { apiService } from './services/api';
import { AlertOctagon, Compass } from 'lucide-react';
import { MOIL_MINES_DATA } from './components/space/GlobeCanvas';

interface SelectedMineContext {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

const VALID_TABS: WorkspaceTab[] = [
  'overview',
  'map',
  'production',
  'satellite',
  'results',
  'recommendations',
  'simulation',
  'quality',
  'system'
];

type AppViewMode = 'space' | 'auth' | 'workspace';

interface InitialNavState {
  view: AppViewMode;
  tab: WorkspaceTab;
  authenticated: boolean;
  redirect?: string;
}

function getInitialNavState(): InitialNavState {
  if (typeof window === 'undefined') {
    return { view: 'space', tab: 'overview', authenticated: false };
  }

  const isAuth = sessionStorage.getItem('moil_authenticated') === 'true';
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const searchParams = new URLSearchParams(window.location.search);
  const queryTab = searchParams.get('tab')?.toLowerCase();
  const queryRedirect = searchParams.get('redirect');

  if (pathname.startsWith('/auth') || pathname.startsWith('/login')) {
    return {
      view: 'auth',
      tab: 'overview',
      authenticated: isAuth,
      redirect: queryRedirect || undefined
    };
  }

  const isWorkspace =
    pathname.startsWith('/workspace') ||
    pathname === '/executive' ||
    hash.startsWith('workspace') ||
    Boolean(queryTab && VALID_TABS.includes(queryTab as WorkspaceTab));

  let tab: WorkspaceTab = 'overview';
  const parts = pathname.split('/').filter(Boolean);
  if (pathname === '/executive') {
    tab = 'overview';
  } else if (parts.length >= 2 && VALID_TABS.includes(parts[1] as WorkspaceTab)) {
    tab = parts[1] as WorkspaceTab;
  } else if (queryTab && VALID_TABS.includes(queryTab as WorkspaceTab)) {
    tab = queryTab as WorkspaceTab;
  }

  const requestedPath = isWorkspace
    ? (tab === 'overview' ? '/workspace' : `/workspace/${tab}`)
    : pathname;

  if (!isAuth && isWorkspace) {
    return {
      view: 'auth',
      tab,
      authenticated: false,
      redirect: requestedPath !== '/' ? requestedPath : '/workspace'
    };
  }

  if (isWorkspace && isAuth) {
    return { view: 'workspace', tab, authenticated: true };
  }

  return { view: 'space', tab: 'overview', authenticated: isAuth };
}

const updateUrl = (
  view: AppViewMode,
  tab: WorkspaceTab,
  replace = false,
  redirectPath?: string
) => {
  if (typeof window === 'undefined') return;

  let targetPath = '/';
  if (view === 'space') {
    targetPath = '/';
  } else if (view === 'auth') {
    targetPath = redirectPath ? `/auth?redirect=${encodeURIComponent(redirectPath)}` : '/auth';
  } else {
    targetPath = tab === 'overview' ? '/workspace' : `/workspace/${tab}`;
  }

  if (window.location.pathname !== targetPath) {
    if (replace) {
      window.history.replaceState(null, '', targetPath);
    } else {
      window.history.pushState(null, '', targetPath);
    }
  }
};

export const App: React.FC = () => {
  const [initialNav] = useState(() => getInitialNavState());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialNav.authenticated);
  const [viewMode, setViewMode] = useState<AppViewMode>(initialNav.view);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialNav.tab);
  const [pendingRedirect, setPendingRedirect] = useState<string | undefined>(initialNav.redirect);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 220);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialNavState();
      setIsAuthenticated(state.authenticated);
      setViewMode(state.view);
      setActiveTab(state.tab);
      if (state.redirect) {
        setPendingRedirect(state.redirect);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route protection effect for direct workspace access
  useEffect(() => {
    if (!isAuthenticated && viewMode === 'workspace') {
      const currentPath = window.location.pathname;
      setViewMode('auth');
      setPendingRedirect(currentPath !== '/' ? currentPath : '/workspace');
      updateUrl('auth', activeTab, true, currentPath !== '/' ? currentPath : '/workspace');
    }
  }, [isAuthenticated, viewMode, activeTab]);

  const [selectedMine, setSelectedMine] = useState<SelectedMineContext>(() => {
    try {
      const savedMineId = sessionStorage.getItem('moil_selected_mine_id');
      if (savedMineId) {
        const found = MOIL_MINES_DATA.find((m) => m.id === savedMineId);
        if (found) {
          return { id: found.id, name: found.name, lat: found.lat, lng: found.lng, type: found.type };
        }
      }
    } catch {}
    return {
      id: 'MINE_BALAGHAT_01',
      name: 'Balaghat Mine (Bharveli)',
      lat: 21.8129,
      lng: 80.1835,
      type: 'Opencast & Underground'
    };
  });

  // Called when user clicks "LAUNCH MINING INTELLIGENCE" or a mine on SpaceLandingPage
  const handleLaunchFromLanding = (
    lat: number, lng: number, mineName: string, mineId: string, directTab?: string
  ) => {
    setSelectedMine({ id: mineId, name: mineName, lat, lng, type: 'MOIL Concession' });
    try { sessionStorage.setItem('moil_selected_mine_id', mineId); } catch {}

    const targetTab = (directTab && VALID_TABS.includes(directTab as WorkspaceTab))
      ? (directTab as WorkspaceTab)
      : 'overview';
    setActiveTab(targetTab);

    if (isAuthenticated) {
      setViewMode('workspace');
      updateUrl('workspace', targetTab, false);
    } else {
      setViewMode('auth');
      updateUrl('auth', targetTab, false);
    }
  };

  const handleAuthSuccess = () => {
    sessionStorage.setItem('moil_authenticated', 'true');
    setIsAuthenticated(true);

    const target = pendingRedirect || '/workspace';
    setPendingRedirect(undefined);

    let targetTab: WorkspaceTab = activeTab;
    if (target.includes('/workspace/')) {
      const parts = target.split('/').filter(Boolean);
      if (parts.length >= 2 && VALID_TABS.includes(parts[1] as WorkspaceTab)) {
        targetTab = parts[1] as WorkspaceTab;
      }
    }

    setViewMode('workspace');
    setActiveTab(targetTab);
    updateUrl('workspace', targetTab, true);
  };

  const handleReturnToLanding = () => {
    setViewMode('space');
    updateUrl('space', 'overview', false);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('moil_authenticated');
    setIsAuthenticated(false);
    setViewMode('auth');
    updateUrl('auth', 'overview', false);
  };

  const navigateToTab = (tab: WorkspaceTab) => {
    if (!isAuthenticated) {
      handleSignOut();
      return;
    }
    setActiveTab(tab);
    updateUrl('workspace', tab, false);
  };

  const handleReturnToSpace = () => {
    setViewMode('space');
    updateUrl('space', 'overview', false);
  };

  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await apiService.checkHealth();
      setApiOnline(isOnline);
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    apiService.setDemoMode(enabled);
  };

  const handleTriggerCrisisDemo = async () => {
    try {
      await apiService.triggerCrisisScenario();
      setCrisisAlert(
        `🚨 Crisis Scenario: Monsoon 54.2mm, Pit Saturation 58.4%, CAT-349 Breakdown 6.5h — Production 768.5t vs 1,000t target (−231.5t, CRITICAL Risk 77.5/100).`
      );
      navigateToTab('results');
      setTimeout(() => setCrisisAlert(null), 10000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectMineId = (mineId: string) => {
    try { sessionStorage.setItem('moil_selected_mine_id', mineId); } catch {}
    const found = MOIL_MINES_DATA.find((m) => m.id === mineId);
    if (found) {
      setSelectedMine({ id: found.id, name: found.name, lat: found.lat, lng: found.lng, type: found.type });
    } else {
      setSelectedMine((prev) => ({ ...prev, id: mineId }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#E5A000] selection:text-[#123B63]">
      
      {/* SCREEN 1: 3D GLOBE LANDING PAGE (Visually Untouched) */}
      {viewMode === 'space' && (
        <SpaceLandingPage onEnterWorkspace={handleLaunchFromLanding} />
      )}

      {/* SCREEN 2: ENGINEER VERIFICATION GATE (/auth) */}
      {viewMode === 'auth' && (
        <AuthPage
          onAuthSuccess={handleAuthSuccess}
          onReturnToLanding={handleReturnToLanding}
          targetMineName={selectedMine.name}
        />
      )}

      {/* SCREEN 3: MULTI-PAGE WORKSPACE PLATFORM */}
      {viewMode === 'workspace' && isAuthenticated && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#EEF5F9] text-[#123B63]">

          <WorkspaceHeader
            selectedMineId={selectedMine.id}
            selectedMineName={selectedMine.name}
            selectedMineCoords={{ lat: selectedMine.lat, lng: selectedMine.lng }}
            activeTab={activeTab}
            onSelectTab={navigateToTab}
            onReturnToSpace={handleReturnToSpace}
            onRunAiAnalysis={() => setIsAiModalOpen(true)}
            onSelectMineId={handleSelectMineId}
            isDemoMode={isDemoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onTriggerCrisisDemo={handleTriggerCrisisDemo}
            apiOnline={apiOnline}
            pendingRecsCount={2}
            currentRiskTier="CRITICAL"
            onSignOut={handleSignOut}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          {/* Crisis Alert Banner */}
          {crisisAlert && (
            <div className="bg-[#FAEAEA] border-b border-[#D94B4B]/30 border-l-4 border-l-[#D94B4B] px-4 py-2.5 text-xs text-[#123B63] flex items-center justify-between z-40">
              <div className="flex items-center space-x-2.5 max-w-5xl">
                <AlertOctagon className="w-4 h-4 text-[#D94B4B] shrink-0" />
                <span className="font-medium text-[#123B63]">{crisisAlert}</span>
              </div>
              <button
                onClick={() => setCrisisAlert(null)}
                className="text-[#55738F] hover:text-[#123B63] px-2 py-0.5 rounded text-xs font-semibold transition-colors ml-4 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Main Workspace Body Layout: Left Sidebar + Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            <WorkspaceSidebar
              activeTab={activeTab}
              onSelectTab={navigateToTab}
              pendingRecsCount={2}
              currentRiskTier="CRITICAL"
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleSidebarCollapse}
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#EEF5F9] transition-all duration-200">
              <div className="max-w-[1536px] mx-auto">

                {activeTab === 'overview' && (
                  <DashboardPage
                    selectedMineId={selectedMine.id}
                    selectedMineName={selectedMine.name}
                    onNavigateTab={(tab: string) => {
                      if (tab === 'production') navigateToTab('production');
                      else if (tab === 'reserves' || tab === 'risk') navigateToTab('results');
                      else if (tab === 'recommendations' || tab === 'decisions') navigateToTab('recommendations');
                      else if (VALID_TABS.includes(tab as WorkspaceTab)) navigateToTab(tab as WorkspaceTab);
                    }}
                  />
                )}

                {activeTab === 'map' && (
                  <div className="space-y-4">
                    <div className="border-b border-[#D5E3ED] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#123B63] flex items-center gap-2">
                          <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5A000]" />
                          Spatial Concession GIS
                        </h1>
                        <p className="text-xs sm:text-sm text-[#55738F] mt-0.5">
                          Interactive GIS — concession lease boundaries, extraction benches, and satellite reserve classifications
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#E5A000] text-[#123B63] font-bold text-xs shadow-xs hover:bg-[#C78B00] self-start sm:self-auto transition-colors"
                      >
                        Run AI Analysis →
                      </button>
                    </div>
                    <div className="h-[640px] w-full bg-[#FFFFFF] border border-[#D5E3ED] rounded-lg p-2 shadow-xs">
                      <MineMap
                        selectedMineId={selectedMine.id}
                        center={[selectedMine.lat, selectedMine.lng]}
                        onZoneSelect={() => navigateToTab('results')}
                        onSelectMineId={handleSelectMineId}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'production' && (
                  <ProductionPage
                    selectedMineId={selectedMine.id}
                    selectedMineName={selectedMine.name}
                  />
                )}

                {activeTab === 'satellite' && (
                  <SatellitePanel
                    mineName={selectedMine.name}
                    selectedMineId={selectedMine.id}
                    onRunAiAnalysis={() => setIsAiModalOpen(true)}
                  />
                )}

                {activeTab === 'results' && (
                  <MiningResultsView
                    selectedMineId={selectedMine.id}
                    selectedMineName={selectedMine.name}
                    onNavigateTab={(tab) => {
                      if (tab === 'recommendations') navigateToTab('recommendations');
                      else if (tab === 'simulation') navigateToTab('simulation');
                      else if (tab === 'risk') navigateToTab('results');
                      else if (VALID_TABS.includes(tab as WorkspaceTab)) navigateToTab(tab as WorkspaceTab);
                    }}
                  />
                )}

                {activeTab === 'recommendations' && (
                  <RecommendationsPage
                    selectedMineId={selectedMine.id}
                    selectedMineName={selectedMine.name}
                  />
                )}

                {activeTab === 'simulation' && <SimulationPage />}

                {activeTab === 'quality' && (
                  <DataQualityPage
                    selectedMineId={selectedMine.id}
                    selectedMineName={selectedMine.name}
                  />
                )}

                {activeTab === 'system' && <SystemInfoPage />}

              </div>
            </main>
          </div>
        </div>
      )}

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedMineId={selectedMine.id}
        selectedMineName={selectedMine.name}
        onComplete={() => { navigateToTab('results'); }}
      />
    </div>
  );
};

export default App;

