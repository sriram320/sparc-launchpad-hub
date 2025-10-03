"""
User model for the application.
"""
from enum import Enum

from sqlalchemy import Column, Enum as SQLAEnum, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import Base as BaseModel


class UserRole(str, Enum):
    """Enum for user roles."""
    MEMBER = "member"
    HOST = "host"
    ADMIN = "admin"


class User(Base, BaseModel):
    """User model."""
    __tablename__ = "users"
    
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=True)
    branch = Column(String(100), nullable=True)
    year = Column(String(10), nullable=True)
    role = Column(SQLAEnum(UserRole), nullable=False, default=UserRole.MEMBER)
    profile_pic_url = Column(String(512), nullable=True)
    
    # Relationships
    events = relationship("Event", back_populates="created_by")
    registrations = relationship("Registration", back_populates="user")
    blog_posts = relationship("BlogPost", back_populates="author")
    gallery_uploads = relationship("Gallery", back_populates="uploaded_by")