"""
Evaluation metrics for production forecasting.
"""
from typing import Dict, Any
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def evaluate_production_forecast(y_true, y_pred) -> Dict[str, float]:
    """
    Calculates authentic regression metrics: MAE, RMSE, R2, and MAPE.
    """
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)

    mae = float(mean_absolute_error(y_true_arr, y_pred_arr))
    rmse = float(np.sqrt(mean_squared_error(y_true_arr, y_pred_arr)))
    r2 = float(r2_score(y_true_arr, y_pred_arr))

    non_zero = y_true_arr != 0
    if np.any(non_zero):
        mape = float(np.mean(np.abs((y_true_arr[non_zero] - y_pred_arr[non_zero]) / y_true_arr[non_zero])) * 100.0)
    else:
        mape = 0.0

    return {
        "mae_tonnes": round(mae, 2),
        "rmse_tonnes": round(rmse, 2),
        "mape_pct": round(mape, 2),
        "r2_score": round(r2, 4)
    }
