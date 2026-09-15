"""
Prescriptive Recommendation Engine for Decision Support.
Generates ranked, actionable operational interventions with human-in-the-loop review workflow.
"""
import uuid
from datetime import datetime, timezone
from typing import List
from ai_ml.recommendation_engine.schemas import (
    RecommendationItem, RecommendationGenerationRequest
)
from ai_ml.recommendation_engine.rules import evaluate_mitigation_rules


def generate_recommendations(req: RecommendationGenerationRequest) -> List[RecommendationItem]:
    """Generates prescriptive recommendations based on current operational bottlenecks."""
    shortfall_pct = req.shortfall_percentage
    if req.planned_production is not None and req.predicted_production is not None:
        shortfall = max(0.0, req.planned_production - req.predicted_production) if req.shortfall is None else req.shortfall
        shortfall_pct = round((shortfall / req.planned_production * 100.0), 2) if req.planned_production > 0 else 0.0

    raw_rules = evaluate_mitigation_rules(
        downtime=req.downtime_hours,
        rainfall=req.rainfall_mm,
        blasting=req.blasting_delay_hours,
        shortfall_pct=shortfall_pct
    )

    now_str = datetime.now(timezone.utc).isoformat()
    recommendations: List[RecommendationItem] = []

    for idx, r in enumerate(raw_rules, start=1):
        rec_id = f"REC_{datetime.now().strftime('%Y%m%d')}_{idx:03d}"
        recommendations.append(RecommendationItem(
            id=rec_id,
            mine_id=req.mine_id or "MINE_BALAGHAT_01",
            title=r["title"],
            category=r["category"],
            problem_summary=r["problem_summary"],
            recommended_action=r["recommended_action"],
            expected_impact=r["expected_impact"],
            expected_tonnage_recovery=r["expected_tonnage_recovery"],
            urgency=r["urgency"],
            status="PENDING",
            manager_notes=None,
            created_at=now_str
        ))

    return recommendations
