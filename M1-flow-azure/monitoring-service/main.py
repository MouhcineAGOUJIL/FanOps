"""
M1 Monitoring Service - Main Application
FastAPI app with WebSocket support for real-time gate monitoring
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from stream_processor import StreamProcessor
from metrics_aggregator import MetricsAggregator

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
stream_processor: StreamProcessor = None
metrics_aggregator: MetricsAggregator = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global stream_processor, metrics_aggregator
    
    logger.info("🚀 Starting M1 Monitoring Service...")
    
    # Initialize components
    stream_processor = StreamProcessor()
    metrics_aggregator = MetricsAggregator()
    
    # Start background tasks
    asyncio.create_task(stream_processor.start())
    asyncio.create_task(metrics_aggregator.start())
    
    logger.info("✅ M1 Monitoring Service started successfully")
    
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down M1 Monitoring Service...")
    await stream_processor.stop()
    await metrics_aggregator.stop()


# Create FastAPI app
app = FastAPI(
    title="M1 Monitoring Service",
    description="Real-time gate monitoring for FanOps M1",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === HTTP Endpoints ===

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "M1 Monitoring",
        "version": "1.0.0"
    }


@app.get("/api/realtime/gates")
async def get_gates_status(stadiumId: str = Query(default="AGADIR")):
    """Get current gate status (HTTP alternative to WebSocket)"""
    try:
        status = await stream_processor.get_current_status(stadiumId)
        return JSONResponse(content=status)
    except Exception as e:
        logger.error(f"Error getting gate status: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.get("/api/metrics")
async def get_metrics(
    stadiumId: str = Query(default="AGADIR"),
    period: str = Query(default="1h")  # 5m, 15m, 1h, 1d
):
    """Get aggregated metrics"""
    try:
        metrics = await metrics_aggregator.get_metrics(stadiumId, period)
        return JSONResponse(content=metrics)
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.post("/api/notify")
async def notify_change(data: dict):
    """Receive notifications from Azure Functions when data changes"""
    try:
        stadium_id = data.get("stadiumId")
        logger.info(f"Received change notification for {stadium_id}")
        
        # Trigger immediate refresh
        if stream_processor:
            asyncio.create_task(stream_processor.force_refresh(stadium_id))
        
        return {"status": "acknowledged"}
    except Exception as e:
        logger.error(f"Error processing notification: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


# === WebSocket Endpoint ===

class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, stadium_id: str):
        """Accept new WebSocket connection"""
        await websocket.accept()
        
        if stadium_id not in self.active_connections:
            self.active_connections[stadium_id] = []
        
        self.active_connections[stadium_id].append(websocket)
        logger.info(f"✅ WebSocket connected for {stadium_id} (total: {len(self.active_connections[stadium_id])})")
    
    def disconnect(self, websocket: WebSocket, stadium_id: str):
        """Remove WebSocket connection"""
        if stadium_id in self.active_connections:
            self.active_connections[stadium_id].remove(websocket)
            logger.info(f"❌ WebSocket disconnected for {stadium_id} (remaining: {len(self.active_connections[stadium_id])})")
    
    async def broadcast(self, stadium_id: str, data: dict):
        """Broadcast data to all connected clients for a stadium"""
        if stadium_id not in self.active_connections:
            return
        
        dead_connections = []
        
        for connection in self.active_connections[stadium_id]:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")
                dead_connections.append(connection)
        
        # Clean up dead connections
        for connection in dead_connections:
            self.active_connections[stadium_id].remove(connection)


manager = ConnectionManager()


@app.websocket("/ws/gates")
async def websocket_endpoint(
    websocket: WebSocket,
    stadiumId: str = Query(default="AGADIR")
):
    """WebSocket endpoint for real-time gate updates"""
    await manager.connect(websocket, stadiumId)
    
    try:
        # Send initial data
        initial_data = await stream_processor.get_current_status(stadiumId)
        await websocket.send_json(initial_data)
        
        # Keep connection alive and listen for updates
        while True:
            try:
                # Wait for client ping or send updates
                data = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                
                # Client can send "refresh" to force update
                if data == "refresh":
                    current_data = await stream_processor.get_current_status(stadiumId)
                    await websocket.send_json(current_data)
                    
            except asyncio.TimeoutError:
                # Send periodic updates (every 5 seconds)
                current_data = await stream_processor.get_current_status(stadiumId)
                await websocket.send_json(current_data)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, stadiumId)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, stadiumId)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )
