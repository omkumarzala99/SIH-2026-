"""
Model training script for Production Forecasting.
Trains a GradientBoostingRegressor on historical daily production, equipment status, and weather observations.
"""
import os
import joblib
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit

from ai_ml.production_prediction.features import FEATURE_NAMES, build_production_training_dataset
from ai_ml.production_prediction.evaluate import evaluate_production_forecast


def _get_default_output_path() -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return os.path.join(base_dir, "ai_ml", "models", "production_model.joblib")


def train_production_model(
    data_dir: str = "data/mock",
    output_path: Optional[str] = None
) -> GradientBoostingRegressor:
    """
    Trains the Production Forecasting GradientBoostingRegressor without target leakage.
    Uses chronological time-series splitting for validation, evaluates performance,
    and serializes the trained model artifact to ai_ml/models/production_model.joblib.
    """
    target_output = output_path or _get_default_output_path()

    # Build joined, leakage-free dataset
    X, y = build_production_training_dataset(data_dir=data_dir)

    # Strictly assert no target leakage
    assert "actual_tonnage" not in X.columns, "Target leakage error: actual_tonnage in X!"
    assert "shortfall_tonnage" not in X.columns, "Target leakage error: shortfall_tonnage in X!"
    assert list(X.columns) == FEATURE_NAMES, f"Feature columns mismatch with FEATURE_NAMES"

    # Chronological validation split (earlier 80% for training, later 20% for testing - temporal ordering)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    val_model = GradientBoostingRegressor(
        n_estimators=60,
        max_depth=3,
        learning_rate=0.08,
        random_state=42
    )
    val_model.fit(X_train, y_train)
    y_pred_val = val_model.predict(X_test)
    val_metrics = evaluate_production_forecast(y_test, y_pred_val)

    # TimeSeriesSplit Cross-Validation
    tscv = TimeSeriesSplit(n_splits=min(5, max(2, len(X) // 5)))
    cv_maes = []
    cv_r2s = []
    for tr_idx, val_idx in tscv.split(X):
        m_cv = GradientBoostingRegressor(n_estimators=60, max_depth=3, learning_rate=0.08, random_state=42)
        m_cv.fit(X.iloc[tr_idx], y.iloc[tr_idx])
        pred_cv = m_cv.predict(X.iloc[val_idx])
        metrics_cv = evaluate_production_forecast(y.iloc[val_idx], pred_cv)
        cv_maes.append(metrics_cv["mae_tonnes"])
        cv_r2s.append(metrics_cv["r2_score"])

    mean_cv_mae = round(float(np.mean(cv_maes)), 2)
    mean_cv_r2 = round(float(np.mean(cv_r2s)), 4)

    # Train final deployment model on complete historical observations
    final_model = GradientBoostingRegressor(
        n_estimators=60,
        max_depth=3,
        learning_rate=0.08,
        random_state=42
    )
    final_model.fit(X, y)
    final_preds = final_model.predict(X)
    full_metrics = evaluate_production_forecast(y, final_preds)

    print("=== Production Model Training Evaluation ===")
    print(f"Features used ({len(FEATURE_NAMES)}): {FEATURE_NAMES}")
    print(f"Target variable: actual_tonnage")
    print(f"Model: GradientBoostingRegressor(n_estimators=60, max_depth=3, lr=0.08)")
    print(f"Chronological Test Split - MAE: {val_metrics['mae_tonnes']} t, RMSE: {val_metrics['rmse_tonnes']} t, R2: {val_metrics['r2_score']}")
    print(f"TimeSeriesSplit CV ({tscv.n_splits}-fold) - Mean MAE: {mean_cv_mae} t, Mean R2: {mean_cv_r2}")
    print(f"Full Dataset Fit - MAE: {full_metrics['mae_tonnes']} t, RMSE: {full_metrics['rmse_tonnes']} t, R2: {full_metrics['r2_score']}")

    os.makedirs(os.path.dirname(target_output), exist_ok=True)
    joblib.dump(final_model, target_output)
    print(f"Production model artifact successfully saved to: {target_output}")

    return final_model


if __name__ == "__main__":
    train_production_model()
