import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, TabType } from './components/common/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ReservePage } from './pages/ReservePage';
import { ProductionPage } from './pages/ProductionPage';
import { RiskPage } from './pages/RiskPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SimulationPage } from './pages/SimulationPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { SystemInfoPage } from './pages/SystemInfoPage';
import { apiService } from './services/api';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Default to resilient demo mode
  const [selectedMine, setSelectedMine] = useState<string>('MINE_BALAGHAT_01');
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  // Check backend health periodically
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/health', { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch {
        setApiOnline(false);
      }
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
      const crisis = await apiService.triggerCrisisScenario();
      setCrisisAlert(
        `🚨 SIH 2026 Presentation Crisis Triggered: Heavy Monsoon (64.2mm), Saturated Pits (62%), and CAT-349 Excavator Breakdown (6.5h) loaded. Predicted Production 820t vs 1000t target (-180t shortfall, HIGH Risk).`
      );
      // Navigate to dashboard or risk page to observe impact
      setActiveTab('dashboard');
      setTimeout(() => {
        setCrisisAlert(null);
      }, 10000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onTriggerCrisisDemo={handleTriggerCrisisDemo}
        selectedMine={selectedMine}
        onSelectMine={setSelectedMine}
        apiOnline={apiOnline}
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

      {/* Main Workspace Layout: Sidebar + Active Page */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingRecsCount={2}
          currentRiskTier="HIGH"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardPage onNavigateTab={setActiveTab} />}
            {activeTab === 'reserves' && <ReservePage />}
            {activeTab === 'production' && <ProductionPage />}
            {activeTab === 'risk' && <RiskPage />}
            {activeTab === 'recommendations' && <RecommendationsPage />}
            {activeTab === 'simulation' && <SimulationPage />}
            {activeTab === 'quality' && <DataQualityPage />}
            {activeTab === 'system' && <SystemInfoPage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
