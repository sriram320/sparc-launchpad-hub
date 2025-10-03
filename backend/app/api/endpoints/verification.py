"""
Authentication verification endpoints.
"""
import boto3
from botocore.exceptions import ClientError
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.config import settings

router = APIRouter()

# Initialize boto3 clients
cognito_client = boto3.client(
    'cognito-idp',
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

# Request models
class EmailVerificationRequest(BaseModel):
    email: EmailStr
    method: str = "email"

class PhoneVerificationRequest(BaseModel):
    phone: str
    method: str = "phone"

class VerifyCodeRequest(BaseModel):
    email: EmailStr = None
    phone: str = None
    code: str
    method: str

@router.post("/send-verification")
async def send_verification_code(request: Dict[str, Any]) -> Any:
    """
    Send verification code via email or phone.
    """
    try:
        method = request.get("method", "email")
        
        if method == "email":
            email = request.get("email")
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is required for email verification"
                )
                
            # Use Cognito to send verification code
            response = cognito_client.admin_create_user(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'false'},
                ],
                MessageAction='SUPPRESS'  # Don't send invitation email yet
            )
            
            # Now initiate auth to send verification code
            cognito_client.admin_initiate_auth(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                ClientId=settings.COGNITO_CLIENT_ID,
                AuthFlow='CUSTOM_AUTH',
                AuthParameters={
                    'USERNAME': email
                }
            )
            
            return {"message": "Verification code sent to email"}
            
        elif method == "phone":
            phone = request.get("phone")
            if not phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number is required for phone verification"
                )
                
            # Format phone number to E.164 format if needed
            if not phone.startswith('+'):
                phone = f"+{phone}"
                
            # Use Cognito to send verification code
            response = cognito_client.admin_create_user(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=phone,
                UserAttributes=[
                    {'Name': 'phone_number', 'Value': phone},
                    {'Name': 'phone_number_verified', 'Value': 'false'},
                ],
                MessageAction='SUPPRESS'  # Don't send invitation SMS yet
            )
            
            # Now initiate auth to send verification code
            cognito_client.admin_initiate_auth(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                ClientId=settings.COGNITO_CLIENT_ID,
                AuthFlow='CUSTOM_AUTH',
                AuthParameters={
                    'USERNAME': phone
                }
            )
            
            return {"message": "Verification code sent to phone"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification method"
            )
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code')
        if error_code == 'UsernameExistsException':
            # User already exists, just send verification code
            if method == "email":
                cognito_client.forgot_password(
                    ClientId=settings.COGNITO_CLIENT_ID,
                    Username=request.get("email")
                )
            else:
                cognito_client.forgot_password(
                    ClientId=settings.COGNITO_CLIENT_ID,
                    Username=request.get("phone")
                )
            return {"message": f"Verification code sent to {method}"}
        
        # Handle other AWS errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending verification code: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

@router.post("/verify-code")
async def verify_code(request: Dict[str, Any]) -> Any:
    """
    Verify code sent via email or phone.
    """
    try:
        method = request.get("method")
        code = request.get("code")
        
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code is required"
            )
            
        if method == "email":
            email = request.get("email")
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is required for email verification"
                )
                
            # Confirm the forgot password flow with the code
            cognito_client.confirm_forgot_password(
                ClientId=settings.COGNITO_CLIENT_ID,
                Username=email,
                ConfirmationCode=code,
                Password="TemporaryPassword123!"  # This will be changed later during normal login
            )
            
            return {"message": "Email verified successfully"}
            
        elif method == "phone":
            phone = request.get("phone")
            if not phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number is required for phone verification"
                )
                
            # Format phone number to E.164 format if needed
            if not phone.startswith('+'):
                phone = f"+{phone}"
                
            # Confirm the forgot password flow with the code
            cognito_client.confirm_forgot_password(
                ClientId=settings.COGNITO_CLIENT_ID,
                Username=phone,
                ConfirmationCode=code,
                Password="TemporaryPassword123!"  # This will be changed later during normal login
            )
            
            return {"message": "Phone verified successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification method"
            )
    except ClientError as e:
        # Handle AWS errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Verification failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )