import azure.functions as func
import logging
import json
from shared.models import GateMeasurement
from shared.storage_client import storage_client
from config.settings import settings
from datetime import datetime

process_queue_bp = func.Blueprint()

@process_queue_bp.queue_trigger(arg_name="msg", queue_name="gates-inflow", connection="AzureWebJobsStorage")
def process_gate_queue(msg: func.QueueMessage) -> None:
    logging.info('Processing queue item: %s', msg.get_body().decode('utf-8'))
    
    try:
        body = json.loads(msg.get_body().decode('utf-8'))
        measurement = GateMeasurement(**body)
        
        # Prepare features for ML model
        # We need to derive time-based features from the timestamp
        ts = datetime.fromisoformat(measurement.ts.replace('Z', '+00:00'))
        match_start = ts.replace(hour=18, minute=0, second=0, microsecond=0)
        minutes_to_kickoff = (match_start - ts).total_seconds() / 60
        
        features = {
            'hour_of_day': ts.hour,
            'minute_of_hour': ts.minute,
            'minutes_to_kickoff': minutes_to_kickoff,
            'is_peak': 1 if -60 <= minutes_to_kickoff <= 0 else 0,
            'queue_length': measurement.queueLength,
            'processing_time': measurement.avgProcessingTime,
            'capacity_utilization': 0.5, # Placeholder or derived from other system
            f'gate_{measurement.gateId}': 1 # One-hot encoding
        }
        
        # ML Inference
        from shared.ml.onnx_inference import inference_engine
        predicted_wait = inference_engine.predict(features)
        
        # Fallback if model fails or returns negative
        if predicted_wait < 0:
            logging.warning("ML inference failed, using fallback rule.")
            predicted_wait = (measurement.queueLength * measurement.avgProcessingTime) / 60
            
        state = "green"
        if predicted_wait > 10:
            state = "red"
        elif predicted_wait > 5:
            state = "yellow"
            
        # Save to Table Storage
        table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
        entity = {
            "PartitionKey": measurement.stadiumId,
            "RowKey": measurement.gateId,
            "wait": float(predicted_wait),
            "state": state,
            "queueLength": measurement.queueLength,
            "processingTime": measurement.avgProcessingTime,
            "last_updated": datetime.utcnow().isoformat(),
            "model_version": "1.0"
        }
        table_client.upsert_entity(entity=entity)
        logging.info(f"Updated status for {measurement.gateId}: {state} ({predicted_wait:.2f} min)")
        
    except Exception as e:
        logging.error(f"Error processing queue item: {str(e)}")
        raise e
