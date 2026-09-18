import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Lightbulb,
  Activity,
  CloudRain,
  Truck
} from 'lucide-react';
import { DashboardData, ProductionTrendData } from '../types';
import { apiService } from '../services/api';
import { ProductionChart } from '../components/charts/ProductionChart';

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
  selectedMineId?: string;
  selectedMineName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, selectedMineId, selectedMineName }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [prodTrend, setProdTrend] = useState<ProductionTrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dash, prod] = await Promise.all([
          apiService.getDashboard(selectedMineId),
          apiService.getProduction(selectedMineId)
        ]);
        setData(dash);
        setProdTrend(prod);
      } catch (err) {
        console.error('Error fetching dashboard feeds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMineId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-[#5F7487]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2A900] mr-3" />
        <span className="text-sm font-medium">Loading Executive Mining Operations Feeds...</span>
      </div>
    );
  }

  const { kpis, top_recommendation } = data;

  return (
    <div className="space-y-6 max-w-[1380px] mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#DDE0DC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#18324A] tracking-tight">Executive Overview</h1>
            <span className="text-xs px-2.5 py-0.5 rounded bg-[#F6F6F2] text-[#18324A] border border-[#DDE0DC] font-semibold">
              {selectedMineName || 'Balaghat Mine (Bharveli)'}
            </span>
          </div>
          <p className="text-xs text-[#5F7487] mt-1">
            Real-time mine operational health, extraction run rates, and active human-in-the-loop decisions.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-[#F6F6F2] px-3.5 py-1.5 rounded border border-[#DDE0DC] shrink-0 shadow-card">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16866A] animate-pulse" />
            <span className="font-semibold text-[#18324A]">Operational Status: ACTIVE</span>
          </div>
          <span className="text-[#DDE0DC]">&bull;</span>
          <div className="flex items-center space-x-1 text-[#5F7487]">
            <Clock className="w-3 h-3" />
            <span className="font-mono text-[11px]">Updated 2m ago</span>
          </div>
        </div>
      </div>

      {/* ── 4 Executive KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Proven Reserves */}
        <div
          onClick={() => onNavigateTab('results')}
          className="bg-[#FAFAF7] border border-[#DDE0DC] hover:border-[#8293A3] rounded-lg p-4 transition-all cursor-pointer shadow-card group"
        >
          <div className="text-[11px] font-semibold text-[#8293A3] uppercase tracking-wider mb-1">Proven Reserves</div>
          <div className="text-2xl font-bold text-[#18324A] font-mono tabular-nums">
            {(kpis.total_estimated_reserves_tonnes / 1_000_000).toFixed(3)}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">Mt</span>
          </div>
          <div className="mt-1.5 text-xs text-[#5F7487]">
            Avg Grade <span className="font-mono font-semibold text-[#18324A]">41.8% Mn</span>
          </div>
          <div className="mt-2 text-[10px] text-[#F2A900] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View Reserve Intelligence →
          </div>
        </div>

        {/* Daily Extraction */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-[#FAFAF7] border border-[#DDE0DC] hover:border-[#8293A3] rounded-lg p-4 transition-all cursor-pointer shadow-card group"
        >
          <div className="text-[11px] font-semibold text-[#8293A3] uppercase tracking-wider mb-1">Daily Extraction</div>
          <div className="text-2xl font-bold text-[#18324A] font-mono tabular-nums">
            {kpis.daily_predicted_production_tonnes}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">t/day</span>
          </div>
          <div className="mt-1.5 text-xs text-[#5F7487]">Current shift run rate</div>
          <div className="mt-2 text-[10px] text-[#F2A900] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View Production Analytics →
          </div>
        </div>

        {/* Production Target */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-[#FAFAF7] border border-[#DDE0DC] hover:border-[#8293A3] rounded-lg p-4 transition-all cursor-pointer shadow-card group"
        >
          <div className="text-[11px] font-semibold text-[#8293A3] uppercase tracking-wider mb-1">Production Target</div>
          <div className="text-2xl font-bold text-[#18324A] font-mono tabular-nums">
            {kpis.daily_planned_production_tonnes}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">t/day</span>
          </div>
          <div className="mt-1.5 text-xs font-semibold text-[#C94747] font-mono">
            −{kpis.daily_shortfall_tonnes} t &nbsp;
            <span className="font-normal text-[#5F7487]">({kpis.shortfall_percentage}% deficit)</span>
          </div>
          <div className="mt-2 text-[10px] text-[#F2A900] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View Shortfall Drivers →
          </div>
        </div>

        {/* Operational Risk */}
        <div
          onClick={() => onNavigateTab('results')}
          className="bg-[#FAFAF7] border border-[#DDE0DC] hover:border-[#8293A3] rounded-lg p-4 transition-all cursor-pointer shadow-card group"
        >
          <div className="text-[11px] font-semibold text-[#8293A3] uppercase tracking-wider mb-1">Operational Risk</div>
          <div className="text-2xl font-bold font-mono tabular-nums flex items-baseline gap-2">
            <span className={kpis.current_risk_tier === 'CRITICAL' ? 'text-[#C94747]' : 'text-[#C47A00]'}>
              {kpis.current_risk_score}
            </span>
            <span className="text-xs text-[#5F7487] font-sans font-normal">/ 100</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
              kpis.current_risk_tier === 'CRITICAL'
                ? 'text-[#C94747] bg-[#FAEAEA] border border-[#C94747]/20'
                : 'text-[#C47A00] bg-[#FDF0D9] border border-[#C47A00]/20'
            }`}>
              {kpis.current_risk_tier}
            </span>
          </div>
          <div className="mt-1.5 text-xs text-[#5F7487]">4-factor weighted engine</div>
          <div className="mt-2 text-[10px] text-[#F2A900] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View Risk Analysis →
          </div>
        </div>
      </div>

      {/* ── Production Status + Operational Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Production Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F0EB] pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#18324A] uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#16866A]" />
                Production Status &amp; 14-Day Trajectory
              </h2>
              <p className="text-xs text-[#5F7487] mt-0.5">
                Actual daily extraction vs. {kpis.daily_planned_production_tonnes.toLocaleString()} t/day scheduled benchmark.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs text-[#F2A900] hover:text-[#D99400] font-semibold flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
            >
              Full Production Analytics →
            </button>
          </div>
          {prodTrend && <ProductionChart data={prodTrend.history} height={240} />}
        </div>

        {/* Operational Status (1 col) */}
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="border-b border-[#F1F0EB] pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#18324A] uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
                Operational Status
              </h2>
              <p className="text-xs text-[#5F7487] mt-0.5">Central India Concession Network</p>
            </div>

            <div className="space-y-0 text-xs divide-y divide-[#F1F0EB]">
              {[
                { label: 'Mine Fleet Status',    value: <span className="font-semibold text-[#16866A] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#16866A] inline-block" />Active · Shift A</span> },
                { label: 'Mines Monitored',      value: <span className="font-mono font-semibold text-[#18324A]">8 Concessions (MP &amp; MH)</span> },
                { label: 'Operational Benches',  value: <span className="font-mono font-semibold text-[#18324A]">5 Extraction Zones</span> },
                { label: 'Spatial GIS Layers',   value: <span className="font-semibold text-[#16866A]">● Vectors Active</span> },
                { label: 'Telemetry Engine',     value: <span className="font-semibold text-[#16866A]">● Live Sensor Feeds</span> },
                { label: 'Fleet Health Score',   value: <span className="font-mono font-semibold text-[#18324A]">{kpis.fleet_health_score || 88.4}%</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2">
                  <span className="text-[#5F7487]">{label}</span>
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1F0EB] mt-4">
            <button
              onClick={() => onNavigateTab('map')}
              className="w-full py-2 px-3 rounded bg-[#F1F0EB] hover:bg-[#DDE0DC] text-[#18324A] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#5F7487]" />
              <span>View In Spatial Concession GIS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#5F7487]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Attention Required ── */}
      <div className="bg-[#FAEAEA] border border-[#C94747]/20 border-l-4 border-l-[#C94747] rounded-lg p-5 shadow-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#C94747] shrink-0" />
              <span className="text-xs font-bold text-[#C94747] uppercase tracking-wider">
                Attention Required: Production Shortfall · Shift Deficit
              </span>
              <span className="text-xs text-[#5F7487] font-mono hidden sm:inline">· 87% Confidence</span>
            </div>

            <p className="text-xs text-[#5F7487] leading-relaxed">
              Daily extraction deficit of{' '}
              <strong className="text-[#18324A]">−{kpis.daily_shortfall_tonnes} tonnes</strong> detected.
              Heavy rainfall saturation (54.2 mm) in Pit C combined with secondary haul dumper cycle delays
              is impacting primary crusher feed.
            </p>

            <div className="pt-1">
              <div className="text-[11px] font-bold text-[#C47A00] uppercase tracking-wide flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Recommended Action:
              </div>
              <p className="text-xs font-semibold text-[#18324A] mt-0.5">
                {top_recommendation?.title || 'Re-deploy Haul Dumper Fleet to Pit A Upper Bench'}
              </p>
              <p className="text-xs text-[#5F7487] mt-0.5">
                {top_recommendation?.recommended_action ||
                  'Temporarily re-route dumpers DMP_VOLVO_FMX_11 and 12 to North Pit A bench −120m RL.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#5F7487] font-semibold block">Expected Recovery</span>
              <span className="text-lg font-bold text-[#16866A] font-mono block">
                +{top_recommendation?.expected_tonnage_recovery || 110} tonnes
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="px-4 py-2 rounded bg-[#F2A900] hover:bg-[#D99400] active:bg-[#BF7F00] text-[#18324A] font-semibold text-xs shadow-card transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>View Decision Support</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Status Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Environmental */}
        <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded-lg px-4 py-3 flex items-center gap-3 shadow-card">
          <CloudRain className="w-4 h-4 text-[#2878A8] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-[#8293A3] tracking-wider">Environmental</div>
            <div className="text-xs font-semibold text-[#C94747] mt-0.5">Severe Flood Risk · 87 mm Rainfall</div>
          </div>
          <button onClick={() => onNavigateTab('satellite')} className="ml-auto text-[10px] text-[#F2A900] font-semibold shrink-0 hover:text-[#D99400]">View →</button>
        </div>

        {/* Fleet */}
        <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded-lg px-4 py-3 flex items-center gap-3 shadow-card">
          <Truck className="w-4 h-4 text-[#5F7487] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-[#8293A3] tracking-wider">Fleet Status</div>
            <div className="text-xs font-semibold text-[#18324A] mt-0.5">4 / 7 Units Active · 3 Under Maintenance</div>
          </div>
          <button onClick={() => onNavigateTab('production')} className="ml-auto text-[10px] text-[#F2A900] font-semibold shrink-0 hover:text-[#D99400]">View →</button>
        </div>

        {/* Data Health */}
        <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded-lg px-4 py-3 flex items-center gap-3 shadow-card">
          <Activity className="w-4 h-4 text-[#16866A] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-[#8293A3] tracking-wider">Data Quality</div>
            <div className="text-xs font-semibold text-[#16866A] mt-0.5">95.1% Completeness · All Feeds Active</div>
          </div>
          <button onClick={() => onNavigateTab('quality')} className="ml-auto text-[10px] text-[#F2A900] font-semibold shrink-0 hover:text-[#D99400]">View →</button>
        </div>
      </div>

    </div>
  );
};
