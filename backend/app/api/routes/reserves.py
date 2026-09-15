"""
Reserve Intelligence Endpoints.
"""
from collections import Counter, defaultdict
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.api.dependencies import get_db
from database.models import GeologicalObservation, MineZone, SatelliteObservation, Mine
from ai_ml.reserve_prediction.schemas import ReservePredictionRequest, ReservePredictionResponse
from ai_ml.reserve_prediction.predict import predict_reserve_potential

router = APIRouter(prefix="/reserves", tags=["Reserves"])


@router.get("")
def list_reserve_zones(
    mine_id: Optional[str] = Query(None, description="Optional mine ID filter"),
    db: Session = Depends(get_db)
):
    """
    Returns evaluated manganese reserve potential across operational zones
    derived from real database geological observations and Reserve ML inference.
    """
    if mine_id:
        mine = db.query(Mine).filter(Mine.id == mine_id).first()
        if not mine:
            raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")

    obs_query = db.query(GeologicalObservation)
    if mine_id:
        obs_query = obs_query.filter(GeologicalObservation.mine_id == mine_id)

    observations = obs_query.all()
    if not observations:
        return []

    # Group observations by zone_id
    zone_obs_map = defaultdict(list)
    for obs in observations:
        zone_obs_map[obs.zone_id].append(obs)

    # Fetch zones in deterministic order
    zone_query = db.query(MineZone)
    if mine_id:
        zone_query = zone_query.filter(MineZone.mine_id == mine_id)
    zones = zone_query.all()

    ordered_zone_ids = [z.id for z in zones]
    for zid in zone_obs_map:
        if zid not in ordered_zone_ids:
            ordered_zone_ids.append(zid)

    zones_by_id = {z.id: z for z in zones}

    results = []
    for zone_id in ordered_zone_ids:
        obs_list = zone_obs_map.get(zone_id, [])
        if not obs_list:
            continue

        # Extract only observations that have valid required geological features
        valid_obs = [
            o for o in obs_list
            if o.depth_meters is not None
            and o.fe_grade_pct is not None
            and o.sio2_pct is not None
            and o.phosphorus_pct is not None
        ]
        if not valid_obs:
            continue

        # Perform ML inference for each suitable borehole observation
        borehole_preds = []
        try:
            for o in valid_obs:
                req = ReservePredictionRequest(
                    zone_id=zone_id,
                    depth_meters=float(o.depth_meters),
                    fe_grade_pct=float(o.fe_grade_pct),
                    sio2_pct=float(o.sio2_pct),
                    phosphorus_pct=float(o.phosphorus_pct),
                    mn_grade_pct=float(o.mn_grade_pct) if o.mn_grade_pct is not None else None,
                    rock_formation=o.rock_formation
                )
                # Note: mn_grade_pct is strictly excluded from model feature matrix X in predict.py
                pred = predict_reserve_potential(req)
                borehole_preds.append(pred)
        except FileNotFoundError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Reserve ML model artifact unavailable: {str(e)}"
            )

        if not borehole_preds:
            continue

        # Aggregate borehole predictions to zone-level metrics
        avg_prob = round(sum(p.reserve_probability for p in borehole_preds) / len(borehole_preds), 2)
        avg_tonnage = round(sum(p.estimated_tonnage for p in borehole_preds) / len(borehole_preds), 0)
        avg_conf = round(sum(p.confidence for p in borehole_preds) / len(borehole_preds), 2)

        if avg_prob >= 0.75:
            classification = "HIGH"
        elif avg_prob >= 0.50:
            classification = "MEDIUM"
        else:
            classification = "LOW"

        # Historical measured assay average (for reporting display only, never passed to ML)
        mn_vals = [o.mn_grade_pct for o in valid_obs if o.mn_grade_pct is not None]
        avg_mn = round(sum(mn_vals) / len(mn_vals), 1) if mn_vals else 0.0

        # Primary rock formation
        formations = [o.rock_formation for o in valid_obs if o.rock_formation]
        primary_formation = Counter(formations).most_common(1)[0][0] if formations else "Unknown Formation"

        # Satellite NDVI for this zone if available
        sat_obs = db.query(SatelliteObservation).filter(
            SatelliteObservation.zone_id == zone_id
        ).order_by(SatelliteObservation.observed_at.desc()).first()
        ndvi_val = round(float(sat_obs.ndvi), 2) if sat_obs else 0.18

        zone = zones_by_id.get(zone_id)
        zone_name = zone.name if zone else zone_id
        status_str = (
            zone.operational_status.replace("_", " ").title()
            if (zone and zone.operational_status)
            else "Active"
        )

        results.append({
            "zone_id": zone_id,
            "name": zone_name,
            "classification": classification,
            "reserve_probability": avg_prob,
            "estimated_tonnage": avg_tonnage,
            "estimated_mn_grade": avg_mn,
            "confidence": avg_conf,
            "formation": primary_formation,
            "ndvi_index": ndvi_val,
            "status": status_str
        })

    return results


@router.post("/predict", response_model=ReservePredictionResponse)
def predict_reserve(req: ReservePredictionRequest):
    """Executes AI/ML inference to classify manganese reserve potential for a target zone."""
    try:
        return predict_reserve_potential(req)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Reserve ML model artifact unavailable: {str(e)}"
        )


@router.get("/boreholes")
def get_borehole_observations(db: Session = Depends(get_db), limit: int = Query(default=25, le=100)):
    """Fetches exploratory borehole drilling records."""
    records = db.query(GeologicalObservation).limit(limit).all()
    return [
        {
            "borehole_id": r.borehole_id,
            "zone_id": r.zone_id,
            "depth_meters": r.depth_meters,
            "mn_grade_pct": r.mn_grade_pct,
            "fe_grade_pct": r.fe_grade_pct,
            "sio2_pct": r.sio2_pct,
            "rock_formation": r.rock_formation,
            "subsurface_layer": r.subsurface_layer
        }
        for r in records
    ]
