import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { DataQualityReport } from '../types';
import { apiService } from '../services/api';

export const DataQualityPage: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuality = async () => {
    setLoading(true);
    try {
      const q = await apiService.getDataQuality();
      setReport(q);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, []);

  if (loading || !report) {
    return <div className="p-12 text-center text-slate-400">Auditing Real Mining Datasets Quality...</div>;
  }

  const { fleet_health_score, domains } = report;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Data Quality & Pipeline Health Governance
          </h1>
          <p className="text-sm text-slate-400">
            Automated empirical audit tracking completeness, duplicate integrity, out-of-bound values, and sensor freshness
          </p>
        </div>

        <button
          onClick={fetchQuality}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Re-audit Datasets</span>
        </button>
      </div>

      {/* Aggregate Score Card */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Empirical Health Rating (Non-Fabricated)
          </div>
          <h2 className="text-xl font-bold text-white">
            Overall Enterprise Data Completeness: {fleet_health_score}%
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Calculated directly from ingested records across Geological Boreholes, Dispatch Logs, Heavy Machinery Telematics, Weather Stations, and Space Observations.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
          <Activity className="w-8 h-8 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400">Composite Health</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{fleet_health_score}%</div>
          </div>
        </div>
      </div>

      {/* 5 Domain Quality Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(domains).map(([key, dom]) => (
          <div
            key={key}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">{dom.name}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {dom.overall_score}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Total Rows:</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{dom.total_records}</div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Completeness:</span>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">{dom.completeness_pct}%</div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Duplicate Rows:</span>
                <div className="text-sm font-bold font-mono text-slate-300 mt-0.5">{dom.duplicate_records}</div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Validity Rate:</span>
                <div className="text-sm font-bold font-mono text-blue-400 mt-0.5">{dom.validity_pct}%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Freshness:
              </span>
              <span className="font-mono text-slate-300">{dom.freshness_hours_ago}h ago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
