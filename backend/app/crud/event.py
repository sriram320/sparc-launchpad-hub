"""
CRUD operations for events.
"""
from typing import List, Optional, Dict, Any, Union
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.crud.base import CRUDBase
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


class CRUDEvent(CRUDBase[Event, EventCreate, EventUpdate]):
    """CRUD operations for events."""
    
    async def get_with_creator(self, db: AsyncSession, *, id: UUID) -> Optional[Event]:
        """
        Get an event by ID with creator details.
        
        Args:
            db: Database session
            id: Event ID
            
        Returns:
            The event with creator details if found, else None
        """
        query = select(Event).options(joinedload(Event.created_by)).where(Event.id == id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_multi_with_creator(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Event]:
        """
        Get multiple events with creator details.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of events with creator details
        """
        query = (
            select(Event)
            .options(joinedload(Event.created_by))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_creator(
        self, db: AsyncSession, *, creator_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Event]:
        """
        Get events by creator.
        
        Args:
            db: Database session
            creator_id: Creator ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of events by the creator
        """
        query = (
            select(Event)
            .where(Event.created_by_id == creator_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    async def create_with_creator(
        self, db: AsyncSession, *, obj_in: EventCreate, creator_id: UUID
    ) -> Event:
        """
        Create a new event with creator.
        
        Args:
            db: Database session
            obj_in: Event create schema
            creator_id: Creator ID
            
        Returns:
            Created event
        """
        obj_in_data = obj_in.model_dump()
        db_obj = Event(**obj_in_data, created_by_id=creator_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def toggle_paid_status(
        self, db: AsyncSession, *, db_obj: Event, is_paid: bool, price: Optional[int] = None
    ) -> Event:
        """
        Toggle paid status of an event.
        
        Args:
            db: Database session
            db_obj: Event object
            is_paid: New paid status
            price: New price if provided
            
        Returns:
            Updated event
        """
        update_data = {"is_paid": is_paid}
        if price is not None:
            update_data["price"] = price
            
        return await super().update(db=db, db_obj=db_obj, obj_in=update_data)


event = CRUDEvent(Event)