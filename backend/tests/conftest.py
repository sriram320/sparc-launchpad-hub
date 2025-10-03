import asyncio
from typing import Generator, Any, AsyncGenerator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db, Base
from app.main import app
from app.core.config import settings

# Create a new database for testing
TEST_DATABASE_URL = str(settings.DATABASE_URI).replace("sparc_db", "test_sparc_db")
engine = create_async_engine(TEST_DATABASE_URL, echo=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

# Override the get_db dependency to use the test database
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get a database session.
    """
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    """
    Create the database tables before running tests, and drop them after.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fixture to get a database session for a test.
    """
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture(scope="module")
def client() -> Generator[TestClient, Any, None]:
    """
    Fixture to get a test client for the FastAPI app.
    """
    with TestClient(app) as c:
        yield c
