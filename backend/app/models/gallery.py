"""
Gallery model for image uploads.
"""
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import Base as BaseModel


class Gallery(Base, BaseModel):
    """Gallery model for image uploads."""
    __tablename__ = "gallery"
    
    image_url = Column(String(512), nullable=False)
    
    # Foreign Keys
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    uploaded_by = relationship("User", back_populates="gallery_uploads")