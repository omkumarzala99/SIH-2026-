"""
Model evaluation module for Reserve Prediction.
"""
from typing import Dict, Any, Optional
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)


def evaluate_reserve_metrics(y_true, y_pred, y_prob: Optional[Any] = None) -> Dict[str, Any]:
    """Calculates accuracy, precision, recall, F1, ROC-AUC, and confusion matrix metrics."""
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    metrics: Dict[str, Any] = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4)
    }

    if y_prob is not None:
        try:
            auc = float(roc_auc_score(y_true, y_prob))
            metrics["roc_auc"] = round(auc, 4)
        except Exception:
            metrics["roc_auc"] = None

    cm = confusion_matrix(y_true, y_pred).tolist()
    metrics["confusion_matrix"] = cm

    return metrics
