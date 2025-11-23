import azure.functions as func
import logging
import json
from shared.models import GateMeasurement
from shared.storage_client import storage_client
from config.settings import settings

flow_ingest_bp = func.Blueprint()

@flow_ingest_bp.route(route="flow/ingest", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def flow_ingest(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing flow ingestion request.')
    
    try:
        req_body = req.get_json()
        # Validate with Pydantic
        measurement = GateMeasurement(**req_body)
        
        # Push to Queue
        queue_client = storage_client.get_queue_client(settings.QUEUE_NAME_INFLOW)
        queue_client.send_message(json.dumps(measurement.dict()))
        
        # TEMPORARY WORKAROUND: Process synchronously since queue trigger isn't firing
        from handlers.process_queue import process_measurement_sync
        process_measurement_sync(measurement)
        
        return func.HttpResponse(
            json.dumps({"status": "accepted", "gateId": measurement.gateId}),
            mimetype="application/json",
            status_code=202
        )
    except ValueError as e:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON or Schema", "details": str(e)}),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error in flow_ingest: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal Server Error"}),
            status_code=500,
            mimetype="application/json"
        )
