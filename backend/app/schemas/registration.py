"""
Registration schemas.
"""
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID

from pydantic import Field

from app.models.registration import PaymentStatus
from app.schemas.base import BaseSchema, BaseSchemaInDB

if TYPE_CHECKING:
    # Avoid circular runtime imports
    from app.schemas.event import Event
    from app.schemas.user import User


class RegistrationBase(BaseSchema):
    """Base schema for registration data."""
    event_id: UUID
    user_id: UUID
    qr_code_url: Optional[str] = None
    payment_status: PaymentStatus = PaymentStatus.PENDING
    checkin_start: Optional[datetime] = None
    checkin_end: Optional[datetime] = None


class RegistrationCreate(BaseSchema):
    """Schema for creating a registration."""
    event_id: UUID


class RegistrationUpdate(BaseSchema):
    """Schema for updating a registration."""
    payment_status: Optional[PaymentStatus] = None
    checkin_start: Optional[datetime] = None
    checkin_end: Optional[datetime] = None


class RegistrationInDB(RegistrationBase, BaseSchemaInDB):
    """Schema for registration data stored in DB."""
    pass


class Registration(RegistrationInDB):
    """Schema for returning registration data."""
    pass


class RegistrationWithDetails(Registration):
    """Schema for returning registration data with event and user details."""
    event: "Event"
    user: "User"

try:
    RegistrationWithDetails.model_rebuild()
except Exception:
    pass