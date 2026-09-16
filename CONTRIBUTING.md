# Contributing to MOIL Mining Intelligence Platform

Welcome to the **MOIL AI/ML Mining Intelligence Platform** repository.

To ensure clean, scalable development without merge conflicts, all contributors must strictly adhere to the following workflow and code conventions.

---

## 1. Modular Subsystem Workstreams

| Workstream | Core Domain | Primary Folder Scope | Branch Pattern | Key Integration APIs |
| :--- | :--- | :--- | :--- | :--- |
| **Pipeline & Integration** | Unified Pipeline & Deployment | `docs/`, `scripts/`, `tests/integration/`, `docker-compose.yml` | `develop`, `release/*` | CI/CD, Deployment, End-to-End verification |
| **Reserve Intelligence** | Geological AI/ML Modeling | `ai_ml/reserve_prediction/`, `ai_ml/models/` | `feature/reserve-ml` | `POST /api/reserves/predict` |
| **Production & Risk** | Forecasting & Decision AI/ML | `ai_ml/production_prediction/`, `ai_ml/risk_prediction/`, `ai_ml/recommendation_engine/` | `feature/production-risk` | `POST /api/production/predict`, `POST /api/risk/predict`, `POST /api/recommendations/generate` |
| **GIS & Remote Sensing** | Spatial Concessions & Satellite | `gis/`, `data/geojson/`, `gis/satellite/` | `feature/gis` | `GET /api/gis/layers`, `GET /api/gis/geojson/{layer}` |
| **Backend & Data Pipeline** | REST API & Data Management | `backend/`, `data_pipeline/`, `database/`, `data/` | `feature/backend`, `feature/data-pipeline` | FastAPI Core, SQLAlchemy, SQLite/PostgreSQL, Quality Auditing |
| **Frontend Dashboard** | Web Workspace & Visuals | `frontend/` | `feature/frontend` | React, Leaflet, Tailwind, Demo state fallback |

---

## 2. Git Branching Model

```
main (Production / Stable Release)
  ^
  |  (Release PR after full regression tests pass)
develop (Integration Branch)
  ^
  +-- feature/frontend
  +-- feature/backend
  +-- feature/reserve-ml
  +-- feature/production-risk
  +-- feature/gis
  +-- feature/data-pipeline
```

### Critical Rules
1. **Never commit directly to `main` or `develop`**.
2. Work exclusively on your designated `feature/<name>` branch.
3. Always pull latest `develop` before beginning new work:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature-name
   git merge develop
   ```
4. Keep commit messages small, atomic, and conventional:
   - `feat: add sentinel-2 ndvi extraction service`
   - `fix: clip negative shortfall tonnages in cleaning pipeline`
   - `test: add unit test for reserve prediction probability`
   - `docs: update subsystem boundaries`
5. Run the test suite before submitting a Pull Request:
   ```bash
   python scripts/run_tests.py
   cd frontend && npm run build
   ```
6. Open a Pull Request targeting `develop`.

---

## 3. Data Integrity & Ethics Policy
- Prototype datasets (`geological_data.csv`, `production_data.csv`, `equipment_data.csv`, `weather_data.csv`, `satellite_data.csv`, and GeoJSON maps) are **synthetic benchmark datasets**.
- **Never claim or present synthetic demo numbers as confidential MOIL Limited proprietary operational data.**
- Do **not** fabricate AI model accuracy metrics.
- Keep the offline Demo Mode functional at all times so that platform uptime is guaranteed.
