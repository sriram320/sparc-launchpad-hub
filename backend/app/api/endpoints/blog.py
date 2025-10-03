"""
Blog API endpoints.
"""
from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.auth import get_current_active_user, get_current_host_user, TokenPayload
from app.core.database import get_db
from app.models.blog import BlogPost
from app.models.user import User
from app.schemas.blog import BlogPost as BlogPostSchema
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostWithAuthor

router = APIRouter()


@router.post("", response_model=BlogPostSchema)
async def create_blog_post(
    post_in: BlogPostCreate,
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create new blog post (host only).
    """
    # Get the user directly
    user_query = select(User).where(User.email == current_user.email)
    result = await db.execute(user_query)
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Create blog post directly
    db_obj = BlogPost(
        title=post_in.title,
        content=post_in.content,
        author_id=db_user.id
    )
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


@router.get("", response_model=List[BlogPostWithAuthor])
async def read_blog_posts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get all blog posts (public).
    """
    query = (
        select(BlogPost)
        .options(joinedload(BlogPost.author))
        .order_by(BlogPost.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{id}", response_model=BlogPostWithAuthor)
async def read_blog_post(
    id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get blog post by ID (public).
    """
    # Get blog post with author directly
    query = (
        select(BlogPost)
        .options(joinedload(BlogPost.author))
        .where(BlogPost.id == id)
    )
    result = await db.execute(query)
    db_post = result.scalar_one_or_none()
    
    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found",
        )
    return db_post


@router.patch("/{id}", response_model=BlogPostSchema)
async def update_blog_post(
    post_in: BlogPostUpdate,
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update blog post (author/host only).
    """
    # Get blog post directly
    query = select(BlogPost).where(BlogPost.id == id)
    result = await db.execute(query)
    db_post = result.scalar_one_or_none()
    
    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found",
        )
    
    # Get the user directly
    user_query = select(User).where(User.email == current_user.email)
    result = await db.execute(user_query)
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check if user is author
    if db_post.author_id != db_user.id and "admin" not in current_user.cognito_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Update blog post directly
    update_data = post_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_post, field, value)
    
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post


@router.delete("/{id}", response_model=BlogPostSchema)
async def delete_blog_post(
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Delete blog post (author/host only).
    """
    # Get blog post directly
    query = select(BlogPost).where(BlogPost.id == id)
    result = await db.execute(query)
    db_post = result.scalar_one_or_none()
    
    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found",
        )
    
    # Get the user directly
    user_query = select(User).where(User.email == current_user.email)
    result = await db.execute(user_query)
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check if user is author
    if db_post.author_id != db_user.id and "admin" not in current_user.cognito_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Delete blog post directly
    await db.delete(db_post)
    await db.commit()
    return db_post