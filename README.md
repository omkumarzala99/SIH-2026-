# 🚀 PS-26009 — MOIL AI/ML Mining Intelligence Platform

### Smart India Hackathon 2026 | Decision Support System for MOIL Limited

[![Tests](https://img.shields.io/badge/tests-17%20passed-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%200.138-009688.svg)]()
[![React](https://img.shields.io/badge/frontend-React%2018%20%7C%20TypeScript-61dafb.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Problem Statement Context (PS-26009)

**MOIL Limited** is the largest producer of manganese ore in India. To sustain domestic supply and meet future steel manufacturing demands, it is essential to accurately locate available ore reserves and prevent production shortfalls.

Current reserve estimation and production scheduling rely heavily on manual surveys, physical borehole logs, and shift dispatch records. These legacy workflows are time-consuming and can lead to mismatches between planned extraction targets and actual pit dispatch.

### Objectives
1. **Identify & map manganese reserves** using surface remote-sensing indices (Sentinel-2 NDVI, Landsat-9 radiometric surface temperatures) and sub-surface borehole drilling assays.
2. **Predict production shortfalls** by modeling constraints: heavy machinery mechanical downtime, monsoon precipitation/soil saturation, and wet blast-hole clearance delays.
3. **Prescribe actionable mitigations** with Human-in-the-Loop decision governance (equipment fleet re-allocation, bench blasting rescheduling, high-grade zone prioritization).
4. **Provide an executive decision dashboard** showing spatial GIS reserves, real-time extraction trajectories, explainable risk ratings, and interactive What-If scenario simulations.

---

## 2. Product Architecture: "Discover &rarr; Predict &rarr; Detect &rarr; Recommend"

```text
GEOLOGICAL DATA (Boreholes, Assays, Stratigraphy)
       +
PRODUCTION DISPATCH (Shift Logs, Mined Tonnages)
       +
HEMM FLEET TELEMATICS (Downtime, OEE, Hours)
       +
METEOROLOGICAL SENSORS (Rainfall, Humidity, Flooding)
       +
SPACE / SATELLITE (Sentinel-2 NDVI, Landsat-9 LST)
       ↓
DATA PIPELINE & QUALITY ENGINE (Validation, Cleaning, Empirical Audit)
       ↓
AI / ML INTELLIGENCE LAYER
   • Reserve Classifier (Surface + Subsurface Fusion)
   • Daily Extraction Forecaster (Constraint Regression)
   • Transparent Multi-Factor Risk Engine (0-100 Score)
   • Explainable AI (XAI) Contributing Factor Attribution
       ↓
PRESCRIPTIVE DECISION SUPPORT (Approve / Reject / Modify)
       ↓
EXECUTIVE WEB DASHBOARD (React + Leaflet GIS + What-If Simulation)
```

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet (React-Leaflet), Lucide Icons, responsive SVG charts.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy ORM.
- **AI/ML**: Python, Pandas, NumPy, scikit-learn (RandomForest, GradientBoosting), Model-Agnostic Extensible Architecture.
- **Database**: Relational models supporting SQLite (zero-config local demo) and PostgreSQL (production/docker).
- **GIS & Space**: GeoJSON spatial vector layers, Leaflet tile layers, Sentinel-2 / Landsat-9 / NASA SMAP provider adapters.
- **Testing & Tooling**: Pytest, Docker, Docker Compose.

---

## 4. Repository Structure

```text
PS-26009-MOIL/
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS + Leaflet
│   ├── public/data/              # Concession boundary and zone GeoJSON files
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, MineMap (Leaflet), ProductionChart
│   │   ├── pages/                # 8 complete application views
│   │   ├── services/api.ts       # Resilient API client + Demo Mode fallback provider
│   │   └── types/index.ts        # Common TypeScript interfaces
├── backend/                      # Python FastAPI REST server
│   ├── app/
│   │   ├── api/routes/           # Dashboard, Reserves, Production, Risk, Recommendations, GIS, Simulation, Quality, Demo
│   │   ├── config.py             # Pydantic environment configuration
│   │   └── main.py               # FastAPI entrypoint, CORS, startup seeding
├── ai_ml/                        # Modular AI/ML components
│   ├── reserve_prediction/       # Surface & subsurface reserve classification
│   ├── production_prediction/    # Daily extraction & shortfall forecaster
│   ├── risk_prediction/          # Transparent multi-factor risk engine & XAI
│   ├── recommendation_engine/    # Prescriptive rules & human-in-the-loop actions
│   └── common/registry.py        # Model versioning registry
├── gis/                          # Spatial GIS layers & space technology
│   ├── geojson/                  # Concession boundary, pit benches, reserve heatmaps
│   └── satellite/provider.py     # Sentinel-2 & Landsat remote sensing adapters
├── data_pipeline/                # End-to-end data pipeline
│   ├── ingestion/ & cleaning/    # Loaders, deduplication, bound clipping
│   ├── transformation/           # Shift aggregation & sensor alignment
│   ├── quality/                  # Empirical non-fabricated quality audit engine
│   └── feature_engineering/      # ML feature matrices
├── database/                     # SQLAlchemy persistence layer
│   ├── models.py                 # 14 relational tables
│   ├── connection.py             # SQLite / PostgreSQL connection factory
│   └── seed_data.py              # Automated database seeding script
├── data/mock/                    # Synthetic CSV datasets (geology, production, equipment, weather, satellite)
├── docs/                         # Architecture, API specifications, and 6-developer guides
├── scripts/                      # Test runner and demo automation scripts
├── tests/                        # 17 automated tests across backend, ML, pipeline, integration
├── .env.example                  # Environment configuration template
├── .gitignore                    # Robust git exclusions
├── docker-compose.yml            # Multi-container orchestration
├── CONTRIBUTING.md               # Git branching & 6-member team playbook
├── LICENSE                       # MIT License
└── README.md
```

---

## 5. Quickstart: Installation & Running

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (v24 tested) & `npm`

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/PS-26009-MOIL.git
cd PS-26009-MOIL
```

### Step 2: Set Up Backend
```bash
# Optional: create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Initialize and seed database
python database/seed_data.py
```

### Step 3: Run FastAPI Backend
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health: `http://localhost:8000/api/health`
- Interactive Swagger UI: `http://localhost:8000/api/docs`

### Step 4: Run React Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. Offline / Demo Mode & Presentation Crisis Scenario

### Offline / Demo Mode
The platform is designed with a **resilient dual-mode architecture**:
- When the backend is online, the frontend communicates with FastAPI endpoints asynchronously.
- If the backend is stopped or network connectivity is lost, the frontend **automatically falls back to built-in mock services with zero errors**, ensuring 100% presentation uptime during judging.
- Users can toggle between **Live API** and **Demo Mode** at any time using the mode switch in the top navigation bar.

### Predefined Hackathon Crisis Demo
Click the **"Run SIH Crisis Demo"** button in the header to trigger the presentation scenario:
- **Precipitation**: 64.2mm (Severe Monsoon Front)
- **Soil Moisture**: 62.0% (Saturated Pit Floor)
- **HEMM Equipment**: CAT-349 Excavator hydraulic line burst (6.5h downtime)
- **Blasting Clearance**: 2.5h safety delay due to wet blast holes
- **Impact**: Projected Extraction drops to 820 tons against 1000-ton target (**-180 tons shortfall, 18% deficit, HIGH Risk**)
- **Decision Engine Action**: Recommends re-deploying dumpers to North Pit A, deferring secondary blast ignition to Shift-B, and activating auxiliary pit dewatering pumps.

---

## 7. Automated Test Verification

Run the test suite covering API endpoints, AI/ML models, data pipeline, and integration workflows:
```bash
python scripts/run_tests.py
```
Expected output: **17 passed**.

Build frontend:
```bash
cd frontend
npm run build
```
Expected output: **✓ built in <5s**.

---

## 8. Six-Developer Team Ownership

| Member | Role | Folder Scope | Branch |
| :--- | :--- | :--- | :--- |
| **Member 1** | Project Lead & Integration | `docs/`, `scripts/`, `tests/integration/`, root | `develop`, `release/*` |
| **Member 2** | Reserve Intelligence AI/ML | `ai_ml/reserve_prediction/`, `ai_ml/models/` | `feature/reserve-ml` |
| **Member 3** | Production & Risk AI/ML | `ai_ml/production_prediction/`, `ai_ml/risk_prediction/`, `ai_ml/recommendation_engine/` | `feature/production-risk` |
| **Member 4** | GIS & Satellite Specialist | `gis/`, `data/geojson/`, `gis/satellite/` | `feature/gis` |
| **Member 5** | Backend & Data Pipeline | `backend/`, `data_pipeline/`, `database/`, `data/` | `feature/backend`, `feature/data-pipeline` |
| **Member 6** | Frontend & UI/UX Specialist | `frontend/` | `feature/frontend` |

See [CONTRIBUTING.md](CONTRIBUTING.md) and [six_developer_guide.md](docs/architecture/six_developer_guide.md) for full branch and PR guidelines.

---

## 9. Data Disclaimer & Responsible AI

> [!IMPORTANT]
> **Data Integrity Disclaimer**:
> All datasets (`geological_data.csv`, `production_data.csv`, `equipment_data.csv`, `weather_data.csv`, `satellite_data.csv`, and GeoJSON layers) in this prototype repository are **synthetic benchmark datasets** constructed for architectural validation and hackathon demonstrations based on public geological domain information (e.g. Sausar Group formations in Central India).
> They do **not** represent confidential, proprietary, or actual operational data of MOIL Limited.
> The platform operates strictly as a **decision-support advisory system** with human-in-the-loop oversight and does not autonomously trigger physical mining machinery.
