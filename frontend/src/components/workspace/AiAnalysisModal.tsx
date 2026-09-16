import React, { useState, useEffect, useRef } from 'react';
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
  X,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { PipelineRunResult } from '../../types';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedMineId?: string;
  selectedMineName?: string;
}

interface PipelineStageConfig {
  id: number;
  name: string;
  defaultSubtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  selectedMineId = 'MINE_BALAGHAT_01',
  selectedMineName = 'Balaghat Manganese Concession'
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineRunResult | null>(null);

  const stepTimerRef = useRef<any>(null);

  const stagesConfig: PipelineStageConfig[] = [
    {
      id: 0,
      name: 'Ingesting Multi-Spectral Satellite & Environmental Data',
      defaultSubtext: `Retrieving Sentinel-2 MSI, Landsat-9 OLI thermal, and moisture indices for ${selectedMineName}`,
      icon: Satellite
    },
    {
      id: 1,
      name: 'Querying Geological Corehole Assays & Borehole Logs',
      defaultSubtext: `Connecting to database geological records and formation horizons for ${selectedMineName}`,
      icon: Database
    },
    {
      id: 2,
      name: 'Executing Reserve Random Forest Classifier',
      defaultSubtext: 'ai_ml/models/reserve_model.joblib (Target leakage-free Mn classification & tonnage estimation)',
      icon: Layers
    },
    {
      id: 3,
      name: 'Executing 14-Feature Production GradientBoosting Regressor',
      defaultSubtext: 'ai_ml/models/production_model.joblib with operational dispatch & weather features',
      icon: Cpu
    },
    {
      id: 4,
      name: 'Evaluating Production Shortfall & Bench Availability',
      defaultSubtext: 'Comparing planned target vs predicted tonnage & equipment operational health',
      icon: TrendingDown
    },
    {
      id: 5,
      name: 'Computing Authoritative 4-Component Risk Matrix & Attribution',
      defaultSubtext: 'Equipment (35%), Weather (25%), Blasting (20%), Deficit (20%) with factor explainability',
      icon: AlertTriangle
    },
    {
      id: 6,
      name: 'Synthesizing Prescriptive Action Protocols',
      defaultSubtext: `Formulating prioritized operational corrective interventions for ${selectedMineName}`,
      icon: Lightbulb
    }
  ];

  const startPipelineExecution = async () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }

    setCurrentStageIndex(0);
    setCompletedStages([]);
    setIsFinished(false);
    setError(null);
    setLoading(true);

    try {
      // Execute the real backend 7-stage AI pipeline
      const result = await apiService.runPipeline(selectedMineId);
      setPipelineResult(result);

      // Smoothly animate the authentic stages to give clear visual feedback of pipeline execution
      let stageCounter = 0;
      stepTimerRef.current = setInterval(() => {
        if (stageCounter < stagesConfig.length) {
          setCurrentStageIndex(stageCounter);
          setCompletedStages((prev) => [...prev, stageCounter]);
          stageCounter += 1;
        } else {
          if (stepTimerRef.current) {
            clearInterval(stepTimerRef.current);
            stepTimerRef.current = null;
          }
          setIsFinished(true);
          setLoading(false);
        }
      }, 160);
    } catch (err: any) {
      console.error('Unified pipeline execution failed:', err);
      setError(err?.message || 'Failed to execute unified AI pipeline. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      setCurrentStageIndex(0);
      setCompletedStages([]);
      setIsFinished(false);
      setError(null);
      setPipelineResult(null);
      return;
    }

    startPipelineExecution();

    return () => {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    };
  }, [isOpen, selectedMineId]);

  if (!isOpen) return null;

  const progressPct = Math.round((completedStages.length / stagesConfig.length) * 100);

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
                End-to-end multi-source automated execution &amp; inference chain ({selectedMineName})
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
              {isFinished
                ? 'Pipeline Execution Complete'
                : error
                ? 'Execution Interrupted'
                : `Processing Stage ${Math.min(currentStageIndex + 1, stagesConfig.length)} of ${stagesConfig.length}...`}
            </span>
            <span className="text-amber-400 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                error
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Error Banner if Pipeline Failed */}
        {error && (
          <div className="mx-6 my-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={startPipelineExecution}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg flex items-center space-x-1 font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 7 Stages Checklist */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {stagesConfig.map((stage) => {
            const isDone = completedStages.includes(stage.id);
            const isCurrent = currentStageIndex === stage.id && !isDone && !error;
            const Icon = stage.icon;

            // Display authentic backend summary if available once stage completes
            const dynamicSummary =
              isDone && pipelineResult?.stages?.[stage.id]?.summary
                ? pipelineResult.stages[stage.id].summary
                : stage.defaultSubtext;

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
                    <div className="text-[10px] text-slate-400">{dynamicSummary}</div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isDone ? (
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline text-[10px]">
                        {pipelineResult?.stages?.[stage.id]?.duration_ms
                          ? `${pipelineResult.stages[stage.id].duration_ms}ms`
                          : 'DONE'}
                      </span>
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

        {/* Dynamic Completion Summary Card if Finished */}
        {isFinished && (
          <div className="px-6 py-4 bg-emerald-500/10 border-t border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                PIPELINE INFERENCE COMPLETE
              </div>
              <div className="text-xs text-slate-300">
                {pipelineResult ? (
                  <span>
                    Reserve ({pipelineResult.reserve.average_mn_grade}% Mn &bull;{' '}
                    {pipelineResult.reserve.primary_classification}) &bull; Predicted Prod:{' '}
                    {pipelineResult.production.predicted_production.toFixed(1)}t &bull; Shortfall:{' '}
                    {pipelineResult.shortfall.shortfall_tonnes > 0
                      ? `-${pipelineResult.shortfall.shortfall_tonnes.toFixed(1)}t`
                      : '0.0t'}{' '}
                    ({pipelineResult.shortfall.shortfall_percentage.toFixed(1)}%) &bull; Risk:{' '}
                    <span
                      className={`font-bold ${
                        pipelineResult.risk.risk_tier === 'CRITICAL'
                          ? 'text-rose-400'
                          : pipelineResult.risk.risk_tier === 'HIGH'
                          ? 'text-orange-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {pipelineResult.risk.risk_tier}
                    </span>{' '}
                    ({pipelineResult.risk.overall_risk_score.toFixed(1)}/100)
                  </span>
                ) : (
                  <span>All 7 operational AI stages completed successfully.</span>
                )}
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
