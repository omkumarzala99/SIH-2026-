# 🚀 MOIL AI/ML Mining Intelligence Platform
### Decision Support System for Manganese Reserve Identification & Production Shortfall Mitigation
**Smart India Hackathon 2026 | Problem Statement: PS-26009**
**Organization:** MOIL Limited / Ministry of Steel | **Theme:** Software / Space Technology

[![Tests](https://img.shields.io/badge/tests-63%20passed-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%200.115-009688.svg)]()
[![React](https://img.shields.io/badge/frontend-React%2019%20%7C%20TypeScript-61dafb.svg)]()
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)]()
[![Render](https://img.shields.io/badge/deploy-Render%20Blueprint-46E3B7.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Executive Summary & Problem Context (PS-26009)

**MOIL Limited** is India's largest producer of manganese ore, supplying crucial raw materials to the national steel manufacturing sector. Meeting domestic production targets requires solving two fundamental challenges:
1. **Accurate Reserve Delineation:** Identifying high-grade manganese horizons beneath complex geological overburden without excessive exploratory drilling.
2. **Shortfall Prevention:** Anticipating operational disruptions (heavy equipment breakdown, wet blast-hole misfires, and monsoon pit inundation) before daily shift targets are missed.

### The MOIL Platform Solution
The MOIL Mining Intelligence Platform couples **subsurface geological borehole assays** with **space-borne Earth observation telemetry (Sentinel-2, Landsat-9)**, **historical production dispatch**, and **heavy machinery telematics**. The system operates on a closed-loop decision architecture:

$$\mathbf{Discover\ (Reserve\ ML)} \longrightarrow \mathbf{Predict\ (Production\ ML)} \longrightarrow \mathbf{Detect\ (Risk\ Engine)} \longrightarrow \mathbf{Prescribe\ (Prescriptive\ XAI)}$$

```text
       +-------------------------------------------------------------+
       |                  MULTI-SOURCE DATA INGESTION                |
       |  Geological Assays | Production Logs | HEMM Fleet Telematics|
       |  Weather Sensors   | Sentinel-2 NDVI | Landsat-9 LST        |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |               DATA PIPELINE & QUALITY LAYER                 |
       |  - Automated Cleaning & Deduplication                       |
       |  - Non-fabricated Empirical Quality Audit (Completeness %)  |
       |  - Spatial-Temporal Resampling & Feature Engineering        |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                     AI / ML INTELLIGENCE                    |
       |  1. Reserve Classification Engine (RandomForest / Kriging)  |
       |  2. Daily Extraction Shortfall Forecaster (GradientBoost)   |
       |  3. Multi-Factor Transparent Risk Engine (Domain Scoring)   |
       |  4. Explainable AI (XAI) Contributing Factor Attribution    |
       |  5. Prescriptive Recommendation Engine                      |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                  FASTAPI BACKEND REST API                   |
       |  - Endpoints: Dashboard, Reserves, Production, Risk,        |
       |    Recommendations, GIS GeoJSON, Simulation, Data Quality   |
       |  - SQLAlchemy ORM (PostgreSQL Staging / SQLite Local Demo)   |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |               RESPONSIVE WEB DASHBOARD (REACT)              |
       |  - Executive Dashboard with KPI Cards & Alerts              |
       |  - Leaflet GIS Map with Layer Toggles (Benches, Reserves)   |
       |  - 14-Day Production Trend & Shortfall SVG Chart            |
       |  - Interactive What-If Operational Simulator                |
       |  - Human-in-the-Loop Workflow (Approve/Reject/Modify)       |
       |  - Instant SIH 2026 Crisis Demo Scenario Trigger            |
       |  - Resilient Zero-Downtime Offline Fallback                 |
       +-------------------------------------------------------------+
```

---

## 2. Six-Member Team Engineering Architecture

The platform reflects an enterprise division of labor across 6 specialized engineering tracks:

| Role / Track | Primary Domain | Core Code Assets |
| :--- | :--- | :--- |
| **1. Team Lead / Integration** | Unified Pipeline & Cloud Architecture | `backend/app/api/routes/pipeline.py`, `render.yaml`, `Dockerfile` |
| **2. Reserve AI/ML Specialist** | Subsurface Geological Modeling | `ai_ml/reserve_prediction/`, `ai_ml/models/reserve_model.joblib` |
| **3. Production & Risk AI/ML** | Constraint Regression & Transparent XAI | `ai_ml/production_prediction/`, `ai_ml/risk_prediction/`, `ai_ml/recommendation_engine/` |
| **4. GIS & Space Technology** | Multi-Mine Vector GIS & Remote Sensing | `gis/`, `frontend/src/components/map/MineMap.tsx`, `frontend/src/components/workspace/SatellitePanel.tsx` |
| **5. Backend & Data Pipeline** | REST API, Persistence & Data Quality | `backend/app/`, `database/models.py`, `data_pipeline/`, `scripts/seed.py` |
| **6. Frontend & UI/UX** | Responsive Web App & Managerial Governance | `frontend/src/App.tsx`, `frontend/src/pages/`, `frontend/src/services/api.ts` |

---

## 3. Key Capabilities & Technological Highlights

### 🔬 Subsurface Reserve Delineation (ROC-AUC: 0.88)
- Trains Random Forest Classifier + Spatial Ordinary Kriging on pre-mining borehole assays ($Mn\%$, $Fe\%$, $SiO_2\%$, depth, stripping ratio, lithology).
- Zero data leakage: strict separation of subsurface exploration from operational extraction variables.

### 📈 Daily Production Forecaster ($R^2 = 0.85$, MAE: 34.2t)
- Gradient Boosting regressor enforcing the **14 Canonical Feature Contract**.
- Strictly shifted chronological lag features (`production_lag_1d`, `production_lag_7d_mean`) prevent temporal leakage.

### 🛡️ Transparent Multi-Factor Risk Engine (0–100 Scale)
- Evaluates 4 operational pillars: Equipment Downtime (35%), Weather & Monsoon (25%), Blasting Adherence (20%), and Production Shortfall (20%).
- Real-time Explainable AI (XAI) mathematical factor attribution with human-readable diagnostic descriptions.

### 🛰️ Multi-Mine GIS & Satellite Telemetry (8 MOIL Mines)
- Full spatial coverage across 8 MOIL concessions: Balaghat, Gumgaon, Tirodi, Chikla, Dongri Buzurg, Ukwa, Kandri, and Mansar.
- Multi-spectral remote sensing indices: Sentinel-2 (NDVI, SAVI, NDWI, MNDWI) and Landsat-9 (LST, Clay, Iron).
- **Scientific Framing Rule:** Clearly identifies satellite observations as contextual surface/environmental indicators; underground ore discovery is proven through borehole drilling assays.

### 🤝 Human-in-the-Loop Prescriptive Governance
- Actionable operational recommendations (equipment re-routing, blasting postponement, high-grade face activation).
- Strict manager governance lifecycle: `PENDING` &rarr; `APPROVED` / `REJECTED` / `MODIFIED` with persistent audit trails.

### 🚨 SIH 2026 Presentation Crisis Demo
- One-click trigger in the UI simulating an acute operational bottleneck: $54.2\text{mm}$ monsoon deluge, $6.5\text{h}$ shovel breakdown, $-231.5\text{t}$ shortfall, and CRITICAL risk ($77.5/100$).

---

## 4. Quickstart Guide

### Option 1: Docker Compose (Instant Full Stack)
```bash
# Clone and start the complete stack (PostgreSQL + FastAPI + Nginx React Frontend)
docker compose up --build -d

# Verify services
docker compose ps
```
- **Web Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Documentation:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### Option 2: Local Development Setup

#### Backend Setup
```bash
# 1. Activate Python 3.11 environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# 2. Install requirements
pip install -r backend/requirements.txt

# 3. Seed SQLite local database (8 mines, 40 HEMM units, 1,255 assays)
python scripts/seed.py --profile full

# 4. Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend Setup
```bash
# 1. Open new terminal and enter frontend
cd frontend

# 2. Install dependencies & launch Vite dev server
npm ci
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## 5. Automated Verification & Testing

The platform includes 63 comprehensive automated tests covering all layers:

```bash
# Run the complete test suite
python scripts/run_tests.py
```

### Test Suite Distribution:
- **`tests/ai_ml/test_models.py` (23 tests):** Reserve classification, production regression, leakage prevention, lag shifting, risk sensitivity, XAI attribution, recommendation rules.
- **`tests/backend/test_api.py` (17 tests):** Root `/health`, `/api/health`, dashboard, reserves, production, risk, recommendations, simulation, data quality.
- **`tests/backend/test_gis.py` (7 tests):** GeoJSON vector layers, multi-mine filtering, satellite telemetry.
- **`tests/backend/test_multimine.py` (4 tests):** Multi-mine relational database filtering across Balaghat, Gumgaon, Tirodi.
- **`tests/backend/test_pipeline.py` (3 tests):** Unified `POST /api/pipeline/run` execution, transaction commit, error handling.
- **`tests/data_pipeline/test_pipeline.py` (3 tests):** Ingestion, cleaning, empirical completeness scoring.
- **`tests/frontend/test_build.py` (2 tests):** Production bundle presence and page routing verification.
- **`tests/integration/test_workflow.py` (1 test):** Full end-to-end hackathon demo user journey.
- **`backend/tests/test_endpoints.py` (3 tests):** Model registry, prediction history, GIS zones.

**Total:** **63 passed / 63 total (100% pass rate)**.

### Frontend Build Verification:
```bash
cd frontend && npm run build
# Built in 4.45s with 0 errors (1881 modules transformed)
```

---

## 6. Comprehensive Documentation Index

- 📋 [Comprehensive System Audit Report](docs/FINAL_AUDIT.md)
- 🏗️ [Master Technical Architecture Specification](docs/ARCHITECTURE.md)
- 🚀 [Production Cloud Deployment Runbook](docs/DEPLOYMENT.md)
- 📡 [Complete REST API Reference Manual](docs/API.md)
- 🧠 [AI/ML & Decision Intelligence Specifications](docs/AI_ML.md)
- 📊 [Data Dictionary & Synthetic Catalog](docs/DATA.md)
- 📱 [Responsive UI/UX QA & Cross-Device Matrix](docs/RESPONSIVE_QA.md)

---

## 7. License & Credits

Developed for the **Smart India Hackathon 2026** under Problem Statement **PS-26009** for **MOIL Limited** and the **Ministry of Steel, Government of India**.
Released under the [MIT License](LICENSE).
