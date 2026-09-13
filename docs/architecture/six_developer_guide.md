# Six-Developer Engineering Guide: PS-26009

This document outlines the exact ownership boundaries, branch workflows, and interface contracts for the 6 developers collaborating on the MOIL Mining Intelligence Platform.

---

## Team Ownership Matrix

```
                          +------------------------------------------+
                          | MEMBER 1: Project Lead & Architecture    |
                          | (Integration, CI/CD, Docs, Release)      |
                          +------------------------------------------+
                                               |
         +--------------------+----------------+--------------------+
         |                    |                |                    |
         v                    v                v                    v
+------------------+ +------------------+ +------------------+ +------------------+
| MEMBER 2         | | MEMBER 3         | | MEMBER 4         | | MEMBER 5         |
| Reserve ML       | | Production & Risk| | GIS & Satellite  | | Backend & Data   |
| (Geology + Space)| | (Forecasting+Rec)| | (GeoJSON+Indices)| | (Pipeline + DB)  |
+------------------+ +------------------+ +------------------+ +------------------+
         |                    |                |                    |
         +--------------------+----------------+--------------------+
                                               |
                                               v
                          +------------------------------------------+
                          | MEMBER 6: Frontend & UI/UX Specialist    |
                          | (React, Leaflet, Dashboard, Demo State)  |
                          +------------------------------------------+
```

---

### Member 1: Project Lead & Integration Architect
- **Primary Directories**: `docs/`, `scripts/`, `tests/integration/`, `docker-compose.yml`, root configs.
- **Git Branch**: `develop`, `release/*`
- **Responsibilities**:
  - Maintains system architecture and data contracts.
  - Reviews and merges Pull Requests from Members 2-6 into `develop`.
  - Runs full automated regression test suites before cutting release tags.
  - Prepares the final hackathon presentation walkthrough and demonstration script.

---

### Member 2: Reserve Identification AI/ML Specialist
- **Primary Directories**: `ai_ml/reserve_prediction/`, `ai_ml/models/`
- **Git Branch**: `feature/reserve-ml`
- **Responsibilities**:
  - Implements borehole feature extraction combining $Mn$, $Fe$, $SiO_2$, depth, and rock formations.
  - Integrates satellite NDVI and thermal indices into the reserve classification model.
  - Implements model training (`train.py`), inference (`predict.py`), and evaluation (`evaluate.py`).
- **Consumed APIs**: `data/mock/geological_data.csv`, `gis/satellite/`
- **Provided APIs**: `POST /api/reserves/predict`

---

### Member 3: Production & Risk AI/ML Specialist
- **Primary Directories**: `ai_ml/production_prediction/`, `ai_ml/risk_prediction/`, `ai_ml/recommendation_engine/`
- **Git Branch**: `feature/production-risk`
- **Responsibilities**:
  - Builds daily extraction forecasting models (`production_prediction/`).
  - Implements multi-factor risk scoring engine and XAI factor attribution (`risk_prediction/`).
  - Builds prescriptive mitigation rules and ranking logic (`recommendation_engine/`).
- **Provided APIs**: `POST /api/production/predict`, `POST /api/risk/predict`, `POST /api/recommendations/generate`

---

### Member 4: GIS & Satellite / Space Specialist
- **Primary Directories**: `gis/`, `data/geojson/`, `gis/satellite/`
- **Git Branch**: `feature/gis`
- **Responsibilities**:
  - Manages spatial vector layers: `mine_boundary.geojson`, `mining_zones.geojson`, `reserve_zones.geojson`.
  - Implements satellite data provider adapters (Sentinel-2, Landsat-9, SMAP).
  - Supplies GeoJSON attributes for pit bench levels, concession boundaries, and heatmaps.
- **Provided APIs**: `GET /api/gis/layers`, `GET /api/gis/geojson/{layer}`, `GET /api/gis/satellite-indices`

---

### Member 5: Backend & Data Pipeline Engineer
- **Primary Directories**: `backend/`, `data_pipeline/`, `database/`, `data/`
- **Git Branch**: `feature/backend`, `feature/data-pipeline`
- **Responsibilities**:
  - Maintains FastAPI REST routing, Pydantic schemas, and database session lifecycles.
  - Implements SQLAlchemy models and migration scripts (SQLite demo fallback & PostgreSQL).
  - Builds data ingestion, cleaning, transformation, and empirical quality audit calculators.
- **Provided APIs**: Core REST router, `GET /api/health`, `GET /api/dashboard`, `GET /api/data-quality`

---

### Member 6: Frontend & UI/UX Specialist
- **Primary Directories**: `frontend/`
- **Git Branch**: `feature/frontend`
- **Responsibilities**:
  - Builds the responsive React 18 TypeScript web dashboard with Tailwind CSS.
  - Integrates the interactive Leaflet GIS map with zone click popups and layer toggles.
  - Implements the 14-day production trend SVG chart, What-If simulation sliders, and Human-in-the-Loop review actions.
  - Ensures the offline Demo Mode operates smoothly with zero external dependencies.
