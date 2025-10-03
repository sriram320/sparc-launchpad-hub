"""
CRUD operations for registrations.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.crud.base import CRUDBase
from app.models.registration import Registration, PaymentStatus
from app.schemas.registration import RegistrationCreate, RegistrationUpdate


class CRUDRegistration(CRUDBase[Registration, RegistrationCreate, RegistrationUpdate]):
    """CRUD operations for registrations."""
    
    async def get_with_details(
        self, db: AsyncSession, *, id: UUID
    ) -> Optional[Registration]:
        """
        Get a registration by ID with event and user details.
        
        Args:
            db: Database session
            id: Registration ID
            
        Returns:
            The registration with details if found, else None
        """
        query = (
            select(Registration)
            .options(joinedload(Registration.event), joinedload(Registration.user))
            .where(Registration.id == id)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_event_and_user(
        self, db: AsyncSession, *, event_id: UUID, user_id: UUID
    ) -> Optional[Registration]:
        """
        Get a registration by event and user.
        
        Args:
            db: Database session
            event_id: Event ID
            user_id: User ID
            
        Returns:
            The registration if found, else None
        """
        query = (
            select(Registration)
            .where(Registration.event_id == event_id, Registration.user_id == user_id)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_user(
        self, db: AsyncSession, *, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Registration]:
        """
        Get registrations by user.
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of registrations by the user
        """
        query = (
            select(Registration)
            .options(joinedload(Registration.event))
            .where(Registration.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_event(
        self, db: AsyncSession, *, event_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Registration]:
        """
        Get registrations by event.
        
        Args:
            db: Database session
            event_id: Event ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of registrations for the event
        """
        query = (
            select(Registration)
            .options(joinedload(Registration.user))
            .where(Registration.event_id == event_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def create_with_user(
        self, db: AsyncSession, *, obj_in: RegistrationCreate, user_id: UUID
    ) -> Registration:
        """
        Create a new registration for a user.
        
        Args:
            db: Database session
            obj_in: Registration create schema
            user_id: User ID
            
        Returns:
            Created registration
        """
        db_obj = Registration(
            event_id=obj_in.event_id,
            user_id=user_id,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update_payment_status(
        self, db: AsyncSession, *, db_obj: Registration, status: PaymentStatus
    ) -> Registration:
        """
        Update payment status of a registration.
        
        Args:
            db: Database session
            db_obj: Registration object
            status: New payment status
            
        Returns:
            Updated registration
        """
        return await super().update(
            db=db, db_obj=db_obj, obj_in={"payment_status": status}
        )
    
    async def mark_checkin_start(
        self, db: AsyncSession, *, db_obj: Registration
    ) -> Registration:
        """
        Mark the start time of attendance.
        
        Args:
            db: Database session
            db_obj: Registration object
            
        Returns:
            Updated registration
        """
        return await super().update(
            db=db, db_obj=db_obj, obj_in={"checkin_start": datetime.now()}
        )
    
    async def mark_checkin_end(
        self, db: AsyncSession, *, db_obj: Registration
    ) -> Registration:
        """
        Mark the end time of attendance.
        
        Args:
            db: Database session
            db_obj: Registration object
            
        Returns:
            Updated registration
        """
        return await super().update(
            db=db, db_obj=db_obj, obj_in={"checkin_end": datetime.now()}
        )


registration = CRUDRegistration(Registration)