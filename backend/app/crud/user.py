"""
CRUD operations for users.
"""
from typing import Optional, Union, Dict, Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD operations for users."""
    
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """
        Get a user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            The user if found, else None
        """
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            obj_in: User create schema
            
        Returns:
            Created user
        """
        db_obj = User(
            name=obj_in.name,
            email=obj_in.email,
            phone=obj_in.phone,
            branch=obj_in.branch,
            year=obj_in.year,
            role=obj_in.role,
            profile_pic_url=obj_in.profile_pic_url,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update(
        self, db: AsyncSession, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """
        Update a user.
        
        Args:
            db: Database session
            db_obj: User object to update
            obj_in: User update schema or dict with fields to update
            
        Returns:
            Updated user
        """
        return await super().update(db=db, db_obj=db_obj, obj_in=obj_in)


user = CRUDUser(User)