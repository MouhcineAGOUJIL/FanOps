import json
import boto3
import os
import tempfile

# Try to import ML libraries
try:
    import joblib
    import pandas as pd
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("ML libraries not available")

# Initialize S3 client
s3 = boto3.client('s3')
BUCKET_NAME = os.environ.get('MODEL_BUCKET')
MODEL_KEY = 'model.joblib'

# Global variable to cache the model
model = None

def load_model():
    global model
    if not ML_AVAILABLE:
        return None
    if model is None:
        print("Loading model from S3...")
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            s3.download_file(BUCKET_NAME, MODEL_KEY, tmp.name)
            model = joblib.load(tmp.name)
        print("Model loaded.")
    return model

def handler(event, context):
    if not ML_AVAILABLE:
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'ML libraries missing, but deployment worked!'})
        }

    try:
        # Load model
        clf = load_model()
        
        # Parse input
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        
        # Expected features
        team_a = body.get('team_a')
        team_b = body.get('team_b')
        stadium = body.get('stadium')
        time = body.get('time')
        stage = body.get('stage')
        
        if not all([team_a, team_b, stadium, time, stage]):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields: team_a, team_b, stadium, time, stage'})
            }
            
        # Create DataFrame for prediction
        input_data = pd.DataFrame([{
            'team_a': team_a,
            'team_b': team_b,
            'stadium': stadium,
            'time': time,
            'stage': stage
        }])
        
        # Predict
        prediction = clf.predict(input_data)[0]
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'predicted_attendance': int(prediction),
                'match_details': body
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
