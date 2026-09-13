# Contributing to PS-26009 MOIL Mining Intelligence Platform

Welcome to the **PS-26009 MOIL AI/ML Mining Intelligence Platform** team repository for **Smart India Hackathon 2026**.

To ensure seamless parallel development across our 6 team members without merge conflicts, all developers must strictly adhere to the following Git workflow and code conventions.

---

## 1. Six-Developer Workstream Ownership

| Developer | Core Role | Primary Folder Scope | Branch Name | Key Integration APIs |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | Project Lead & Integration | `docs/`, `scripts/`, `tests/integration/`, `docker-compose.yml` | `develop`, `release/*` | CI/CD, Deployment, End-to-End verification |
| **Member 2** | Reserve Intelligence AI/ML | `ai_ml/reserve_prediction/`, `ai_ml/models/` | `feature/reserve-ml` | `POST /api/reserves/predict` |
| **Member 3** | Production & Risk AI/ML | `ai_ml/production_prediction/`, `ai_ml/risk_prediction/`, `ai_ml/recommendation_engine/` | `feature/production-risk` | `POST /api/production/predict`, `POST /api/risk/predict`, `POST /api/recommendations/generate` |
| **Member 4** | GIS & Satellite / Space | `gis/`, `data/geojson/`, `gis/satellite/` | `feature/gis` | `GET /api/gis/layers`, `GET /api/gis/geojson/{layer}` |
| **Member 5** | Backend & Data Pipeline | `backend/`, `data_pipeline/`, `database/`, `data/` | `feature/backend`, `feature/data-pipeline` | FastAPI Core, SQLAlchemy, SQLite/PostgreSQL, Quality Auditing |
| **Member 6** | Frontend & UI/UX | `frontend/` | `feature/frontend` | React, Leaflet, Tailwind, Demo state fallback |

---

## 2. Git Branching Model

```
main (Production / Stable Presentation Release)
  ^
  |  (Release PR after full regression tests pass)
develop (Integration Branch for Team)
  ^
  +-- feature/frontend          (Member 6)
  +-- feature/backend           (Member 5)
  +-- feature/reserve-ml        (Member 2)
  +-- feature/production-risk   (Member 3)
  +-- feature/gis               (Member 4)
  +-- feature/data-pipeline     (Member 5)
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
   - `docs: update six developer folder boundaries`
5. Run the test suite before submitting a Pull Request:
   ```bash
   python scripts/run_tests.py
   cd frontend && npm run build
   ```
6. Open a Pull Request targeting `develop`. Request review from Member 1 (Project Lead).

---

## 3. Data Integrity & Ethics Policy
- Prototype datasets (`geological_data.csv`, `production_data.csv`, `equipment_data.csv`, `weather_data.csv`, `satellite_data.csv`, and GeoJSON maps) are **synthetic benchmark datasets**.
- **Never claim or present synthetic demo numbers as confidential MOIL Limited proprietary operational data.**
- Do **not** fabricate AI model accuracy metrics.
- Keep the offline Demo Mode functional at all times so that presentation uptime is guaranteed.
