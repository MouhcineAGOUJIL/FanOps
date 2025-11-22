import azure.functions as func
import logging
import json
from shared.storage_client import storage_client
from config.settings import settings

flow_status_bp = func.Blueprint()

@flow_status_bp.route(route="flow/status", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def flow_status(req: func.HttpRequest) -> func.HttpResponse:
    stadium_id = req.params.get('stadiumId')
    if not stadium_id:
        return func.HttpResponse(
            json.dumps({"error": "Missing stadiumId parameter"}),
            status_code=400,
            mimetype="application/json"
        )

    try:
        table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
        # Query for all gates in the stadium
        filter_query = f"PartitionKey eq '{stadium_id}'"
        entities = table_client.query_entities(filter_query)
        
        gates = []
        from shared.ml.aws_anomaly_client import aws_client
        
        for entity in entities:
            # Construct data point for anomaly check
            # In a real scenario, we might want more recent raw data, 
            # but we'll use the current state as a proxy.
            data_point = {
                "gateId": entity['RowKey'],
                "wait": entity.get('wait', 0),
                "queueLength": entity.get('queueLength', 0),
                "processingTime": entity.get('processingTime', 0)
            }
            
            # Check for anomaly (cached)
            anomaly_result = aws_client.check_anomaly(data_point)
            
            gates.append({
                "gateId": entity['RowKey'],
                "wait": entity.get('wait', 0),
                "state": entity.get('state', 'green'),
                "last_updated": str(entity.get('Timestamp', '')),
                "anomaly": anomaly_result['anomaly'],
                "anomalyScore": anomaly_result['score']
            })
            
        return func.HttpResponse(
            json.dumps({"stadiumId": stadium_id, "gates": gates}),
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error in flow_status: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
