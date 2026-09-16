# Production Deployment & Infrastructure Runbook
**MOIL AI Mining Intelligence Platform | SIH 2026 Problem Statement PS-26009**
**Organization:** MOIL Limited / Ministry of Steel

---

## 1. Cloud Deployment Options Overview

| Target Platform | Backend Deployment | Frontend Deployment | Database | Estimated Setup Time |
| :--- | :--- | :--- | :--- | :--- |
| **Render (Recommended)** | Docker Web Service | Static Site | Managed PostgreSQL | ~5 minutes (Automated Blueprint) |
| **Docker Compose** | Containerized FastAPI | Nginx Container | PostgreSQL Container | ~2 minutes (`docker compose up`) |
| **Railway** | Dockerfile Web Service | Static / Node | Railway Postgres Plugin | ~5 minutes |
| **Local Bare-Metal** | Python 3.11 + Uvicorn | Node 20 + Vite | SQLite (Zero-Config) | ~2 minutes |

---

## 2. Option A: Deploy on Render via Blueprint (Recommended)

Render provides automated Infrastructure-as-Code via the repository's `render.yaml`.

### Step 1: Connect Repository
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** &rarr; **New Blueprint Instance**.
3. Connect your GitHub repository (`csdc` or fork).
4. Select the target branch: `main` or `feature/ai-ml`.

### Step 2: Review Manifest & Apply
Render detects `render.yaml` and provisions:
- `moil-backend`: Docker Web Service running FastAPI (`/health` health check enabled).
- `moil-frontend`: Static Site building Vite React with SPA rewrites.
- `moil-postgres`: Managed PostgreSQL instance.

### Step 3: Seed Initial Prototype Data
Once the services are deployed, execute a one-time database seed via Render's Web Shell on `moil-backend`:
```bash
python scripts/seed.py --profile full
```
The database will populate with all 8 MOIL mines, 40 HEMM units, 1,255 geological assays, and 2,528 production records.

---

## 3. Option B: Local or Self-Hosted Docker Compose

Docker Compose runs the complete isolated environment (PostgreSQL + FastAPI + Nginx React Frontend).

### Prerequisites
- Docker Engine 24.0+
- Docker Compose v2.20+

### Step 1: Launch Stack
From the project root directory:
```bash
docker compose up --build -d
```

### Step 2: Verify Running Containers
```bash
docker compose ps
```
Output should display 3 healthy containers:
```text
NAME            IMAGE               STATUS              PORTS
moil_postgres   postgres:15-alpine  Up (healthy)        0.0.0.0:5432->5432/tcp
moil_backend    csdc-backend        Up (healthy)        0.0.0.0:8000->8000/tcp
moil_frontend   csdc-frontend       Up                  0.0.0.0:5173->80/tcp
```

### Step 3: Access Application
- **Web UI:** [http://localhost:5173](http://localhost:5173)
- **API Documentation (Swagger UI):** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Root Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### Step 4: Tear Down
```bash
docker compose down -v
```

---

## 4. Option C: Bare-Metal Local Development

For development or rapid local evaluation without Docker:

### Backend Setup (Terminal 1)
```bash
# 1. Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Seed SQLite local database
python scripts/seed.py --profile full

# 4. Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup (Terminal 2)
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm ci

# 3. Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The frontend connects directly to the local backend at `http://localhost:8000/api`.

---

## 5. Environment Variables Reference

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | No | `sqlite:///./data/processed/moil_mining.db` | SQLAlchemy connection URI. Supports SQLite (`sqlite:///...`) or PostgreSQL (`postgresql://...`). `postgres://` is automatically converted. |
| `PORT` | No | `8000` | Port for the backend server to bind to (Render, Heroku, Railway supply this dynamically). |
| `ENVIRONMENT` | No | `development` | Environment mode (`development` or `production`). |
| `APP_MODE` | No | `demo` | Application operational mode (`demo` or `live`). |
| `DEBUG` | No | `true` | Enables auto-reload and verbose logging in development. Set to `false` in production. |
| `CORS_ORIGINS` | No | `*` | Comma-separated list or JSON array of allowed origins for browser security. |
| `VITE_API_URL` | No | `http://localhost:8000/api` | Frontend build-time variable pointing to the backend API base. |

---

## 6. Health Checks & Monitoring

The platform features multi-level health verification:

| Endpoint | Target Component | Typical Response | Purpose |
| :--- | :--- | :--- | :--- |
| `GET /health` | Backend + DB + Models | `{"status": "online", "database": "connected", "models": {"reserve_model": "available", "production_model": "available"}}` | Root health check used by Render, Railway, AWS ALB, and Docker. |
| `GET /api/health` | Backend API | Same as root `/health` | API route namespace health check. |
| `GET /healthz` | Frontend Nginx | `healthy` | Nginx reverse-proxy liveness check. |

---

## 7. Zero-Downtime Resilience: Demo Fallback Mode

To ensure an un-breakable evaluation experience during judge presentations and network interruptions:
1. **Frontend Fallback Interceptor:** If the backend becomes unreachable, `frontend/src/services/api.ts` transparently returns high-fidelity fallback datasets calibrated for MOIL's Balaghat concession.
2. **Visual Status Indicator:** The navigation bar displays an active status badge (**API Online: Green** vs **Demo Mode: Amber**), informing the evaluator of the connection state.
3. **Crisis Trigger Button:** An on-screen **"🚨 Crisis Demo"** button injects a live shortfall scenario (54.2mm monsoon deluge, 6.5h excavator failure, -231.5t deficit) for instant hackathon walkthroughs.
