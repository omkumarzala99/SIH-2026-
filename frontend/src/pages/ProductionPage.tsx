import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CloudRain,
  Zap,
  Truck,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { ProductionTrendData, EquipmentItem } from '../types';
import { apiService } from '../services/api';
import { ProductionChart } from '../components/charts/ProductionChart';

export const ProductionPage: React.FC = () => {
  const [prodData, setProdData] = useState<ProductionTrendData | null>(null);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic prediction state
  const [downtimeInput, setDowntimeInput] = useState(6.5);
  const [rainfallInput, setRainfallInput] = useState(54.2);
  const [blastingInput, setBlastingInput] = useState(2.2);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [forecasting, setForecasting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, eq] = await Promise.all([
          apiService.getProduction(),
          apiService.getEquipment()
        ]);
        setProdData(p);
        setEquipmentList(eq);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRecalculateForecast = async () => {
    setForecasting(true);
    try {
      // Local or API prediction
      const lossDowntime = downtimeInput * 28.0;
      const lossWeather = Math.max(0, (rainfallInput - 15.0) * 1.8);
      const lossBlast = blastingInput * 35.0;
      const totalLoss = lossDowntime + lossWeather + lossBlast;
      const predicted = Math.max(0, Math.round(1000 - totalLoss));
      const shortfall = 1000 - predicted;
      const shortfallPct = Math.round((shortfall / 1000) * 100);

      setForecastResult({
        planned: 1000,
        predicted,
        shortfall,
        shortfall_pct: shortfallPct,
        loss_downtime: Math.round(lossDowntime),
        loss_weather: Math.round(lossWeather),
        loss_blast: Math.round(lossBlast)
      });
    } finally {
      setForecasting(false);
    }
  };

  if (loading || !prodData) {
    return <div className="p-12 text-center text-slate-400">Loading Production Trends & Fleet Telematics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Production Forecasting & Shortfall Prediction
          </h1>
          <p className="text-sm text-slate-400">
            Real-time daily extraction monitoring, shift tracking, and machine-learning operational shortfall detection
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Daily Shift Cycle: 3 Shifts / 24h
          </span>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">PLANNED TARGET</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{prodData.current_target} tons</div>
          <div className="text-xs text-slate-400 mt-2">Daily scheduled quota across all 5 benches</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">AI PREDICTED EXTRACTION</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{prodData.current_predicted} tons</div>
          <div className="text-xs text-slate-400 mt-2">Model: GradientBoosting_Forecaster_v1</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">PROJECTED SHORTFALL</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">-{prodData.current_shortfall} tons</div>
          <div className="text-xs text-rose-400 mt-2 font-medium">
            Deficit: {prodData.shortfall_percentage}% below plan
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">ACTIVE FLEET STATUS</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {equipmentList.filter(e => e.status === 'OPTIMAL').length} / {equipmentList.length} Units
          </div>
          <div className="text-xs text-slate-400 mt-2">1 Excavator & 1 Rig under maintenance</div>
        </div>
      </div>

      {/* Production Trend Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              14-Day Shift Extraction vs. Scheduled Targets
            </h2>
            <p className="text-xs text-slate-400">Notice shortfall spikes during monsoon storms and equipment maintenance</p>
          </div>
        </div>
        <ProductionChart data={prodData.history} height={260} />
      </div>

      {/* Operational Constraints & Forecasting Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Heavy Earth Moving Machinery (HEMM) Fleet Logs */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              Heavy Earthmoving Fleet (HEMM) Telematics
            </h2>
            <span className="text-xs text-slate-400 font-mono">Balaghat Pit Equipment</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Equipment ID</th>
                  <th className="pb-2 font-medium">Category / Model</th>
                  <th className="pb-2 font-medium">Operating Zone</th>
                  <th className="pb-2 font-medium">Downtime</th>
                  <th className="pb-2 font-medium">Efficiency</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-mono text-slate-200 font-semibold">{eq.id}</td>
                    <td className="py-2.5 text-slate-300">{eq.name}</td>
                    <td className="py-2.5 text-slate-400">{eq.zone}</td>
                    <td className="py-2.5 font-mono text-slate-200">{eq.downtime_h} h</td>
                    <td className="py-2.5 font-mono text-slate-200">{eq.efficiency}%</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          eq.status === 'OPTIMAL'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : eq.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Contributing Factors Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" />
                Contributing Constraint Factors
              </h2>
              <p className="text-xs text-slate-400">Tonnage deficit root cause breakdown</p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Equipment Mechanical Breakdown</span>
                  <span className="text-rose-400 font-mono font-bold">-112 tons</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[62%] rounded-full"></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">CAT 349 Excavator hydraulic overheat (6.5h)</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Rainfall & Pit Floor Inflow</span>
                  <span className="text-orange-400 font-mono font-bold">-48 tons</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[28%] rounded-full"></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">54.2mm precipitation reduces haul ramp speed</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Bench Blasting Delays</span>
                  <span className="text-amber-400 font-mono font-bold">-20 tons</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[12%] rounded-full"></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">2.2h safety clearance window deferred</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">Total Accounted Deficit:</span>
            <span className="font-bold text-rose-400 font-mono">-180 tons (100%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
