import functions_framework
import joblib
import pandas as pd
import numpy as np
import json
import os
from google.cloud import storage
from sponsors_config import SPONSORS

# Configuration
BUCKET_NAME = os.environ.get("GCP_MODEL_BUCKET", "fanops-m4-models")
MODEL_BLOB_NAME = "model.joblib"
COLUMNS_BLOB_NAME = "model_columns.joblib"

# Load model and columns globally for cold start optimization
model = None
model_columns = None

def download_blob(bucket_name, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(source_blob_name)
        blob.download_to_filename(destination_file_name)
        print(f"✅ Downloaded {source_blob_name} to {destination_file_name}")
        return True
    except Exception as e:
        print(f"⚠️ Could not download from GCS (Local mode?): {e}")
        return False

def load_model():
    global model, model_columns
    if model is None:
        # Try to download from GCS if not present locally or if forced
        if not os.path.exists('model.joblib'):
            print("⬇️ Model not found locally, attempting GCS download...")
            download_blob(BUCKET_NAME, MODEL_BLOB_NAME, 'model.joblib')
            download_blob(BUCKET_NAME, COLUMNS_BLOB_NAME, 'model_columns.joblib')

        try:
            model = joblib.load('model.joblib')
            model_columns = joblib.load('model_columns.joblib')
            print("✅ Model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            model = None

@functions_framework.http
def sponsor_recommendation(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`.
    """
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    load_model()
    
    if model is None:
        return (json.dumps({"error": "Model not initialized"}), 500, headers)

    try:
        request_json = request.get_json(silent=True)
        
        if not request_json:
            return (json.dumps({"error": "Invalid JSON"}), 400, headers)
            
        # Extract features
        # Expected input: {"match_minute": 45, "score_diff": 0, "temperature": 25, "crowd_density": 0.8, "zone": "North", "event": "Halftime"}
        
        input_data = {
            "match_minute": request_json.get("match_minute", 0),
            "score_diff": request_json.get("score_diff", 0),
            "temperature": request_json.get("temperature", 20),
            "crowd_density": request_json.get("crowd_density", 0.5),
            "zone": request_json.get("zone", "North"),
            "event": request_json.get("event", "None")
        }
        
        # Create DataFrame
        df = pd.DataFrame([input_data])
        
        # One-Hot Encode (align with training columns)
        df_encoded = pd.get_dummies(df, columns=["zone", "event"])
        
        # Ensure all columns from training exist, fill missing with 0
        for col in model_columns:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
                
        # Reorder columns to match training
        df_encoded = df_encoded[model_columns]
        
        # Predict
        prediction = model.predict(df_encoded)[0]
        probabilities = model.predict_proba(df_encoded)[0]
        confidence = np.max(probabilities)
        
        # Get Sponsor Details
        sponsor_details = SPONSORS.get(prediction, {})
        
        response = {
            "recommended_sponsor": prediction,
            "confidence": float(confidence),
            "campaign_message": sponsor_details.get("message", ""),
            "category": sponsor_details.get("category", ""),
            "context_used": input_data
        }
        
        return (json.dumps(response), 200, headers)

    except Exception as e:
        print(f"Error processing request: {e}")
        return (json.dumps({"error": str(e)}), 500, headers)
