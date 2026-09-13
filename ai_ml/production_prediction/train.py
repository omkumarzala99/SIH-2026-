"""
Model training script for Production Forecasting.
Trains a GradientBoostingRegressor on historical daily production logs.
"""
import os
import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score


def train_production_model(data_path: str = "data/mock/production_data.csv", output_path: str = "ai_ml/models/production_model.joblib"):
    if not os.path.exists(data_path):
        print(f"Data file {data_path} not found.")
        return None

    df = pd.read_csv(data_path)
    X = df[["planned_tonnage", "blasting_delay_hours", "hauling_trips"]]
    y = df["actual_tonnage"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    model.fit(X_train, y_train)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Production model trained and saved to {output_path}")
    return model


if __name__ == "__main__":
    train_production_model()
