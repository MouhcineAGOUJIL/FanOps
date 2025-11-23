"""
Agent Orchestrator - Timer Trigger that runs agent every 2 minutes
"""
import azure.functions as func
import logging
import json
from datetime import datetime
from ai_engine.agent.orchestration_agent import OrchestrationAgent
from ai_engine.agent.decision_logger import decision_logger
from shared.storage_client import storage_client
from config.settings import settings

agent_orchestrator_bp = func.Blueprint()

@agent_orchestrator_bp.schedule(
    schedule="0 */2 * * * *",  # Every 2 minutes
    arg_name="timer",
    run_on_startup=False,
    use_monitor=False
)
def agent_orchestrator(timer: func.TimerRequest) -> None:
    """
    Automated AI agent that runs every 2 minutes
    Analyzes stadium gates and makes intelligent recommendations
    """
    logging.info('Agent Orchestrator triggered')
    
    try:
        # Check if match is active (has recent gate data)
        if not _is_match_active():
            logging.info("No active match detected. Skipping agent run.")
            return
        
        # Run agent for each active stadium
        stadiums = ["AGADIR"]  # TODO: Get from configuration or detect dynamically
        
        for stadium_id in stadiums:
            logging.info(f"Running orchestration agent for {stadium_id}")
            
            # Create and run agent
            agent = OrchestrationAgent(stadium_id=stadium_id)
            decision = agent.make_decision()
            
            # Log decision
            decision_id = decision_logger.log_decision(decision, stadium_id)
            
            logging.info(f"Agent decision logged: {decision_id}")
            logging.info(f"Decision: {decision.get('decision', '')}")
            logging.info(f"Confidence: {decision.get('confidence', 0.0)}")
            
            # Log metrics
            metadata = decision.get("metadata", {})
            logging.info(f"Iterations: {metadata.get('iterations', 0)}")
            logging.info(f"Functions called: {metadata.get('functions_called', [])}")
            logging.info(f"Cost: ${metadata.get('total_cost_usd', 0.0):.4f}")
    
    except Exception as e:
        logging.error(f"Agent orchestrator error: {str(e)}")
        raise

def _is_match_active() -> bool:
    """
    Check if there's an active match by looking for recent gate data
    Returns True if data was updated in last 10 minutes
    """
    try:
        table_client = storage_client.get_table_client(settings.TABLE_NAME_GATES)
        
        # Query all entities
        entities = list(table_client.query_entities(""))
        
        if not entities:
            return False
        
        # Check if any entity was updated recently
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(minutes=10)
        
        for entity in entities:
            timestamp = entity.get('Timestamp')
            if timestamp and timestamp > cutoff:
                return True
        
        return False
    
    except Exception as e:
        logging.warning(f"Error checking match activity: {str(e)}")
        return False
