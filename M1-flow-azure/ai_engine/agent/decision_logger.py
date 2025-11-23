"""
Decision Logger - Stores agent decisions for audit and analysis
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any
from shared.storage_client import storage_client
from config.settings import settings

logger = logging.getLogger(__name__)

class DecisionLogger:
    """Logs agent decisions to Table Storage and Blob Storage"""
    
    def __init__(self):
        self.table_client = storage_client.get_table_client(settings.TABLE_NAME_AI_DECISIONS)
        self.blob_client = None  # Will init when needed
    
    def log_decision(self, decision: Dict[str, Any], stadium_id: str) -> str:
        """
        Log an agent decision
        
        Args:
            decision: Decision dict from orchestration agent
            stadium_id: Stadium identifier
        
        Returns:
            Decision ID
        """
        try:
            # Generate unique decision ID
            timestamp = datetime.utcnow()
            decision_id = f"DEC_{stadium_id}_{int(timestamp.timestamp())}"
            
            # Extract key fields
            metadata = decision.get("metadata", {})
            
            # Prepare entity for Table Storage
            entity = {
                "PartitionKey": stadium_id,
                "RowKey": decision_id,
                "decision_text": decision.get("decision", ""),
                "confidence": float(decision.get("confidence", 0.0)),
                "reasoning": decision.get("reasoning", "")[:500],  # Truncate for table
                "full_response": decision.get("full_response", "")[:1000],
                "iterations": metadata.get("iterations", 0),
                "functions_called": json.dumps(metadata.get("functions_called", [])),
                "cost_usd": metadata.get("total_cost_usd", 0.0),
                "model": metadata.get("model", "unknown"),
                "timestamp": timestamp,
                "fallback": decision.get("fallback", False)
            }
            
            # Store in Table Storage
            self.table_client.upsert_entity(entity)
            logger.info(f"Logged decision {decision_id} to Table Storage")
            
            # Store detailed trace in Blob Storage (for full audit trail)
            self._store_blob_trace(decision_id, decision, stadium_id)
            
            return decision_id
        
        except Exception as e:
            logger.error(f"Failed to log decision: {str(e)}")
            return f"ERROR_{timestamp.timestamp()}"
    
    def _store_blob_trace(self, decision_id: str, decision: Dict, stadium_id: str):
        """Store full decision trace as JSON in Blob Storage"""
        try:
            # Initialize blob client if needed
            if not self.blob_client:
                from azure.storage.blob import BlobServiceClient
                blob_service = BlobServiceClient.from_connection_string(
                    settings.STORAGE_CONNECTION_STRING
                )
                container_name = settings.BLOB_CONTAINER_DECISION_TRACES
                
                # Create container if it doesn't exist
                try:
                    blob_service.create_container(container_name)
                except Exception:
                    pass  # Container already exists
                
                self.blob_client = blob_service.get_container_client(container_name)
            
            # Prepare blob data
            blob_data = {
                "decision_id": decision_id,
                "stadium_id": stadium_id,
                "timestamp": datetime.utcnow().isoformat(),
                "decision": decision
            }
            
            blob_name = f"{stadium_id}/{decision_id}.json"
            blob_json = json.dumps(blob_data, indent=2)
            
            # Upload to blob
            self.blob_client.upload_blob(
                name=blob_name,
                data=blob_json,
                overwrite=True
            )
            
            logger.info(f"Stored decision trace to blob: {blob_name}")
        
        except Exception as e:
            logger.warning(f"Failed to store blob trace: {str(e)}")
    
    def get_recent_decisions(self, stadium_id: str, limit: int = 10) -> list:
        """Get recent decisions for a stadium"""
        try:
            filter_query = f"PartitionKey eq '{stadium_id}'"
            entities = self.table_client.query_entities(
                filter_query,
                select=["RowKey", "decision_text", "confidence", "timestamp", "cost_usd"]
            )
            
            # Convert to list and sort by timestamp (desc)
            decisions = list(entities)
            decisions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            
            return decisions[:limit]
        
        except Exception as e:
            logger.error(f"Failed to get recent decisions: {str(e)}")
            return []

# Global logger instance
decision_logger = DecisionLogger()
