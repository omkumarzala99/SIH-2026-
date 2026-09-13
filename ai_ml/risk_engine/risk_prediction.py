"""
Risk Prediction Engine: Evaluates operational risk score (0-100) and severity tiers.
"""
from ai_ml.risk_engine.schemas import RiskEvaluationRequest, RiskEvaluationResponse
from ai_ml.risk_engine.risk_rules import evaluate_operational_rules


def predict_risk(req: RiskEvaluationRequest) -> RiskEvaluationResponse:
    downtime = req.equipment_downtime_hours
    rainfall = req.rainfall_mm
    blasting = req.blasting_delay_hours
    shortfall_pct = req.shortfall_percentage

    # Sub-scores 0 - 100
    eq_risk = min(100.0, max(0.0, (downtime / 8.0) * 100.0))
    weather_risk = min(100.0, max(0.0, (rainfall / 60.0) * 100.0))
    blasting_risk = min(100.0, max(0.0, (blasting / 4.0) * 100.0))
    prod_risk = min(100.0, max(0.0, (shortfall_pct / 30.0) * 100.0))

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

    factors = evaluate_operational_rules(downtime, rainfall, blasting, shortfall_pct)
    elevated = [f.name for f in factors if f.severity in ["HIGH", "CRITICAL"]]

    summary = f"Risk evaluated at {tier} ({overall_score}/100) due to {', '.join(elevated) if elevated else 'normal operations'}."

    return RiskEvaluationResponse(
        mine_id=req.mine_id or "MINE_BALAGHAT_01",
        overall_risk_score=overall_score,
        risk_tier=tier,
        equipment_risk=round(eq_risk, 1),
        weather_risk=round(weather_risk, 1),
        blasting_risk=round(blasting_risk, 1),
        production_risk=round(prod_risk, 1),
        contributing_factors=factors,
        summary_explanation=summary,
        model_version="Risk_Engine_v1.0"
    )
