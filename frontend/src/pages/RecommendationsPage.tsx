import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { apiService } from '../services/api';

interface RecommendationsPageProps {
  selectedMineId?: string;
  selectedMineName?: string;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ selectedMineId, selectedMineName }) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecForModify, setSelectedRecForModify] = useState<RecommendationItem | null>(null);
  const [modifiedText, setModifiedText] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const list = await apiService.getRecommendations(selectedMineId);
      setRecommendations(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedMineId]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'MODIFY') => {
    try {
      await apiService.takeRecommendationAction(
        id,
        action,
        action === 'MODIFY' ? managerNotes : undefined,
        action === 'MODIFY' ? modifiedText : undefined
      );
      setStatusFeedback(`Recommendation marked as ${action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'MODIFIED')}`);
      setTimeout(() => setStatusFeedback(null), 3500);
      setSelectedRecForModify(null);
      fetchRecommendations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            Decision Support &amp; AI Action Protocols
            {selectedMineName && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
                {selectedMineName}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Prescriptive mitigation steps with Human-in-the-Loop decision governance (Approve, Reject, or Modify)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
            Human-in-the-Loop Active
          </span>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusFeedback && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{statusFeedback}</span>
        </div>
      )}

      {/* Modify Modal */}
      {selectedRecForModify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Modify Operational Recommendation
              </h3>
              <button
                onClick={() => setSelectedRecForModify(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Recommended Action Protocol</label>
              <textarea
                rows={3}
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Mine Manager Review Notes</label>
              <input
                type="text"
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder="e.g., Authorized with reduced speed limits for Shift-A only."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedRecForModify(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedRecForModify.id, 'MODIFY')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
              >
                Save & Authorize Modification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Cards Flow: Problem -> Risk -> Action -> Expected Impact */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const statusBg =
            rec.status === 'APPROVED'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : rec.status === 'REJECTED'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : rec.status === 'MODIFIED'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

          return (
            <div
              key={rec.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-amber-400">{rec.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono uppercase">
                    {rec.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusBg}`}>
                    {rec.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Urgency:</span>
                  <span
                    className={`font-bold uppercase ${
                      rec.urgency === 'CRITICAL'
                        ? 'text-rose-400'
                        : rec.urgency === 'HIGH'
                        ? 'text-orange-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {rec.urgency}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-base font-bold text-white">{rec.title}</h2>

              {/* Story Pipeline: Problem -> Risk -> Recommendation -> Expected Impact */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {/* 1. Problem */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    1. Observed Problem
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.problem_summary}</p>
                </div>

                {/* 2. Bottleneck / Risk */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-orange-400" />
                    2. Risk Consequence
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sustained production shortfall and potential haul fleet idling.
                  </p>
                </div>

                {/* 3. Recommended Action */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    3. Recommended Action
                  </span>
                  <p className="text-xs text-amber-200 font-medium leading-relaxed">{rec.recommended_action}</p>
                </div>

                {/* 4. Expected Impact */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    4. Expected Recovery
                  </span>
                  <p className="text-xs text-emerald-300 font-medium leading-relaxed">{rec.expected_impact}</p>
                  <div className="text-sm font-extrabold text-emerald-400 font-mono pt-1">
                    +{rec.expected_tonnage_recovery} tonnes
                  </div>
                </div>
              </div>

              {/* Manager Review Notes if any */}
              {rec.manager_notes && (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-300 font-semibold">Mine Manager Audit Note: </span>
                  {rec.manager_notes}
                </div>
              )}

              {/* Action Buttons: Approve, Reject, Modify */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedRecForModify(rec);
                    setModifiedText(rec.recommended_action);
                    setManagerNotes(rec.manager_notes || '');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Modify</span>
                </button>

                <button
                  onClick={() => handleAction(rec.id, 'REJECT')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleAction(rec.id, 'APPROVE')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Approve Action</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
