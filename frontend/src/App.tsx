import React, { useState, useEffect } from 'react';
import { SpaceLandingPage } from './components/space/SpaceLandingPage';
import { WorkspaceHeader, WorkspaceTab } from './components/workspace/WorkspaceHeader';
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

export const App: React.FC = () => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'space' | 'workspace'>('space');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  // Selected Mine & Coordinates
  const [selectedMine, setSelectedMine] = useState<SelectedMineContext>({
    id: 'MINE_BALAGHAT_01',
    name: 'Balaghat Mine (Bharveli)',
    lat: 21.8502,
    lng: 80.2274,
    type: 'Opencast & Underground'
  });

  // AI Pipeline Execution Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Operational State & API Health
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  // Check backend health periodically
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
        `🚨 SIH 2026 Presentation Crisis Triggered: Heavy Monsoon (54.2mm), Saturated Pits (58.4%), and CAT-349 Excavator Breakdown (6.5h) loaded. Predicted Production 768.5t vs 1,000t target (-231.5t shortfall, CRITICAL Risk 77.5 / 100).`
      );
      setActiveTab('results');
      setTimeout(() => {
        setCrisisAlert(null);
      }, 10000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectMineId = (mineId: string) => {
    const found = MOIL_MINES_DATA.find((m) => m.id === mineId);
    if (found) {
      setSelectedMine({
        id: found.id,
        name: found.name,
        lat: found.lat,
        lng: found.lng,
        type: found.type
      });
    } else {
      setSelectedMine((prev) => ({ ...prev, id: mineId }));
    }
  };

  // Handler when location is chosen on the Space Landing Page
  const handleEnterWorkspace = (
    lat: number,
    lng: number,
    mineName: string,
    mineId: string,
    directTab?: string
  ) => {
    setSelectedMine({
      id: mineId,
      name: mineName,
      lat,
      lng,
      type: 'MOIL Concession'
    });
    setViewMode('workspace');
    if (directTab && ['overview', 'map', 'satellite', 'results', 'recommendations', 'simulation', 'quality', 'system'].includes(directTab)) {
      setActiveTab(directTab as WorkspaceTab);
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* SCREEN 1 & 2: Space Landing Page, Location Selection & Flight Transition */}
      {viewMode === 'space' && (
        <SpaceLandingPage onEnterWorkspace={handleEnterWorkspace} />
      )}

      {/* SCREEN 3, 4, 5, 6, 7: Mining Location Workspace */}
      {viewMode === 'workspace' && (
        <div className="min-h-screen flex flex-col bg-slate-950">
          {/* Workspace Top Header & Navigation Tabs */}
          <WorkspaceHeader
            selectedMineId={selectedMine.id}
            selectedMineName={selectedMine.name}
            selectedMineCoords={{ lat: selectedMine.lat, lng: selectedMine.lng }}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onReturnToSpace={() => setViewMode('space')}
            onRunAiAnalysis={() => setIsAiModalOpen(true)}
            onSelectMineId={handleSelectMineId}
            isDemoMode={isDemoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onTriggerCrisisDemo={handleTriggerCrisisDemo}
            apiOnline={apiOnline}
            pendingRecsCount={2}
            currentRiskTier="CRITICAL"
          />

          {/* Presentation Crisis Banner */}
          {crisisAlert && (
            <div className="bg-rose-500/20 border-b border-rose-500/40 px-4 py-3 text-xs text-rose-200 flex items-center justify-between animate-fadeIn z-40">
              <div className="flex items-center space-x-2.5 max-w-5xl">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                <span className="font-semibold">{crisisAlert}</span>
              </div>
              <button
                onClick={() => setCrisisAlert(null)}
                className="text-rose-400 hover:text-white px-2 py-0.5 rounded text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Tab Workspace View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Tab 1: Overview Dashboard */}
              {activeTab === 'overview' && (
                <DashboardPage
                  selectedMineId={selectedMine.id}
                  selectedMineName={selectedMine.name}
                  onNavigateTab={(tab: string) => {
                    if (tab === 'reserves') setActiveTab('results');
                    else if (tab === 'production') setActiveTab('results');
                    else if (tab === 'risk') setActiveTab('results');
                    else if (tab === 'recommendations') setActiveTab('recommendations');
                    else setActiveTab(tab as WorkspaceTab);
                  }}
                />
              )}

              {/* Tab 2: Spatial GIS Map */}
              {activeTab === 'map' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Compass className="w-6 h-6 text-amber-400" />
                        Spatial Concession GIS &amp; Bench Classifications
                      </h1>
                      <p className="text-sm text-slate-400">
                        Interactive Leaflet GIS displaying lease perimeter, active open-cast extraction benches, and satellite-guided reserve classifications
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAiModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-400 self-start sm:self-auto"
                    >
                      Run AI Analysis &rarr;
                    </button>
                  </div>
                  <div className="h-[600px] w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <MineMap
                      selectedMineId={selectedMine.id}
                      center={[selectedMine.lat, selectedMine.lng]}
                      onZoneSelect={() => setActiveTab('results')}
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Satellite Telemetry */}
              {activeTab === 'satellite' && (
                <SatellitePanel
                  mineName={selectedMine.name}
                  selectedMineId={selectedMine.id}
                  onRunAiAnalysis={() => setIsAiModalOpen(true)}
                />
              )}

              {/* Tab 4: AI Mining Intelligence Results (Reserve, Production, Risk, XAI) */}
              {activeTab === 'results' && (
                <MiningResultsView
                  selectedMineId={selectedMine.id}
                  selectedMineName={selectedMine.name}
                  onNavigateTab={(tab) => {
                    if (tab === 'recommendations') setActiveTab('recommendations');
                    else if (tab === 'simulation') setActiveTab('simulation');
                    else if (tab === 'risk') setActiveTab('results');
                    else setActiveTab(tab);
                  }}
                />
              )}

              {/* Tab 5: Decision Support / Recommendations */}
              {activeTab === 'recommendations' && (
                <RecommendationsPage
                  selectedMineId={selectedMine.id}
                  selectedMineName={selectedMine.name}
                />
              )}

              {/* Tab 6: What-If Scenario Simulator */}
              {activeTab === 'simulation' && <SimulationPage />}

              {/* Tab 7: Data Quality & Health Telemetry */}
              {activeTab === 'quality' && (
                <DataQualityPage
                  selectedMineId={selectedMine.id}
                  selectedMineName={selectedMine.name}
                />
              )}

              {/* Tab 8: System Architecture & 6-Dev Team Hub */}
              {activeTab === 'system' && <SystemInfoPage />}
            </div>
          </main>
        </div>
      )}

      {/* SCREEN 4: 7-STAGE AI ANALYSIS EXECUTION MODAL */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedMineId={selectedMine.id}
        selectedMineName={selectedMine.name}
        onComplete={() => {
          setActiveTab('results');
        }}
      />
    </div>
  );
};

export default App;
