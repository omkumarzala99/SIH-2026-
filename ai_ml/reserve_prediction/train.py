"""
Model training pipeline stub for Reserve Classification.
Can train a scikit-learn RandomForestClassifier or XGBoost on borehole assay and satellite datasets.
"""
import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score


from ai_ml.reserve_prediction.features import FEATURE_NAMES
from ai_ml.reserve_prediction.evaluate import evaluate_reserve_metrics


def train_reserve_model(
    data_path: str = "data/mock/geological_data.csv",
    output_path: str = "ai_ml/models/reserve_model.joblib"
):
    """
    Trains a baseline RandomForest model on borehole observations without target leakage.
    Target: High-grade manganese reserve classification (mn_grade_pct >= 35.0).
    Features: Non-target geological measurements (depth_meters, fe_grade_pct, sio2_pct, phosphorus_pct).
    """
    if not os.path.exists(data_path):
        print(f"Data file {data_path} not found.")
        return None

    df = pd.read_csv(data_path)

    # Create target label based on Mn grade thresholds
    # Target source: mn_grade_pct >= 35.0
    df["target"] = (df["mn_grade_pct"] >= 35.0).astype(int)

    # Use non-target features only — strictly ensure mn_grade_pct and its derived ratios are excluded
    features = list(FEATURE_NAMES)
    assert "mn_grade_pct" not in features, "Target leakage detected: mn_grade_pct must not be in training features!"
    assert "mn_fe_ratio" not in features, "Target leakage detected: mn_fe_ratio contains target source!"

    X = df[features]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None
    metrics = evaluate_reserve_metrics(y_test, y_pred, y_prob)

    print("=== Reserve Model Training Evaluation (Leakage-Free) ===")
    print(f"Features used ({len(features)}): {features}")
    print(f"Accuracy:  {metrics['accuracy']}")
    print(f"Precision: {metrics['precision']}")
    print(f"Recall:    {metrics['recall']}")
    print(f"F1 Score:  {metrics['f1_score']}")
    print(f"ROC-AUC:   {metrics.get('roc_auc')}")
    print(f"Confusion Matrix: {metrics['confusion_matrix']}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Model saved to {output_path}")
    return model


if __name__ == "__main__":
    train_reserve_model()

