// Common Data Contracts for PS-26009 MOIL Mining Intelligence Platform

export interface DashboardKPIs {
  total_estimated_reserves_tonnes: number;
  daily_planned_production_tonnes: number;
  daily_predicted_production_tonnes: number;
  daily_shortfall_tonnes: number;
  shortfall_percentage: number;
  current_risk_score: number;
  current_risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fleet_health_score: number;
  active_equipment_count: number;
  pending_recommendations_count: number;
}

export interface EnvironmentalStatus {
  rainfall_mm: number;
  soil_moisture_pct: number;
  ambient_temp_c: number;
  flood_risk_level: string;
  weather_trend: string;
}

export interface SystemAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
}

export interface TopRecommendation {
  id: string;
  title: string;
  category: string;
  recommended_action: string;
  expected_tonnage_recovery: number;
  urgency: string;
  status: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  environmental_status: EnvironmentalStatus;
  recent_alerts: SystemAlert[];
  top_recommendation: TopRecommendation;
  mode: 'demo' | 'live';
}

export interface ReserveZone {
  zone_id: string;
  name: string;
  classification: 'HIGH' | 'MEDIUM' | 'LOW';
  reserve_probability: number;
  estimated_tonnage: number;
  estimated_mn_grade: number;
  confidence: number;
  formation: string;
  ndvi_index: number;
  status: string;
}

export interface BoreholeRecord {
  borehole_id: string;
  zone_id: string;
  depth_meters: number;
  mn_grade_pct: number;
  fe_grade_pct: number;
  sio2_pct: number;
  rock_formation: string;
  subsurface_layer: string;
}

export interface ProductionHistoryItem {
  date: string;
  planned: number;
  actual: number;
  shortfall: number;
  blasting_delay_h: number;
  rainfall_mm: number;
}

export interface ProductionTrendData {
  current_target: number;
  current_predicted: number;
  current_shortfall: number;
  shortfall_percentage: number;
  history: ProductionHistoryItem[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  zone: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL_MAINTENANCE';
  downtime_h: number;
  efficiency: number;
}

export interface RiskFactor {
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  weight: number;
  description: string;
  observed_value: string;
}

export interface RiskData {
  mine_id: string;
  overall_risk_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  equipment_risk: number;
  weather_risk: number;
  blasting_risk: number;
  production_risk: number;
  contributing_factors: RiskFactor[];
  summary_explanation: string;
}

export interface RecommendationItem {
  id: string;
  mine_id: string;
  title: string;
  category: 'EQUIPMENT' | 'BLASTING' | 'SCHEDULE' | 'ENVIRONMENTAL' | 'ZONE_PRIORITIZATION';
  problem_summary: string;
  recommended_action: string;
  expected_impact: string;
  expected_tonnage_recovery: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  manager_notes?: string;
  created_at: string;
}

export interface SimulationResult {
  scenario_name: string;
  baseline: {
    downtime_hours: number;
    rainfall_mm: number;
    blasting_delay_hours: number;
    predicted_production: number;
    shortfall: number;
    shortfall_percentage: number;
    risk_score: number;
    risk_tier: string;
  };
  simulated: {
    downtime_hours: number;
    rainfall_mm: number;
    blasting_delay_hours: number;
    predicted_production: number;
    shortfall: number;
    shortfall_percentage: number;
    risk_score: number;
    risk_tier: string;
  };
  variance: {
    production_delta_tonnes: number;
    shortfall_delta_tonnes: number;
    risk_score_delta: number;
    improved: boolean;
  };
  recommendation: string;
}

export interface DomainQuality {
  name: string;
  overall_score: number;
  completeness_pct: number;
  uniqueness_pct: number;
  validity_pct: number;
  total_records: number;
  missing_values: number;
  duplicate_records: number;
  freshness_hours_ago: number;
  last_updated: string;
}

export interface DataQualityReport {
  fleet_health_score: number;
  domains: {
    geological: DomainQuality;
    production: DomainQuality;
    equipment: DomainQuality;
    weather: DomainQuality;
    satellite: DomainQuality;
  };
  generated_at: string;
}

export interface PipelineStageResult {
  id: number;
  name: string;
  status: 'COMPLETED' | 'SKIPPED' | 'WARNING' | 'FAILED';
  duration_ms: number;
  summary: string;
  details?: Record<string, any>;
}

export interface PipelineReserveResult {
  total_estimated_reserves: number;
  primary_classification: 'HIGH' | 'MEDIUM' | 'LOW';
  average_reserve_probability: number;
  average_mn_grade: number;
  zones_evaluated: number;
  zones: Array<{
    zone_id: string;
    name: string;
    classification: string;
    reserve_probability: number;
    estimated_tonnage: number;
    estimated_mn_grade: number;
    confidence: number;
  }>;
}

export interface PipelineProductionResult {
  target_date: string;
  planned_production: number;
  predicted_production: number;
  confidence: number;
  contributing_factors?: Record<string, any>;
}

export interface PipelineShortfallResult {
  shortfall_tonnes: number;
  shortfall_percentage: number;
  is_deficit: boolean;
  assessment: string;
}

export interface PipelineRiskResult {
  mine_id?: string;
  overall_risk_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  equipment_risk: number;
  weather_risk: number;
  blasting_risk: number;
  production_risk: number;
  contributing_factors: RiskFactor[];
  summary_explanation: string;
}

export interface PipelineRunResult {
  analysis_id: string;
  executed_at: string;
  mine: {
    id: string;
    name: string;
    concession_code: string;
    state: string;
    district: string;
    latitude: number;
    longitude: number;
    mineral_type: string;
  };
  stages: PipelineStageResult[];
  reserve: PipelineReserveResult;
  production: PipelineProductionResult;
  shortfall: PipelineShortfallResult;
  risk: PipelineRiskResult;
  recommendations: RecommendationItem[];
}

