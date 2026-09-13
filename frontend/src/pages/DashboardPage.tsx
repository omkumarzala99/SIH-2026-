import React, { useEffect, useState } from 'react';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Flame,
  CloudRain,
  Thermometer,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { DashboardData, ProductionTrendData } from '../types';
import { apiService } from '../services/api';
import { MineMap } from '../components/map/MineMap';
import { ProductionChart } from '../components/charts/ProductionChart';

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [prodTrend, setProdTrend] = useState<ProductionTrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dash, prod] = await Promise.all([
          apiService.getDashboard(),
          apiService.getProduction()
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
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
        <span>Loading Executive Mining Intelligence Feeds...</span>
      </div>
    );
  }

  const { kpis, environmental_status, recent_alerts, top_recommendation } = data;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Mining Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Balaghat Concession
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time multi-source intelligence: Geological Reserves, Extraction Forecast, Multi-Factor Risk & Corrective Actions
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Feed Refreshed: Just now</span>
        </div>
      </div>

      {/* 4 PRIMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estimated Reserves */}
        <div
          onClick={() => onNavigateTab('reserves')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>PROVED & PROBABLE RESERVES</span>
            <Layers className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis.total_estimated_reserves_tonnes.toLocaleString()} <span className="text-xs font-normal text-slate-400">tonnes</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5 Operational Zones
            </span>
            <span className="font-mono text-slate-300">Avg 41.8% Mn</span>
          </div>
        </div>

        {/* Card 2: Daily Scheduled Production */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>DAILY PLANNED EXTRACTION</span>
            <TrendingUp className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis.daily_planned_production_tonnes.toLocaleString()} <span className="text-xs font-normal text-slate-400">tons / day</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
            <span className="text-slate-300">AI Forecast:</span>
            <span className="font-mono text-amber-400 font-semibold">{kpis.daily_predicted_production_tonnes} tons</span>
          </div>
        </div>

        {/* Card 3: Shortfall Deficit */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-rose-500/5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>PROJECTED SHORTFALL</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            -{kpis.daily_shortfall_tonnes} <span className="text-xs font-normal text-slate-400">tons ({kpis.shortfall_percentage}%)</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
            <span className="text-rose-400">Deficit Alert Active</span>
            <span className="text-slate-300">Shift-A & B Lag</span>
          </div>
        </div>

        {/* Card 4: Multi-Factor Risk */}
        <div
          onClick={() => onNavigateTab('risk')}
          className="bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-orange-500/5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>MULTI-FACTOR RISK SCORE</span>
            <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-orange-400 font-mono flex items-baseline gap-2">
            {kpis.current_risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {kpis.current_risk_tier}
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
            <span>Fleet Availability: {kpis.fleet_health_score}%</span>
            <span className="text-orange-400 font-medium">Explain Factors &rarr;</span>
          </div>
        </div>
      </div>

      {/* MINE GIS MAP (CENTRAL VISUAL COMPONENT) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              Spatial Concession GIS Map & Reserve Classifications
            </h2>
            <p className="text-xs text-slate-400">
              Interactive Leaflet GIS showing lease perimeter, active open-cast extraction benches, and satellite-guided reserve classifications
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('reserves')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium self-start sm:self-auto transition-colors"
          >
            Explore Reserve Drillholes &rarr;
          </button>
        </div>

        <div className="h-[440px] w-full">
          <MineMap onZoneSelect={() => onNavigateTab('reserves')} />
        </div>
      </div>

      {/* LOWER SECTION: PRODUCTION FORECAST CHART + ENVIRONMENTAL SENSORS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Production Forecast Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                14-Day Production Trend & Extraction Shortfalls
              </h2>
              <p className="text-xs text-slate-400">Daily extraction tonnage vs. scheduled target with weather & blasting constraints</p>
            </div>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs text-amber-400 hover:underline"
            >
              Full Forecast Details
            </button>
          </div>

          {prodTrend && <ProductionChart data={prodTrend.history} height={240} />}
        </div>

        {/* Right Col: Environmental Sensors & Satellite Earth Observation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                Space & Weather Telemetry
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                IMD + Sentinel
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Precipitation (24h)</div>
                    <div className="text-base font-bold text-white font-mono">{environmental_status.rainfall_mm} mm</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  Monsoon Surge
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Soil Moisture Index</div>
                    <div className="text-base font-bold text-white font-mono">{environmental_status.soil_moisture_pct}%</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  Saturated Pit Floor
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Land Surface Temp (LST)</div>
                    <div className="text-base font-bold text-white font-mono">{environmental_status.ambient_temp_c}&deg;C</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Normal
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Flood Risk Index:</span>
            <span className="font-bold text-orange-400">{environmental_status.flood_risk_level}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PRIORITY AI RECOMMENDATION HERO CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase font-mono">
                  Priority AI Action
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">{top_recommendation.category}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{top_recommendation.title}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {top_recommendation.recommended_action}
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 gap-2">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Potential Recovery</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">+{top_recommendation.expected_tonnage_recovery} tons</div>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              Review & Approve &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
