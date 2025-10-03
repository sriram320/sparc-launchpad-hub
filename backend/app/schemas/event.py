"""
Event schemas.
"""
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID

from pydantic import Field
from app.schemas.base import BaseSchema, BaseSchemaInDB

if TYPE_CHECKING:
    # Imports here are only for type checking to avoid circular runtime imports
    from app.schemas.user import User
    from app.schemas.registration import Registration


class EventBase(BaseSchema):
    """Base schema for event data."""
    title: str
    description: Optional[str] = None
    date_time: datetime
    venue: str
    is_paid: bool = False
    price: int = 0
    capacity: int
    cover_image_url: Optional[str] = None


class EventCreate(EventBase):
    """Schema for creating an event."""
    pass


class EventUpdate(BaseSchema):
    """Schema for updating an event."""
    title: Optional[str] = None
    description: Optional[str] = None
    date_time: Optional[datetime] = None
    venue: Optional[str] = None
    is_paid: Optional[bool] = None
    price: Optional[int] = None
    capacity: Optional[int] = None
    cover_image_url: Optional[str] = None


class EventInDB(EventBase, BaseSchemaInDB):
    """Schema for event data stored in DB."""
    created_by_id: UUID


class Event(EventInDB):
    """Schema for returning event data."""
    pass


class EventWithRelations(Event):
    """Schema for returning event data with creator and registrations."""
    created_by: "User"
    registrations: list["Registration"] = []

    class Config:
        orm_mode = True

# If using forward refs, ensure models are updated (for pydantic v1 compatibility)
try:
    EventWithRelations.model_rebuild()
except Exception:
    # Fallback for older/newer pydantic versions; ignore if not available
    pass

# Backwards compatibility: some modules import EventWithCreator
# so provide an alias to the newer EventWithRelations name here to
# avoid import-time errors and circular import issues.
EventWithCreator = EventWithRelations