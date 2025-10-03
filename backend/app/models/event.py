"""
Event model.
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import Base as BaseModel


class Event(Base, BaseModel):
    """Event model."""
    __tablename__ = "events"
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date_time = Column(DateTime(timezone=True), nullable=False)
    venue = Column(String(255), nullable=False)
    is_paid = Column(Boolean, default=False)
    price = Column(Integer, default=0)
    capacity = Column(Integer, nullable=False)
    cover_image_url = Column(String(512), nullable=True)
    
    # Foreign Keys
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationships
    created_by = relationship("User", back_populates="events")
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")