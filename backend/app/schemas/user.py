"""
User schema models.
"""
from typing import Optional

from pydantic import EmailStr, Field

from app.models.user import UserRole
from app.schemas.base import BaseSchema, BaseSchemaInDB


class UserBase(BaseSchema):
    """Base schema for user data."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    role: UserRole = UserRole.MEMBER
    profile_pic_url: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    pass


class UserUpdate(BaseSchema):
    """Schema for updating a user."""
    name: Optional[str] = None
    phone: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    profile_pic_url: Optional[str] = None


class UserInDB(UserBase, BaseSchemaInDB):
    """Schema for user data stored in DB."""
    pass


class User(UserInDB):
    """Schema for returning user data."""
    pass