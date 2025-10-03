"""
Blog post model.
"""
from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import Base as BaseModel


class BlogPost(Base, BaseModel):
    """Blog post model."""
    __tablename__ = "blog_posts"
    
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    # Foreign Keys
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    author = relationship("User", back_populates="blog_posts")