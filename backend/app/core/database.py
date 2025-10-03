"""
Database session management and SQLAlchemy setup
"""
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Determine which database URI to use
database_uri = os.getenv("DATABASE_URI", str(settings.DATABASE_URI))

# Create async engine
engine = create_async_engine(database_uri, echo=True)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    """Yield a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise