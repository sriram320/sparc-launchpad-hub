"""
User API endpoints.
"""
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user, TokenPayload
from app.core.database import get_db
from app.core.storage import BucketName, upload_file_to_s3
from app.crud import user
from app.schemas.user import User, UserUpdate

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return db_user


@router.patch("/me", response_model=User)
async def update_user_me(
    user_in: UserUpdate,
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update current user.
    """
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return await user.update(db=db, db_obj=db_user, obj_in=user_in)


@router.post("/me/avatar", response_model=User)
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Upload user avatar.
    """
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Upload avatar to S3
    avatar_url = await upload_file_to_s3(
        file=avatar,
        bucket=BucketName.PROFILEPICS,
        object_name=f"{db_user.id}/profile.{avatar.filename.split('.')[-1]}",
        content_type=avatar.content_type,
    )
    
    # Update user
    return await user.update(
        db=db, db_obj=db_user, obj_in={"profile_pic_url": avatar_url}
    )