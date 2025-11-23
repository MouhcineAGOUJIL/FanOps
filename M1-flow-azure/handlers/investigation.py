"""
Investigation Query API - Query RCA investigation results
"""
import azure.functions as func
import logging
import json
from shared.storage_client import storage_client
from config.settings import settings

investigation_bp = func.Blueprint()

@investigation_bp.route(route="flow/investigation/{investigation_id}", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def get_investigation(req: func.HttpRequest) -> func.HttpResponse:
    """
    Get RCA investigation results by ID
    
    Path Parameters:
        investigation_id: Investigation identifier
    
    Returns:
        JSON with full investigation details
    """
    logging.info('Investigation query API called')
    
    try:
        # Get investigation ID from route
        investigation_id = req.route_params.get('investigation_id')
        
        if not investigation_id:
            return func.HttpResponse(
                json.dumps({"error": "investigation_id is required"}),
                status_code=400,
                mimetype="application/json"
            )
        
        # Extract stadium_id from investigation_id (format: INV_STADIUMID_GATEID_TIMESTAMP)
        # For simplicity, query all and filter
        table_client = storage_client.get_table_client(settings.TABLE_NAME_INVESTIGATION_LOGS)
        
        # Try to find the investigation
        entities = list(table_client.query_entities(f"RowKey eq '{investigation_id}'"))
        
        if not entities:
            return func.HttpResponse(
                json.dumps({"error": "Investigation not found"}),
                status_code=404,
                mimetype="application/json"
            )
        
        entity = entities[0]
        
        # Parse JSON fields if they exist
        import json as json_module
        
        all_hypotheses = []
        tested_hypotheses = []
        bayesian_analysis = {}
        
        try:
            if entity.get('all_hypotheses'):
                all_hypotheses = json_module.loads(entity['all_hypotheses'])
        except:
            pass
            
        try:
            if entity.get('tested_hypotheses'):
                tested_hypotheses = json_module.loads(entity['tested_hypotheses'])
        except:
            pass
            
        try:
            if entity.get('bayesian_analysis'):
                bayesian_analysis = json_module.loads(entity['bayesian_analysis'])
        except:
            pass
        
        # Format response with full details
        response_data = {
            "investigation_id": investigation_id,
            "stadium_id": entity['PartitionKey'],
            "gate_id": entity.get('gate_id', ''),
            "timestamp": entity.get('Timestamp', '').isoformat() if hasattr(entity.get('Timestamp', ''), 'isoformat') else str(entity.get('Timestamp', '')),
            "diagnosis": {
                "root_cause": entity.get('root_cause', ''),
                "confidence": entity.get('confidence', 0.0),
                "reasoning": entity.get('reasoning', '')
            },
            "anomaly_score": entity.get('anomaly_score', 0.0),
            "all_hypotheses": all_hypotheses,
            "tested_hypotheses": tested_hypotheses,
            "bayesian_analysis": bayesian_analysis,
            "mitigation": {
                "priority": entity.get('mitigation_priority', 'unknown'),
                "actions": entity.get('mitigation_actions', '').split('\n') if entity.get('mitigation_actions') else []
            },
            "status": entity.get('status', 'unknown'),
            "execution_time_ms": entity.get('execution_time_ms', 0)
        }
        
        return func.HttpResponse(
            json.dumps(response_data, indent=2),
            status_code=200,
            mimetype="application/json"
        )
    
    except Exception as e:
        logging.error(f"Error querying investigation: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
