"""
Gallery API endpoints.
"""
from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user, get_current_host_user, TokenPayload
from app.core.database import get_db
from app.core.storage import BucketName, upload_file_to_s3
from app.crud import gallery, user
from app.schemas.gallery import Gallery, GalleryCreate, GalleryWithUploader

router = APIRouter()


@router.post("", response_model=Gallery)
async def upload_gallery_image(
    image: UploadFile = File(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Upload gallery image (host only).
    """
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Upload image to S3
    image_url = await upload_file_to_s3(
        file=image,
        bucket=BucketName.GALLERY,
        object_name=f"gallery/{db_user.id}/{image.filename}",
        content_type=image.content_type,
    )
    
    # Create gallery item
    gallery_in = GalleryCreate(image_url=image_url)
    return await gallery.create_with_uploader(
        db=db, obj_in=gallery_in, uploader_id=db_user.id
    )


@router.get("", response_model=List[GalleryWithUploader])
async def read_gallery_images(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get all gallery images (public).
    """
    return await gallery.get_multi_with_uploader(db=db, skip=skip, limit=limit)


@router.get("/{id}", response_model=GalleryWithUploader)
async def read_gallery_image(
    id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get gallery image by ID (public).
    """
    db_gallery = await gallery.get_with_uploader(db=db, id=id)
    if not db_gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery image not found",
        )
    return db_gallery


@router.delete("/{id}", response_model=Gallery)
async def delete_gallery_image(
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Delete gallery image (uploader/host only).
    """
    db_gallery = await gallery.get(db=db, id=id)
    if not db_gallery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery image not found",
        )
        
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check if user is uploader
    if db_gallery.uploaded_by_id != db_user.id and "admin" not in current_user.cognito_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return await gallery.remove(db=db, id=id)