"""
Stream Processor - Continuously monitors Azure Table Storage and streams updates
"""
import asyncio
import logging
from datetime import datetime
from typing import Dict, Optional
from azure.data.tables import TableClient
from azure.core.exceptions import AzureError

from config import settings

logger = logging.getLogger(__name__)


class StreamProcessor:
    """Processes real-time gate status updates from Azure Table Storage"""
    
    def __init__(self):
        self.running = False
        self.cache: Dict[str, dict] = {}
        self.last_update: Dict[str, datetime] = {}
        self.poll_interval = 2  # seconds
        
        # Initialize Azure Table client
        try:
            self.table_client = TableClient.from_connection_string(
                conn_str=settings.AZURE_STORAGE_CONNECTION_STRING,
                table_name=settings.TABLE_NAME_GATES
            )
            logger.info(f"✅ Connected to Azure Table: {settings.TABLE_NAME_GATES}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Azure Table: {e}")
            self.table_client = None
    
    async def start(self):
        """Start the stream processor"""
        self.running = True
        logger.info("🔄 Stream processor started")
        
        while self.running:
            try:
                await self._poll_updates()
                await asyncio.sleep(self.poll_interval)
            except Exception as e:
                logger.error(f"Error in stream processor: {e}")
                await asyncio.sleep(5)  # Back off on error
    
    async def stop(self):
        """Stop the stream processor"""
        self.running = False
        logger.info("🛑 Stream processor stopped")
    
    async def _poll_updates(self):
        """Poll Azure Table Storage for updates"""
        if not self.table_client:
            return
        
        try:
            # Query all entities for configured stadium
            entities = self.table_client.query_entities(
                query_filter=f"PartitionKey eq '{settings.STADIUM_ID}'"
            )
            
            gates = []
            for entity in entities:
                gate_data = {
                    "gateId": entity.get("RowKey"),
                    "wait": entity.get("wait_time_prediction", 0),
                    "state": entity.get("state", "unknown"),
                    "anomaly": entity.get("anomaly_detected", False),
                    "anomalyScore": entity.get("anomaly_score", 0),
                    "lastUpdate": entity.get("Timestamp", datetime.utcnow()).isoformat()
                }
                
                # Add investigation data if available
                if entity.get("investigation_id"):
                    gate_data["investigation_id"] = entity["investigation_id"]
                    gate_data["root_cause"] = entity.get("root_cause", "")
                
                gates.append(gate_data)
            
            # Update cache
            if gates:
                stadium_data = {
                    "stadiumId": settings.STADIUM_ID,
                    "gates": gates,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.cache[settings.STADIUM_ID] = stadium_data
                self.last_update[settings.STADIUM_ID] = datetime.utcnow()
                
        except AzureError as e:
            logger.error(f"Azure Table query error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error polling updates: {e}")
    
    async def get_current_status(self, stadium_id: str) -> dict:
        """Get current status for a stadium"""
        # If not in cache, do immediate poll
        if stadium_id not in self.cache:
            await self._poll_updates()
        
        return self.cache.get(stadium_id, {
            "stadiumId": stadium_id,
            "gates": [],
            "timestamp": datetime.utcnow().isoformat(),
            "error": "No data available"
        })
    
    async def force_refresh(self, stadium_id: str):
        """Force an immediate refresh for a stadium"""
        logger.info(f"🔄 Forcing refresh for {stadium_id}")
        await self._poll_updates()
