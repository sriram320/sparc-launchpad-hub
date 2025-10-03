"""
Base model that all other models inherit from.
"""
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID


class Base:
    """Base model with common attributes."""
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())