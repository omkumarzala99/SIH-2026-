"""
Seed script to initialize and populate the MOIL Mining database with synthetic baseline data.
"""
import os
import csv
from datetime import datetime
from database.connection import init_db, SessionLocal
from database.models import (
    Mine, MineZone, GeologicalObservation, SatelliteObservation,
    WeatherObservation, Equipment, EquipmentStatus, ProductionRecord,
    ReservePrediction, ProductionPrediction, RiskAssessment,
    Recommendation, ModelVersion
)


def seed_database():
    print("Initializing database tables...")
    init_db()
    session = SessionLocal()

    try:
        # Check if already seeded
        if session.query(Mine).count() > 0:
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding Mines...")
        balaghat = Mine(
            id="MINE_BALAGHAT_01",
            name="Balaghat Manganese Concession",
            concession_code="MOIL-MP-BGT-001",
            state="Madhya Pradesh",
            district="Balaghat",
            latitude=21.8129,
            longitude=80.1835,
            area_sq_km=14.85,
            mineral_type="Manganese Ore"
        )
        gumgaon = Mine(
            id="MINE_GUMGAON_02",
            name="Gumgaon Manganese Mine",
            concession_code="MOIL-MH-GMG-002",
            state="Maharashtra",
            district="Nagpur",
            latitude=21.3854,
            longitude=78.9812,
            area_sq_km=9.40,
            mineral_type="Manganese Ore"
        )
        session.add_all([balaghat, gumgaon])
        session.commit()

        print("Seeding Mine Zones...")
        zones_data = [
            ("ZONE_NORTH_A", "MINE_BALAGHAT_01", "North Bench Pit A", "ACTIVE_EXTRACTION", "-120m RL", 450),
            ("ZONE_CENTRAL_B", "MINE_BALAGHAT_01", "Central Main Pit B", "HIGH_EXTRACTION", "-160m RL", 520),
            ("ZONE_SOUTH_C", "MINE_BALAGHAT_01", "South Expansion Zone C", "DEVELOPMENT_BENCH", "-60m RL", 250),
            ("ZONE_EAST_D", "MINE_BALAGHAT_01", "East Exploration Block D", "GEOLOGICAL_PROSPECTING", "Surface (+320m RL)", 0),
            ("ZONE_WEST_E", "MINE_BALAGHAT_01", "West Overburden Dump E", "WASTE_STABILIZATION", "Surface (+340m RL)", 0),
        ]
        for zid, mid, name, status, bench, target in zones_data:
            session.add(MineZone(
                id=zid, mine_id=mid, name=name,
                operational_status=status, bench_level=bench,
                daily_target_tons=target
            ))
        session.commit()

        # Seed Geological observations
        geo_csv = "data/mock/geological_data.csv"
        if os.path.exists(geo_csv):
            print("Seeding Geological observations from mock CSV...")
            with open(geo_csv, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    session.add(GeologicalObservation(
                        borehole_id=row["borehole_id"],
                        mine_id=row["mine_id"],
                        zone_id=row["zone_id"],
                        latitude=float(row["latitude"]),
                        longitude=float(row["longitude"]),
                        depth_meters=float(row["depth_meters"]),
                        mn_grade_pct=float(row["mn_grade_pct"]),
                        fe_grade_pct=float(row["fe_grade_pct"]),
                        sio2_pct=float(row["sio2_pct"]),
                        phosphorus_pct=float(row["phosphorus_pct"]),
                        rock_formation=row["rock_formation"],
                        subsurface_layer=row["subsurface_layer"],
                        observed_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                    ))
            session.commit()

        # Seed Equipment
        print("Seeding Equipment fleet...")
        eq_meta = [
            ("EXC_CAT_349_01", "MINE_BALAGHAT_01", "Hydraulic Excavator", "CAT 349D2 L", 2021, "ZONE_CENTRAL_B"),
            ("EXC_KOM_PC450_02", "MINE_BALAGHAT_01", "Hydraulic Excavator", "Komatsu PC450-8", 2022, "ZONE_NORTH_A"),
            ("DMP_VOLVO_FMX_11", "MINE_BALAGHAT_01", "Haul Dumper", "Volvo FMX 460 8x4", 2023, "ZONE_CENTRAL_B"),
            ("DMP_VOLVO_FMX_12", "MINE_BALAGHAT_01", "Haul Dumper", "Volvo FMX 460 8x4", 2023, "ZONE_NORTH_A"),
            ("DMP_VOLVO_FMX_13", "MINE_BALAGHAT_01", "Haul Dumper", "Volvo FMX 440 8x4", 2022, "ZONE_SOUTH_C"),
            ("DRL_ATLAS_ROC_01", "MINE_BALAGHAT_01", "Blast Drill Rig", "Atlas Copco ROC L8", 2020, "ZONE_NORTH_A"),
            ("CRU_TELSMITH_01", "MINE_BALAGHAT_01", "Primary Jaw Crusher", "Telsmith 3648", 2019, "ZONE_CENTRAL_B"),
            ("WTR_TRK_TATA_01", "MINE_BALAGHAT_01", "Dust Suppression Bowser", "Tata Prima 2828", 2022, "ZONE_CENTRAL_B")
        ]
        for eid, mid, etype, model, yr, z in eq_meta:
            session.add(Equipment(
                id=eid, mine_id=mid, equipment_type=etype,
                model=model, commissioned_year=yr, assigned_zone=z, is_active=True
            ))
        session.commit()

        # Seed Production Records
        prod_csv = "data/mock/production_data.csv"
        if os.path.exists(prod_csv):
            print("Seeding Production records from mock CSV...")
            with open(prod_csv, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    session.add(ProductionRecord(
                        mine_id=row["mine_id"],
                        zone_id=row["zone_id"],
                        date=row["date"],
                        shift=row["shift"],
                        planned_tonnage=float(row["planned_tonnage"]),
                        actual_tonnage=float(row["actual_tonnage"]),
                        shortfall_tonnage=float(row["shortfall_tonnage"]),
                        ore_grade_mined=float(row["ore_grade_mined"]),
                        hauling_trips=int(row["hauling_trips"]),
                        blasting_status=row["blasting_status"],
                        blasting_delay_hours=float(row["blasting_delay_hours"]),
                        created_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                    ))
            session.commit()

        # Seed Model Versions
        print("Seeding Model Registry...")
        session.add_all([
            ModelVersion(
                id="MOD_RES_001",
                model_name="Manganese Reserve Classification Model",
                version="v1.2.0",
                algorithm="RandomForestClassifier + Spatial Kriging",
                training_date=datetime(2026, 3, 1),
                accuracy_metric="ROC-AUC",
                metric_value=0.88,
                is_active=True
            ),
            ModelVersion(
                id="MOD_PRD_002",
                model_name="Daily Extraction Forecaster",
                version="v1.1.0",
                algorithm="GradientBoostingRegressor + Lag Constraints",
                training_date=datetime(2026, 3, 5),
                accuracy_metric="R2 Score",
                metric_value=0.85,
                is_active=True
            ),
            ModelVersion(
                id="MOD_RSK_003",
                model_name="Multi-Factor Mining Risk Engine",
                version="v1.0.0",
                algorithm="Weighted Rule-Based Engine + Operational Bounds",
                training_date=datetime(2026, 3, 10),
                accuracy_metric="Sensitivity",
                metric_value=0.91,
                is_active=True
            )
        ])
        session.commit()

        # Seed Active Recommendations
        print("Seeding Recommendations...")
        recommendations = [
            Recommendation(
                id="REC_2026_001",
                mine_id="MINE_BALAGHAT_01",
                title="Re-deploy Haul Dumper Fleet to Pit A Upper Bench",
                category="EQUIPMENT",
                problem_summary="Pit B experienced hydraulic failure on EXC_CAT_349_01, creating hauling idle time while Pit A faces 24% shortfall.",
                recommended_action="Temporarily re-route Dumpers DMP_VOLVO_FMX_11 and 12 to North Pit A bench -120m RL to feed Primary Crusher at capacity.",
                expected_impact="Recovers approximately 110 tons/shift and reduces dumper idle fuel consumption by 18%.",
                expected_tonnage_recovery=110.0,
                urgency="HIGH",
                status="PENDING",
                created_at=datetime.utcnow()
            ),
            Recommendation(
                id="REC_2026_002",
                mine_id="MINE_BALAGHAT_01",
                title="Reschedule Bench Blasting Window Post-Monsoon Surge",
                category="BLASTING",
                problem_summary="Monsoon rainfall recorded at 72.4mm saturated top blast holes in Zone C, causing 3.2 hour ignition delay.",
                recommended_action="Postpone secondary shot-firing in Zone C to Shift-B; prioritize pre-blasted fragmented muckpile extraction in Central Zone B.",
                expected_impact="Avoids misfire safety hazard and unlocks 95 tons of immediate run-of-mine ore feed.",
                expected_tonnage_recovery=95.0,
                urgency="HIGH",
                status="PENDING",
                created_at=datetime.utcnow()
            ),
            Recommendation(
                id="REC_2026_003",
                mine_id="MINE_BALAGHAT_01",
                title="Activate Sump Dewatering Pumps in Central Pit B",
                category="ENVIRONMENTAL",
                problem_summary="Soil moisture index reached 64% with 48mm pit floor water accumulation, impending haul ramp traction.",
                recommended_action="Deploy 2x 75kW submersible slurry pumps at Bench -160m sump and grade haul road with dry quartz gravel.",
                expected_impact="Prevents ramp slippage risk and restores dumper cycle speed from 12 km/h to standard 22 km/h.",
                expected_tonnage_recovery=75.0,
                urgency="MEDIUM",
                status="APPROVED",
                created_at=datetime.utcnow()
            )
        ]
        session.add_all(recommendations)
        session.commit()

        print("Database seed completed successfully!")

    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
