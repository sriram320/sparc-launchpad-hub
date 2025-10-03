"""
Import all schemas for easy access.
"""
from app.schemas.base import BaseSchema, BaseSchemaInDB
from app.schemas.blog import BlogPost, BlogPostCreate, BlogPostUpdate, BlogPostWithAuthor
from app.schemas.event import (
    Event, EventCreate, EventUpdate, EventWithRelations
)
from app.schemas.gallery import Gallery, GalleryCreate, GalleryWithUploader
from app.schemas.registration import (
    Registration, RegistrationCreate, RegistrationUpdate, RegistrationWithDetails
)
from app.schemas.user import User, UserCreate, UserUpdate

__all__ = [
    "BaseSchema",
    "BaseSchemaInDB",
    "User",
    "UserCreate",
    "UserUpdate",
    "Event",
    "EventCreate", 
    "EventUpdate",
        # Backwards-compat alias
        "EventWithCreator",
    "Registration",
    "RegistrationCreate",
    "RegistrationUpdate",
    "RegistrationWithDetails",
    "BlogPost",
    "BlogPostCreate",
    "BlogPostUpdate",
    "BlogPostWithAuthor",
    "Gallery",
    "GalleryCreate",
    "GalleryWithUploader",
]

# Backwards-compatibility: provide EventWithCreator name
EventWithCreator = EventWithRelations

# Ensure Pydantic forward refs are resolved for composed models
try:
    EventWithRelations.model_rebuild()
except Exception:
    pass

try:
    RegistrationWithDetails.model_rebuild()
except Exception:
    pass