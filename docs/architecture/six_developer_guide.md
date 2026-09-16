# Modular Subsystem Engineering Guide

This document outlines the architectural boundaries, branch workflows, and interface contracts for the functional subsystems of the MOIL Mining Intelligence Platform.

---

## Subsystem Architecture Matrix

```
                          +------------------------------------------+
                          | 1. Pipeline & Integration Layer          |
                          | (Unified Pipeline, CI/CD, Deployment)    |
                          +------------------------------------------+
                                               |
         +--------------------+----------------+--------------------+
         |                    |                |                    |
         v                    v                v                    v
+------------------+ +------------------+ +------------------+ +------------------+
| 2. Reserve AI/ML | | 3. Production &  | | 4. GIS & Space   | | 5. Backend & Data|
| (Geology + Space)| | Risk Forecaster  | | (GeoJSON+Indices)| | (Pipeline + DB)  |
+------------------+ +------------------+ +------------------+ +------------------+
         |                    |                |                    |
         +--------------------+----------------+--------------------+
                                               |
                                               v
                          +------------------------------------------+
                          | 6. Frontend & Visual Analytics Workspace |
                          | (React, Leaflet, Dashboard, Simulation)  |
                          +------------------------------------------+
```

---

### 1. Pipeline & Integration Layer
- **Primary Directories**: `docs/`, `scripts/`, `tests/integration/`, `docker-compose.yml`, root configs.
- **Git Branch**: `develop`, `release/*`
- **Core Capabilities**:
  - Maintains system architecture and data contracts.
  - Reviews and merges Pull Requests from feature branches into `develop`.
  - Runs full automated regression test suites before cutting release tags.
  - Manages operational simulation workflows.

---

### 2. Reserve Identification AI/ML Subsystem
- **Primary Directories**: `ai_ml/reserve_prediction/`, `ai_ml/models/`
- **Git Branch**: `feature/reserve-ml`
- **Core Capabilities**:
  - Implements borehole feature extraction combining $Mn$, $Fe$, $SiO_2$, depth, and rock formations.
  - Integrates satellite NDVI and thermal indices into the reserve classification model.
  - Implements model training (`train.py`), inference (`predict.py`), and evaluation (`evaluate.py`).
- **Consumed APIs**: `data/mock/geological_data.csv`, `gis/satellite/`
- **Provided APIs**: `POST /api/reserves/predict`

---

### 3. Production & Risk AI/ML Engine
- **Primary Directories**: `ai_ml/production_prediction/`, `ai_ml/risk_prediction/`, `ai_ml/recommendation_engine/`
- **Git Branch**: `feature/production-risk`
- **Core Capabilities**:
  - Builds daily extraction forecasting models (`production_prediction/`).
  - Implements multi-factor risk scoring engine and XAI factor attribution (`risk_prediction/`).
  - Builds prescriptive mitigation rules and ranking logic (`recommendation_engine/`).
- **Provided APIs**: `POST /api/production/predict`, `POST /api/risk/predict`, `POST /api/recommendations/generate`

---

### 4. GIS & Remote Sensing Subsystem
- **Primary Directories**: `gis/`, `data/geojson/`, `gis/satellite/`
- **Git Branch**: `feature/gis`
- **Core Capabilities**:
  - Manages spatial vector layers: `mine_boundary.geojson`, `mining_zones.geojson`, `reserve_zones.geojson`.
  - Implements satellite data provider adapters (Sentinel-2, Landsat-9, SMAP).
  - Supplies GeoJSON attributes for pit bench levels, concession boundaries, and heatmaps.
- **Provided APIs**: `GET /api/gis/layers`, `GET /api/gis/geojson/{layer}`, `GET /api/gis/satellite-indices`

---

### 5. Backend & Data Infrastructure Subsystem
- **Primary Directories**: `backend/`, `data_pipeline/`, `database/`, `data/`
- **Git Branch**: `feature/backend`, `feature/data-pipeline`
- **Core Capabilities**:
  - Maintains FastAPI REST routing, Pydantic schemas, and database session lifecycles.
  - Implements SQLAlchemy models and migration scripts (SQLite demo fallback & PostgreSQL).
  - Builds data ingestion, cleaning, transformation, and empirical quality audit calculators.
- **Provided APIs**: Core REST router, `GET /api/health`, `GET /api/dashboard`, `GET /api/data-quality`

---

### 6. Frontend & Visual Analytics Workspace
- **Primary Directories**: `frontend/`
- **Git Branch**: `feature/frontend`
- **Core Capabilities**:
  - Builds the responsive React 19 TypeScript web dashboard with Tailwind CSS.
  - Integrates the interactive Leaflet GIS map with zone click popups and layer toggles.
  - Implements the 14-day production trend SVG chart, What-If simulation sliders, and Human-in-the-Loop review actions.
  - Ensures the offline Demo Mode operates smoothly with zero external dependencies.
