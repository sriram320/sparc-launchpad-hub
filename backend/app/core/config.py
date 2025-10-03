"""
Configuration settings for the application.
"""
import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SPARC Club Web Platform"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str = ""
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    DATABASE_URI: Optional[str] = None

    @field_validator("DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        # For non-SQLite configurations
        try:
            db_url = PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=values.data.get("POSTGRES_USER"),
                password=values.data.get("POSTGRES_PASSWORD"),
                host=values.data.get("POSTGRES_SERVER"),
                path=f"{values.data.get('POSTGRES_DB') or ''}",
            )
            return str(db_url)
        except:
            # Use SQLite as fallback
            return "sqlite+aiosqlite:///./test.db"

    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = "test_access_key"
    AWS_SECRET_ACCESS_KEY: Optional[str] = "test_secret_key"
    
    # S3
    S3_BUCKET_GALLERY: str = "test-gallery"
    S3_BUCKET_QRCODES: str = "test-qrcodes"
    S3_BUCKET_PROFILEPICS: str = "test-profilepics"
    
    # Cognito
    COGNITO_USER_POOL_ID: str = "us-east-1_test"
    COGNITO_CLIENT_ID: str = "test_client_id"
    COGNITO_DOMAIN: str = "test-domain.auth.us-east-1.amazoncognito.com"
    
    # LocalStack
    LOCALSTACK_DOCKER_NAME: Optional[str] = None
    
    # Development Authentication (skip Cognito)
    DEV_AUTH: bool = False
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()