import azure.functions as func
from handlers.flow_ingest import flow_ingest_bp
from handlers.flow_status import flow_status_bp
from handlers.process_queue import process_queue_bp

app = func.FunctionApp()

app.register_functions(flow_ingest_bp)
app.register_functions(flow_status_bp)
app.register_functions(process_queue_bp)
