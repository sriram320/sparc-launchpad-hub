"""Insert a test host user and a test event into the database.

Run inside the api container:
    python -m app.scripts.insert_test_event
"""
import asyncio
from datetime import datetime, timedelta
from uuid import UUID

from app.core.database import AsyncSessionLocal, engine
from app.models import User, Event
from app.models.user import UserRole


async def run():
    async with AsyncSessionLocal() as session:
        # Check for existing test host user via ORM select
        from sqlalchemy import select

        q = select(User).where(User.email == "test-host@example.com")
        res = await session.execute(q)
        existing_user = res.scalar_one_or_none()

        if existing_user:
            user_id = existing_user.id
            print(f"Found existing user id={user_id}")
        else:
            # create user via ORM
            new_user = User(
                name="Test Host",
                email="test-host@example.com",
                role=UserRole.HOST,
            )
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)
            user_id = new_user.id
            print(f"Created user id={user_id}")

        # Create a test event
        test_event = Event(
            title="Test Event (Inserted)",
            description="This is a test event inserted by a script.",
            date_time=datetime.utcnow() + timedelta(days=7),
            venue="Test Hall",
            is_paid=False,
            price=0,
            capacity=100,
            created_by_id=user_id,
        )
        session.add(test_event)
        await session.commit()
        await session.refresh(test_event)
        print(f"Inserted event id={test_event.id} title={test_event.title}")


if __name__ == "__main__":
    asyncio.run(run())
