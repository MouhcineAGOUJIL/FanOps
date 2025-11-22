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
        
        # Basic Logic for Wait Time (Placeholder for ML)
        # Simple rule: wait = queueLength * avgProcessingTime / 60 (minutes)
        wait_time = (measurement.queueLength * measurement.avgProcessingTime) / 60
        
        state = "green"
        if wait_time > 10:
            state = "red"
        elif wait_time > 5:
            state = "yellow"
            
        # Save to Table Storage
        table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
        entity = {
            "PartitionKey": measurement.stadiumId,
            "RowKey": measurement.gateId,
            "wait": wait_time,
            "state": state,
            "queueLength": measurement.queueLength,
            "processingTime": measurement.avgProcessingTime,
            "last_updated": datetime.utcnow().isoformat()
        }
        table_client.upsert_entity(entity=entity)
        logging.info(f"Updated status for {measurement.gateId}: {state} ({wait_time:.2f} min)")
        
    except Exception as e:
        logging.error(f"Error processing queue item: {str(e)}")
        raise e
