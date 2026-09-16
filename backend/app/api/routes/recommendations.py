"""
Decision Support & AI Recommendations Endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.api.dependencies import get_db
from database.models import Recommendation
from ai_ml.recommendation_engine.schemas import (
    RecommendationItem, RecommendationActionRequest, RecommendationGenerationRequest
)
from ai_ml.recommendation_engine.recommender import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=List[RecommendationItem])
def list_recommendations(
    mine_id: Optional[str] = Query(None, description="Optional mine ID filter"),
    db: Session = Depends(get_db)
):
    """Fetches all active prescriptive AI recommendations."""
    query = db.query(Recommendation)
    if mine_id and mine_id.upper() != "ALL":
        query = query.filter(Recommendation.mine_id == mine_id)
    recs = query.all()
    if not recs:
        # Generate initial recommendations if DB is fresh
        sample_gen = generate_recommendations(RecommendationGenerationRequest())
        for r in sample_gen:
            db_item = Recommendation(
                id=r.id,
                mine_id=r.mine_id,
                title=r.title,
                category=r.category,
                problem_summary=r.problem_summary,
                recommended_action=r.recommended_action,
                expected_impact=r.expected_impact,
                expected_tonnage_recovery=r.expected_tonnage_recovery,
                urgency=r.urgency,
                status=r.status,
                created_at=datetime.now(timezone.utc)
            )
            db.add(db_item)
        db.commit()
        recs = db.query(Recommendation).all()

    return [
        RecommendationItem(
            id=r.id,
            mine_id=r.mine_id,
            title=r.title,
            category=r.category,
            problem_summary=r.problem_summary,
            recommended_action=r.recommended_action,
            expected_impact=r.expected_impact,
            expected_tonnage_recovery=r.expected_tonnage_recovery or 100.0,
            urgency=r.urgency,
            status=r.status,
            manager_notes=r.manager_notes,
            created_at=r.created_at.isoformat() if r.created_at else datetime.now(timezone.utc).isoformat()
        )
        for r in recs
    ]


@router.post("/generate", response_model=List[RecommendationItem])
def generate_new_recommendations(req: RecommendationGenerationRequest, db: Session = Depends(get_db)):
    """Generates prescriptive recommendations dynamically from operational parameters."""
    items = generate_recommendations(req)
    for it in items:
        # Save or update in database
        existing = db.query(Recommendation).filter(Recommendation.id == it.id).first()
        if not existing:
            db.add(Recommendation(
                id=it.id,
                mine_id=it.mine_id,
                title=it.title,
                category=it.category,
                problem_summary=it.problem_summary,
                recommended_action=it.recommended_action,
                expected_impact=it.expected_impact,
                expected_tonnage_recovery=it.expected_tonnage_recovery,
                urgency=it.urgency,
                status="PENDING",
                created_at=datetime.now(timezone.utc)
            ))
    db.commit()
    return items


@router.post("/{rec_id}/action")
def take_human_in_loop_action(rec_id: str, payload: RecommendationActionRequest, db: Session = Depends(get_db)):
    """Human-in-the-Loop decision action: Approve, Reject, or Modify a recommendation."""
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    status_map = {
        "APPROVE": "APPROVED",
        "APPROVED": "APPROVED",
        "REJECT": "REJECTED",
        "REJECTED": "REJECTED",
        "MODIFY": "MODIFIED",
        "MODIFIED": "MODIFIED"
    }
    rec.status = status_map.get(payload.action.upper(), "APPROVED")
    if payload.manager_notes:
        rec.manager_notes = payload.manager_notes
    if payload.modified_action:
        rec.recommended_action = payload.modified_action

    rec.reviewed_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "success": True,
        "id": rec.id,
        "status": rec.status,
        "manager_notes": rec.manager_notes,
        "message": f"Recommendation successfully marked as {rec.status}."
    }
