"""
Registration API endpoints.
"""
import json
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user, get_current_host_user, TokenPayload
from app.core.database import get_db
from app.core.qrcode_utils import generate_qrcode
from app.core.storage import BucketName
from app.crud import event, registration, user
from app.models.registration import PaymentStatus
from app.schemas.registration import (
    Registration, RegistrationCreate, RegistrationUpdate, RegistrationWithDetails
)

router = APIRouter()


async def _generate_registration_qrcode(
    registration_id: UUID, event_id: UUID, user_id: UUID
) -> str:
    """Generate QR code for registration."""
    # Data to encode in QR code
    qr_data = {
        "registration_id": str(registration_id),
        "event_id": str(event_id),
        "user_id": str(user_id),
    }
    
    # Generate QR code and upload to S3
    return await generate_qrcode(
        data=qr_data,
        bucket=BucketName.QRCODES,
        object_name=f"registrations/{registration_id}.png",
    )


@router.post("/{event_id}/register", response_model=Registration)
async def register_for_event(
    background_tasks: BackgroundTasks,
    event_id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Register for an event.
    """
    # Check if event exists
    db_event = await event.get(db=db, id=event_id)
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Get user
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if already registered
    existing_registration = await registration.get_by_event_and_user(
        db=db, event_id=event_id, user_id=db_user.id
    )
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this event",
        )
    
    # Create registration
    registration_in = RegistrationCreate(event_id=event_id)
    new_registration = await registration.create_with_user(
        db=db, obj_in=registration_in, user_id=db_user.id
    )
    
    # Generate QR code in background
    background_tasks.add_task(
        _generate_registration_qrcode,
        registration_id=new_registration.id,
        event_id=event_id,
        user_id=db_user.id,
    )
    
    return new_registration


@router.get("/me", response_model=List[RegistrationWithDetails])
async def read_user_registrations(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get current user's registrations.
    """
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return await registration.get_by_user(
        db=db, user_id=db_user.id, skip=skip, limit=limit
    )


@router.get("/{id}", response_model=RegistrationWithDetails)
async def read_registration(
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get registration by ID.
    """
    db_user = await user.get_by_email(db, email=current_user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    db_registration = await registration.get_with_details(db=db, id=id)
    if not db_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found",
        )
    
    # Check if user is authorized to view this registration
    if db_registration.user_id != db_user.id and "host" not in current_user.cognito_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return db_registration


@router.get("/event/{event_id}", response_model=List[RegistrationWithDetails])
async def read_event_registrations(
    event_id: UUID = Path(...),
    skip: int = 0,
    limit: int = 100,
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get registrations for an event (host only).
    """
    # Check if event exists
    db_event = await event.get(db=db, id=event_id)
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    return await registration.get_by_event(
        db=db, event_id=event_id, skip=skip, limit=limit
    )


@router.patch("/{id}/update-payment", response_model=Registration)
async def update_payment_status(
    status: PaymentStatus,
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update payment status (host only).
    """
    db_registration = await registration.get(db=db, id=id)
    if not db_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found",
        )
    
    return await registration.update_payment_status(
        db=db, db_obj=db_registration, status=status
    )


@router.patch("/{id}/checkin-start", response_model=Registration)
async def mark_checkin_start(
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Mark check-in start time (host only).
    """
    db_registration = await registration.get(db=db, id=id)
    if not db_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found",
        )
    
    return await registration.mark_checkin_start(db=db, db_obj=db_registration)


@router.patch("/{id}/checkin-end", response_model=Registration)
async def mark_checkin_end(
    id: UUID = Path(...),
    current_user: TokenPayload = Depends(get_current_host_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Mark check-in end time (host only).
    """
    db_registration = await registration.get(db=db, id=id)
    if not db_registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found",
        )
    
    return await registration.mark_checkin_end(db=db, db_obj=db_registration)