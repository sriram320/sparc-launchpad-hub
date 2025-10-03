"""Utility script to create all tables from SQLAlchemy metadata.

Run inside the api container after the DB is available:
    python -m app.scripts.create_tables
"""
import asyncio

from app.core.database import engine
from app.models import Base


async def create_all():
    async with engine.begin() as conn:
        # run_sync will execute the synchronous metadata.create_all on the connection
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(create_all())
