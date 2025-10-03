"""
Social login endpoints for Google and Microsoft authentication.
"""
import boto3
import jwt
import httpx
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.social_login import social_login_settings
from app.core.database import get_db
from app.crud import user
from app.models.user import UserRole
from app.schemas.user import UserCreate

router = APIRouter()

# Initialize boto3 client for Cognito
cognito_idp = boto3.client(
    'cognito-idp',
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

# Google OAuth endpoints
@router.get("/google/login")
async def google_login() -> RedirectResponse:
    """
    Initiate Google OAuth flow.
    """
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={social_login_settings.GOOGLE_CLIENT_ID}"
        "&response_type=code"
        f"&redirect_uri={social_login_settings.GOOGLE_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(google_auth_url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Handle Google OAuth callback.
    """
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": social_login_settings.GOOGLE_CLIENT_ID,
                    "client_secret": social_login_settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": social_login_settings.GOOGLE_REDIRECT_URI,
                },
            )
            token_data = token_response.json()
            
            # Verify and get user info from Google
            id_token = token_data["id_token"]
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            google_user = user_info_response.json()
            
            # Get user details from Google response
            email = google_user["email"]
            name = google_user.get("name", "")
            
            # Check if user exists in our database
            db_user = await user.get_by_email(db, email=email)
            
            if not db_user:
                # Create new user
                user_in = UserCreate(
                    name=name,
                    email=email,
                    role=UserRole.MEMBER,
                )
                db_user = await user.create(db, obj_in=user_in)
                
            # Use Cognito to generate JWT tokens
            # Create or update user in Cognito
            try:
                cognito_idp.admin_create_user(
                    UserPoolId=settings.COGNITO_USER_POOL_ID,
                    Username=email,
                    UserAttributes=[
                        {"Name": "email", "Value": email},
                        {"Name": "name", "Value": name},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                    MessageAction="SUPPRESS",  # Don't send welcome email
                )
            except cognito_idp.exceptions.UsernameExistsException:
                # User already exists in Cognito, update attributes
                cognito_idp.admin_update_user_attributes(
                    UserPoolId=settings.COGNITO_USER_POOL_ID,
                    Username=email,
                    UserAttributes=[
                        {"Name": "name", "Value": name},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                )
                
            # Set user password (required for admin_initiate_auth)
            # This is a temporary password that won't be used for actual login
            temp_password = "TemporaryPassword123!"
            cognito_idp.admin_set_user_password(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=email,
                Password=temp_password,
                Permanent=True,
            )
            
            # Get Cognito tokens
            auth_response = cognito_idp.admin_initiate_auth(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                ClientId=settings.COGNITO_CLIENT_ID,
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": temp_password,
                },
            )
            
            # Return tokens to the frontend
            return {
                "access_token": auth_response["AuthenticationResult"]["AccessToken"],
                "id_token": auth_response["AuthenticationResult"]["IdToken"],
                "refresh_token": auth_response["AuthenticationResult"]["RefreshToken"],
                "token_type": "Bearer",
                "expires_in": auth_response["AuthenticationResult"]["ExpiresIn"],
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}",
        )


# Microsoft OAuth endpoints
@router.get("/microsoft/login")
async def microsoft_login() -> RedirectResponse:
    """
    Initiate Microsoft OAuth flow.
    """
    microsoft_auth_url = (
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        f"?client_id={social_login_settings.MICROSOFT_CLIENT_ID}"
        "&response_type=code"
        f"&redirect_uri={social_login_settings.MICROSOFT_REDIRECT_URI}"
        "&scope=openid%20email%20profile%20User.Read"
    )
    return RedirectResponse(microsoft_auth_url)


@router.get("/microsoft/callback")
async def microsoft_callback(code: str, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Handle Microsoft OAuth callback.
    """
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                data={
                    "client_id": social_login_settings.MICROSOFT_CLIENT_ID,
                    "client_secret": social_login_settings.MICROSOFT_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": social_login_settings.MICROSOFT_REDIRECT_URI,
                },
            )
            token_data = token_response.json()
            
            # Get user info from Microsoft Graph API
            user_info_response = await client.get(
                "https://graph.microsoft.com/v1.0/me",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            ms_user = user_info_response.json()
            
            # Get user details from Microsoft response
            email = ms_user.get("mail") or ms_user.get("userPrincipalName")
            name = ms_user.get("displayName", "")
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not retrieve email from Microsoft account",
                )
                
            # Check if user exists in our database
            db_user = await user.get_by_email(db, email=email)
            
            if not db_user:
                # Create new user
                user_in = UserCreate(
                    name=name,
                    email=email,
                    role=UserRole.MEMBER,
                )
                db_user = await user.create(db, obj_in=user_in)
                
            # Use Cognito to generate JWT tokens
            # Create or update user in Cognito
            try:
                cognito_idp.admin_create_user(
                    UserPoolId=settings.COGNITO_USER_POOL_ID,
                    Username=email,
                    UserAttributes=[
                        {"Name": "email", "Value": email},
                        {"Name": "name", "Value": name},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                    MessageAction="SUPPRESS",  # Don't send welcome email
                )
            except cognito_idp.exceptions.UsernameExistsException:
                # User already exists in Cognito, update attributes
                cognito_idp.admin_update_user_attributes(
                    UserPoolId=settings.COGNITO_USER_POOL_ID,
                    Username=email,
                    UserAttributes=[
                        {"Name": "name", "Value": name},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                )
                
            # Set user password (required for admin_initiate_auth)
            # This is a temporary password that won't be used for actual login
            temp_password = "TemporaryPassword123!"
            cognito_idp.admin_set_user_password(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=email,
                Password=temp_password,
                Permanent=True,
            )
            
            # Get Cognito tokens
            auth_response = cognito_idp.admin_initiate_auth(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                ClientId=settings.COGNITO_CLIENT_ID,
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": temp_password,
                },
            )
            
            # Return tokens to the frontend
            return {
                "access_token": auth_response["AuthenticationResult"]["AccessToken"],
                "id_token": auth_response["AuthenticationResult"]["IdToken"],
                "refresh_token": auth_response["AuthenticationResult"]["RefreshToken"],
                "token_type": "Bearer",
                "expires_in": auth_response["AuthenticationResult"]["ExpiresIn"],
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Microsoft authentication failed: {str(e)}",
        )