"""
Configuration settings for monitoring service
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Azure Storage
    AZURE_STORAGE_CONNECTION_STRING: str = os.getenv(
        "AZURE_STORAGE_CONNECTION_STRING",
        "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
    )
    
    # Table names
    TABLE_NAME_GATES: str = "gatestatus"
    TABLE_NAME_AI_DECISIONS: str = "aidecisions"
    TABLE_NAME_INVESTIGATION_LOGS: str = "investigationlogs"
    
    # Default stadium
    STADIUM_ID: str = "AGADIR"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 5  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
