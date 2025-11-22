import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import onnxmltools
from onnxmltools.convert.common.data_types import FloatTensorType
import os
import json

def train_and_export():
    # 1. Load Data
    if not os.path.exists("synthetic_gate_data.csv"):
        print("Data not found. Please run generate_data.py first.")
        return

    df = pd.read_csv("synthetic_gate_data.csv")
    
    # 2. Prepare Features and Target
    target = 'wait_time'
    features = [c for c in df.columns if c != target]
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Train Model
    print("Training LightGBM model...")
    model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    # 4. Evaluate
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Model Performance: RMSE={rmse:.4f}, R2={r2:.4f}")
    
    # 5. Export to ONNX
    print("Converting to ONNX...")
    initial_types = [('float_input', FloatTensorType([None, len(features)]))]
    onnx_model = onnxmltools.convert_lightgbm(model, initial_types=initial_types)
    
    # Ensure output directory exists (Robust Path)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../shared/ml/models")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "wait_time_model.onnx")
    onnxmltools.utils.save_model(onnx_model, output_path)
    print(f"Model saved to {output_path}")
    
    # 6. Save Metadata
    metadata = {
        "version": "1.0",
        "created_at": pd.Timestamp.now().isoformat(),
        "metrics": {"rmse": rmse, "r2": r2},
        "features": features
    }
    metadata_path = os.path.join(output_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

if __name__ == "__main__":
    train_and_export()
