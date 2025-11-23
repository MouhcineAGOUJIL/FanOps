import os
from pydantic_settings import BaseSettings
from typing import Optional

from pydantic import Field

class Settings(BaseSettings):
    # Azure Common
    AZURE_TENANT_ID: Optional[str] = None
    AZURE_CLIENT_ID: Optional[str] = None
    AZURE_CLIENT_SECRET: Optional[str] = None
    
    # Storage
    STORAGE_CONNECTION_STRING: str = Field(default="UseDevelopmentStorage=true", validation_alias="AzureWebJobsStorage")
    TABLE_NAME_GATES: str = "gatestatus"
    QUEUE_NAME_INFLOW: str = "gates-inflow"
    QUEUE_NAME_CONTROL: str = "gates-control"
    BLOB_CONTAINER_MODELS: str = "ml-models"
    
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"  # Use 3.5 to save costs
    OPENAI_MAX_TOKENS: int = 1500
    
    # AI Storage
    TABLE_NAME_AI_DECISIONS: str = "aidecisions"
    TABLE_NAME_AGENT_MEMORY: str = "agentmemory"
    TABLE_NAME_INVESTIGATION_LOGS: str = "investigationlogs"
    BLOB_CONTAINER_DECISION_TRACES: str = "decision-traces"
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "eu-north-1"
    SAGEMAKER_ENDPOINT_NAME: Optional[str] = None
    
    # ML
    MODEL_FILENAME: str = "wait_time_model.onnx"
    
    class Config:
        env_file = ".env"

settings = Settings()
