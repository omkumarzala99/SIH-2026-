"""
Environment setup verification script.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import init_db
from database.seed_data import seed_database


def main():
    print("[SETUP] Verifying Python runtime and database...")
    init_db()
    seed_database()
    print("[SETUP] MOIL Mining Intelligence Platform environment ready.")


if __name__ == "__main__":
    main()
