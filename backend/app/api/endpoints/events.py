"""
Event API endpoints.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status, Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.auth import get_current_active_user, get_current_host_user, TokenPayload
from app.core.database import get_db
from app.core.storage import BucketName, upload_file_to_s3
from app.models.event import Event as EventModel
from app.models.user import User, UserRole
from app.models.registration import Registration as RegistrationModel
from app.schemas.event import Event, EventCreate, EventUpdate, EventWithRelations
from app.schemas.registration import Registration, RegistrationCreate, RegistrationUpdate
from app.schemas.user import User

router = APIRouter()


@router.post("", response_model=Event)
async def create_event(
    event_in: EventCreate,
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create new event (host only).
    """
    # Get user directly
    query = select(User).where(User.email == current_user.email)
    result = await db.execute(query)
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Create event directly
    db_obj = EventModel(
        title=event_in.title,
        description=event_in.description,
        date_time=event_in.date_time,
        venue=event_in.venue,
        is_paid=event_in.is_paid,
        price=event_in.price,
        capacity=event_in.capacity,
        cover_image_url=event_in.cover_image_url,
        created_by_id=db_user.id
    )
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


@router.get("", response_model=List[EventWithRelations])
async def read_events(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get all events (public).
    """
    # Get events with creator directly
    query = (
        select(EventModel)
        .options(
            joinedload(EventModel.created_by),
            joinedload(EventModel.registrations).joinedload(RegistrationModel.user),
        )
        .order_by(EventModel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    # When joinedload includes collection relationships the result may contain
    # duplicate parent rows; use unique() before scalars() to deduplicate.
    return result.unique().scalars().all()


@router.get("/{id}", response_model=EventWithRelations)
async def read_event(
    id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get event by ID (public).
    """
    # Get event with creator and registrations directly
    query = (
        select(EventModel)
        .options(joinedload(EventModel.created_by), joinedload(EventModel.registrations).joinedload(RegistrationModel.user))
        .where(EventModel.id == id)
    )
    result = await db.execute(query)
    db_event = result.scalar_one_or_none()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    return db_event


@router.post("/{event_id}/register", response_model=Registration)
async def register_for_event(
    event_id: UUID,
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Register current user for an event.
    """
    # Get user
    user_query = select(User).where(User.email == current_user.email)
    user_result = await db.execute(user_query)
    db_user = user_result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get event
    event_query = select(EventModel).where(EventModel.id == event_id)
    event_result = await db.execute(event_query)
    db_event = event_result.scalar_one_or_none()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already registered
    reg_query = select(RegistrationModel).where(
        RegistrationModel.event_id == event_id, RegistrationModel.user_id == db_user.id
    )
    reg_result = await db.execute(reg_query)
    existing_reg = reg_result.scalar_one_or_none()
    if existing_reg:
        raise HTTPException(status_code=400, detail="Already registered for this event")

    # Create registration
    new_reg = RegistrationModel(event_id=event_id, user_id=db_user.id)
    db.add(new_reg)
    await db.commit()
    await db.refresh(new_reg)
    return new_reg


@router.post("/{event_id}/attendance", response_model=Registration)
async def mark_attendance(
    event_id: UUID,
    user_id: UUID,
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a user's attendance for an event (host only).
    """
    # Verify host is the creator of the event or an admin
    event_query = select(EventModel).where(EventModel.id == event_id)
    event_result = await db.execute(event_query)
    db_event = event_result.scalar_one_or_none()
    
    host_user_query = select(User).where(User.email == current_user.email)
    host_user_result = await db.execute(host_user_query)
    db_host = host_user_result.scalar_one_or_none()

    if not db_event or not db_host:
        raise HTTPException(status_code=404, detail="Event or host not found")

    if db_event.created_by_id != db_host.id and db_host.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to mark attendance for this event")

    # Find the registration
    reg_query = select(RegistrationModel).where(
        RegistrationModel.event_id == event_id, RegistrationModel.user_id == user_id
    )
    reg_result = await db.execute(reg_query)
    db_reg = reg_result.scalar_one_or_none()

    if not db_reg:
        raise HTTPException(status_code=404, detail="User is not registered for this event")

    # Mark attendance (e.g., by setting a check-in time)
    if not db_reg.checkin_start:
        db_reg.checkin_start = datetime.utcnow()
        await db.commit()
        await db.refresh(db_reg)

    return db_reg


@router.patch("/{id}", response_model=Event)
async def update_event(
    event_in: EventUpdate,
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update event (host only).
    """
    # Get event
    query = select(EventModel).where(EventModel.id == id)
    result = await db.execute(query)
    db_event = result.scalar_one_or_none()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
        
    # Get user
    user_query = select(User).where(User.email == current_user.email)
    user_result = await db.execute(user_query)
    db_user = user_result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check ownership or admin role
    if db_event.created_by_id != db_user.id and db_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Update event directly
    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    await db.commit()
    await db.refresh(db_event)
    return db_event


@router.delete("/{id}", response_model=Event)
async def delete_event(
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Delete event (host only).
    """
    # Get event
    query = select(EventModel).where(EventModel.id == id)
    result = await db.execute(query)
    db_event = result.scalar_one_or_none()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Get user
    user_query = select(User).where(User.email == current_user.email)
    user_result = await db.execute(user_query)
    db_user = user_result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check ownership or admin role
    if db_event.created_by_id != db_user.id and db_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Delete event directly
    deleted_event = db_event
    await db.delete(db_event)
    await db.commit()
    return deleted_event


@router.post("/{id}/cover", response_model=Event)
async def upload_event_cover(
    cover_image: UploadFile = File(...),
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Upload event cover image (host only).
    """
    # Get event
    query = select(EventModel).where(EventModel.id == id)
    result = await db.execute(query)
    db_event = result.scalar_one_or_none()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Get user
    user_query = select(User).where(User.email == current_user.email)
    user_result = await db.execute(user_query)
    db_user = user_result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check ownership or admin role
    if db_event.created_by_id != db_user.id and db_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Upload cover image to S3
    cover_url = await upload_file_to_s3(
        file=cover_image,
        bucket=BucketName.GALLERY,
        object_name=f"events/{id}/cover.{cover_image.filename.split('.')[-1]}",
        content_type=cover_image.content_type,
    )
    
    # Update event directly
    db_event.cover_image_url = cover_url
    await db.commit()
    await db.refresh(db_event)
    return db_event


@router.patch("/{id}/toggle-paid", response_model=Event)
async def toggle_paid_status(
    is_paid: bool,
    price: Optional[int] = None,
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Toggle event paid status (host only).
    """
    # Get event
    query = select(EventModel).where(EventModel.id == id)
    result = await db.execute(query)
    db_event = result.scalar_one_or_none()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Get user
    user_query = select(User).where(User.email == current_user.email)
    user_result = await db.execute(user_query)
    db_user = user_result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    # Check ownership or admin role
    if db_event.created_by_id != db_user.id and db_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Toggle paid status directly
    db_event.is_paid = is_paid
    if is_paid and price is not None:
        db_event.price = price
    elif not is_paid:
        db_event.price = 0
        
    await db.commit()
    await db.refresh(db_event)
    return db_event