import azure.functions as func
from handlers.flow_ingest import flow_ingest_bp
from handlers.flow_status import flow_status_bp
from handlers.process_queue import process_queue_bp
from handlers.ai_insights import ai_insights_bp
from handlers.agent_orchestrator import agent_orchestrator_bp
from handlers.investigation import investigation_bp

app = func.FunctionApp()

app.register_functions(flow_ingest_bp)
app.register_functions(flow_status_bp)
app.register_functions(process_queue_bp)
app.register_functions(ai_insights_bp)
app.register_functions(agent_orchestrator_bp)
app.register_functions(investigation_bp)
