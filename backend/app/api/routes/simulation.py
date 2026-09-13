"""
What-If Scenario Simulation Endpoint.
Calculates Before vs. After operational impact when adjusting constraints.
"""
from fastapi import APIRouter
from backend.app.schemas.common import SimulationRequestDTO, SimulationResultDTO
from ai_ml.production_prediction.schemas import ProductionPredictionRequest
from ai_ml.production_prediction.predict import predict_production_and_shortfall
from ai_ml.risk_prediction.schemas import RiskAssessmentRequest
from ai_ml.risk_prediction.engine import evaluate_mining_risk
from ai_ml.recommendation_engine.rules import evaluate_mitigation_rules

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post("/run", response_model=SimulationResultDTO)
def run_simulation(req: SimulationRequestDTO):
    """Simulates production, shortfall, and risk variances under altered operational conditions."""
    # 1. Baseline crisis conditions
    base_prod_req = ProductionPredictionRequest(
        planned_production=req.planned_production,
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.5
    )
    base_prod = predict_production_and_shortfall(base_prod_req)
    base_risk = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.5,
        shortfall_percentage=base_prod.shortfall_percentage
    ))

    # 2. Simulated conditions with user-adjusted sliders
    sim_prod_req = ProductionPredictionRequest(
        planned_production=req.planned_production,
        equipment_downtime_hours=req.equipment_downtime_hours,
        rainfall_mm=req.rainfall_mm,
        blasting_delay_hours=req.blasting_delay_hours
    )
    sim_prod = predict_production_and_shortfall(sim_prod_req)
    sim_risk = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=req.equipment_downtime_hours,
        rainfall_mm=req.rainfall_mm,
        blasting_delay_hours=req.blasting_delay_hours,
        shortfall_percentage=sim_prod.shortfall_percentage
    ))

    # Calculate variance
    prod_delta = round(sim_prod.predicted_production - base_prod.predicted_production, 1)
    shortfall_delta = round(sim_prod.shortfall - base_prod.shortfall, 1)
    risk_delta = round(sim_risk.overall_risk_score - base_risk.overall_risk_score, 1)

    # Generated guidance
    if prod_delta > 0:
        recommendation = f"Adjustments recover +{prod_delta} metric tons of ore and reduce risk score by {abs(risk_delta)} points."
    elif prod_delta < 0:
        recommendation = f"Increased operational constraints decrease extraction by {abs(prod_delta)} tons and elevate risk."
    else:
        recommendation = "No net variance compared to baseline operational model."

    return SimulationResultDTO(
        scenario_name="What-If Operational Adjustment",
        baseline={
            "downtime_hours": 6.5,
            "rainfall_mm": 54.2,
            "blasting_delay_hours": 2.5,
            "predicted_production": base_prod.predicted_production,
            "shortfall": base_prod.shortfall,
            "shortfall_percentage": base_prod.shortfall_percentage,
            "risk_score": base_risk.overall_risk_score,
            "risk_tier": base_risk.risk_tier
        },
        simulated={
            "downtime_hours": req.equipment_downtime_hours,
            "rainfall_mm": req.rainfall_mm,
            "blasting_delay_hours": req.blasting_delay_hours,
            "predicted_production": sim_prod.predicted_production,
            "shortfall": sim_prod.shortfall,
            "shortfall_percentage": sim_prod.shortfall_percentage,
            "risk_score": sim_risk.overall_risk_score,
            "risk_tier": sim_risk.risk_tier
        },
        variance={
            "production_delta_tonnes": prod_delta,
            "shortfall_delta_tonnes": shortfall_delta,
            "risk_score_delta": risk_delta,
            "improved": prod_delta > 0
        },
        recommendation=recommendation
    )
