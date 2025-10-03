"""
API router for all endpoints.
"""
from fastapi import APIRouter

from app.api.endpoints import auth, blog, events, gallery, registrations, users
from app.routers import verification, social_login

api_router = APIRouter()

# Add all endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(verification.router, prefix="/auth/verification", tags=["auth", "verification"])
api_router.include_router(social_login.router, prefix="/auth", tags=["auth", "social-login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])