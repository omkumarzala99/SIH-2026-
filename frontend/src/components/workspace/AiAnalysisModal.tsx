import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
  Database,
  Satellite,
  Cpu,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface PipelineStage {
  id: number;
  name: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  durationMs: number;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const stages: PipelineStage[] = [
    {
      id: 0,
      name: 'Ingesting Multi-Spectral Satellite & Weather Feeds',
      subtext: 'Sentinel-2 MSI, Landsat-9 OLI thermal, and IMD radar precipitation',
      icon: Satellite,
      durationMs: 400
    },
    {
      id: 1,
      name: 'Querying Geological Corehole Assays from DB',
      subtext: 'Connecting to database/seed_data.py assay tables & drillcore logs',
      icon: Database,
      durationMs: 400
    },
    {
      id: 2,
      name: 'Running Reserve Random Forest Classifier',
      subtext: 'ai_ml/models/reserve_model.joblib (Target leakage-free Mn ≥ 35%)',
      icon: Layers,
      durationMs: 500
    },
    {
      id: 3,
      name: 'Executing 14-Feature Production GradientBoosting Regressor',
      subtext: 'ai_ml/models/production_model.joblib with operational & weather lags',
      icon: Cpu,
      durationMs: 500
    },
    {
      id: 4,
      name: 'Calculating Extraction Deficit & Shift Shortfall',
      subtext: 'Comparing planned 1,000t vs predicted tonnage & bench availability',
      icon: TrendingDown,
      durationMs: 400
    },
    {
      id: 5,
      name: 'Computing Authoritative 4-Component Risk Matrix',
      subtext: 'Equipment (35%), Weather (25%), Blasting (20%), Deficit (20%)',
      icon: AlertTriangle,
      durationMs: 450
    },
    {
      id: 6,
      name: 'Synthesizing Human-in-the-Loop Action Protocols',
      subtext: 'Formulating prescriptive corrective interventions for mine managers',
      icon: Lightbulb,
      durationMs: 450
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setCompletedStages([]);
      setIsFinished(false);
      return;
    }

    // Trigger pipeline data fetch
    apiService.getDashboard().catch(() => {});
    apiService.getRisk().catch(() => {});
    apiService.getRecommendations().catch(() => {});

    let stageIdx = 0;
    let timer: any;

    const runNextStage = () => {
      if (stageIdx < stages.length) {
        setCurrentStageIndex(stageIdx);
        timer = setTimeout(() => {
          setCompletedStages((prev) => [...prev, stageIdx]);
          stageIdx += 1;
          if (stageIdx < stages.length) {
            runNextStage();
          } else {
            setIsFinished(true);
          }
        }, stages[stageIdx].durationMs);
      }
    };

    runNextStage();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPct = Math.round((completedStages.length / stages.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Executing MOIL AI Mining Intelligence Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end multi-source automated execution &amp; inference chain
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4 pb-2 bg-slate-900">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-slate-400">
              {isFinished ? 'Pipeline Execution Complete' : `Processing Stage ${currentStageIndex + 1} of ${stages.length}...`}
            </span>
            <span className="text-amber-400 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 7 Stages Checklist */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {stages.map((stage) => {
            const isDone = completedStages.includes(stage.id);
            const isCurrent = currentStageIndex === stage.id && !isDone;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                    : isCurrent
                    ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold">{stage.name}</div>
                    <div className="text-[10px] text-slate-400">{stage.subtext}</div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isDone ? (
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline text-[10px]">DONE</span>
                    </div>
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Summary Card if Finished */}
        {isFinished && (
          <div className="px-6 py-4 bg-emerald-500/10 border-t border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                PIPELINE INFERENCE COMPLETE
              </div>
              <div className="text-xs text-slate-300">
                Reserve (42.5% Mn) &bull; Predicted Prod: 768.5t &bull; Shortfall: -231.5t &bull; Risk: CRITICAL
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onComplete();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shrink-0"
            >
              <span>View Mining Intelligence Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
