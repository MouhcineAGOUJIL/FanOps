"""
AI Insights API - HTTP endpoint to query agent decisions
"""
import azure.functions as func
import logging
import json
from datetime import datetime, timedelta
from shared.storage_client import storage_client
from config.settings import settings

ai_insights_bp = func.Blueprint()

@ai_insights_bp.route(route="flow/ai-insights", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def ai_insights(req: func.HttpRequest) -> func.HttpResponse:
    """
    Get AI agent insights and recent decisions
    
    Query Parameters:
        stadium_id: Required. Stadium identifier
        limit: Optional. Number of recent decisions to return (default: 5)
    
    Returns:
        JSON with latest agent recommendations, reasoning, and history
    """
    logging.info('AI Insights API called')
    
    try:
        # Get parameters
        stadium_id = req.params.get('stadium_id')
        if not stadium_id:
            return func.HttpResponse(
                json.dumps({"error": "stadium_id parameter required"}),
                status_code=400,
                mimetype="application/json"
            )
        
        limit = int(req.params.get('limit', 5))
        
        # Query recent decisions from Table Storage
        table_client = storage_client.get_table_client(settings.TABLE_NAME_AI_DECISIONS)
        filter_query = f"PartitionKey eq '{stadium_id}'"
        
        entities = list(table_client.query_entities(filter_query))
        
        # Sort by timestamp (newest first)
        entities.sort(key=lambda x: x.get('Timestamp', datetime.min), reverse=True)
        
        # Get latest decision
        latest = entities[0] if entities else None
        
        # Format recent decisions
        recent_decisions = []
        for entity in entities[:limit]:
            recent_decisions.append({
                "decision_id": entity['RowKey'],
                "timestamp": entity.get('Timestamp', '').isoformat() if hasattr(entity.get('Timestamp', ''), 'isoformat') else str(entity.get('Timestamp', '')),
                "decision": entity.get('decision_text', ''),
                "confidence": entity.get('confidence', 0.0),
                "cost_usd": entity.get('cost_usd', 0.0),
                "fallback": entity.get('fallback', False)
            })
        
        # Build response
        response_data = {
            "stadium_id": stadium_id,
            "latest_decision": {
                "decision": latest.get('decision_text', 'No decisions yet') if latest else 'No decisions yet',
                "reasoning": latest.get('reasoning', '') if latest else '',
                "confidence": latest.get('confidence', 0.0) if latest else 0.0,
                "timestamp": latest.get('Timestamp', '').isoformat() if latest and hasattr(latest.get('Timestamp', ''), 'isoformat') else '',
                "functions_called": json.loads(latest.get('functions_called', '[]')) if latest else [],
                "cost_usd": latest.get('cost_usd', 0.0) if latest else 0.0
            },
            "recent_decisions": recent_decisions,
            "total_decisions": len(entities),
            "query_time": datetime.utcnow().isoformat()
        }
        
        return func.HttpResponse(
            json.dumps(response_data, indent=2),
            status_code=200,
            mimetype="application/json"
        )
    
    except Exception as e:
        logging.error(f"Error in AI insights: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
