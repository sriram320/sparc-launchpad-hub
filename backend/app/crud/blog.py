"""
CRUD operations for blog posts.
"""
from typing import List, Optional, Dict, Any, Union
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.crud.base import CRUDBase
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate


class CRUDBlogPost(CRUDBase[BlogPost, BlogPostCreate, BlogPostUpdate]):
    """CRUD operations for blog posts."""
    
    async def get_with_author(
        self, db: AsyncSession, *, id: UUID
    ) -> Optional[BlogPost]:
        """
        Get a blog post by ID with author details.
        
        Args:
            db: Database session
            id: Blog post ID
            
        Returns:
            The blog post with author details if found, else None
        """
        query = (
            select(BlogPost)
            .options(joinedload(BlogPost.author))
            .where(BlogPost.id == id)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_multi_with_author(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[BlogPost]:
        """
        Get multiple blog posts with author details.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of blog posts with author details
        """
        query = (
            select(BlogPost)
            .options(joinedload(BlogPost.author))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_author(
        self, db: AsyncSession, *, author_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[BlogPost]:
        """
        Get blog posts by author.
        
        Args:
            db: Database session
            author_id: Author ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of blog posts by the author
        """
        query = (
            select(BlogPost)
            .where(BlogPost.author_id == author_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def create_with_author(
        self, db: AsyncSession, *, obj_in: BlogPostCreate, author_id: UUID
    ) -> BlogPost:
        """
        Create a new blog post with author.
        
        Args:
            db: Database session
            obj_in: Blog post create schema
            author_id: Author ID
            
        Returns:
            Created blog post
        """
        db_obj = BlogPost(
            title=obj_in.title,
            content=obj_in.content,
            author_id=author_id,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


blog_post = CRUDBlogPost(BlogPost)