"""
Gallery schemas.
"""
from typing import Optional
from uuid import UUID

from pydantic import Field

from app.schemas.base import BaseSchema, BaseSchemaInDB
from app.schemas.user import User


class GalleryBase(BaseSchema):
    """Base schema for gallery data."""
    image_url: str
    uploaded_by_id: UUID


class GalleryCreate(BaseSchema):
    """Schema for creating a gallery item."""
    image_url: str


class GalleryInDB(GalleryBase, BaseSchemaInDB):
    """Schema for gallery data stored in DB."""
    pass


class Gallery(GalleryInDB):
    """Schema for returning gallery data."""
    pass


class GalleryWithUploader(Gallery):
    """Schema for returning gallery data with uploader."""
    uploaded_by: User