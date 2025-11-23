import azure.functions as func
import logging
import json
from datetime import datetime
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
        filter_query = f"PartitionKey eq '{stadium_id}'"
        entities = table_client.query_entities(filter_query)
        
        gates = []
        from shared.ml.aws_anomaly_client import aws_client
        
        for entity in entities:
            gate_id = entity['RowKey']
            wait = entity.get('wait', 0)
            state = entity.get('state', 'green')
            last_updated = str(entity.get('Timestamp', ''))
            
            # Construct data point for anomaly check
            gate_metrics = {
                "gateId": gate_id,
                "wait": wait,
                "queueLength": entity.get('queueLength', 0),
                "processingTime": entity.get('processingTime', 0)
            }
            
            # Check for anomaly (AWS SageMaker)
            anomaly_result = aws_client.check_anomaly(gate_metrics)
            
            gate_data = {
                "gateId": gate_id,
                "wait": wait,
                "state": state,
                "last_updated": last_updated,
                "anomaly": anomaly_result['anomaly'],
                "anomalyScore": anomaly_result['score']
            }
            
            # TRIGGER RCA if anomaly detected
            if anomaly_result['anomaly']:
                logging.info(f"Anomaly detected at {gate_id}, triggering RCA investigation")
                
                # Prepare anomaly data for investigation
                anomaly_data = {
                    "stadium_id": stadium_id,
                    "gate_id": gate_id,
                    "anomaly_score": anomaly_result['score'],
                    "queue_length": gate_metrics.get("queueLength", 0),
                    "wait_time": wait,
                    "processing_time": gate_metrics.get("processingTime", 0),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Run RCA investigation
                try:
                    from ai_engine.root_cause.anomaly_investigator import anomaly_investigator
                    investigation = anomaly_investigator.investigate(anomaly_data)
                    gate_data["investigation_id"] = investigation.get("investigation_id")
                    gate_data["investigation_status"] = "completed"
                    gate_data["root_cause"] = investigation.get("diagnosis", {}).get("root_cause")
                except Exception as e:
                    logging.error(f"RCA investigation failed: {str(e)}")
                    gate_data["investigation_status"] = "failed"
            
            gates.append(gate_data)
            
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
