# REST API Reference Manual
**MOIL AI Mining Intelligence Platform**
**Base URL:** `http://localhost:8000` | **Prefix:** `/api`
**Interactive Swagger UI:** `/api/docs` | **ReDoc:** `/api/redoc`

---

## 1. System & Health Endpoints

### `GET /health` & `GET /api/health`
Validates backend server status, database connection, and AI/ML model artifact availability.

**Response (200 OK):**
```json
{
  "status": "online",
  "service": "MOIL AI/ML Mining Intelligence Platform",
  "version": "1.0.0",
  "environment": "production",
  "mode": "demo",
  "database": "connected",
  "models": {
    "reserve_model": "available",
    "production_model": "available"
  },
  "timestamp": "2026-09-16T12:00:00.000000+00:00"
}
```

---

## 2. End-to-End Analysis Pipeline

### `POST /api/pipeline/run`
Executes the unified AI/ML mining intelligence pipeline end-to-end for the designated concession.

**Query Parameters:**
- `mine_id` (string, optional): Target mine identifier (e.g., `MINE_BALAGHAT_01`, `MINE_GUMGAON_02`). Defaults to `MINE_BALAGHAT_01`.

**Response (200 OK):**
```json
{
  "analysis_id": "ANL_BALAGHAT_20260916_120000",
  "mine_id": "MINE_BALAGHAT_01",
  "timestamp": "2026-09-16T12:00:00.000000+00:00",
  "reserve_classification": {
    "mine_id": "MINE_BALAGHAT_01",
    "reserve_category": "HIGH",
    "confidence_score": 0.88,
    "estimated_grade_mn": 42.5,
    "ore_tonnage_estimate": 1485000.0,
    "subsurface_assays_evaluated": 120
  },
  "production": {
    "target_date": "2026-09-16",
    "planned_production": 1000.0,
    "predicted_production": 820.0,
    "confidence": 0.85
  },
  "shortfall": {
    "shortfall_tonnes": 180.0,
    "shortfall_percentage": 18.0,
    "is_deficit": true,
    "assessment": "18.0% production deficit (180.0 tonnes below target)"
  },
  "risk": {
    "mine_id": "MINE_BALAGHAT_01",
    "overall_risk_score": 68.5,
    "risk_tier": "HIGH",
    "equipment_risk": 72.0,
    "weather_risk": 84.0,
    "blasting_risk": 55.0,
    "production_risk": 60.0,
    "contributing_factors": [
      {
        "name": "Equipment Downtime",
        "severity": "HIGH",
        "weight": 0.35,
        "description": "CAT-349 Excavator hydraulic pump failure (6.5h downtime).",
        "observed_value": "6.5 hrs"
      }
    ],
    "summary_explanation": "Critical shortfall driven by equipment downtime and monsoon saturation."
  },
  "recommendations": [
    {
      "id": "REC_2026_001",
      "title": "Re-deploy Haul Dumper Fleet to Pit A Upper Bench",
      "category": "EQUIPMENT",
      "urgency": "HIGH",
      "expected_tonnage_recovery": 110.0,
      "status": "PENDING"
    }
  ]
}
```

---

## 3. Executive Dashboard & KPIs

### `GET /api/dashboard`
Returns high-level KPI cards, recent alerts, environmental status, and top pending recommendations.

**Query Parameters:**
- `mine_id` (string, optional): Target mine concession ID.

**Response (200 OK):**
```json
{
  "kpis": {
    "total_estimated_reserves_tonnes": 1485000.0,
    "daily_planned_production_tonnes": 1000.0,
    "daily_predicted_production_tonnes": 820.0,
    "daily_shortfall_tonnes": 180.0,
    "shortfall_percentage": 18.0,
    "current_risk_score": 68.5,
    "current_risk_tier": "HIGH",
    "fleet_health_score": 88.5,
    "active_equipment_count": 8,
    "pending_recommendations_count": 3
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
    }
  ],
  "top_recommendation": {
    "id": "REC_2026_001",
    "title": "Re-deploy Haul Dumper Fleet to Pit A Upper Bench",
    "category": "EQUIPMENT",
    "expected_tonnage_recovery": 110.0,
    "urgency": "HIGH"
  }
}
```

---

## 4. Subsurface Reserves & Assays

### `GET /api/reserves`
Retrieves geological reserve summary, borehole drill hole logs, and zone-level assay statistics.

### `POST /api/reserves/predict`
Evaluates custom geological features through the trained Random Forest model.

**Request Body:**
```json
{
  "manganese_pct": 44.5,
  "depth_m": 85.0,
  "iron_pct": 6.2,
  "silica_pct": 9.5,
  "stripping_ratio": 2.8,
  "lithology": "Manganiferous Quartzite",
  "zone_id": "ZONE_CENTRAL_B"
}
```

---

## 5. Production Forecasting & Trends

### `GET /api/production`
Returns 14-day production historical vs planned trends, HEMM fleet status, and active shift logs.

### `POST /api/production/forecast`
Forecasts daily production using the 14-feature lag-constrained Gradient Boosting model.

**Request Body:**
```json
{
  "planned_tonnage": 1000.0,
  "excavator_downtime_hours": 4.5,
  "dumper_availability_pct": 82.0,
  "rainfall_mm": 35.0,
  "soil_moisture_pct": 52.0,
  "blasting_delay_hours": 1.5,
  "active_faces": 3
}
```

---

## 6. Multi-Factor Risk & Explainable AI (XAI)

### `GET /api/risk`
Returns current operational risk rating (0–100), risk tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), factor weights, and root-cause summaries.

### `POST /api/risk/predict`
Calculates risk score for arbitrary operational conditions.

---

## 7. Prescriptive Recommendations & Governance

### `GET /api/recommendations`
Lists all active operational recommendations filtered by mine, category, or status.

### `POST /api/recommendations/{id}/action`
Executes managerial decision governance (Human-in-the-Loop).

**Request Body:**
```json
{
  "action": "APPROVE",
  "notes": "Approved by Shift Superintendent for immediate execution."
}
```
*Allowed actions:* `APPROVE`, `REJECT`, `MODIFY`.

---

## 8. GIS & Satellite Earth Observation

### `GET /api/gis/layers`
Lists available spatial GeoJSON vector layers.

### `GET /api/gis/geojson`
Returns GeoJSON vector geometry for boundary polygons, pit benches, and reserve heatmaps.

**Query Parameters:**
- `layer`: `boundary`, `benches`, or `reserves`.
- `mine_id`: Target mine ID (e.g., `MINE_BALAGHAT_01`, `MINE_GUMGAON_02`).

### `GET /api/gis/satellite-indices`
Returns Sentinel-2 and Landsat-9 spectral telemetry for the designated mine zones.

**Query Parameters:**
- `mine_id`: Target mine ID.

---

## 9. Simulation & Demo Utilities

### `POST /api/simulation/run`
Runs an interactive What-If scenario adjusting rainfall, machinery downtime, or blasting delays.

### `POST /api/demo/crisis`
Instantly triggers the Operational Crisis Scenario (heavy monsoon + excavator failure).

### `GET /api/quality`
Returns non-fabricated empirical data pipeline quality and completeness metrics.
