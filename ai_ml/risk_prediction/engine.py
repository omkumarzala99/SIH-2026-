"""
Transparent Multi-Factor Risk Assessment Engine.
Calculates overall composite risk score (0 - 100) and domain-specific sub-scores.
"""
from ai_ml.risk_prediction.schemas import RiskAssessmentRequest, RiskAssessmentResponse
from ai_ml.risk_prediction.explainability import build_risk_explanations


def evaluate_mining_risk(req: RiskAssessmentRequest) -> RiskAssessmentResponse:
    downtime = req.equipment_downtime_hours
    rainfall = req.rainfall_mm
    blasting = req.blasting_delay_hours

    planned_prod = req.planned_production
    pred_prod = req.predicted_production
    shortfall = req.shortfall

    # If planned production is provided, derive or infer predicted production and shortfall
    if planned_prod is not None:
        if pred_prod is None:
            # Dynamically invoke production ML prediction
            from ai_ml.production_prediction.schemas import ProductionPredictionRequest
            from ai_ml.production_prediction.predict import predict_production_and_shortfall
            prod_req = ProductionPredictionRequest(
                mine_id=req.mine_id,
                planned_production=planned_prod,
                equipment_downtime_hours=downtime,
                rainfall_mm=rainfall,
                blasting_delay_hours=blasting,
                equipment_efficiency_pct=req.equipment_efficiency_pct,
                soil_moisture_pct=req.soil_moisture_pct,
                flood_risk_score=req.flood_risk_score,
                active_equipment_count=req.active_equipment_count
            )
            prod_res = predict_production_and_shortfall(prod_req)
            pred_prod = prod_res.predicted_production
            shortfall = prod_res.shortfall
            shortfall_pct = prod_res.shortfall_percentage
        else:
            if shortfall is None:
                shortfall = max(0.0, planned_prod - pred_prod)
            shortfall_pct = round((shortfall / planned_prod * 100.0), 2) if planned_prod > 0 else 0.0
    else:
        shortfall_pct = req.shortfall_percentage
        if shortfall is None and planned_prod is not None:
            shortfall = round((shortfall_pct / 100.0) * planned_prod, 1)

    # Domain risk scores scaled to 0-100
    eq_risk = min(100.0, max(0.0, (downtime / 8.0) * 100.0))
    weather_risk = min(100.0, max(0.0, (rainfall / 60.0) * 100.0))
    blasting_risk = min(100.0, max(0.0, (blasting / 4.0) * 100.0))
    prod_risk = min(100.0, max(0.0, (shortfall_pct / 30.0) * 100.0))

    # Composite weighted risk calculation
    overall_score = round(
        (eq_risk * 0.35) +
        (weather_risk * 0.25) +
        (blasting_risk * 0.20) +
        (prod_risk * 0.20),
        1
    )

    if overall_score >= 75.0:
        tier = "CRITICAL"
    elif overall_score >= 55.0:
        tier = "HIGH"
    elif overall_score >= 30.0:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    factors = build_risk_explanations(
        downtime=downtime,
        rainfall=rainfall,
        blasting=blasting,
        shortfall_pct=shortfall_pct,
        soil_moisture=req.soil_moisture_pct,
        equipment_efficiency=req.equipment_efficiency_pct,
        planned_production=planned_prod,
        predicted_production=pred_prod,
        shortfall=shortfall
    )

    critical_factors = [f.name for f in factors if f.severity in ["HIGH", "CRITICAL"]]
    if critical_factors:
        summary = f"Risk elevated to {tier} primarily due to: {', '.join(critical_factors)}."
    else:
        summary = f"All operational indicators are operating within normal tolerances ({tier} risk)."

    return RiskAssessmentResponse(
        mine_id=req.mine_id or "MINE_BALAGHAT_01",
        overall_risk_score=overall_score,
        risk_tier=tier,
        equipment_risk=round(eq_risk, 1),
        weather_risk=round(weather_risk, 1),
        blasting_risk=round(blasting_risk, 1),
        production_risk=round(prod_risk, 1),
        contributing_factors=factors,
        summary_explanation=summary,
        planned_production=planned_prod,
        predicted_production=pred_prod,
        shortfall=shortfall,
        shortfall_percentage=round(shortfall_pct, 2)
    )

