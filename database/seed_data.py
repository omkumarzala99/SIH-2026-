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


def _find_csv(filename: str) -> str:
    candidates = [
        os.path.join("data", "mock", filename),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "mock", filename)
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return candidates[0]


def seed_database():
    print("Initializing database tables...")
    init_db()
    session = SessionLocal()

    try:
        # 1. Seed Mines
        if session.query(Mine).count() == 0:
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
        else:
            print("Mines already exist. Skipping.")

        # 2. Seed Mine Zones
        if session.query(MineZone).count() == 0:
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
        else:
            print("Mine Zones already exist. Skipping.")

        # 3. Seed Geological observations
        if session.query(GeologicalObservation).count() == 0:
            geo_csv = _find_csv("geological_data.csv")
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
        else:
            print("Geological observations already exist. Skipping.")

        # 4. Seed Equipment
        if session.query(Equipment).count() == 0:
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
        else:
            print("Equipment fleet already exists. Skipping.")

        # 5. Seed Equipment Status
        if session.query(EquipmentStatus).count() == 0:
            eq_csv = _find_csv("equipment_data.csv")
            if os.path.exists(eq_csv):
                print("Seeding Equipment status logs from mock CSV...")
                valid_equipment_ids = {e.id for e in session.query(Equipment.id).all()}
                with open(eq_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        eq_id = row["equipment_id"]
                        if eq_id not in valid_equipment_ids:
                            print(f"Warning: Equipment ID '{eq_id}' not found in equipment table. Skipping.")
                            continue
                        session.add(EquipmentStatus(
                            equipment_id=eq_id,
                            operational_hours=float(row["operational_hours"]),
                            downtime_hours=float(row["downtime_hours"]),
                            downtime_reason=row.get("downtime_reason", "None") or "None",
                            efficiency_pct=float(row.get("efficiency_pct", 90.0) or 90.0),
                            health_status=row.get("health_status", "OPTIMAL") or "OPTIMAL",
                            recorded_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.commit()
        else:
            print("Equipment status logs already exist. Skipping.")

        # 6. Seed Production Records
        if session.query(ProductionRecord).count() == 0:
            prod_csv = _find_csv("production_data.csv")
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
        else:
            print("Production records already exist. Skipping.")

        # 7. Seed Weather observations
        if session.query(WeatherObservation).count() == 0:
            weather_csv = _find_csv("weather_data.csv")
            if os.path.exists(weather_csv):
                print("Seeding Weather observations from mock CSV...")
                valid_mine_ids = {m.id for m in session.query(Mine.id).all()}
                with open(weather_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        mid = row["mine_id"]
                        if mid not in valid_mine_ids:
                            print(f"Warning: Mine ID '{mid}' not found in mines table. Skipping.")
                            continue
                        session.add(WeatherObservation(
                            mine_id=mid,
                            rainfall_mm=float(row["rainfall_mm"]) if row.get("rainfall_mm") else 0.0,
                            soil_moisture_pct=float(row["soil_moisture_pct"]) if row.get("soil_moisture_pct") else 0.0,
                            ambient_temp_c=float(row["ambient_temp_c"]) if row.get("ambient_temp_c") else 25.0,
                            humidity_pct=float(row["humidity_pct"]) if row.get("humidity_pct") else 50.0,
                            wind_speed_kmh=float(row["wind_speed_kmh"]) if row.get("wind_speed_kmh") else 15.0,
                            flood_risk_index=row.get("flood_risk_index", "LOW") or "LOW",
                            observed_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.commit()
        else:
            print("Weather observations already exist. Skipping.")

        # 8. Seed Satellite observations
        if session.query(SatelliteObservation).count() == 0:
            sat_csv = _find_csv("satellite_data.csv")
            if os.path.exists(sat_csv):
                print("Seeding Satellite observations from mock CSV...")
                valid_mine_ids = {m.id for m in session.query(Mine.id).all()}
                valid_zone_ids = {z.id for z in session.query(MineZone.id).all()}
                with open(sat_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        mid = row["mine_id"]
                        zid = row["zone_id"]
                        if mid not in valid_mine_ids or zid not in valid_zone_ids:
                            print(f"Warning: Invalid FK mine_id='{mid}' or zone_id='{zid}'. Skipping.")
                            continue
                        session.add(SatelliteObservation(
                            satellite_source=row.get("satellite_source", "Sentinel-2 MSI") or "Sentinel-2 MSI",
                            mine_id=mid,
                            zone_id=zid,
                            ndvi=float(row["ndvi"]),
                            ndwi=float(row["ndwi"]),
                            land_surface_temp_c=float(row["land_surface_temp_c"]),
                            soil_moisture_satellite_pct=float(row["soil_moisture_satellite_pct"]),
                            cloud_coverage_pct=float(row.get("cloud_coverage_pct", 5.0) or 5.0),
                            data_quality_flag=row.get("data_quality_flag", "CLEAR") or "CLEAR",
                            observed_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.commit()
        else:
            print("Satellite observations already exist. Skipping.")

        # 9. Seed Model Versions
        if session.query(ModelVersion).count() == 0:
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
        else:
            print("Model versions already exist. Skipping.")

        # 10. Seed Active Recommendations
        if session.query(Recommendation).count() == 0:
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
        else:
            print("Recommendations already exist. Skipping.")

        print("Database seed completed successfully!")

    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
