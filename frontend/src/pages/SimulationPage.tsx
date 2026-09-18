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
  CloudRain,
  CheckCircle2
} from 'lucide-react';
import { SimulationResult } from '../types';
import { apiService } from '../services/api';

export const SimulationPage: React.FC = () => {
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
    <div className="space-y-6 max-w-[1380px] mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE0DC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F0EB] text-[#5F7487] border border-[#DDE0DC] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[#C47A00]" />
              SCENARIO ENGINE
            </span>
            <span className="text-xs text-[#8293A3]">What-If Operational Sandbox</span>
          </div>
          <h1 className="text-xl font-bold text-[#18324A] mt-1 flex items-center gap-2">
            <span>What-If Operational Scenario Simulator</span>
          </h1>
          <p className="text-xs text-[#5F7487] mt-0.5">
            Test variable constraints to forecast output variance, recovery tonnages, and risk changes prior to physical dispatch.
          </p>
        </div>

        <button
          onClick={handleResetToCrisis}
          className="px-3 py-1.5 rounded-md bg-[#FAFAF7] hover:bg-[#F6F6F2] text-[#18324A] text-xs font-medium flex items-center space-x-1.5 transition-colors border border-[#DDE0DC] shadow-card"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#5F7487]" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Constraint Adjustment Sliders */}
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-5 shadow-card space-y-5">
          <div className="border-b border-[#F1F0EB] pb-2.5">
            <h2 className="text-sm font-bold text-[#18324A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C47A00]" />
              Adjust Operational Variables
            </h2>
            <p className="text-xs text-[#5F7487] mt-0.5">Simulate corrective interventions</p>
          </div>

          {/* Slider 1: Equipment Downtime */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#18324A] font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C94747]" />
                Equipment Downtime
              </span>
              <span className="text-[#18324A] font-mono font-bold bg-[#F6F6F2] px-2 py-0.5 rounded text-xs border border-[#DDE0DC]">
                {downtime} hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={downtime}
              onChange={(e) => setDowntime(parseFloat(e.target.value))}
              className="w-full accent-[#F2A900] cursor-pointer h-1.5 bg-[#F1F0EB] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#8293A3] font-mono">
              <span>0h (Ideal)</span>
              <span className="text-[#C94747] font-medium">Current: 6.5h</span>
              <span>12h (Max)</span>
            </div>
          </div>

          {/* Slider 2: Rainfall & Precipitation */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#18324A] font-semibold flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-[#2878A8]" />
                Rainfall &amp; Pit Inflow
              </span>
              <span className="text-[#18324A] font-mono font-bold bg-[#F6F6F2] px-2 py-0.5 rounded text-xs border border-[#DDE0DC]">
                {rainfall} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="w-full accent-[#2878A8] cursor-pointer h-1.5 bg-[#F1F0EB] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#8293A3] font-mono">
              <span>0mm (Dry)</span>
              <span className="text-[#2878A8] font-medium">Current: 54.2mm</span>
              <span>100mm (Heavy)</span>
            </div>
          </div>

          {/* Slider 3: Blasting Delay */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#18324A] font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#C47A00]" />
                Blasting Delay
              </span>
              <span className="text-[#18324A] font-mono font-bold bg-[#F6F6F2] px-2 py-0.5 rounded text-xs border border-[#DDE0DC]">
                {blastingDelay} hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={blastingDelay}
              onChange={(e) => setBlastingDelay(parseFloat(e.target.value))}
              className="w-full accent-[#F2A900] cursor-pointer h-1.5 bg-[#F1F0EB] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#8293A3] font-mono">
              <span>0h (On Time)</span>
              <span className="text-[#C47A00] font-medium">Current: 2.5h</span>
              <span>6h (Critical)</span>
            </div>
          </div>

          {/* Slider 4: Production Target */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#18324A] font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#16866A]" />
                Planned Target
              </span>
              <span className="text-[#18324A] font-mono font-bold bg-[#F6F6F2] px-2 py-0.5 rounded text-xs border border-[#DDE0DC]">
                {targetProduction} tons
              </span>
            </div>
            <input
              type="range"
              min="600"
              max="1500"
              step="50"
              value={targetProduction}
              onChange={(e) => setTargetProduction(parseInt(e.target.value))}
              className="w-full accent-[#16866A] cursor-pointer h-1.5 bg-[#F1F0EB] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#8293A3] font-mono">
              <span>600t</span>
              <span className="text-[#18324A] font-medium">Planned: 1000t</span>
              <span>1500t</span>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full py-2.5 rounded-md bg-[#F2A900] hover:bg-[#D99400] active:bg-[#C47A00] text-[#18324A] font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-card disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-[#18324A]" />
            <span>{simulating ? 'Calculating Variance...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Right 2 Columns: Before vs After Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Variance Outcome Card */}
              <div
                className={`p-4 rounded-md border shadow-card flex items-center justify-between ${
                  result.variance.improved
                    ? 'bg-[#FAFAF7] border-[#DDE0DC] border-l-4 border-l-[#16866A]'
                    : 'bg-[#FAFAF7] border-[#DDE0DC] border-l-4 border-l-[#C94747]'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#16866A]">
                    {result.variance.improved ? 'POSITIVE OPERATIONAL OUTCOME' : 'NEGATIVE IMPACT DETECTED'}
                  </div>
                  <h3 className="text-sm font-bold text-[#18324A]">{result.recommendation}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-[#5F7487]">Production Delta</div>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      result.variance.production_delta_tonnes > 0 ? 'text-[#16866A]' : 'text-[#C94747]'
                    }`}
                  >
                    {result.variance.production_delta_tonnes > 0 ? '+' : ''}
                    {result.variance.production_delta_tonnes} t
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Baseline Card */}
                <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-4 space-y-3 shadow-card">
                  <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2">
                    <span className="text-xs font-mono font-bold text-[#5F7487] uppercase">1. Current Baseline</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#C94747]/10 text-[#C94747] border border-[#C94747]/20 uppercase">
                      {result.baseline.risk_tier} RISK
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5F7487]">Predicted Output:</span>
                      <span className="font-mono font-bold text-[#18324A]">{result.baseline.predicted_production} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F7487]">Shortfall Deficit:</span>
                      <span className="font-mono font-bold text-[#C94747]">
                        -{result.baseline.shortfall} tons ({result.baseline.shortfall_percentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F7487]">Risk Score:</span>
                      <span className="font-mono font-bold text-[#C47A00]">{result.baseline.risk_score} / 100</span>
                    </div>
                    <div className="pt-2 border-t border-[#F1F0EB] text-[11px] text-[#8293A3] font-mono">
                      Conditions: {result.baseline.downtime_hours}h downtime, {result.baseline.rainfall_mm}mm rain, {result.baseline.blasting_delay_hours}h delay
                    </div>
                  </div>
                </div>

                {/* Simulated Outcome Card */}
                <div className="bg-[#FAFAF7] border-2 border-[#F2A900] rounded-md p-4 space-y-3 shadow-card">
                  <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2">
                    <span className="text-xs font-mono font-bold text-[#18324A] uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A]" />
                      2. Simulated Outcome
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        result.simulated.risk_tier === 'LOW'
                          ? 'bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/20'
                          : result.simulated.risk_tier === 'MEDIUM'
                          ? 'bg-[#C47A00]/10 text-[#C47A00] border border-[#C47A00]/20'
                          : 'bg-[#C94747]/10 text-[#C94747] border border-[#C94747]/20'
                      }`}
                    >
                      {result.simulated.risk_tier} RISK
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5F7487]">Predicted Output:</span>
                      <span className="font-mono font-bold text-[#16866A]">{result.simulated.predicted_production} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F7487]">Shortfall Deficit:</span>
                      <span className="font-mono font-bold text-[#18324A]">
                        -{result.simulated.shortfall} tons ({result.simulated.shortfall_percentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F7487]">Risk Score:</span>
                      <span className="font-mono font-bold text-[#16866A]">{result.simulated.risk_score} / 100</span>
                    </div>
                    <div className="pt-2 border-t border-[#F1F0EB] text-[11px] text-[#8293A3] font-mono">
                      Conditions: {result.simulated.downtime_hours}h downtime, {result.simulated.rainfall_mm}mm rain, {result.simulated.blasting_delay_hours}h delay
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-12 text-center space-y-2 shadow-card">
              <Sliders className="w-8 h-8 text-[#8293A3] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#18324A]">No Active Simulation Executed Yet</h3>
              <p className="text-xs text-[#5F7487] max-w-md mx-auto">
                Adjust the operational constraint sliders on the left and click &quot;Execute What-If Simulation&quot; to inspect Before vs. After results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
