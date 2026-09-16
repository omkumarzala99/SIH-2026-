# Database Layer: MOIL Mining Intelligence Platform

Relational persistence layer built with SQLAlchemy 2.0.

## Supported Engines
1. **SQLite (Embedded Local)**: Default for instant development and local execution. Stores database at `data/processed/moil_mining.db`.
2. **PostgreSQL**: Production-grade deployment via `docker-compose.yml` or remote connection URL.

## Entities Modeled (14 Tables)
- `mines`, `mine_zones`
- `geological_observations`, `satellite_observations`, `weather_observations`
- `equipment`, `equipment_status`
- `production_records`
- `reserve_predictions`, `production_predictions`
- `risk_assessments`, `recommendations`
- `model_versions`, `prediction_history`

## Seeding
```bash
python database/seed_data.py
# or
python database/seed/seed_data.py
```
