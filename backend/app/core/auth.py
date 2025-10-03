"""
Authentication utilities for AWS Cognito.
"""
import base64
import json
import time
from typing import Dict, Optional, Union

import httpx
import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2AuthorizationCodeBearer
import os
from jwt.algorithms import RSAAlgorithm
from pydantic import BaseModel

from app.core.config import settings

# Define security scheme for OAuth2 with Cognito
# Make oauth2 optional (auto_error=False) so we can fall back to dev auth via headers
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"https://{settings.COGNITO_DOMAIN}/oauth2/authorize",
    tokenUrl=f"https://{settings.COGNITO_DOMAIN}/oauth2/token",
    scopes={
        "openid": "OpenID scope",
        "email": "Email scope",
        "profile": "Profile scope",
    },
    auto_error=False,
)

# Cache for JWT public keys
jwk_keys: Dict = {}


async def get_cognito_jwk():
    """Get the JSON Web Key (JWK) for validating Cognito tokens."""
    global jwk_keys
    if not jwk_keys:
        async with httpx.AsyncClient() as client:
            keys_url = (
                f"https://cognito-idp.{settings.AWS_REGION}.amazonaws.com/"
                f"{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
            )
            response = await client.get(keys_url)
            jwk_keys = response.json()["keys"]
    return jwk_keys


class TokenPayload(BaseModel):
    """Model for JWT token payload."""
    sub: str
    exp: int
    iat: int
    iss: str
    client_id: str
    username: str
    email: Optional[str] = None
    cognito_groups: Optional[list] = None


async def decode_token(token: str) -> TokenPayload:
    """Decode and verify the JWT token."""
    # Get the header from token
    header = json.loads(
        base64.b64decode(token.split(".")[0] + "==").decode("utf-8")
    )
    
    # Get the kid (key ID)
    kid = header["kid"]
    
    # Get JWKs
    keys = await get_cognito_jwk()
    
    # Find the key matching kid
    key = next((k for k in keys if k["kid"] == kid), None)
    if not key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Key not found",
        )
    
    # Get public key
    public_key = RSAAlgorithm.from_jwk(json.dumps(key))
    
    # Validate token
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.COGNITO_CLIENT_ID,
            issuer=f"https://cognito-idp.{settings.AWS_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}",
        )
        
        # Check if token is expired
        if payload["exp"] < time.time():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token expired",
            )
        
        # Convert payload
        token_data = TokenPayload(
            sub=payload["sub"],
            exp=payload["exp"],
            iat=payload["iat"],
            iss=payload["iss"],
            client_id=payload["client_id"],
            username=payload.get("username", ""),
            email=payload.get("email", None),
            cognito_groups=payload.get("cognito:groups", []),
        )
        return token_data
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )


async def get_current_user(token: str = Depends(oauth2_scheme), request: Request = None) -> TokenPayload:
    """Get the current user from the token, or when in development allow a dev header-based user.

    If DEV_AUTH=true in environment and headers `x-dev-email` (required) are provided, build a
    TokenPayload from headers. This allows local development without Cognito.
    """
    # If a token is present, decode as usual
    if token:
        return await decode_token(token)

    # Dev auth fallback
    if os.getenv("DEV_AUTH", "false").lower() == "true" and request is not None:
        dev_email = request.headers.get("x-dev-email")
        if dev_email:
            dev_username = request.headers.get("x-dev-username", dev_email.split("@")[0])
            groups = request.headers.get("x-dev-groups", "").split(",") if request.headers.get("x-dev-groups") else []
            # Construct TokenPayload-like object
            token_data = TokenPayload(
                sub=dev_email,
                exp=2 ** 31 - 1,
                iat=0,
                iss="dev",
                client_id="dev",
                username=dev_username,
                email=dev_email,
                cognito_groups=[g.strip().lower() for g in groups if g.strip()],
            )
            return token_data

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials",
    )


def get_current_active_user(
    current_user: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    """Get the current active user."""
    return current_user


def get_current_host_user(
    current_user: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    """Get the current host user."""
    if "host" not in current_user.cognito_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Host role required",
        )
    return current_user


def get_current_admin_user(
    current_user: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    """Get the current admin user."""
    if "admin" not in current_user.cognito_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user