import React, { ReactNode } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar, TabType } from '../components/common/Sidebar';

interface MainLayoutProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onTriggerCrisisDemo: () => void;
  selectedMine: string;
  onSelectMine: (mine: string) => void;
  apiOnline: boolean;
  pendingRecsCount: number;
  currentRiskTier: string;
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeTab,
  onSelectTab,
  isDemoMode,
  onToggleDemoMode,
  onTriggerCrisisDemo,
  selectedMine,
  onSelectMine,
  apiOnline,
  pendingRecsCount,
  currentRiskTier,
  children
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        isDemoMode={isDemoMode}
        onToggleDemoMode={onToggleDemoMode}
        onTriggerCrisisDemo={onTriggerCrisisDemo}
        selectedMine={selectedMine}
        onSelectMine={onSelectMine}
        apiOnline={apiOnline}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          pendingRecsCount={pendingRecsCount}
          currentRiskTier={currentRiskTier}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
