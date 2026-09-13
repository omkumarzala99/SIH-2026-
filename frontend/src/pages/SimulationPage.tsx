import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  CloudRain
} from 'lucide-react';
import { SimulationResult } from '../types';
import { apiService } from '../services/api';

export const SimulationPage: React.FC = () => {
  // Input Sliders
  const [downtime, setDowntime] = useState(2.0); // reduced from 6.5h
  const [rainfall, setRainfall] = useState(20.0); // reduced from 54.2mm
  const [blastingDelay, setBlastingDelay] = useState(0.5); // reduced from 2.5h
  const [targetProduction, setTargetProduction] = useState(1000);

  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await apiService.runSimulation({
        equipment_downtime_hours: downtime,
        rainfall_mm: rainfall,
        blasting_delay_hours: blastingDelay,
        planned_production: targetProduction
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetToCrisis = () => {
    setDowntime(6.5);
    setRainfall(54.2);
    setBlastingDelay(2.5);
    setTargetProduction(1000);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-400" />
            What-If Operational Scenario Simulator
          </h1>
          <p className="text-sm text-slate-400">
            Dynamically adjust operational variables to forecast recovery tonnages, shortfall reduction, and threat mitigation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetToCrisis}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Crisis Baseline</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Constraint Adjustment Sliders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Adjust Operational Variables
            </h2>
            <p className="text-xs text-slate-400">Simulate intervention consequences</p>
          </div>

          {/* Slider 1: Equipment Downtime */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                Equipment Downtime
              </span>
              <span className="text-amber-400 font-mono font-bold">{downtime} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={downtime}
              onChange={(e) => setDowntime(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0h (Ideal)</span>
              <span className="text-rose-400">Current: 6.5h</span>
              <span>12h (Max)</span>
            </div>
          </div>

          {/* Slider 2: Rainfall & Precipitation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                Rainfall & Ground Inflow
              </span>
              <span className="text-blue-400 font-mono font-bold">{rainfall} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0mm (Dry)</span>
              <span className="text-blue-400">Current: 54.2mm</span>
              <span>100mm (Monsoon)</span>
            </div>
          </div>

          {/* Slider 3: Blasting Delay */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Blasting Clearance Delay
              </span>
              <span className="text-amber-400 font-mono font-bold">{blastingDelay} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={blastingDelay}
              onChange={(e) => setBlastingDelay(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0h (On Schedule)</span>
              <span className="text-orange-400">Current: 2.5h</span>
              <span>6h (Severe)</span>
            </div>
          </div>

          {/* Slider 4: Production Target */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Daily Planned Target
              </span>
              <span className="text-emerald-400 font-mono font-bold">{targetProduction} tons</span>
            </div>
            <input
              type="range"
              min="600"
              max="1500"
              step="50"
              value={targetProduction}
              onChange={(e) => setTargetProduction(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>600t</span>
              <span className="text-slate-200">Default: 1000t</span>
              <span>1500t</span>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{simulating ? 'Calculating Physics & ML Variance...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Right 2 Columns: Before vs After Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Variance Highlight Card */}
              <div
                className={`p-5 rounded-2xl border shadow-xl flex items-center justify-between ${
                  result.variance.improved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider">
                    {result.variance.improved ? 'POSITIVE OPERATIONAL OUTCOME' : 'NEGATIVE IMPACT DETECTED'}
                  </div>
                  <h3 className="text-base font-bold text-white">{result.recommendation}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Production Variance</div>
                  <div
                    className={`text-2xl font-extrabold font-mono ${
                      result.variance.production_delta_tonnes > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.variance.production_delta_tonnes > 0 ? '+' : ''}
                    {result.variance.production_delta_tonnes} t
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison: BEFORE vs AFTER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE (Baseline Crisis State) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">1. CURRENT BASELINE</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase">
                      {result.baseline.risk_tier} RISK
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Predicted Extraction:</span>
                      <span className="font-mono font-bold text-white">{result.baseline.predicted_production} tons</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Shortfall Deficit:</span>
                      <span className="font-mono font-bold text-rose-400">
                        -{result.baseline.shortfall} tons ({result.baseline.shortfall_percentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Risk Score:</span>
                      <span className="font-mono font-bold text-orange-400">{result.baseline.risk_score} / 100</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      Inputs: {result.baseline.downtime_hours}h downtime, {result.baseline.rainfall_mm}mm rain, {result.baseline.blasting_delay_hours}h blast delay
                    </div>
                  </div>
                </div>

                {/* AFTER (Simulated State) */}
                <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">2. SIMULATED OUTCOME</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        result.simulated.risk_tier === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : result.simulated.risk_tier === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {result.simulated.risk_tier} RISK
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Predicted Extraction:</span>
                      <span className="font-mono font-bold text-emerald-400">{result.simulated.predicted_production} tons</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Shortfall Deficit:</span>
                      <span className="font-mono font-bold text-slate-200">
                        -{result.simulated.shortfall} tons ({result.simulated.shortfall_percentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Risk Score:</span>
                      <span className="font-mono font-bold text-emerald-400">{result.simulated.risk_score} / 100</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      Inputs: {result.simulated.downtime_hours}h downtime, {result.simulated.rainfall_mm}mm rain, {result.simulated.blasting_delay_hours}h blast delay
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Sliders className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Active Simulation Executed Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Adjust any operational constraint sliders on the left and click &quot;Execute What-If Simulation&quot; to inspect Before vs. After results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
