import azure.functions as func
from handlers.flow_ingest import flow_ingest_bp
from handlers.flow_status import flow_status_bp
from handlers.process_queue import process_queue_bp
from handlers.ai_insights import ai_insights_bp
from handlers.agent_orchestrator import agent_orchestrator_bp
from handlers.investigation import investigation_bp

app = func.FunctionApp()

app.register_blueprint(flow_ingest_bp)
app.register_blueprint(flow_status_bp)
app.register_blueprint(process_queue_bp)
app.register_blueprint(ai_insights_bp)
app.register_blueprint(agent_orchestrator_bp)
app.register_blueprint(investigation_bp)
