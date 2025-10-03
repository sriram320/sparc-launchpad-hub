from fastapi import APIRouter, Depends, HTTPException, Request, Body
from fastapi.security import OAuth2PasswordBearer
import boto3
import os
from dotenv import load_dotenv
import requests
import jwt
from datetime import datetime, timedelta
import uuid
import logging
from typing import Optional
from pydantic import BaseModel
import json
from urllib.parse import urlencode

# Load environment variables
load_dotenv()

# Initialize router
router = APIRouter()

# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEV_MODE = ENVIRONMENT == "development"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION", "86400"))  # 24 hours

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", f"{FRONTEND_URL}/auth/google/callback")

# Microsoft OAuth
MS_CLIENT_ID = os.getenv("MS_CLIENT_ID")
MS_CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET")
MS_REDIRECT_URI = os.getenv("MS_REDIRECT_URI", f"{FRONTEND_URL}/auth/microsoft/callback")
MS_TENANT = os.getenv("MS_TENANT", "common")

# AWS Cognito
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_COGNITO_USER_POOL_ID = os.getenv("AWS_COGNITO_USER_POOL_ID")
AWS_COGNITO_APP_CLIENT_ID = os.getenv("AWS_COGNITO_APP_CLIENT_ID")

# Initialize AWS Cognito client
try:
    cognito = boto3.client('cognito-idp', 
                        region_name=AWS_REGION,
                        aws_access_key_id=AWS_ACCESS_KEY,
                        aws_secret_access_key=AWS_SECRET_KEY)
    
    logger.info("AWS Cognito client initialized successfully")
except Exception as e:
    logger.error(f"Error initializing AWS Cognito client: {str(e)}")
    cognito = None

# Models
class SocialAuthCallbackRequest(BaseModel):
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

# Helper functions
def create_jwt_token(user_data: dict) -> str:
    """Create JWT token for authenticated users"""
    payload = {
        "sub": user_data["sub"],
        "name": user_data.get("name", "User"),
        "email": user_data.get("email", ""),
        "picture": user_data.get("picture", ""),
        "role": user_data.get("role", "member"),
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def get_or_create_cognito_user(email: str, name: str, external_id: str, provider: str):
    """Get or create a user in Cognito"""
    if DEV_MODE and not cognito:
        # Mock user creation in dev mode
        logger.info(f"DEV MODE: Mock Cognito user creation for {email}")
        return {
            "sub": f"dev-{provider}-{uuid.uuid4()}",
            "email": email,
            "name": name,
            "picture": "https://ui-avatars.com/api/?name=" + name.replace(" ", "+"),
            "role": "member"
        }
        
    try:
        # Check if user exists in Cognito
        try:
            user_by_email = cognito.list_users(
                UserPoolId=AWS_COGNITO_USER_POOL_ID,
                Filter=f'email = "{email}"',
                Limit=1
            )
            
            if user_by_email.get('Users'):
                # User exists, get details
                user = user_by_email['Users'][0]
                
                # Extract user attributes
                attributes = {attr['Name']: attr['Value'] for attr in user['Attributes']}
                
                return {
                    "sub": attributes.get("sub"),
                    "email": attributes.get("email"),
                    "name": attributes.get("name", name),
                    "picture": attributes.get("picture", ""),
                    "role": "member"  # Role from Cognito groups would be fetched here in a real implementation
                }
        except Exception as e:
            logger.warning(f"Error finding user by email: {str(e)}")
        
        # User doesn't exist, create new user
        response = cognito.admin_create_user(
            UserPoolId=AWS_COGNITO_USER_POOL_ID,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "name", "Value": name},
                {"Name": f"identities", "Value": json.dumps([{
                    "userId": external_id,
                    "providerName": provider,
                    "providerType": "OIDC"
                }])}
            ]
        )
        
        # Extract user data
        user_data = {
            "sub": response['User']['Username'],
            "email": email,
            "name": name,
            "picture": "",  # Could be set if available from provider
            "role": "member"
        }
        
        # Add user to 'member' group
        try:
            cognito.admin_add_user_to_group(
                UserPoolId=AWS_COGNITO_USER_POOL_ID,
                Username=email,
                GroupName='member'
            )
        except Exception as e:
            logger.warning(f"Error adding user to member group: {str(e)}")
        
        return user_data
        
    except Exception as e:
        logger.error(f"Error in get_or_create_cognito_user: {str(e)}")
        raise

# Google OAuth Routes
@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth flow"""
    if not GOOGLE_CLIENT_ID and DEV_MODE:
        # Return a mock URL in dev mode
        logger.info("DEV MODE: Returning mock Google auth URL")
        return {"authorizationUrl": f"{FRONTEND_URL}/auth/mock-google-callback?code=dev-google-code"}
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Build authorization URL
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "response_type": "code",
        "access_type": "offline",
        "prompt": "select_account consent"
    }
    
    authorization_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
    return {"authorizationUrl": authorization_url}

@router.post("/google/callback")
async def google_callback(request: SocialAuthCallbackRequest):
    """Handle Google OAuth callback"""
    code = request.code
    
    if code == "dev-google-code" and DEV_MODE:
        # Mock successful authentication in dev mode
        logger.info("DEV MODE: Mocking Google OAuth callback")
        mock_user = {
            "sub": f"google-{uuid.uuid4()}",
            "email": "dev-user@gmail.com",
            "name": "Dev User",
            "picture": "https://ui-avatars.com/api/?name=Dev+User",
            "role": "member"
        }
        
        token = create_jwt_token(mock_user)
        return {
            "token": token,
            "user": mock_user
        }
    
    try:
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()
        
        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info_response.raise_for_status()
        user_info = user_info_response.json()
        
        # Get or create user in our system
        user_data = get_or_create_cognito_user(
            email=user_info["email"],
            name=user_info.get("name", ""),
            external_id=user_info["sub"],
            provider="Google"
        )
        
        # Create JWT token
        token = create_jwt_token(user_data)
        
        return {
            "token": token,
            "user": user_data
        }
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error during Google OAuth: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid authorization code")
    except Exception as e:
        logger.error(f"Error during Google OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")

# Microsoft OAuth Routes
@router.get("/microsoft/login")
async def microsoft_login():
    """Initiate Microsoft OAuth flow"""
    if not MS_CLIENT_ID and DEV_MODE:
        # Return a mock URL in dev mode
        logger.info("DEV MODE: Returning mock Microsoft auth URL")
        return {"authorizationUrl": f"{FRONTEND_URL}/auth/mock-microsoft-callback?code=dev-microsoft-code"}
    
    if not MS_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Microsoft OAuth not configured")
    
    # Build authorization URL
    params = {
        "client_id": MS_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": MS_REDIRECT_URI,
        "response_mode": "query",
        "scope": "openid email profile User.Read",
        "prompt": "select_account"
    }
    
    authorization_url = f"https://login.microsoftonline.com/{MS_TENANT}/oauth2/v2.0/authorize?{urlencode(params)}"
    return {"authorizationUrl": authorization_url}

@router.post("/microsoft/callback")
async def microsoft_callback(request: SocialAuthCallbackRequest):
    """Handle Microsoft OAuth callback"""
    code = request.code
    
    if code == "dev-microsoft-code" and DEV_MODE:
        # Mock successful authentication in dev mode
        logger.info("DEV MODE: Mocking Microsoft OAuth callback")
        mock_user = {
            "sub": f"microsoft-{uuid.uuid4()}",
            "email": "dev-user@outlook.com",
            "name": "Dev User",
            "picture": "https://ui-avatars.com/api/?name=Dev+User",
            "role": "member"
        }
        
        token = create_jwt_token(mock_user)
        return {
            "token": token,
            "user": mock_user
        }
    
    try:
        # Exchange code for token
        token_url = f"https://login.microsoftonline.com/{MS_TENANT}/oauth2/v2.0/token"
        token_data = {
            "client_id": MS_CLIENT_ID,
            "client_secret": MS_CLIENT_SECRET,
            "code": code,
            "redirect_uri": MS_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()
        
        # Decode id_token to get user info
        id_token = tokens["id_token"]
        # Note: In production, verify the token signature
        user_info = jwt.decode(id_token, options={"verify_signature": False})
        
        # Get additional user info from Microsoft Graph API
        graph_url = "https://graph.microsoft.com/v1.0/me"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        
        graph_response = requests.get(graph_url, headers=headers)
        graph_response.raise_for_status()
        graph_data = graph_response.json()
        
        # Get or create user in our system
        user_data = get_or_create_cognito_user(
            email=user_info["email"] if "email" in user_info else graph_data["userPrincipalName"],
            name=graph_data.get("displayName", ""),
            external_id=user_info["sub"] if "sub" in user_info else user_info["oid"],
            provider="Microsoft"
        )
        
        # Create JWT token
        token = create_jwt_token(user_data)
        
        return {
            "token": token,
            "user": user_data
        }
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error during Microsoft OAuth: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid authorization code")
    except Exception as e:
        logger.error(f"Error during Microsoft OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")