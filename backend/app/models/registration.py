"""
Registration model for event registrations.
"""
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SQLAEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import Base as BaseModel


class PaymentStatus(str, Enum):
    """Enum for payment status."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Registration(Base, BaseModel):
    """Registration model for events."""
    __tablename__ = "registrations"
    
    # Foreign Keys
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Registration details
    qr_code_url = Column(String(512), nullable=True)
    payment_status = Column(SQLAEnum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Attendance tracking
    checkin_start = Column(DateTime(timezone=True), nullable=True)
    checkin_end = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")