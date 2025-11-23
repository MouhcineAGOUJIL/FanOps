"""
Function Executor - Implements the actual logic for agent function calls
Maps function names to their implementations
"""
import json
import logging
import math
from datetime import datetime, timedelta
from typing import Dict, Any
from shared.storage_client import storage_client
from config.settings import settings

logger = logging.getLogger(__name__)

class FunctionExecutor:
    """Executes functions called by the orchestration agent"""
    
    def __init__(self):
        self.function_registry = {
            "get_all_gate_status": self.get_all_gate_status,
            "get_historical_pattern": self.get_historical_pattern,
            "simulate_redistribution": self.simulate_redistribution,
            "send_staff_alert": self.send_staff_alert,
            "get_match_context": self.get_match_context
        }
    
    def execute(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a function by name with given arguments
        
        Args:
            function_name: Name of function to call
            arguments: Function arguments as dict
        
        Returns:
            Function result as dict
        """
        if function_name not in self.function_registry:
            logger.error(f"Unknown function: {function_name}")
            return {"error": f"Function {function_name} not found"}
        
        try:
            logger.info(f"Executing function: {function_name} with args: {arguments}")
            result = self.function_registry[function_name](**arguments)
            logger.info(f"Function {function_name} returned: {result}")
            return result
        except Exception as e:
            logger.error(f"Error executing {function_name}: {str(e)}")
            return {"error": str(e)}
    
    def get_all_gate_status(self, stadium_id: str) -> Dict[str, Any]:
        """Get current status of all gates"""
        try:
            table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
            filter_query = f"PartitionKey eq '{stadium_id}'"
            entities = table_client.query_entities(filter_query)
            
            gates = []
            for entity in entities:
                gates.append({
                    "gate_id": entity['RowKey'],
                    "wait_time": entity.get('wait', 0),
                    "state": entity.get('state', 'unknown'),
                    "queue_length": entity.get('queueLength', 0),
                    "processing_time": entity.get('processingTime', 0),
                    "last_updated": str(entity.get('Timestamp', ''))
                })
            
            return {
                "stadium_id": stadium_id,
                "gates": gates,
                "total_gates": len(gates),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {"error": f"Failed to get gate status: {str(e)}"}
    
    def get_historical_pattern(self, stadium_id: str, time_of_day: str, lookback_days: int = 30) -> Dict[str, Any]:
        """
        Get historical crowd patterns (MOCK implementation)
        In production, this would query a time-series database
        """
        logger.info(f"Getting historical pattern for {stadium_id} at {time_of_day}")
        
        # Mock historical data
        return {
            "stadium_id": stadium_id,
            "time_period": time_of_day,
            "avg_total_crowd": 35000,
            "peak_arrival_time": "17:30-18:00",
            "typical_distribution": {
                "G1": 0.20,
                "G2": 0.25,
                "G3": 0.22,
                "G4": 0.18,
                "G5": 0.15
            },
            "historical_incidents": [
                {"date": "2025-06-15", "type": "weather_delay", "impact": "15min delay"},
                {"date": "2025-06-22", "type": "scanner_failure", "gate": "G2"}
            ]
        }
    
    def simulate_redistribution(self, from_gate: str, to_gate: str, percentage: float, stadium_id: str) -> Dict[str, Any]:
        """
        Simulate crowd redistribution using M/M/c queueing model
        
        M/M/c: Markov arrivals, Markov service, c servers (lanes)
        """
        try:
            # Get current gate status
            table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
            
            # Fetch FROM gate
            from_entity = table_client.get_entity(stadium_id, from_gate)
            from_queue = from_entity.get('queueLength', 0)
            from_service_time = from_entity.get('processingTime', 4.0)
            
            # Fetch TO gate
            to_entity = table_client.get_entity(stadium_id, to_gate)
            to_queue = to_entity.get('queueLength', 0)
            to_service_time = to_entity.get('processingTime', 4.0)
            
            # Calculate redistribution
            redirect_count = int(from_queue * (percentage / 100))
            
            # M/M/c formula: W = (L / λ) where L is avg queue length, λ is arrival rate
            # Simplified: wait_time ≈ queue_length * service_time / 60 (convert to minutes)
            
            # NEW queue lengths
            new_from_queue = from_queue - redirect_count
            new_to_queue = to_queue + redirect_count
            
            # NEW wait times
            new_from_wait = (new_from_queue * from_service_time) / 60
            new_to_wait = (new_to_queue * to_service_time) / 60
            
            # Calculate improvement
            old_from_wait = (from_queue * from_service_time) / 60
            old_to_wait = (to_queue * to_service_time) / 60
            old_total_wait = old_from_wait + old_to_wait
            new_total_wait = new_from_wait + new_to_wait
            
            return {
                "stadium_id": stadium_id,
                "from_gate": from_gate,
                "to_gate": to_gate,
                "redirected_count": redirect_count,
                "before": {
                    f"{from_gate}_wait": round(old_from_wait, 2),
                    f"{to_gate}_wait": round(old_to_wait, 2),
                    "total_wait": round(old_total_wait, 2)
                },
                "after": {
                    f"{from_gate}_wait": round(new_from_wait, 2),
                    f"{to_gate}_wait": round(new_to_wait, 2),
                    "total_wait": round(new_total_wait, 2)
                },
                "improvement": round(old_total_wait - new_total_wait, 2),
                "recommendation": "beneficial" if new_total_wait < old_total_wait else "not_beneficial"
            }
        except Exception as e:
            return {"error": f"Simulation failed: {str(e)}"}
    
    def send_staff_alert(self, alert_type: str, gate_id: str, message: str, priority: str, stadium_id: str) -> Dict[str, Any]:
        """Send alert to staff (logs to queue + table)"""
        try:
            alert_data = {
                "alert_id": f"ALERT_{datetime.utcnow().timestamp()}",
                "stadium_id": stadium_id,
                "gate_id": gate_id,
                "alert_type": alert_type,
                "message": message,
                "priority": priority,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "sent"
            }
            
            # Send to control queue
            queue_client = storage_client.get_queue_client(settings.QUEUE_NAME_CONTROL)
            queue_client.send_message(json.dumps(alert_data))
            
            logger.info(f"Alert sent: {alert_type} for {gate_id} with priority {priority}")
            
            return {
                "status": "success",
                "alert_id": alert_data["alert_id"],
                "message": f"Alert sent to {alert_type} team",
                "priority": priority
            }
        except Exception as e:
            return {"error": f"Failed to send alert: {str(e)}"}
    
    def get_match_context(self, stadium_id: str) -> Dict[str, Any]:
        """
        Get match context (MOCK implementation)
        In production, this would integrate with ticketing/event systems
        """
        # Mock match context
        now = datetime.utcnow()
        kickoff_time = now.replace(hour=18, minute=0, second=0, microsecond=0)
        minutes_to_kickoff = int((kickoff_time - now).total_seconds() / 60)
        
        return {
            "stadium_id": stadium_id,
            "match": {
                "home_team": "Morocco",
                "away_team": "Senegal",
                "kickoff_time": kickoff_time.isoformat(),
                "minutes_to_kickoff": minutes_to_kickoff,
                "current_score": "0-0",
                "match_status": "pre_match" if minutes_to_kickoff > 0 else "in_progress"
            },
            "weather": {
                "condition": "clear",
                "temperature": 22,
                "precipitation": 0
            },
            "vip_arrivals": {
                "expected_count": 150,
                "arrival_window": "17:30-17:45",
                "designated_gates": ["G1", "G6"]
            },
            "capacity": {
                "total": 50000,
                "expected_attendance": 48000,
                "tickets_sold": 47500
            }
        }

# Global executor instance
function_executor = FunctionExecutor()
