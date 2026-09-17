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
  AlertOctagon,
  Wind,
  Droplets
} from 'lucide-react';
import { DashboardData, ProductionTrendData } from '../types';
import { apiService } from '../services/api';
import { MineMap } from '../components/map/MineMap';
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
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Mining Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-medium">
              {selectedMineName || 'Balaghat Concession'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time multi-source intelligence: Geological Reserves, Extraction Forecast, Multi-Factor Risk & Corrective Actions
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Telemetry Active &bull; Shift A</span>
        </div>
      </div>

      {/* 4 PRIMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estimated Reserves */}
        <div
          onClick={() => onNavigateTab('reserves')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4.5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold tracking-wider mb-1">
            <span>ESTIMATED RESERVES</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums font-mono">
            {kpis.total_estimated_reserves_tonnes.toLocaleString()} <span className="text-xs font-normal text-slate-400">tonnes</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-medium flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5 Zones Mapped
            </span>
            <span className="tabular-nums font-mono text-slate-300">Avg 41.8% Mn</span>
          </div>
        </div>

        {/* Card 2: Daily Scheduled Production */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4.5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold tracking-wider mb-1">
            <span>DAILY SCHEDULED EXTRACTION</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums font-mono">
            {kpis.daily_planned_production_tonnes.toLocaleString()} <span className="text-xs font-normal text-slate-400">tons / day</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">AI Predicted:</span>
            <span className="tabular-nums font-mono text-amber-400 font-semibold">{kpis.daily_predicted_production_tonnes} tons</span>
          </div>
        </div>

        {/* Card 3: Shortfall Deficit */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-xl p-4.5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold tracking-wider mb-1">
            <span>PROJECTED SHORTFALL</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tabular-nums font-mono">
            -{kpis.daily_shortfall_tonnes} <span className="text-xs font-normal text-slate-400">tons ({kpis.shortfall_percentage}%)</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-rose-400 font-medium">Deficit Alert Active</span>
            <span className="text-slate-300">Shift Lag</span>
          </div>
        </div>

        {/* Card 4: Multi-Factor Risk */}
        <div
          onClick={() => onNavigateTab('risk')}
          className="bg-slate-900 border border-slate-800 hover:border-orange-500/60 rounded-xl p-4.5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold tracking-wider mb-1">
            <span>OPERATIONAL RISK SCORE</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 tabular-nums font-mono flex items-baseline gap-2">
            {kpis.current_risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {kpis.current_risk_tier}
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Fleet Health: {kpis.fleet_health_score}%</span>
            <span className="text-orange-400 font-medium hover:underline">Explain Factors &rarr;</span>
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
          <MineMap
            selectedMineId={selectedMineId}
            onZoneSelect={() => onNavigateTab('reserves')}
          />
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

        {/* Right Col: Environmental Sensors & Real-Time Weather Telemetry */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                Space & Weather Telemetry
              </h2>
              <div>
                {environmental_status.is_live ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    LIVE WEATHER
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    OFFLINE FALLBACK
                  </span>
                )}
              </div>
            </div>

            {/* Weather Source & Freshness */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 px-0.5">
              <span className="font-mono text-slate-300 text-[11px]">
                {environmental_status.data_source_label || (environmental_status.is_live ? 'Data Source: Weatherstack' : 'Data Source: Local Simulation / Offline Fallback')}
              </span>
              <span className="text-slate-500 text-[10px] font-mono">
                {environmental_status.observation_time ? `Obs: ${environmental_status.observation_time}` : 'Latest'}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Metric 1: Precipitation */}
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Precipitation (24h)</div>
                    <div className="text-sm font-bold text-white font-mono">{environmental_status.rainfall_mm} mm</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  environmental_status.rainfall_mm >= 40 ? 'text-rose-400 bg-rose-500/10' :
                  (environmental_status.rainfall_mm >= 15 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10')
                }`}>
                  {environmental_status.weather_description || (environmental_status.rainfall_mm >= 25 ? 'Monsoon Surge' : 'Clear Extraction')}
                </span>
              </div>

              {/* Metric 2 & 3: Temperature & Humidity */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Thermometer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Ambient Temp</div>
                    <div className="text-xs font-bold text-white font-mono">{environmental_status.ambient_temp_c}&deg;C</div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Humidity</div>
                    <div className="text-xs font-bold text-white font-mono">{environmental_status.humidity_pct ?? 68}%</div>
                  </div>
                </div>
              </div>

              {/* Metric 4 & 5: Soil Moisture & Wind Speed */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Soil Moisture</div>
                    <div className="text-xs font-bold text-white font-mono">{environmental_status.soil_moisture_pct}%</div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Wind className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Wind Speed</div>
                    <div className="text-xs font-bold text-white font-mono">{environmental_status.wind_speed_kmh ?? 14} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Flood Risk Index:</span>
            <span className={`font-bold ${
              environmental_status.flood_risk_level === 'HIGH' || environmental_status.flood_risk_level === 'MODERATE_HIGH'
                ? 'text-rose-400'
                : (environmental_status.flood_risk_level === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400')
            }`}>
              {environmental_status.flood_risk_level}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PRIORITY AI RECOMMENDATION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-2.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase font-mono">
                  Priority Action
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">{top_recommendation.category}</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-1">{top_recommendation.title}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {top_recommendation.recommended_action}
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 gap-2">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Expected Recovery</div>
              <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">+{top_recommendation.expected_tonnage_recovery} tons</div>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="px-3.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              Review & Approve &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
