# Backend Service: PS-26009 MOIL Mining Intelligence Platform (Member 5 Ownership)

FastAPI REST API providing data contracts, ML orchestration, and persistence for the MOIL Decision Support System.

## Architecture
- `app/api/routes/`: Modular endpoints for dashboard KPIs, reserves, production forecasting, multi-factor risk, recommendations, GIS layers, What-If simulation, data quality audit, and demo triggers.
- `app/schemas/`: Pydantic v2 data transfer objects.
- `app/models/`: Database entities mapped via SQLAlchemy.
- `app/core/`: Configuration settings and environment parsing.

## Running Locally
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API Documentation: `http://localhost:8000/api/docs`
