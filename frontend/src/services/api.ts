// API client with seamless offline fallback and Demo Mode
import {
  DashboardData, ReserveZone, BoreholeRecord, ProductionTrendData,
  EquipmentItem, RiskData, RecommendationItem, SimulationResult, DataQualityReport,
  PipelineRunResult
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Static client-side mock fallback datasets (calibrated for Balaghat Concession)
const FALLBACK_DASHBOARD: DashboardData = {
  kpis: {
    total_estimated_reserves_tonnes: 1485000,
    daily_planned_production_tonnes: 1000,
    daily_predicted_production_tonnes: 820,
    daily_shortfall_tonnes: 180,
    shortfall_percentage: 18.0,
    current_risk_score: 68.5,
    current_risk_tier: 'HIGH',
    fleet_health_score: 88.5,
    active_equipment_count: 8,
    pending_recommendations_count: 3
  },
  environmental_status: {
    rainfall_mm: 54.2,
    soil_moisture_pct: 58.4,
    ambient_temp_c: 34.2,
    flood_risk_level: 'MODERATE_HIGH',
    weather_trend: 'Monsoon Front Approaching'
  },
  recent_alerts: [
    {
      id: 'ALT-01',
      severity: 'CRITICAL',
      title: 'Equipment Downtime Alert',
      message: 'Excavator EXC_CAT_349_01 experiencing hydraulic overheating at Central Pit B.',
      timestamp: '15m ago'
    },
    {
      id: 'ALT-02',
      severity: 'HIGH',
      title: 'Production Shortfall Warning',
      message: 'Shift-A actual extraction 260t is 28% below planned target of 360t.',
      timestamp: '42m ago'
    },
    {
      id: 'ALT-03',
      severity: 'MEDIUM',
      title: 'Bench Water Accumulation',
      message: 'Bench -160m sump level reached 78% capacity after 54mm rainfall.',
      timestamp: '1h ago'
    }
  ],
  top_recommendation: {
    id: 'REC_2026_001',
    title: 'Re-deploy Haul Dumper Fleet to Pit A Upper Bench',
    category: 'EQUIPMENT',
    recommended_action: 'Temporarily re-route dumpers DMP_VOLVO_FMX_11 and 12 to North Pit A bench -120m RL.',
    expected_tonnage_recovery: 110,
    urgency: 'HIGH',
    status: 'PENDING'
  },
  mode: 'demo'
};

const FALLBACK_RESERVES: ReserveZone[] = [
  {
    zone_id: 'ZONE_NORTH_A',
    name: 'North Bench Pit A',
    classification: 'HIGH',
    reserve_probability: 0.89,
    estimated_tonnage: 485000,
    estimated_mn_grade: 44.2,
    confidence: 0.86,
    formation: 'Sausar Group Gondite',
    ndvi_index: 0.15,
    status: 'Priority Extraction'
  },
  {
    zone_id: 'ZONE_CENTRAL_B',
    name: 'Central Main Pit B',
    classification: 'HIGH',
    reserve_probability: 0.84,
    estimated_tonnage: 620000,
    estimated_mn_grade: 41.6,
    confidence: 0.83,
    formation: 'Mansar Schist',
    ndvi_index: 0.17,
    status: 'Active Deep Bench'
  },
  {
    zone_id: 'ZONE_SOUTH_C',
    name: 'South Expansion Zone C',
    classification: 'MEDIUM',
    reserve_probability: 0.62,
    estimated_tonnage: 295000,
    estimated_mn_grade: 32.4,
    confidence: 0.77,
    formation: 'Chorbaoli Quartzite',
    ndvi_index: 0.24,
    status: 'Secondary Blend Horizon'
  },
  {
    zone_id: 'ZONE_EAST_D',
    name: 'East Exploration Block D',
    classification: 'LOW',
    reserve_probability: 0.31,
    estimated_tonnage: 85000,
    estimated_mn_grade: 21.5,
    confidence: 0.71,
    formation: 'Tirodi Biotite Gneiss',
    ndvi_index: 0.39,
    status: 'Prospecting'
  },
  {
    zone_id: 'ZONE_WEST_E',
    name: 'West Overburden Dump E',
    classification: 'LOW',
    reserve_probability: 0.18,
    estimated_tonnage: 0,
    estimated_mn_grade: 14.2,
    confidence: 0.65,
    formation: 'Overburden Schist',
    ndvi_index: 0.42,
    status: 'Sterilized Dump Area'
  }
];

const FALLBACK_PRODUCTION: ProductionTrendData = {
  current_target: 1000,
  current_predicted: 820,
  current_shortfall: 180,
  shortfall_percentage: 18.0,
  history: [
    { date: '03-01', planned: 1050, actual: 1020, shortfall: 30, blasting_delay_h: 0.0, rainfall_mm: 0.0 },
    { date: '03-02', planned: 1050, actual: 1040, shortfall: 10, blasting_delay_h: 0.5, rainfall_mm: 2.0 },
    { date: '03-03', planned: 1000, actual: 980, shortfall: 20, blasting_delay_h: 0.0, rainfall_mm: 0.0 },
    { date: '03-04', planned: 1100, actual: 1060, shortfall: 40, blasting_delay_h: 0.0, rainfall_mm: 5.0 },
    { date: '03-05', planned: 1050, actual: 1030, shortfall: 20, blasting_delay_h: 0.0, rainfall_mm: 0.0 },
    { date: '03-06', planned: 1000, actual: 990, shortfall: 10, blasting_delay_h: 0.5, rainfall_mm: 0.0 },
    { date: '03-07', planned: 1050, actual: 1010, shortfall: 40, blasting_delay_h: 0.0, rainfall_mm: 8.0 },
    { date: '03-08', planned: 1000, actual: 950, shortfall: 50, blasting_delay_h: 1.0, rainfall_mm: 12.0 },
    { date: '03-09', planned: 1050, actual: 920, shortfall: 130, blasting_delay_h: 1.5, rainfall_mm: 24.0 },
    { date: '03-10', planned: 1000, actual: 880, shortfall: 120, blasting_delay_h: 2.0, rainfall_mm: 38.0 },
    { date: '03-11', planned: 1050, actual: 840, shortfall: 210, blasting_delay_h: 2.5, rainfall_mm: 52.0 },
    { date: '03-12', planned: 1000, actual: 810, shortfall: 190, blasting_delay_h: 2.0, rainfall_mm: 64.0 },
    { date: '03-13', planned: 1000, actual: 820, shortfall: 180, blasting_delay_h: 1.8, rainfall_mm: 54.2 },
    { date: '03-14 (Today)', planned: 1000, actual: 790, shortfall: 210, blasting_delay_h: 2.2, rainfall_mm: 48.0 }
  ]
};

const FALLBACK_EQUIPMENT: EquipmentItem[] = [
  { id: 'EXC_CAT_349_01', name: 'CAT 349D2 L', type: 'Hydraulic Excavator', zone: 'Central Pit B', status: 'CRITICAL_MAINTENANCE', downtime_h: 6.5, efficiency: 52 },
  { id: 'EXC_KOM_PC450_02', name: 'Komatsu PC450-8', type: 'Hydraulic Excavator', zone: 'North Pit A', status: 'OPTIMAL', downtime_h: 0.5, efficiency: 94 },
  { id: 'DMP_VOLVO_FMX_11', name: 'Volvo FMX 460', type: 'Haul Dumper 35T', zone: 'Central Pit B', status: 'WARNING', downtime_h: 3.0, efficiency: 72 },
  { id: 'DMP_VOLVO_FMX_12', name: 'Volvo FMX 460', type: 'Haul Dumper 35T', zone: 'North Pit A', status: 'OPTIMAL', downtime_h: 0.0, efficiency: 96 },
  { id: 'DMP_VOLVO_FMX_13', name: 'Volvo FMX 440', type: 'Haul Dumper 35T', zone: 'South Pit C', status: 'OPTIMAL', downtime_h: 1.0, efficiency: 89 },
  { id: 'DRL_ATLAS_ROC_01', name: 'Atlas Copco ROC L8', type: 'Blast Drill Rig', zone: 'North Pit A', status: 'WARNING', downtime_h: 2.2, efficiency: 78 },
  { id: 'CRU_TELSMITH_01', name: 'Telsmith 3648', type: 'Primary Jaw Crusher', zone: 'Crusher Pad', status: 'OPTIMAL', downtime_h: 0.0, efficiency: 98 }
];

const FALLBACK_RISK: RiskData = {
  mine_id: 'MINE_BALAGHAT_01',
  overall_risk_score: 68.5,
  risk_tier: 'HIGH',
  equipment_risk: 72.0,
  weather_risk: 84.0,
  blasting_risk: 55.0,
  production_risk: 60.0,
  contributing_factors: [
    {
      name: 'Heavy Equipment Downtime',
      severity: 'CRITICAL',
      weight: 0.35,
      description: 'CAT-349 Excavator hydraulic overheat at Central Pit B causing 6.5h bottleneck.',
      observed_value: '6.5 hrs'
    },
    {
      name: 'Precipitation & Monsoon Impact',
      severity: 'HIGH',
      weight: 0.25,
      description: 'Precipitation reached 54.2mm with soil moisture at 58.4% reducing haul speeds.',
      observed_value: '54.2 mm'
    },
    {
      name: 'Blasting Schedule Delay',
      severity: 'MEDIUM',
      weight: 0.20,
      description: 'Wet blast holes prompted a 2.2h safety evacuation and detonation deferral.',
      observed_value: '2.2 hrs'
    },
    {
      name: 'Daily Production Deficit',
      severity: 'HIGH',
      weight: 0.20,
      description: 'Daily shortfall is currently at 18.0% (180 tonnes below scheduled target).',
      observed_value: '18.0%'
    }
  ],
  summary_explanation: 'Risk elevated to HIGH primarily due to: Heavy Equipment Downtime, Precipitation & Monsoon Impact, Daily Production Deficit.'
};

let localRecommendations: RecommendationItem[] = [
  {
    id: 'REC_2026_001',
    mine_id: 'MINE_BALAGHAT_01',
    title: 'Re-deploy Haul Dumper Fleet to Pit A Upper Bench',
    category: 'EQUIPMENT',
    problem_summary: 'Central Pit B experienced hydraulic downtime on EXC_CAT_349_01, creating hauling idle time while Pit A faces 24% shortfall.',
    recommended_action: 'Temporarily re-route dumpers DMP_VOLVO_FMX_11 and 12 to North Pit A bench -120m RL to feed Primary Crusher at capacity.',
    expected_impact: 'Recovers approximately 110 tons/shift and reduces dumper idle fuel consumption by 18%.',
    expected_tonnage_recovery: 110,
    urgency: 'HIGH',
    status: 'PENDING',
    created_at: '2026-03-14T08:30:00Z'
  },
  {
    id: 'REC_2026_002',
    mine_id: 'MINE_BALAGHAT_01',
    title: 'Reschedule Bench Blasting Window Post-Monsoon Surge',
    category: 'BLASTING',
    problem_summary: 'Monsoon rainfall recorded at 54.2mm saturated top blast holes in Zone C, causing 2.2 hour ignition delay.',
    recommended_action: 'Postpone secondary shot-firing in Zone C to Shift-B; prioritize pre-blasted fragmented muckpile extraction in Central Zone B.',
    expected_impact: 'Avoids misfire safety hazard and unlocks 95 tons of immediate run-of-mine ore feed.',
    expected_tonnage_recovery: 95,
    urgency: 'HIGH',
    status: 'PENDING',
    created_at: '2026-03-14T09:15:00Z'
  },
  {
    id: 'REC_2026_003',
    mine_id: 'MINE_BALAGHAT_01',
    title: 'Activate Sump Dewatering Pumps in Central Pit B',
    category: 'ENVIRONMENTAL',
    problem_summary: 'Soil moisture index reached 58.4% with pit floor water accumulation, impeding haul ramp traction.',
    recommended_action: 'Deploy 2x 75kW submersible slurry pumps at Bench -160m sump and grade haul road with dry quartz gravel.',
    expected_impact: 'Prevents ramp slippage risk and restores dumper cycle speed from 12 km/h to standard 22 km/h.',
    expected_tonnage_recovery: 75,
    urgency: 'MEDIUM',
    status: 'APPROVED',
    manager_notes: 'Dewatering pumps activated at 10:00 AM.',
    created_at: '2026-03-14T07:45:00Z'
  }
];

const FALLBACK_QUALITY: DataQualityReport = {
  fleet_health_score: 95.6,
  domains: {
    geological: {
      name: 'Geological Boreholes',
      overall_score: 96.0,
      completeness_pct: 98.4,
      uniqueness_pct: 100.0,
      validity_pct: 98.5,
      total_records: 60,
      missing_values: 0,
      duplicate_records: 0,
      freshness_hours_ago: 18.2,
      last_updated: '2026-03-14 06:00 UTC'
    },
    production: {
      name: 'Production Dispatch',
      overall_score: 98.2,
      completeness_pct: 100.0,
      uniqueness_pct: 100.0,
      validity_pct: 100.0,
      total_records: 90,
      missing_values: 0,
      duplicate_records: 0,
      freshness_hours_ago: 2.1,
      last_updated: '2026-03-14 14:00 UTC'
    },
    equipment: {
      name: 'Equipment Telematics',
      overall_score: 94.5,
      completeness_pct: 97.2,
      uniqueness_pct: 100.0,
      validity_pct: 96.0,
      total_records: 112,
      missing_values: 1,
      duplicate_records: 0,
      freshness_hours_ago: 0.5,
      last_updated: '2026-03-14 15:30 UTC'
    },
    weather: {
      name: 'Meteorological Sensors',
      overall_score: 99.0,
      completeness_pct: 100.0,
      uniqueness_pct: 100.0,
      validity_pct: 100.0,
      total_records: 30,
      missing_values: 0,
      duplicate_records: 0,
      freshness_hours_ago: 1.0,
      last_updated: '2026-03-14 15:00 UTC'
    },
    satellite: {
      name: 'Satellite Earth Observation',
      overall_score: 90.3,
      completeness_pct: 92.5,
      uniqueness_pct: 100.0,
      validity_pct: 94.0,
      total_records: 50,
      missing_values: 2,
      duplicate_records: 0,
      freshness_hours_ago: 12.4,
      last_updated: '2026-03-14 04:00 UTC'
    }
  },
  generated_at: new Date().toISOString()
};

export const apiService = {
  isDemoMode: false,

  setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  },

  async getDashboard(mineId?: string): Promise<DashboardData> {
    if (this.isDemoMode) return FALLBACK_DASHBOARD;
    try {
      const url = mineId ? `${API_BASE}/dashboard?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/dashboard`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return FALLBACK_DASHBOARD;
    }
  },

  async getReserves(mineId?: string): Promise<ReserveZone[]> {
    if (this.isDemoMode) return FALLBACK_RESERVES;
    try {
      const url = mineId ? `${API_BASE}/reserves?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/reserves`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return FALLBACK_RESERVES;
    }
  },

  async predictReserve(params: any): Promise<any> {
    if (this.isDemoMode) {
      return {
        zone_id: params.zone_id || 'ZONE_NORTH_A',
        reserve_probability: 0.89,
        classification: 'HIGH',
        estimated_tonnage: 485000,
        estimated_mn_grade: 44.2,
        confidence: 0.86,
        model_version: 'Reserve_ML_v1.0',
        contributing_indicators: params
      };
    }
    try {
      const res = await fetch(`${API_BASE}/reserves/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return {
        zone_id: params.zone_id || 'ZONE_NORTH_A',
        reserve_probability: 0.89,
        classification: 'HIGH',
        estimated_tonnage: 485000,
        estimated_mn_grade: 44.2,
        confidence: 0.86,
        model_version: 'Reserve_ML_v1.0 (Offline Fallback)',
        contributing_indicators: params
      };
    }
  },

  async getProduction(mineId?: string): Promise<ProductionTrendData> {
    if (this.isDemoMode) return FALLBACK_PRODUCTION;
    try {
      const url = mineId ? `${API_BASE}/production?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/production`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return FALLBACK_PRODUCTION;
    }
  },

  async forecastProduction(params: any): Promise<any> {
    if (this.isDemoMode) {
      const planned = params.planned_production || params.planned_tonnage || 1000;
      const downtimeLoss = (params.equipment_downtime_hours || params.excavator_downtime_hours || 0) * 28.0;
      const weatherLoss = Math.max(0, ((params.rainfall_mm || 0) - 15.0) * 1.8);
      const blastingLoss = (params.blasting_delay_hours || 0) * 35.0;
      const predicted = Math.max(0, Math.round(planned - downtimeLoss - weatherLoss - blastingLoss));
      const shortfall = Math.max(0, planned - predicted);
      return {
        planned_production: planned,
        predicted_production: predicted,
        shortfall_tonnes: shortfall,
        shortfall_percentage: Math.round((shortfall / planned) * 100),
        confidence: 0.85,
        contributing_factors: {
          equipment_downtime_loss_tons: Math.round(downtimeLoss),
          weather_rainfall_loss_tons: Math.round(weatherLoss),
          blasting_delay_loss_tons: Math.round(blastingLoss)
        }
      };
    }
    try {
      const res = await fetch(`${API_BASE}/production/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error('Forecast API failed');
      return await res.json();
    } catch {
      const planned = params.planned_production || params.planned_tonnage || 1000;
      return {
        planned_production: planned,
        predicted_production: Math.round(planned * 0.82),
        shortfall_tonnes: Math.round(planned * 0.18),
        shortfall_percentage: 18.0,
        confidence: 0.85
      };
    }
  },

  async getEquipment(mineId?: string): Promise<EquipmentItem[]> {
    if (this.isDemoMode) return FALLBACK_EQUIPMENT;
    try {
      const url = mineId ? `${API_BASE}/production/equipment?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/production/equipment`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return FALLBACK_EQUIPMENT;
    }
  },

  async getRisk(mineId?: string): Promise<RiskData> {
    if (this.isDemoMode) return FALLBACK_RISK;
    try {
      const url = mineId ? `${API_BASE}/risk?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/risk`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return FALLBACK_RISK;
    }
  },

  async getRecommendations(mineId?: string): Promise<RecommendationItem[]> {
    if (this.isDemoMode) return localRecommendations;
    try {
      const url = mineId ? `${API_BASE}/recommendations?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/recommendations`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return localRecommendations;
    }
  },

  async takeRecommendationAction(id: string, action: 'APPROVE' | 'REJECT' | 'MODIFY', notes?: string, modifiedAction?: string) {
    const statusVal = action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'MODIFIED');
    // Update local state
    localRecommendations = localRecommendations.map(r =>
      r.id === id
        ? {
            ...r,
            status: statusVal,
            manager_notes: notes || r.manager_notes,
            recommended_action: modifiedAction || r.recommended_action
          }
        : r
    );

    if (this.isDemoMode) return { success: true, status: statusVal };
    try {
      const res = await fetch(`${API_BASE}/recommendations/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, manager_notes: notes, modified_action: modifiedAction }),
        signal: AbortSignal.timeout(2500)
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return { success: true, status: statusVal, fallback: true };
    }
  },

  async runSimulation(params: {
    equipment_downtime_hours: number;
    rainfall_mm: number;
    blasting_delay_hours: number;
    planned_production: number;
  }): Promise<SimulationResult> {
    if (this.isDemoMode) {
      return this.calculateLocalSimulation(params);
    }
    try {
      const res = await fetch(`${API_BASE}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return this.calculateLocalSimulation(params);
    }
  },

  calculateLocalSimulation(params: {
    equipment_downtime_hours: number;
    rainfall_mm: number;
    blasting_delay_hours: number;
    planned_production: number;
  }): SimulationResult {
    const basePredicted = 820;
    const baseShortfall = 180;
    const baseRisk = 68.5;

    const lossDowntime = params.equipment_downtime_hours * 28.0;
    const lossRain = Math.max(0, (params.rainfall_mm - 15.0) * 1.8);
    const lossBlast = params.blasting_delay_hours * 35.0;
    const simPredicted = Math.round(Math.max(0, params.planned_production - (lossDowntime + lossRain + lossBlast)));
    const simShortfall = Math.round(Math.max(0, params.planned_production - simPredicted));
    const simShortfallPct = Math.round((simShortfall / params.planned_production) * 100);

    const eqR = Math.min(100, (params.equipment_downtime_hours / 8.0) * 100);
    const wR = Math.min(100, (params.rainfall_mm / 60.0) * 100);
    const bR = Math.min(100, (params.blasting_delay_hours / 4.0) * 100);
    const pR = Math.min(100, (simShortfallPct / 30.0) * 100);
    const simRiskScore = Math.round((eqR * 0.35) + (wR * 0.25) + (bR * 0.20) + (pR * 0.20));

    const prodDelta = simPredicted - basePredicted;
    const shortfallDelta = simShortfall - baseShortfall;
    const riskDelta = simRiskScore - baseRisk;

    return {
      scenario_name: 'What-If Simulation Scenario',
      baseline: {
        downtime_hours: 6.5,
        rainfall_mm: 54.2,
        blasting_delay_hours: 2.5,
        predicted_production: basePredicted,
        shortfall: baseShortfall,
        shortfall_percentage: 18.0,
        risk_score: baseRisk,
        risk_tier: 'HIGH'
      },
      simulated: {
        downtime_hours: params.equipment_downtime_hours,
        rainfall_mm: params.rainfall_mm,
        blasting_delay_hours: params.blasting_delay_hours,
        predicted_production: simPredicted,
        shortfall: simShortfall,
        shortfall_percentage: simShortfallPct,
        risk_score: simRiskScore,
        risk_tier: simRiskScore > 75 ? 'CRITICAL' : (simRiskScore > 50 ? 'HIGH' : (simRiskScore > 30 ? 'MEDIUM' : 'LOW'))
      },
      variance: {
        production_delta_tonnes: prodDelta,
        shortfall_delta_tonnes: shortfallDelta,
        risk_score_delta: riskDelta,
        improved: prodDelta > 0
      },
      recommendation: prodDelta > 0
        ? `Adjustments successfully recover +${prodDelta} tonnes and reduce risk by ${Math.abs(riskDelta)} points.`
        : 'Adjusted parameters further reduce operational output.'
    };
  },

  async getDataQuality(mineId?: string): Promise<DataQualityReport> {
    if (this.isDemoMode) return FALLBACK_QUALITY;
    try {
      const url = mineId ? `${API_BASE}/data-quality?mine_id=${encodeURIComponent(mineId)}` : `${API_BASE}/data-quality`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return FALLBACK_QUALITY;
    }
  },

  async triggerCrisisScenario(): Promise<any> {
    if (this.isDemoMode) {
      return {
        scenario_id: 'CRISIS_SCENARIO_01',
        name: 'Monsoon Inflow & Fleet Mechanical Breakdown',
        description: 'Heavy rainfall (64.2mm) in Balaghat concession, accompanied by hydraulic failure on CAT-349 excavator and 2.5h bench blasting delay.',
        prediction_impact: {
          planned_production_tonnes: 1000,
          predicted_production_tonnes: 820,
          shortfall_tonnes: 180,
          shortfall_percentage: 18.0,
          overall_risk_score: 74.5,
          risk_tier: 'HIGH'
        }
      };
    }
    try {
      const res = await fetch(`${API_BASE}/demo/crisis-scenario`, { method: 'POST', signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return {
        scenario_id: 'CRISIS_SCENARIO_01',
        name: 'Monsoon Inflow & Fleet Mechanical Breakdown',
        description: 'Heavy rainfall (64.2mm) in Balaghat concession, accompanied by hydraulic failure on CAT-349 excavator and 2.5h bench blasting delay.'
      };
    }
  },

  async getGisGeoJson(layerName: string, mineId?: string): Promise<any> {
    const cleanName = layerName.replace('.geojson', '');
    if (this.isDemoMode) {
      try {
        const res = await fetch(`/data/${cleanName}.geojson`);
        if (res.ok) return await res.json();
      } catch {
        // pass
      }
    }
    try {
      const url = mineId
        ? `${API_BASE}/gis/geojson/${cleanName}?mine_id=${encodeURIComponent(mineId)}`
        : `${API_BASE}/gis/geojson/${cleanName}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`GIS layer API failed: ${res.status}`);
      return await res.json();
    } catch {
      // Offline fallback to static file
      try {
        const fallbackRes = await fetch(`/data/${cleanName}.geojson`);
        if (fallbackRes.ok) return await fallbackRes.json();
      } catch {
        // ignore
      }
      return { type: 'FeatureCollection', features: [] };
    }
  },

  async getSatelliteIndices(mineId?: string): Promise<any> {
    if (this.isDemoMode) {
      try {
        const res = await fetch('/data/satellite_indicators.json');
        if (res.ok) return await res.json();
      } catch {
        // pass
      }
    }
    try {
      const url = mineId
        ? `${API_BASE}/gis/satellite-indices?mine_id=${encodeURIComponent(mineId)}`
        : `${API_BASE}/gis/satellite-indices`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`Satellite indices API failed: ${res.status}`);
      return await res.json();
    } catch {
      // Offline fallback
      try {
        const res = await fetch('/data/satellite_indicators.json');
        if (res.ok) return await res.json();
      } catch {
        // ignore
      }
      return {
        mine_id: mineId || 'MINE_BALAGHAT_01',
        mine_name: 'Balaghat Manganese Concession',
        satellite_mission: 'Sentinel-2 MSI Level-2A',
        acquisition_date: '2026-03-14',
        ndvi: 0.174,
        ndwi: -0.082,
        land_surface_temp_c: 36.8,
        soil_moisture_satellite_pct: 24.5,
        cloud_coverage_pct: 4.2,
        rainfall_mm: 54.2,
        status: 'VALID_OBSERVATION',
        indicators: []
      };
    }
  },

  async runPipeline(mineId?: string): Promise<PipelineRunResult> {
    const targetMineId = mineId || 'MINE_BALAGHAT_01';
    if (this.isDemoMode) {
      return this.getFallbackPipelineResult(targetMineId);
    }
    try {
      const url = `${API_BASE}/pipeline/run?mine_id=${encodeURIComponent(targetMineId)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) throw new Error(`Pipeline execution failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Pipeline backend call failed, falling back to deterministic local execution:', err);
      return this.getFallbackPipelineResult(targetMineId);
    }
  },

  getFallbackPipelineResult(mineId: string): PipelineRunResult {
    const isBalaghat = mineId === 'MINE_BALAGHAT_01' || !mineId;
    return {
      analysis_id: `ANALYSIS-${mineId}-${Date.now()}`,
      executed_at: new Date().toISOString(),
      mine: {
        id: mineId,
        name: isBalaghat ? 'Balaghat Manganese Concession' : 'Gumgaon Manganese Mine',
        concession_code: isBalaghat ? 'MOIL-MP-BAL-01' : 'MOIL-MH-GMG-02',
        state: isBalaghat ? 'Madhya Pradesh' : 'Maharashtra',
        district: isBalaghat ? 'Balaghat' : 'Nagpur',
        latitude: isBalaghat ? 21.8045 : 21.3789,
        longitude: isBalaghat ? 80.1856 : 78.9834,
        mineral_type: 'Manganese Ore'
      },
      stages: [
        {
          id: 0,
          name: 'Ingesting Multi-Spectral Satellite & Environmental Data',
          status: 'COMPLETED',
          duration_ms: 12.4,
          summary: isBalaghat
            ? 'Ingested Sentinel-2 MSI (NDVI: 0.17, NDWI: -0.08) and weather telemetry (54.2 mm rain, 58.4% soil moisture).'
            : 'Ingested Sentinel-2 MSI (NDVI: 0.22, NDWI: -0.12) and weather telemetry (8.5 mm rain, 30.0% soil moisture).'
        },
        {
          id: 1,
          name: 'Querying Geological Corehole Assays & Borehole Logs',
          status: 'COMPLETED',
          duration_ms: 8.2,
          summary: isBalaghat
            ? 'Retrieved 25 exploratory borehole assay logs across 5 operational mine zones.'
            : 'Retrieved 16 exploratory borehole assay logs across 4 operational mine zones.'
        },
        {
          id: 2,
          name: 'Executing Reserve Random Forest Classifier',
          status: 'COMPLETED',
          duration_ms: 15.6,
          summary: isBalaghat
            ? 'Reserve ML evaluated 5 zones: HIGH potential (89%), total est. reserves 1,485,000 tonnes.'
            : 'Reserve ML evaluated 4 zones: HIGH potential (82%), total est. reserves 840,000 tonnes.'
        },
        {
          id: 3,
          name: 'Executing 14-Feature Production GradientBoosting Regressor',
          status: 'COMPLETED',
          duration_ms: 18.1,
          summary: isBalaghat
            ? 'GradientBoosting forecasted 820.0T output against 1000.0T target (confidence: 85%).'
            : 'GradientBoosting forecasted 610.0T output against 650.0T target (confidence: 90%).'
        },
        {
          id: 4,
          name: 'Evaluating Production Shortfall & Bench Availability',
          status: 'COMPLETED',
          duration_ms: 4.5,
          summary: isBalaghat
            ? 'Shortfall analysis: 18.0% production deficit (180.0 tonnes below target)'
            : 'Shortfall analysis: 6.2% production deficit (40.0 tonnes below target)'
        },
        {
          id: 5,
          name: 'Computing Authoritative 4-Component Risk Matrix & Attribution',
          status: 'COMPLETED',
          duration_ms: 11.3,
          summary: isBalaghat
            ? 'Composite risk calculated at 68.5/100 (HIGH Risk) with full 4-domain XAI factor attribution.'
            : 'Composite risk calculated at 34.0/100 (LOW Risk) with full 4-domain XAI factor attribution.'
        },
        {
          id: 6,
          name: 'Synthesizing Prescriptive Action Protocols',
          status: 'COMPLETED',
          duration_ms: 9.8,
          summary: isBalaghat
            ? 'Synthesized 3 prioritized prescriptive mitigation protocols for operational management approval.'
            : 'Synthesized 2 prioritized prescriptive mitigation protocols for operational management approval.'
        }
      ],
      reserve: {
        total_estimated_reserves: isBalaghat ? 1485000 : 840000,
        primary_classification: 'HIGH',
        average_reserve_probability: isBalaghat ? 0.89 : 0.82,
        average_mn_grade: isBalaghat ? 41.8 : 37.2,
        zones_evaluated: isBalaghat ? 5 : 4,
        zones: []
      },
      production: {
        target_date: '2026-03-15',
        planned_production: isBalaghat ? 1000 : 650,
        predicted_production: isBalaghat ? 820 : 610,
        confidence: isBalaghat ? 0.85 : 0.90
      },
      shortfall: {
        shortfall_tonnes: isBalaghat ? 180 : 40,
        shortfall_percentage: isBalaghat ? 18.0 : 6.2,
        is_deficit: true,
        assessment: isBalaghat
          ? '18.0% production deficit (180.0 tonnes below target)'
          : '6.2% production deficit (40.0 tonnes below target)'
      },
      risk: {
        mine_id: mineId,
        overall_risk_score: isBalaghat ? 68.5 : 34.0,
        risk_tier: isBalaghat ? 'HIGH' : 'LOW',
        equipment_risk: isBalaghat ? 72.0 : 25.0,
        weather_risk: isBalaghat ? 84.0 : 18.0,
        blasting_risk: isBalaghat ? 55.0 : 20.0,
        production_risk: isBalaghat ? 60.0 : 15.0,
        contributing_factors: isBalaghat ? FALLBACK_RISK.contributing_factors : [
          { name: 'Equipment Downtime', severity: 'LOW', weight: 0.35, description: 'Optimal equipment availability (1.5h downtime).', observed_value: '1.5 hrs' },
          { name: 'Precipitation & Monsoon Impact', severity: 'LOW', weight: 0.25, description: 'Favorable weather conditions (8.5mm precipitation).', observed_value: '8.5 mm' },
          { name: 'Blasting Schedule Adherence', severity: 'LOW', weight: 0.20, description: 'Blasting executed on scheduled shift window (0.5h delay).', observed_value: '0.5 hrs' },
          { name: 'Daily Production Deficit', severity: 'LOW', weight: 0.20, description: 'Production tracking close to planned targets (6.2% shortfall).', observed_value: '6.2%' }
        ],
        summary_explanation: isBalaghat ? FALLBACK_RISK.summary_explanation : 'Operations within normal parameters.'
      },
      recommendations: isBalaghat ? localRecommendations : []
    };
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }
};

export const api = apiService;

