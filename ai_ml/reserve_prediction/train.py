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


def train_reserve_model(data_path: str = "data/mock/geological_data.csv", output_path: str = "ai_ml/models/reserve_model.joblib"):
    """Trains a baseline RandomForest model on borehole observations."""
    if not os.path.exists(data_path):
        print(f"Data file {data_path} not found.")
        return None

    df = pd.read_csv(data_path)
    
    # Create target label based on Mn grade thresholds
    df["target"] = (df["mn_grade_pct"] >= 35.0).astype(int)
    
    features = ["depth_meters", "mn_grade_pct", "fe_grade_pct", "sio2_pct", "phosphorus_pct"]
    X = df[features]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Model saved to {output_path}")
    return model


if __name__ == "__main__":
    train_reserve_model()
