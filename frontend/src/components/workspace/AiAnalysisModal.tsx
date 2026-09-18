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
      const result = await apiService.runPipeline(selectedMineId);
      setPipelineResult(result);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18324A]/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg max-w-2xl w-full shadow-card overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#DDE0DC] flex items-center justify-between bg-[#F1F0EB]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[#FAFAF7] text-[#C47A00] border border-[#DDE0DC]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18324A] tracking-tight uppercase">
                Executing MOIL AI Mining Intelligence Pipeline
              </h2>
              <p className="text-xs text-[#5B6875]">
                Multi-source automated inference chain &bull; {selectedMineName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#7B8792] hover:text-[#18324A] p-1.5 rounded-md hover:bg-[#FAFAF7] border border-transparent hover:border-[#DDE0DC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-4 pb-2 bg-[#FAFAF7] border-b border-[#DDE0DC]">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-[#5B6875] font-medium">
              {isFinished
                ? 'Pipeline Execution Complete'
                : error
                ? 'Execution Interrupted'
                : `Processing Stage ${Math.min(currentStageIndex + 1, stagesConfig.length)} of ${stagesConfig.length}...`}
            </span>
            <span className="text-[#18324A] font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-[#F1F0EB] h-2 rounded-md overflow-hidden border border-[#DDE0DC]">
            <div
              className={`h-full transition-all duration-300 rounded-md ${
                error
                  ? 'bg-[#C94747]'
                  : isFinished
                  ? 'bg-[#16866A]'
                  : 'bg-[#F2A900]'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Error Banner if Pipeline Failed */}
        {error && (
          <div className="mx-5 my-3 p-3 bg-[#FDF2F2] border border-[#F5C2C7] rounded-md flex items-center justify-between text-xs text-[#C94747]">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-[#C94747] shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={startPipelineExecution}
              className="px-3 py-1 bg-[#FAFAF7] border border-[#DDE0DC] hover:bg-[#F3F5F7] text-[#18324A] rounded-md flex items-center space-x-1 font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5B6875]" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 7 Stages Checklist */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1 bg-[#FAFAF7]">
          {stagesConfig.map((stage) => {
            const isDone = completedStages.includes(stage.id);
            const isCurrent = currentStageIndex === stage.id && !isDone && !error;
            const Icon = stage.icon;

            const dynamicSummary =
              isDone && pipelineResult?.stages?.[stage.id]?.summary
                ? pipelineResult.stages[stage.id].summary
                : stage.defaultSubtext;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-md border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-[#F4F9F6] border-[#B7DFC9] text-[#18324A]'
                    : isCurrent
                    ? 'bg-[#FEF9E7] border-[#FAD79A] text-[#18324A]'
                    : 'bg-[#F3F5F7] border-[#DDE0DC] text-[#7B8792]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-md ${
                      isDone
                        ? 'bg-[#E3F2E9] text-[#16866A]'
                        : isCurrent
                        ? 'bg-[#FEF3D6] text-[#C47A00]'
                        : 'bg-[#F1F0EB] text-[#7B8792]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold">{stage.name}</div>
                    <div className="text-[11px] text-[#5B6875]">{dynamicSummary}</div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isDone ? (
                    <div className="flex items-center space-x-1 text-[#16866A] text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
                      <span className="hidden sm:inline text-[10px] font-semibold">
                        {pipelineResult?.stages?.[stage.id]?.duration_ms
                          ? `${pipelineResult.stages[stage.id].duration_ms}ms`
                          : 'DONE'}
                      </span>
                    </div>
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#C47A00] animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-[#7B8792]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Completion Summary Card if Finished */}
        {isFinished && (
          <div className="px-5 py-3 bg-[#F4F9F6] border-t border-[#B7DFC9] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold text-[#16866A] font-mono flex items-center gap-1.5 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
                PIPELINE INFERENCE COMPLETE
              </div>
              <div className="text-xs text-[#18324A]">
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
                      className={`font-semibold ${
                        pipelineResult.risk.risk_tier === 'CRITICAL'
                          ? 'text-[#C94747]'
                          : pipelineResult.risk.risk_tier === 'HIGH'
                          ? 'text-[#C47A00]'
                          : 'text-[#16866A]'
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
              className="px-4 py-2 rounded-md bg-[#F2A900] hover:bg-[#D99100] text-[#18324A] font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-card shrink-0"
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
