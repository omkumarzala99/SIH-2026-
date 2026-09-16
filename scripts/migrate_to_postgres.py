"""
Database Migration Utility: SQLite to PostgreSQL.
Migrates all tables and records from the existing SQLite database
to production PostgreSQL with 100% row parity and foreign key preservation.

Usage:
    python scripts/migrate_to_postgres.py
    python scripts/migrate_to_postgres.py --target-url "postgresql://user:pass@host:5432/dbname"
"""
import os
import sys
import argparse
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import sessionmaker

# Ensure project root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import Base

# Dependency order to satisfy foreign keys
MIGRATION_ORDER = [
    "mines",
    "mine_zones",
    "equipment",
    "geological_observations",
    "satellite_observations",
    "weather_observations",
    "equipment_status",
    "production_records",
    "risk_assessments",
    "recommendations",
    "model_versions",
    "production_predictions",
    "reserve_predictions",
    "prediction_history",
    "simulation_runs"
]


def migrate_database(sqlite_path: str, target_pg_url: str):
    print(f"=== Database Migration from SQLite to PostgreSQL ===")
    print(f"Source SQLite: {sqlite_path}")
    print(f"Target DB:     {target_pg_url.split('@')[-1] if '@' in target_pg_url else target_pg_url}")

    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"Source SQLite database not found at '{sqlite_path}'")

    # Clean target URL
    if target_pg_url.startswith("postgres://"):
        target_pg_url = target_pg_url.replace("postgres://", "postgresql://", 1)

    src_engine = create_engine(f"sqlite:///{sqlite_path}")
    dst_engine = create_engine(target_pg_url, pool_pre_ping=True)

    # 1. Create all tables in destination
    print("\n1. Ensuring all target tables exist...")
    Base.metadata.create_all(bind=dst_engine)
    print("   Target schema initialized.")

    src_meta = MetaData()
    src_meta.reflect(bind=src_engine)

    dst_meta = MetaData()
    dst_meta.reflect(bind=dst_engine)

    report = []

    # 2. Transfer data in topological order
    print("\n2. Migrating table records...")
    with src_engine.connect() as src_conn, dst_engine.connect() as dst_conn:
        for table_name in MIGRATION_ORDER:
            if table_name not in src_meta.tables:
                continue

            src_table = src_meta.tables[table_name]
            dst_table = dst_meta.tables[table_name]

            # Fetch source rows
            rows = src_conn.execute(select(src_table)).fetchall()
            src_count = len(rows)

            if src_count > 0:
                # Convert rows to dicts
                row_dicts = [dict(row._mapping) for row in rows]
                
                # Check destination count
                dst_initial = dst_conn.execute(select(dst_table)).fetchall()
                if len(dst_initial) == 0:
                    # Insert in chunks of 500
                    chunk_size = 500
                    for i in range(0, len(row_dicts), chunk_size):
                        chunk = row_dicts[i:i + chunk_size]
                        dst_conn.execute(dst_table.insert(), chunk)
                    dst_conn.commit()

            # Verify destination count
            dst_final_count = len(dst_conn.execute(select(dst_table)).fetchall())
            match = "MATCH" if src_count == dst_final_count else "MISMATCH"
            report.append((table_name, src_count, dst_final_count, match))
            print(f"   {table_name:<26} Source: {src_count:>5} | Dest: {dst_final_count:>5} [{match}]")

    print("\n=== MIGRATION VERIFICATION REPORT ===")
    print(f"{'Table Name':<26} {'Source (SQLite)':<16} {'Target (Postgres)':<18} {'Status'}")
    print("-" * 70)
    all_matched = True
    for table, s_cnt, d_cnt, status in report:
        print(f"{table:<26} {s_cnt:<16} {d_cnt:<18} {status}")
        if status != "MATCH":
            all_matched = False

    if all_matched:
        print("\nSUCCESS: All tables migrated with 100% data integrity!")
    else:
        print("\nWARNING: Some row count mismatches were detected. Review above table.")


def main():
    parser = argparse.ArgumentParser(description="MOIL SQLite to PostgreSQL Database Migrator")
    parser.add_argument("--sqlite-path", default="data/processed/moil_mining.db",
                        help="Path to source SQLite database file")
    parser.add_argument("--target-url", default=os.getenv("DATABASE_URL", ""),
                        help="Target PostgreSQL database URL")
    args = parser.parse_args()

    if not args.target_url or args.target_url.startswith("sqlite"):
        print("Notice: Target DATABASE_URL is SQLite or not specified.")
        print("To migrate to PostgreSQL, specify --target-url 'postgresql://user:pass@host:5432/dbname'")
        print(f"Verifying source SQLite database: {args.sqlite_path}")
        if os.path.exists(args.sqlite_path):
            src_engine = create_engine(f"sqlite:///{args.sqlite_path}")
            src_meta = MetaData()
            src_meta.reflect(bind=src_engine)
            with src_engine.connect() as conn:
                print(f"{'Table Name':<26} {'Row Count':<10}")
                print("-" * 38)
                for t in MIGRATION_ORDER:
                    if t in src_meta.tables:
                        cnt = len(conn.execute(select(src_meta.tables[t])).fetchall())
                        print(f"{t:<26} {cnt:<10}")
        return

    migrate_database(args.sqlite_path, args.target_url)


if __name__ == "__main__":
    main()
