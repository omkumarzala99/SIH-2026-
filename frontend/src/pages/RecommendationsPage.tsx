import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldAlert,
  TrendingUp,
  AlertCircle,
  Filter,
  Check,
  Clock,
  RotateCcw,
  X,
  ChevronRight
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { apiService } from '../services/api';

interface RecommendationsPageProps {
  selectedMineId?: string;
  selectedMineName?: string;
}

const URGENCY_COLORS = {
  CRITICAL: { dot: 'bg-[#C94747]', text: 'text-[#C94747]', bg: 'bg-[#FAEAEA]', border: 'border-[#C94747]/20', pill: 'text-[#C94747] bg-[#FAEAEA] border-[#C94747]/20', left: 'border-l-[#C94747]' },
  HIGH:     { dot: 'bg-[#C47A00]', text: 'text-[#C47A00]', bg: 'bg-[#FDF0D9]', border: 'border-[#C47A00]/20', pill: 'text-[#C47A00] bg-[#FDF0D9] border-[#C47A00]/20', left: 'border-l-[#C47A00]' },
  MEDIUM:   { dot: 'bg-[#2878A8]', text: 'text-[#2878A8]', bg: 'bg-[#D6EAF5]', border: 'border-[#2878A8]/20', pill: 'text-[#2878A8] bg-[#D6EAF5] border-[#2878A8]/20', left: 'border-l-[#DDE0DC]' },
};

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ selectedMineId, selectedMineName }) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<RecommendationItem | null>(null);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [modifiedText, setModifiedText] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const list = await apiService.getRecommendations(selectedMineId);
      setRecommendations(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, [selectedMineId]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'MODIFY') => {
    try {
      await apiService.takeRecommendationAction(
        id, action,
        action === 'MODIFY' ? managerNotes : undefined,
        action === 'MODIFY' ? modifiedText : undefined
      );
      setStatusFeedback(`Decision ${id} marked as ${action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'MODIFIED'}`);
      setTimeout(() => setStatusFeedback(null), 3500);
      setReviewItem(null);
      setIsEditingAction(false);
      fetchRecommendations();
    } catch (err) { console.error(err); }
  };

  const openReviewDrawer = (item: RecommendationItem) => {
    setReviewItem(item);
    setModifiedText(item.recommended_action);
    setManagerNotes(item.manager_notes || '');
    setIsEditingAction(false);
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (statusFilter !== 'ALL') {
      const recStatus = rec.status ? rec.status.toUpperCase() : 'PENDING';
      if (statusFilter === 'PENDING' && recStatus !== 'PENDING' && recStatus !== 'NEW') return false;
      if (statusFilter !== 'PENDING' && recStatus !== statusFilter) return false;
    }
    if (urgencyFilter !== 'ALL' && rec.urgency.toUpperCase() !== urgencyFilter) return false;
    return true;
  });

  const pendingCount = recommendations.filter(r => !r.status || r.status.toUpperCase() === 'PENDING' || r.status.toUpperCase() === 'NEW').length;

  const getStatusPill = (rec: RecommendationItem) => {
    const s = rec.status?.toUpperCase();
    if (s === 'APPROVED') return <span className="text-[10px] font-semibold text-[#16866A] bg-[#E6F4EF] border border-[#16866A]/20 px-1.5 py-0.5 rounded font-mono">APPROVED</span>;
    if (s === 'REJECTED') return <span className="text-[10px] font-semibold text-[#C94747] bg-[#FAEAEA] border border-[#C94747]/20 px-1.5 py-0.5 rounded font-mono">REJECTED</span>;
    if (s === 'MODIFIED') return <span className="text-[10px] font-semibold text-[#2878A8] bg-[#D6EAF5] border border-[#2878A8]/20 px-1.5 py-0.5 rounded font-mono">MODIFIED</span>;
    return <span className="text-[10px] font-semibold text-[#C47A00] bg-[#FDF0D9] border border-[#C47A00]/20 px-1.5 py-0.5 rounded font-mono">AWAITING</span>;
  };

  return (
    <div className="space-y-5 max-w-[1380px] mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE0DC]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FDF0D9] text-[#C47A00] border border-[#C47A00]/20 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              HUMAN-IN-THE-LOOP GOVERNANCE
            </span>
            {selectedMineName && (
              <span className="text-xs text-[#8293A3]">
                Concession: <strong className="text-[#18324A]">{selectedMineName}</strong>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#18324A] flex items-center gap-2.5">
            Operational Decisions
            <span className="text-sm px-2.5 py-0.5 rounded bg-[#F6F6F2] text-[#18324A] border border-[#DDE0DC] font-medium">
              {pendingCount} Awaiting Review
            </span>
          </h1>
          <p className="text-xs text-[#5F7487] mt-1">
            Prescriptive mitigations requiring shift managerial review and authorization.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="px-3 py-1.5 rounded bg-[#F6F6F2] hover:bg-[#F1F0EB] text-[#18324A] border border-[#DDE0DC] text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-card self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#5F7487]" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Success feedback toast */}
      {statusFeedback && (
        <div className="bg-[#E6F4EF] border border-[#16866A]/20 border-l-4 border-l-[#16866A] text-[#18324A] px-4 py-2.5 rounded text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#16866A] shrink-0" />
            <span className="font-semibold">{statusFeedback}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-[#8293A3] hover:text-[#18324A] ml-4">✕</button>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded-lg px-4 py-2.5 shadow-card flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-1.5 text-[#5F7487] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#8293A3]" />
            <span>Status:</span>
          </div>
          <div className="flex items-center space-x-1 bg-[#F1F0EB] p-0.5 rounded border border-[#DDE0DC]">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'MODIFIED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  statusFilter === s ? 'bg-[#FAFAF7] text-[#18324A] shadow-card font-semibold' : 'text-[#5F7487] hover:text-[#18324A]'
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-[#DDE0DC] hidden sm:block" />
          <span className="text-[#5F7487] font-semibold">Priority:</span>
          <div className="flex items-center space-x-1 bg-[#F1F0EB] p-0.5 rounded border border-[#DDE0DC]">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUrgencyFilter(u)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  urgencyFilter === u ? 'bg-[#FAFAF7] text-[#18324A] shadow-card font-semibold' : 'text-[#5F7487] hover:text-[#18324A]'
                }`}
              >
                {u.charAt(0) + u.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[#8293A3] text-[11px] font-mono">
          {filteredRecommendations.length} of {recommendations.length}
        </span>
      </div>

      {/* ── Decision Queue ── */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-[#5F7487]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2A900] mr-3" />
          <span className="text-sm font-medium">Loading Decisions Queue...</span>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-12 text-center text-[#5F7487] space-y-1 shadow-card">
          <CheckCircle2 className="w-8 h-8 text-[#16866A] mx-auto mb-2" />
          <div className="text-sm font-bold text-[#18324A]">No decisions match the selected filters</div>
          <p className="text-xs text-[#5F7487]">All current shift action protocols are up to date.</p>
        </div>
      ) : (
        <div className="space-y-0 bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg overflow-hidden shadow-card">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-4 py-2.5 bg-[#F1F0EB] border-b border-[#DDE0DC] text-[10px] font-semibold uppercase tracking-wider text-[#8293A3]">
            <span>Priority</span>
            <span>Decision</span>
            <span className="text-right hidden sm:block">Recovery</span>
            <span className="text-right hidden md:block">Status</span>
            <span />
          </div>

          {filteredRecommendations.map((rec, index) => {
            const urgency = (rec.urgency?.toUpperCase() || 'MEDIUM') as keyof typeof URGENCY_COLORS;
            const colors = URGENCY_COLORS[urgency] || URGENCY_COLORS.MEDIUM;
            const prevRec = filteredRecommendations[index - 1];
            const isNewSection = urgencyFilter === 'ALL' && (!prevRec || prevRec.urgency !== rec.urgency);

            return (
              <React.Fragment key={rec.id}>
                {isNewSection && (
                  <div className="px-4 py-1.5 bg-[#F6F6F2] border-b border-[#DDE0DC] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#18324A]">
                      {urgency === 'CRITICAL' || urgency === 'HIGH' ? 'High Priority Queue' : 'Medium Priority Queue'}
                    </span>
                    <span className="text-[10px] text-[#8293A3] font-mono">Requires Shift Manager Authorization</span>
                  </div>
                )}

                {/* Compact Queue Row */}
                <div
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-4 py-3.5 border-b border-[#F1F0EB] border-l-4 ${colors.left} hover:bg-[#F6F6F2] transition-colors group`}
                >
                  {/* Priority Dot + Label */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                    <span className={`text-[10px] font-bold font-mono uppercase ${colors.text}`}>{rec.urgency}</span>
                  </div>

                  {/* Decision Title */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#18324A] truncate">{rec.title}</div>
                    <div className="text-[11px] text-[#8293A3] font-mono mt-0.5">{rec.id} · {rec.category}</div>
                  </div>

                  {/* Recovery */}
                  <div className="text-right hidden sm:block shrink-0">
                    <div className="text-[10px] text-[#8293A3] uppercase font-semibold">Recovery</div>
                    <div className="text-sm font-bold font-mono text-[#16866A]">+{rec.expected_tonnage_recovery} t</div>
                  </div>

                  {/* Status Pill */}
                  <div className="hidden md:block shrink-0">
                    {getStatusPill(rec)}
                  </div>

                  {/* Review Button */}
                  <button
                    onClick={() => openReviewDrawer(rec)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#F2A900] hover:bg-[#D99400] text-[#18324A] font-semibold text-xs shadow-card transition-colors shrink-0"
                  >
                    Review
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Review Decision Drawer ── */}
      {reviewItem && (() => {
        const urgency = (reviewItem.urgency?.toUpperCase() || 'MEDIUM') as keyof typeof URGENCY_COLORS;
        const colors = URGENCY_COLORS[urgency] || URGENCY_COLORS.MEDIUM;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18324A]/50 backdrop-blur-sm p-4">
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg max-w-2xl w-full shadow-drawer overflow-hidden flex flex-col max-h-[90vh] animate-slideInRight">

              {/* Drawer Header */}
              <div className={`px-5 py-4 border-b border-[#F1F0EB] flex items-center justify-between ${colors.bg}`}>
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className={`font-bold uppercase font-mono ${colors.text}`}>{reviewItem.urgency} Priority</span>
                    <span className="text-[#8293A3]">&bull;</span>
                    <span className="font-mono text-[#8293A3]">{reviewItem.id}</span>
                    <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAFAF7]/60 border border-[#DDE0DC] text-[#5F7487]">
                      {reviewItem.category}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#18324A] mt-1">{reviewItem.title}</h2>
                </div>
                <button
                  onClick={() => setReviewItem(null)}
                  className="text-[#8293A3] hover:text-[#18324A] p-1 rounded hover:bg-[#F1F0EB] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">

                {/* 1. Observed Root Cause */}
                <div className="p-3.5 bg-[#F6F6F2] rounded border border-[#DDE0DC] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8293A3] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#C94747]" />
                    1. Observed Root Cause
                  </span>
                  <p className="text-[#18324A] leading-relaxed">{reviewItem.problem_summary}</p>
                </div>

                {/* 2. Evidence */}
                <div className="p-3.5 bg-[#F6F6F2] rounded border border-[#DDE0DC] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8293A3] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#2878A8]" />
                    2. Operational Risk if Unaddressed
                  </span>
                  <p className="text-[#5F7487] leading-relaxed">
                    {reviewItem.category === 'EQUIPMENT'
                      ? 'Extended dumper wait queue at Central Pit B and primary crusher starving below minimum throughput.'
                      : reviewItem.category === 'BLASTING'
                      ? 'Delayed fragmentation causes shovel loading cycle resistance and secondary blasting requirements.'
                      : 'Pit floor saturation leads to dumper slippage and mandatory safety speed reductions.'}
                  </p>
                </div>

                {/* 3. Recommended Action (editable) */}
                <div className="p-3.5 bg-[#FAFAF7] rounded border border-[#F2A900]/50 space-y-1.5 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#C47A00] flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      3. Recommended Action Protocol
                    </span>
                    <button
                      onClick={() => setIsEditingAction(!isEditingAction)}
                      className="text-[11px] text-[#2878A8] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingAction ? 'Cancel Edit' : 'Edit'}</span>
                    </button>
                  </div>
                  {isEditingAction ? (
                    <textarea
                      rows={3}
                      value={modifiedText}
                      onChange={(e) => setModifiedText(e.target.value)}
                      className="w-full bg-[#F6F6F2] border border-[#DDE0DC] rounded p-2 text-xs text-[#18324A] focus:outline-none focus:border-[#F2A900]"
                    />
                  ) : (
                    <p className="text-[#18324A] font-medium leading-relaxed">{modifiedText}</p>
                  )}
                </div>

                {/* 4. Expected Recovery */}
                <div className="p-3.5 bg-[#E6F4EF] rounded border border-[#16866A]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#16866A]">4. Expected Output Recovery</span>
                    <div className="text-lg font-bold text-[#16866A] font-mono mt-0.5">
                      +{reviewItem.expected_tonnage_recovery} tonnes / shift
                    </div>
                    <div className="text-[11px] text-[#5F7487]">{reviewItem.expected_impact}</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#16866A]/30" />
                </div>

                {/* 5. Manager Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#18324A] block">
                    5. Mine Manager Governance &amp; Audit Note
                  </label>
                  <input
                    type="text"
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    placeholder="e.g. Authorized for Shift A only. Re-inspect at 18:00."
                    className="w-full bg-[#F6F6F2] border border-[#DDE0DC] rounded p-2 text-xs text-[#18324A] focus:outline-none focus:border-[#F2A900]"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="px-5 py-3.5 bg-[#F6F6F2] border-t border-[#F1F0EB] flex items-center justify-between gap-3">
                <button
                  onClick={() => setReviewItem(null)}
                  className="px-3 py-1.5 rounded bg-[#FAFAF7] border border-[#DDE0DC] text-xs font-medium text-[#5F7487] hover:bg-[#F1F0EB] transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction(reviewItem.id, 'REJECT')}
                    className="px-3.5 py-1.5 rounded bg-[#FAFAF7] border border-[#C94747] text-[#C94747] hover:bg-[#FAEAEA] text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  {isEditingAction || managerNotes ? (
                    <button
                      onClick={() => handleAction(reviewItem.id, 'MODIFY')}
                      className="px-3.5 py-1.5 rounded bg-[#2878A8] hover:bg-[#2A6A8E] text-white text-xs font-semibold transition-colors flex items-center space-x-1 shadow-card"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Authorize Modification</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(reviewItem.id, 'APPROVE')}
                      className="px-4 py-1.5 rounded bg-[#16866A] hover:bg-[#127356] text-white text-xs font-semibold transition-colors flex items-center space-x-1 shadow-card"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Decision</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
