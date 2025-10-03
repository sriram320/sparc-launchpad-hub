"""
Blog post schemas.
"""
from typing import Optional
from uuid import UUID

from pydantic import Field

from app.schemas.base import BaseSchema, BaseSchemaInDB
from app.schemas.user import User


class BlogPostBase(BaseSchema):
    """Base schema for blog post data."""
    title: str
    content: str


class BlogPostCreate(BlogPostBase):
    """Schema for creating a blog post."""
    pass


class BlogPostUpdate(BaseSchema):
    """Schema for updating a blog post."""
    title: Optional[str] = None
    content: Optional[str] = None


class BlogPostInDB(BlogPostBase, BaseSchemaInDB):
    """Schema for blog post data stored in DB."""
    author_id: UUID


class BlogPost(BlogPostInDB):
    """Schema for returning blog post data."""
    pass


class BlogPostWithAuthor(BlogPost):
    """Schema for returning blog post data with author."""
    author: User