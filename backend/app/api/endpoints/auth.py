"""
Authentication API endpoints.
"""
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user, TokenPayload
from app.core.database import get_db
from app.crud import user
from app.models.user import UserRole
from app.schemas.user import User, UserCreate

router = APIRouter()


@router.get("/me", response_model=User)
async def read_user_me(
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get current user.
    """
    db_user = await user.get_by_email(db, email=current_user.email)
    
    if not db_user:
        # Create user if not exists
        user_in = UserCreate(
            name=current_user.username,
            email=current_user.email,
            role=UserRole.MEMBER,
        )
        db_user = await user.create(db, obj_in=user_in)
    
    return db_user