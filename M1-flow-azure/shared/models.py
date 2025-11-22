from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class GateMeasurement(BaseModel):
    stadiumId: str
    gateId: str
    ts: str  # ISO format string
    perMinuteCount: int
    avgProcessingTime: float
    queueLength: int

class GateStatus(BaseModel):
    stadiumId: str
    gateId: str
    wait: float
    state: str  # "green", "yellow", "red"
    last_updated: str
    recommendation: Optional[str] = None
    anomaly: bool = False
    anomalyScore: Optional[float] = None

class StadiumStatus(BaseModel):
    stadiumId: str
    gates: List[GateStatus]
    global_recommendation: Optional[str] = None
