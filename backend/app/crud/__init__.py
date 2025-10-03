"""
Import all CRUD modules for easy access.
"""
from app.crud.blog import blog_post
from app.crud.event import event
from app.crud.gallery import gallery
from app.crud.registration import registration
from app.crud.user import user

__all__ = [
    "user",
    "event",
    "registration",
    "blog_post",
    "gallery",
]