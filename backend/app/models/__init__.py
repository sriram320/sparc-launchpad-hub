"""
Import all models for easy access.
"""
# Use the declarative Base from core.database so Base.metadata is available
from app.core.database import Base
from app.models.blog import BlogPost
from app.models.event import Event
from app.models.gallery import Gallery
from app.models.registration import Registration, PaymentStatus
from app.models.user import User, UserRole

__all__ = [
    "Base",
    "User",
    "UserRole",
    "Event",
    "Registration",
    "PaymentStatus",
    "BlogPost",
    "Gallery",
]