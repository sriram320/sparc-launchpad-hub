"""
CRUD operations for gallery items.
"""
from typing import List, Optional, Dict, Any, Union
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.crud.base import CRUDBase
from app.models.gallery import Gallery
from app.schemas.gallery import GalleryCreate


class CRUDGallery(CRUDBase[Gallery, GalleryCreate, Any]):
    """CRUD operations for gallery items."""
    
    async def get_with_uploader(
        self, db: AsyncSession, *, id: UUID
    ) -> Optional[Gallery]:
        """
        Get a gallery item by ID with uploader details.
        
        Args:
            db: Database session
            id: Gallery item ID
            
        Returns:
            The gallery item with uploader details if found, else None
        """
        query = (
            select(Gallery)
            .options(joinedload(Gallery.uploaded_by))
            .where(Gallery.id == id)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_multi_with_uploader(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Gallery]:
        """
        Get multiple gallery items with uploader details.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of gallery items with uploader details
        """
        query = (
            select(Gallery)
            .options(joinedload(Gallery.uploaded_by))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def create_with_uploader(
        self, db: AsyncSession, *, obj_in: GalleryCreate, uploader_id: UUID
    ) -> Gallery:
        """
        Create a new gallery item with uploader.
        
        Args:
            db: Database session
            obj_in: Gallery item create schema
            uploader_id: Uploader ID
            
        Returns:
            Created gallery item
        """
        db_obj = Gallery(
            image_url=obj_in.image_url,
            uploaded_by_id=uploader_id,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


gallery = CRUDGallery(Gallery)