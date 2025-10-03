"""
Social login configuration for the application.
"""
from pydantic import BaseSettings


class SocialLoginSettings(BaseSettings):
    """Social login configuration settings."""
    
    # Google OAuth settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    
    # Microsoft OAuth settings
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    MICROSOFT_REDIRECT_URI: str = ""
    
    class Config:
        env_file = ".env"


social_login_settings = SocialLoginSettings()