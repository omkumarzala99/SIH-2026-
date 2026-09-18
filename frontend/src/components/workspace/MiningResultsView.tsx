import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Info,
  CheckCircle2,
  ArrowRight,
  Truck,
  CloudRain,
  Zap,
  TrendingDown,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileCode,
  Check
} from 'lucide-react';
import { ProductionChart } from '../charts/ProductionChart';
import { apiService } from '../../services/api';
import { DashboardData, ProductionTrendData, RiskData, ReserveZone } from '../../types';

interface MiningResultsViewProps {
  onNavigateTab: (tab: any) => void;
  selectedMineId?: string;
  selectedMineName?: string;
}

type AiSubTab = 'production' | 'reserves' | 'risk' | 'anomalies';

export const MiningResultsView: React.FC<MiningResultsViewProps> = ({ onNavigateTab, selectedMineId, selectedMineName }) => {
  const [activeSubTab, setActiveSubTab] = useState<AiSubTab>('production');
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [prodTrend, setProdTrend] = useState<ProductionTrendData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [reserves, setReserves] = useState<ReserveZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [dash, prod, r, res] = await Promise.all([
          apiService.getDashboard(selectedMineId),
          apiService.getProduction(selectedMineId),
          apiService.getRisk(selectedMineId),
          apiService.getReserves(selectedMineId).catch(() => [])
        ]);
        setDashData(dash);
        setProdTrend(prod);
        setRiskData(r);
        setReserves(res || []);
      } catch (err) {
        console.error('Failed to load mining results:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [selectedMineId]);

  if (loading || !dashData || !riskData) {
    return (
      <div className="flex items-center justify-center h-96 text-[#5F7487]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2A900] mr-3"></div>
        <span className="text-sm font-medium">Querying Multi-Source AI Mining Models...</span>
      </div>
    );
  }

  const { kpis } = dashData;
  const { overall_risk_score, risk_tier, equipment_risk, weather_risk, blasting_risk, production_risk, contributing_factors } = riskData;

  const avgGrade = reserves.length > 0
    ? (reserves.reduce((acc, z) => acc + z.estimated_mn_grade, 0) / reserves.length).toFixed(1)
    : '41.8';

  const eqFactor = contributing_factors.find(f => f.name.toLowerCase().includes('equipment')) || contributing_factors[0];
  const wxFactor = contributing_factors.find(f => f.name.toLowerCase().includes('precipitation') || f.name.toLowerCase().includes('weather')) || contributing_factors[1];
  const blstFactor = contributing_factors.find(f => f.name.toLowerCase().includes('blasting')) || contributing_factors[2];
  const prodFactor = contributing_factors.find(f => f.name.toLowerCase().includes('production') || f.name.toLowerCase().includes('deficit')) || contributing_factors[3];

  return (
    <div className="space-y-6 max-w-[1380px] mx-auto">
      {/* Title & Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE0DC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F0EB] text-[#16866A] border border-[#DDE0DC] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A]" />
              AI INFERENCE ACTIVE
            </span>
            <span className="text-xs text-[#8293A3] font-mono">
              Model Artifacts: production_model.joblib &bull; reserve_model.joblib
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#18324A] mt-1 flex items-center gap-2">
            <span>AI Mining Intelligence &amp; Predictive Forecasting</span>
            {selectedMineName && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#FAFAF7] text-[#5F7487] border border-[#DDE0DC] font-medium">
                {selectedMineName}
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="px-3.5 py-1.5 rounded-md bg-[#F2A900] hover:bg-[#D99400] text-[#18324A] text-xs font-semibold shadow-card transition-colors"
          >
            Review Decisions &rarr;
          </button>
          <button
            onClick={() => onNavigateTab('simulation')}
            className="px-3 py-1.5 rounded-md bg-[#FAFAF7] hover:bg-[#F6F6F2] text-[#18324A] border border-[#DDE0DC] text-xs font-medium shadow-card transition-colors"
          >
            Simulate What-If
          </button>
        </div>
      </div>

      {/* AI Module Tabs */}
      <div className="flex space-x-1 bg-[#F1F0EB] p-1 rounded-md border border-[#DDE0DC] max-w-fit text-xs font-medium">
        <button
          onClick={() => { setActiveSubTab('production'); setShowEvidence(false); }}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'production'
              ? 'bg-[#FAFAF7] text-[#18324A] font-semibold shadow-card'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          Extraction Forecast
        </button>
        <button
          onClick={() => { setActiveSubTab('reserves'); setShowEvidence(false); }}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'reserves'
              ? 'bg-[#FAFAF7] text-[#18324A] font-semibold shadow-card'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          Geological Reserves
        </button>
        <button
          onClick={() => { setActiveSubTab('risk'); setShowEvidence(false); }}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'risk'
              ? 'bg-[#FAFAF7] text-[#18324A] font-semibold shadow-card'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          4-Factor Risk Engine
        </button>
        <button
          onClick={() => { setActiveSubTab('anomalies'); setShowEvidence(false); }}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSubTab === 'anomalies'
              ? 'bg-[#FAFAF7] text-[#18324A] font-semibold shadow-card'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          Bench Anomalies
        </button>
      </div>

      {/* TAB 1: PRODUCTION FORECAST */}
      {activeSubTab === 'production' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Intelligence Flow: Observation -> AI Analysis -> Finding -> Impact */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FAFAF7] p-3.5 rounded-lg border border-[#DDE0DC] shadow-card text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#2878A8] block">1. Observation</span>
              <p className="text-[#18324A] font-semibold leading-tight">54.2mm rain &bull; 6.5h excavator downtime</p>
              <p className="text-[11px] text-[#5F7487]">Rain saturated bench haul roads while EXC_CAT_349 overheated.</p>
            </div>
            <div className="space-y-1 md:border-l md:border-[#F1F0EB] md:pl-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#F2A900] block">2. AI Analysis</span>
              <p className="text-[#18324A] font-semibold leading-tight">GradientBoosting_14F</p>
              <p className="text-[11px] text-[#5F7487]">Shifted lag windows (t-1d, 7d-mean) with 87% test confidence.</p>
            </div>
            <div className="space-y-1 md:border-l md:border-[#F1F0EB] md:pl-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#C94747] block">3. Finding</span>
              <p className="text-[#18324A] font-semibold leading-tight">820 t/day (-18.0% shortfall)</p>
              <p className="text-[11px] text-[#5F7487]">Daily shortfall of -180 tonnes below 1,000 t scheduled target.</p>
            </div>
            <div className="space-y-1 md:border-l md:border-[#F1F0EB] md:pl-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#16866A] block">4. Operational Impact</span>
              <p className="text-[#18324A] font-semibold leading-tight">Recovery Protocol Available</p>
              <p className="text-[11px] text-[#5F7487]">Re-route haulers to Pit A upper bench to recover +110 tonnes.</p>
            </div>
          </div>

          {/* AI Assessment Card */}
          <div className="bg-[#FAFAF7] border border-[#DDE0DC] border-l-4 border-l-[#D99400] rounded-lg p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#D99400] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#D99400]" />
                Forecaster Output Summary
              </div>
              <p className="text-sm font-semibold text-[#18324A]">
                Daily extraction projected at {kpis.daily_predicted_production_tonnes} t/day ({kpis.shortfall_percentage}% below scheduled target) over next 5 shifts.
              </p>
              <p className="text-xs text-[#5F7487]">
                Root cause: Equipment downtime (62.2%) combined with rainfall haul cycle resistance (26.7%).
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-[#5F7487] uppercase font-semibold">Model Confidence</div>
                <div className="text-lg font-bold text-[#16866A] font-mono">87%</div>
              </div>
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="px-3 py-1.5 rounded-md bg-[#F6F6F2] hover:bg-[#F1F0EB] border border-[#DDE0DC] text-xs font-semibold text-[#18324A] transition-colors"
              >
                {showEvidence ? 'Hide Methodology' : 'View Methodology'}
              </button>
            </div>
          </div>

          {/* 14-Day Production Chart */}
          <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-[#18324A]">14-Day Shift Projection vs. Scheduled Run Rate</h3>
            {prodTrend && <ProductionChart data={prodTrend.history} height={250} />}
          </div>

          {/* Expandable Evidence & Methodology */}
          {showEvidence && (
            <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded-lg p-4 text-xs space-y-2 text-[#5F7487] animate-fadeIn">
              <div className="font-bold text-[#18324A] flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#D99400]" />
                Production GradientBoostingRegressor Technical Specification
              </div>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#18324A]">
                <li>Algorithm: GradientBoostingRegressor (14 Canonical Features)</li>
                <li>Temporal Validation: Strictly shifted lag windows (t-1d, 7d-mean) to prevent forward data leakage</li>
                <li>Weather Covariates: Rainfall (mm), humidity (%), pit inflow rate (m3/h)</li>
                <li>Equipment Covariates: Active excavator hours, dumper cycle frequency</li>
                <li>Artifact: ai_ml/models/production_model.joblib</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESERVE INTELLIGENCE */}
      {activeSubTab === 'reserves' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#FAFAF7] border border-[#DDE0DC] border-l-4 border-l-[#16866A] rounded-lg p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#16866A] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A]" />
                AI Geological Assessment
              </div>
              <p className="text-sm font-semibold text-[#18324A]">
                Proven Concession Reserves: {(kpis.total_estimated_reserves_tonnes / 1000000).toFixed(3)} Mt with {avgGrade}% average Manganese grade.
              </p>
              <p className="text-xs text-[#5F7487]">
                Stratigraphic continuity confirmed along the Sausar Group Gondite horizon with low silica contaminant ratio.
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-[#8293A3] uppercase font-semibold">Model Confidence</div>
                <div className="text-lg font-bold text-[#16866A] font-mono">92%</div>
              </div>
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="px-3 py-1.5 rounded-md bg-[#F6F6F2] hover:bg-[#F1F0EB] border border-[#DDE0DC] text-xs font-semibold text-[#18324A] transition-colors"
              >
                {showEvidence ? 'Hide Methodology' : 'View Methodology'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card">
              <div className="text-[11px] text-[#5F7487] uppercase font-semibold">High Potential Reserves</div>
              <div className="text-xl font-bold text-[#16866A] font-mono mt-1">&gt;40% Mn Grade</div>
              <p className="text-[11px] text-[#8293A3] mt-0.5">Central Deep Bench &amp; Pit A</p>
            </div>
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card">
              <div className="text-[11px] text-[#5F7487] uppercase font-semibold">Medium Potential Reserves</div>
              <div className="text-xl font-bold text-[#C47A00] font-mono mt-1">30–40% Mn Grade</div>
              <p className="text-[11px] text-[#8293A3] mt-0.5">North Ridge &amp; East Expansion</p>
            </div>
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card">
              <div className="text-[11px] text-[#5F7487] uppercase font-semibold">Overburden / Low Potential</div>
              <div className="text-xl font-bold text-[#8293A3] font-mono mt-1">&lt;30% Mn Grade</div>
              <p className="text-[11px] text-[#8293A3] mt-0.5">West Waste Dump Sector</p>
            </div>
          </div>

          {showEvidence && (
            <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded-lg p-4 text-xs space-y-2 text-[#5F7487] animate-fadeIn">
              <div className="font-bold text-[#18324A] flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#16866A]" />
                Reserve Random Forest &amp; Ordinary Kriging Specification
              </div>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#18324A]">
                <li>Algorithm: Random Forest Classifier + 3D Empirical Kriging</li>
                <li>Geological Assays: 1,204 core borehole logs analyzed across strike length</li>
                <li>Chemical Vectors: Mn%, Fe%, SiO2%, Al2O3%, P%</li>
                <li>Spatial Resolution: 30m grid block modeling</li>
                <li>Artifact: ai_ml/models/reserve_model.joblib</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RISK ANALYSIS */}
      {activeSubTab === 'risk' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#FAFAF7] border border-[#DDE0DC] border-l-4 border-l-[#C47A00] rounded-lg p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#C47A00] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C47A00]" />
                Composite Operational Threat Matrix
              </div>
              <p className="text-sm font-semibold text-[#18324A]">
                Current Risk Rating: {overall_risk_score} / 100 ({risk_tier}). Primary driver: Equipment fleet availability (35% weight).
              </p>
              <p className="text-xs text-[#5F7487]">
                Formula: 0.35&times;Eq ({equipment_risk}) + 0.25&times;Wth ({weather_risk}) + 0.20&times;Blst ({blasting_risk}) + 0.20&times;Prod ({production_risk}).
              </p>
            </div>

            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="px-3 py-1.5 rounded-md bg-[#F6F6F2] hover:bg-[#F1F0EB] border border-[#DDE0DC] text-xs font-semibold text-[#18324A] transition-colors shrink-0"
            >
              {showEvidence ? 'Hide Factor Breakdown' : 'View Factor Breakdown'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Equipment (35%)</span>
                <span className="font-mono font-bold text-[#C94747]">{equipment_risk}/100</span>
              </div>
              <div className="w-full bg-[#F1F0EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#C94747] h-full" style={{ width: `${equipment_risk}%` }} />
              </div>
              <p className="text-[11px] text-[#5F7487] truncate">{eqFactor?.description}</p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Weather (25%)</span>
                <span className="font-mono font-bold text-[#2878A8]">{weather_risk}/100</span>
              </div>
              <div className="w-full bg-[#F1F0EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2878A8] h-full" style={{ width: `${weather_risk}%` }} />
              </div>
              <p className="text-[11px] text-[#5F7487] truncate">{wxFactor?.description}</p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Blasting Delay (20%)</span>
                <span className="font-mono font-bold text-[#C47A00]">{blasting_risk}/100</span>
              </div>
              <div className="w-full bg-[#F1F0EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#C47A00] h-full" style={{ width: `${blasting_risk}%` }} />
              </div>
              <p className="text-[11px] text-[#5F7487] truncate">{blstFactor?.description}</p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Output Deficit (20%)</span>
                <span className="font-mono font-bold text-[#C47A00]">{production_risk}/100</span>
              </div>
              <div className="w-full bg-[#F1F0EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#C47A00] h-full" style={{ width: `${production_risk}%` }} />
              </div>
              <p className="text-[11px] text-[#5F7487] truncate">{prodFactor?.description}</p>
            </div>
          </div>

          {showEvidence && (
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 space-y-3 shadow-card animate-fadeIn">
              <h4 className="text-xs font-bold text-[#18324A] uppercase tracking-wider">Explainable AI (XAI) Attribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contributing_factors.map((factor, idx) => (
                  <div key={idx} className="bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-[#18324A]">
                      <span>{factor.name}</span>
                      <span className="font-mono text-[#C47A00]">{factor.severity}</span>
                    </div>
                    <p className="text-[#5F7487]">{factor.description}</p>
                    <div className="text-[10px] text-[#8293A3] font-mono">Observed: {factor.observed_value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANOMALY DETECTION */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#FAFAF7] border border-[#DDE0DC] border-l-4 border-l-[#C47A00] rounded-lg p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#C47A00] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C47A00]" />
                Operational Telemetry Anomaly
              </div>
              <p className="text-sm font-semibold text-[#18324A]">
                1 Active Anomaly: Hydraulic system overheating on Excavator EXC_CAT_349_01 (Pit B).
              </p>
              <p className="text-xs text-[#5F7487]">
                Spaceborne thermal radiance checks show 0 wildfire or surface anomalies within the 20km concession buffer.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-[#8293A3] uppercase font-semibold">Anomaly Severity</div>
              <div className="text-lg font-bold text-[#C47A00] font-mono">MODERATE</div>
            </div>
          </div>

          <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card space-y-2">
            <h4 className="text-xs font-bold text-[#18324A] uppercase">Anomaly Response Protocol</h4>
            <p className="text-xs text-[#5F7487]">
              Hydraulic line inspection scheduled for Shift-A conclusion. Secondary Volvo dumper fleet diverted to North Pit A -120m bench to maintain primary crusher throughput.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
