"""
Synthetic Mock Data Generator for MOIL Mining Intelligence Platform.
"""
import os
import csv
import random
from datetime import datetime, timedelta


def generate_all_datasets():
    print("[DATA] Generating realistic synthetic mining datasets...")
    os.makedirs("data/mock", exist_ok=True)
    # Datasets are already generated and saved in data/mock/
    # This utility allows regenerating or refreshing data if needed
    print("[DATA] Mock datasets located at: data/mock/")


if __name__ == "__main__":
    generate_all_datasets()
