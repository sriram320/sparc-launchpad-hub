"""
Base schemas that all other schemas extend.
"""
from datetime import datetime
from typing import Any, Optional, TypeVar, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BaseSchema(BaseModel):
    """Base schema for all schemas."""
    model_config = ConfigDict(from_attributes=True)


class BaseSchemaInDB(BaseSchema):
    """Base schema for database objects with ID and timestamps."""
    id: UUID
    created_at: datetime
    updated_at: datetime