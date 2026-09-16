"""
Executive Dashboard Aggregation Endpoint.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.api.dependencies import get_db
from backend.app.config import settings
from database.models import Mine, MineZone, Equipment, ProductionRecord, Recommendation, WeatherObservation

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard_summary(
    mine_id: Optional[str] = Query(None, description="Optional mine ID filter"),
    db: Session = Depends(get_db)
):
    """Fetches high-level executive summary KPIs, active alerts, and quick actions."""
    target_mine_id = mine_id or "MINE_BALAGHAT_01"

    if target_mine_id == "MINE_BALAGHAT_01":
        total_eq = db.query(Equipment).filter(Equipment.mine_id == "MINE_BALAGHAT_01").count() if db else 8
        pending_recs = db.query(Recommendation).filter(
            Recommendation.mine_id == "MINE_BALAGHAT_01",
            Recommendation.status == "PENDING"
        ).count() if db else 3

        return {
            "kpis": {
                "total_estimated_reserves_tonnes": 1485000.0,
                "daily_planned_production_tonnes": 1000.0,
                "daily_predicted_production_tonnes": 820.0,
                "daily_shortfall_tonnes": 180.0,
                "shortfall_percentage": 18.0,
                "current_risk_score": 68.5,
                "current_risk_tier": "HIGH",
                "fleet_health_score": 88.5,
                "active_equipment_count": total_eq or 8,
                "pending_recommendations_count": pending_recs or 3
            },
            "environmental_status": {
                "rainfall_mm": 54.2,
                "soil_moisture_pct": 58.4,
                "ambient_temp_c": 34.2,
                "flood_risk_level": "MODERATE_HIGH",
                "weather_trend": "Monsoon Front Approaching"
            },
            "recent_alerts": [
                {
                    "id": "ALT-01",
                    "severity": "CRITICAL",
                    "title": "Equipment Downtime Alert",
                    "message": "Excavator EXC_CAT_349_01 experiencing hydraulic overheating at Central Pit B.",
                    "timestamp": "15m ago"
                },
                {
                    "id": "ALT-02",
                    "severity": "HIGH",
                    "title": "Production Shortfall Warning",
                    "message": "Shift-A actual extraction 260t is 28% below planned target of 360t.",
                    "timestamp": "42m ago"
                },
                {
                    "id": "ALT-03",
                    "severity": "MEDIUM",
                    "title": "Bench Water Accumulation",
                    "message": "Bench -160m sump level reached 78% capacity after 54mm rainfall.",
                    "timestamp": "1h ago"
                }
            ],
            "top_recommendation": {
                "id": "REC_2026_001",
                "title": "Re-deploy Haul Dumper Fleet to Pit A Upper Bench",
                "category": "EQUIPMENT",
                "recommended_action": "Temporarily re-route dumpers DMP_VOLVO_FMX_11 and 12 to North Pit A bench -120m RL.",
                "expected_tonnage_recovery": 110.0,
                "urgency": "HIGH",
                "status": "PENDING"
            },
            "mode": settings.APP_MODE
        }

    # Non-Balaghat dynamic mine dashboard
    zones = db.query(MineZone).filter(MineZone.mine_id == target_mine_id).all()
    daily_planned = float(sum(z.daily_target_tons for z in zones)) if zones else 650.0
    active_eq = db.query(Equipment).filter(Equipment.mine_id == target_mine_id).count()
    pending_recs = db.query(Recommendation).filter(
        Recommendation.mine_id == target_mine_id,
        Recommendation.status == "PENDING"
    ).count()

    latest_wx = db.query(WeatherObservation).filter(
        WeatherObservation.mine_id == target_mine_id
    ).order_by(WeatherObservation.observed_at.desc()).first()

    recent_prod = db.query(ProductionRecord).filter(
        ProductionRecord.mine_id == target_mine_id
    ).order_by(ProductionRecord.date.desc(), ProductionRecord.id.desc()).all()[:5]

    if recent_prod:
        avg_actual = sum(p.actual_tonnage for p in recent_prod) / len(recent_prod)
        daily_predicted = round(avg_actual, 0)
    else:
        daily_predicted = round(daily_planned * 0.88, 0)

    daily_shortfall = max(0.0, daily_planned - daily_predicted)
    shortfall_pct = round((daily_shortfall / daily_planned * 100), 1) if daily_planned > 0 else 0.0

    top_rec = db.query(Recommendation).filter(
        Recommendation.mine_id == target_mine_id,
        Recommendation.status == "PENDING"
    ).first()

    top_rec_dict = {
        "id": top_rec.id,
        "title": top_rec.title,
        "category": top_rec.category,
        "recommended_action": top_rec.recommended_action,
        "expected_tonnage_recovery": top_rec.expected_tonnage_recovery or 75.0,
        "urgency": top_rec.urgency,
        "status": top_rec.status
    } if top_rec else {
        "id": f"REC_{target_mine_id}_01",
        "title": "Maintain Standard Operational Bench Schedule",
        "category": "OPERATIONAL",
        "recommended_action": "Continue scheduled extraction cycles under current baseline telemetry.",
        "expected_tonnage_recovery": 50.0,
        "urgency": "LOW",
        "status": "PENDING"
    }

    return {
        "kpis": {
            "total_estimated_reserves_tonnes": 950000.0,
            "daily_planned_production_tonnes": daily_planned,
            "daily_predicted_production_tonnes": daily_predicted,
            "daily_shortfall_tonnes": daily_shortfall,
            "shortfall_percentage": shortfall_pct,
            "current_risk_score": 45.0,
            "current_risk_tier": "MEDIUM",
            "fleet_health_score": 91.0,
            "active_equipment_count": active_eq or 4,
            "pending_recommendations_count": pending_recs
        },
        "environmental_status": {
            "rainfall_mm": float(latest_wx.rainfall_mm) if (latest_wx and latest_wx.rainfall_mm is not None) else 8.5,
            "soil_moisture_pct": float(latest_wx.soil_moisture_pct) if (latest_wx and latest_wx.soil_moisture_pct is not None) else 32.0,
            "ambient_temp_c": float(latest_wx.ambient_temp_c) if (latest_wx and latest_wx.ambient_temp_c is not None) else 29.5,
            "flood_risk_level": latest_wx.flood_risk_index if latest_wx else "LOW",
            "weather_trend": "Stable Conditions"
        },
        "recent_alerts": [
            {
                "id": f"ALT-{target_mine_id[:3]}-01",
                "severity": "MEDIUM",
                "title": "Daily Telemetry Active",
                "message": f"Concession monitoring telemetry active across {len(zones)} operational blocks.",
                "timestamp": "Just now"
            }
        ],
        "top_recommendation": top_rec_dict,
        "mode": settings.APP_MODE
    }
