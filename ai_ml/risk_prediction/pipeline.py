"""
Integrated Decision Support Pipeline.
Chains:
Production ML (forecasting & shortfall) ->
Multi-Factor Risk Assessment (composite scoring & XAI factor attribution) ->
Prescriptive Recommendation Engine (mitigation rules & human approval workflow)
"""
from typing import List, Optional
from pydantic import BaseModel
from ai_ml.production_prediction.schemas import ProductionPredictionRequest, ProductionPredictionResponse
from ai_ml.production_prediction.predict import predict_production_and_shortfall
from ai_ml.risk_prediction.schemas import RiskAssessmentRequest, RiskAssessmentResponse
from ai_ml.risk_prediction.engine import evaluate_mining_risk
from ai_ml.recommendation_engine.schemas import RecommendationItem, RecommendationGenerationRequest
from ai_ml.recommendation_engine.recommender import generate_recommendations


class IntegratedPipelineResult(BaseModel):
    mine_id: str
    production: ProductionPredictionResponse
    risk: RiskAssessmentResponse
    recommendations: List[RecommendationItem]


def run_integrated_risk_pipeline(
    planned_production: float = 1000.0,
    equipment_downtime_hours: float = 3.5,
    rainfall_mm: float = 28.0,
    blasting_delay_hours: float = 1.5,
    mine_id: str = "MINE_BALAGHAT_01",
    equipment_efficiency_pct: Optional[float] = None,
    soil_moisture_pct: Optional[float] = None,
    flood_risk_score: Optional[float] = None,
    active_equipment_count: Optional[float] = None,
    hauling_trips: Optional[float] = None,
    model=None
) -> IntegratedPipelineResult:
    """
    Executes the end-to-end operational AI decision loop:
    1. ML regression forecasts daily production extraction and computes shortfall deficit.
    2. Multi-factor risk engine evaluates operational risk tier and attributes root causes.
    3. Prescriptive engine triggers actionable operational mitigation interventions for manager review.
    """
    # 1. Production Forecasting
    prod_req = ProductionPredictionRequest(
        mine_id=mine_id,
        planned_production=planned_production,
        equipment_downtime_hours=equipment_downtime_hours,
        rainfall_mm=rainfall_mm,
        blasting_delay_hours=blasting_delay_hours,
        equipment_efficiency_pct=equipment_efficiency_pct,
        soil_moisture_pct=soil_moisture_pct,
        flood_risk_score=flood_risk_score,
        active_equipment_count=active_equipment_count,
        hauling_trips=hauling_trips
    )
    prod_res = predict_production_and_shortfall(prod_req, model=model)

    # 2. Risk Assessment & Attribution
    risk_req = RiskAssessmentRequest(
        mine_id=mine_id,
        equipment_downtime_hours=equipment_downtime_hours,
        rainfall_mm=rainfall_mm,
        blasting_delay_hours=blasting_delay_hours,
        shortfall_percentage=prod_res.shortfall_percentage,
        planned_production=prod_res.planned_production,
        predicted_production=prod_res.predicted_production,
        shortfall=prod_res.shortfall,
        equipment_efficiency_pct=equipment_efficiency_pct,
        soil_moisture_pct=soil_moisture_pct,
        flood_risk_score=flood_risk_score,
        active_equipment_count=active_equipment_count
    )
    risk_res = evaluate_mining_risk(risk_req)

    # 3. Prescriptive Recommendations
    rec_req = RecommendationGenerationRequest(
        mine_id=mine_id,
        downtime_hours=equipment_downtime_hours,
        rainfall_mm=rainfall_mm,
        blasting_delay_hours=blasting_delay_hours,
        shortfall_percentage=prod_res.shortfall_percentage,
        planned_production=prod_res.planned_production,
        predicted_production=prod_res.predicted_production,
        shortfall=prod_res.shortfall,
        risk_score=risk_res.overall_risk_score,
        risk_tier=risk_res.risk_tier
    )
    rec_res = generate_recommendations(rec_req)

    return IntegratedPipelineResult(
        mine_id=mine_id,
        production=prod_res,
        risk=risk_res,
        recommendations=rec_res
    )
