import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Activity,
  Server,
  Cpu
} from 'lucide-react';
import { DataQualityReport } from '../types';
import { apiService } from '../services/api';

interface DataQualityPageProps {
  selectedMineId?: string;
  selectedMineName?: string;
}

export const DataQualityPage: React.FC<DataQualityPageProps> = ({ selectedMineId, selectedMineName }) => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuality = async () => {
    setLoading(true);
    try {
      const q = await apiService.getDataQuality(selectedMineId);
      setReport(q);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, [selectedMineId]);

  if (loading || !report) {
    return (
      <div className="p-12 text-center text-[#5F7487]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16866A] mx-auto mb-3"></div>
        <span className="text-sm font-medium">Auditing Ingested Mining Records &amp; Telemetry Health...</span>
      </div>
    );
  }

  const { fleet_health_score, domains } = report;

  return (
    <div className="space-y-6 max-w-[1380px] mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE0DC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F0EB] text-[#16866A] border border-[#DDE0DC] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16866A]" />
              INTEGRITY AUDIT VERIFIED
            </span>
            {selectedMineName && (
              <span className="text-xs text-[#8293A3]">
                Concession: <strong className="text-[#18324A]">{selectedMineName}</strong>
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-[#18324A] mt-1 flex items-center gap-2">
            <span>Data Quality &amp; Telemetry Governance</span>
          </h1>
          <p className="text-xs text-[#5F7487] mt-0.5">
            Automated empirical audit tracking completeness, duplicate integrity, out-of-bound values, and sensor freshness across operational domains.
          </p>
        </div>

        <button
          onClick={fetchQuality}
          className="px-3 py-1.5 rounded-md bg-[#FAFAF7] hover:bg-[#F6F6F2] text-[#18324A] text-xs font-medium flex items-center space-x-1.5 transition-colors border border-[#DDE0DC] shadow-card"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#5F7487]" />
          <span>Re-audit Datasets</span>
        </button>
      </div>

      {/* Aggregate Score Card */}
      <div className="bg-[#FAFAF7] border border-[#DDE0DC] border-l-4 border-l-[#16866A] rounded-md p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-[#16866A] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
            Empirical Health Rating (Non-Fabricated Records)
          </div>
          <h2 className="text-lg font-bold text-[#18324A]">
            Overall Enterprise Data Completeness: {fleet_health_score}%
          </h2>
          <p className="text-xs text-[#5F7487] max-w-2xl leading-relaxed">
            Verified across Geological Borehole Logs, Shift Haulage Logs, Heavy Fleet Telematics, Weather Stations, and Spaceborne Earth Observation pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] shrink-0">
          <Activity className="w-6 h-6 text-[#16866A]" />
          <div>
            <div className="text-[10px] text-[#8293A3] font-semibold uppercase">Composite Score</div>
            <div className="text-2xl font-bold text-[#16866A] font-mono">{fleet_health_score}%</div>
          </div>
        </div>
      </div>

      {/* 5 Domain Quality Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(domains).map(([key, dom]) => (
          <div
            key={key}
            className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-4 shadow-card space-y-3 hover:border-[#8293A3] transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#C47A00]" />
                <h3 className="font-bold text-xs text-[#18324A]">{dom.name}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#16866A] px-2 py-0.5 rounded bg-[#F1F0EB] border border-[#DDE0DC]">
                {dom.overall_score}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F6F6F2] p-2 rounded border border-[#DDE0DC]">
                <span className="text-[#8293A3] text-[10px] uppercase font-semibold">Total Rows:</span>
                <div className="text-sm font-bold font-mono text-[#18324A] mt-0.5">{dom.total_records.toLocaleString()}</div>
              </div>

              <div className="bg-[#F6F6F2] p-2 rounded border border-[#DDE0DC]">
                <span className="text-[#8293A3] text-[10px] uppercase font-semibold">Completeness:</span>
                <div className="text-sm font-bold font-mono text-[#16866A] mt-0.5">{dom.completeness_pct}%</div>
              </div>

              <div className="bg-[#F6F6F2] p-2 rounded border border-[#DDE0DC]">
                <span className="text-[#8293A3] text-[10px] uppercase font-semibold">Duplicates:</span>
                <div className="text-sm font-bold font-mono text-[#18324A] mt-0.5">{dom.duplicate_records}</div>
              </div>

              <div className="bg-[#F6F6F2] p-2 rounded border border-[#DDE0DC]">
                <span className="text-[#8293A3] text-[10px] uppercase font-semibold">Validity:</span>
                <div className="text-sm font-bold font-mono text-[#2878A8] mt-0.5">{dom.validity_pct}%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F0EB] text-[11px] text-[#8293A3] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8293A3]" />
                Audit Freshness:
              </span>
              <span className="font-mono text-[#18324A]">{dom.freshness_hours_ago}h ago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
