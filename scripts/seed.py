"""
Command-line utility to seed the MOIL Mining database with synthetic prototype data.

Usage:
    python scripts/seed.py                  # Seeds full profile (~1,255 geo, 3,600 eq status, 2,528 prod)
    python scripts/seed.py --clean          # Drops tables first and re-seeds clean full dataset
    python scripts/seed.py --profile small  # Restores small baseline dataset
    python scripts/seed.py --profile small --clean
"""
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.seed_data import main

if __name__ == "__main__":
    main()
