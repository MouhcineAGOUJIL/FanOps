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
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    SAGEMAKER_ENDPOINT_NAME: Optional[str] = None
    
    # ML
    MODEL_FILENAME: str = "wait_time_model.onnx"
    
    class Config:
        env_file = ".env"

settings = Settings()
