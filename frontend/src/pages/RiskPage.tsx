import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Truck,
  CloudRain,
  Zap,
  TrendingDown,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';
import { RiskData } from '../types';
import { apiService } from '../services/api';

interface RiskPageProps {
  selectedMineId?: string;
  selectedMineName?: string;
}

export const RiskPage: React.FC<RiskPageProps> = ({ selectedMineId, selectedMineName }) => {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await apiService.getRisk(selectedMineId);
        setRiskData(r);
        // Predefined 7-day risk timeline
        setHistory([
          { date: '03-08', score: 28.5, tier: 'LOW', factor: 'Stable clear weather' },
          { date: '03-09', score: 42.0, tier: 'MEDIUM', factor: 'Scattered showers (12mm)' },
          { date: '03-10', score: 58.4, tier: 'HIGH', factor: 'Rainfall & pit sump inflow' },
          { date: '03-11', score: 72.8, tier: 'CRITICAL', factor: 'CAT excavator hose burst' },
          { date: '03-12', score: 69.2, tier: 'HIGH', factor: 'Continuous monsoon & blast freeze' },
          { date: '03-13', score: 66.5, tier: 'HIGH', factor: 'Pit dewatering underway' },
          { date: '03-14 (Today)', score: 68.5, tier: 'HIGH', factor: 'Downtime + 18% shortfall' }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMineId]);

  if (loading || !riskData) {
    return <div className="p-12 text-center text-slate-400">Loading Multi-Factor Mining Risk Intelligence...</div>;
  }

  const { overall_risk_score, risk_tier, equipment_risk, weather_risk, blasting_risk, production_risk, contributing_factors, summary_explanation } = riskData;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            Transparent Multi-Factor Risk Engine &amp; Explainability
            {selectedMineName && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-normal">
                {selectedMineName}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Real-time composite operational risk index and explainable factor attribution without black-box opacity
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold uppercase self-start sm:self-auto font-mono">
          Tier: {risk_tier} RISK
        </span>
      </div>

      {/* Main Risk Gauge & 4 Domain Risk Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Overall Composite Risk Card */}
        <div className="lg:col-span-4 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/30 border border-orange-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs text-orange-400 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Current Composite Operational Threat Rating</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {summary_explanation}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Formulated from weighted multi-sensor telemetry across heavy earth moving fleet status (35%), precipitation index (25%), blast clearance (20%), and daily output deficit (20%).
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0 min-w-[180px]">
            <span className="text-xs text-slate-400 font-medium">COMPOSITE SCORE</span>
            <div className="text-4xl font-extrabold text-orange-400 font-mono mt-1">
              {overall_risk_score} <span className="text-sm text-slate-400 font-normal">/ 100</span>
            </div>
            <span className="mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
              {risk_tier} SEVERITY
            </span>
          </div>
        </div>

        {/* Domain 1: Equipment Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">EQUIPMENT FLEET RISK</span>
            <Truck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{equipment_risk} / 100</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${equipment_risk}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Weight: 35% | 6.5h CAT-349 Excavator breakdown</div>
        </div>

        {/* Domain 2: Weather Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">WEATHER & PRECIPITATION</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{weather_risk} / 100</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${weather_risk}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Weight: 25% | 54.2mm rain + 58.4% soil moisture</div>
        </div>

        {/* Domain 3: Blasting Delay Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">BLASTING DELAY RISK</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{blasting_risk} / 100</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${blasting_risk}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Weight: 20% | 2.2h safety detonation freeze</div>
        </div>

        {/* Domain 4: Production Deficit Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">PRODUCTION DEFICIT RISK</span>
            <TrendingDown className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 font-mono">{production_risk} / 100</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${production_risk}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Weight: 20% | 18% shortfall (180 tonnes below plan)</div>
        </div>
      </div>

      {/* Explainability Cards Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-400" />
              Explainable AI (XAI): Contributing Factor Attribution
            </h2>
            <p className="text-xs text-slate-400">
              Clear mathematical attribution of why the system flagged HIGH risk without opaque AI hallucinations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributing_factors.map((factor, idx) => {
            const sevBg =
              factor.severity === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : factor.severity === 'HIGH'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

            return (
              <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white">{factor.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-mono">Weight: {(factor.weight * 100).toFixed(0)}%</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${sevBg}`}>
                      {factor.severity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{factor.description}</p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Observed Metric:</span>
                  <span className="font-mono font-bold text-amber-400">{factor.observed_value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Risk Trajectory Timeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            7-Day Operational Risk Score History
          </h2>
          <span className="text-xs text-slate-400">Temporal risk tracking</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {history.map((h, i) => (
            <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-mono">{h.date}</div>
              <div className="text-lg font-bold font-mono text-white mt-1">{h.score}</div>
              <span
                className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase mt-1 ${
                  h.tier === 'CRITICAL'
                    ? 'text-rose-400 bg-rose-500/10'
                    : h.tier === 'HIGH'
                    ? 'text-orange-400 bg-orange-500/10'
                    : h.tier === 'MEDIUM'
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {h.tier}
              </span>
              <div className="text-[10px] text-slate-400 mt-2 truncate" title={h.factor}>
                {h.factor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
