from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordBearer
import boto3
import os
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel, EmailStr
import random
import string
import logging
from datetime import datetime, timedelta
import json
import jwt

# Load environment variables
load_dotenv()

# Initialize router
router = APIRouter()

# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_COGNITO_USER_POOL_ID = os.getenv("AWS_COGNITO_USER_POOL_ID")
AWS_COGNITO_APP_CLIENT_ID = os.getenv("AWS_COGNITO_APP_CLIENT_ID")
AWS_SES_SENDER_EMAIL = os.getenv("AWS_SES_SENDER_EMAIL", "noreply@sparclaunchpad.org")

# Initialize AWS clients
try:
    cognito = boto3.client('cognito-idp', 
                        region_name=AWS_REGION,
                        aws_access_key_id=AWS_ACCESS_KEY,
                        aws_secret_access_key=AWS_SECRET_KEY)
    
    ses = boto3.client('ses',
                    region_name=AWS_REGION,
                    aws_access_key_id=AWS_ACCESS_KEY,
                    aws_secret_access_key=AWS_SECRET_KEY)
    
    sns = boto3.client('sns',
                    region_name=AWS_REGION,
                    aws_access_key_id=AWS_ACCESS_KEY,
                    aws_secret_access_key=AWS_SECRET_KEY)
    
    logger.info("AWS clients initialized successfully")
except Exception as e:
    logger.error(f"Error initializing AWS clients: {str(e)}")
    # Initialize with None so the app can still start without AWS
    cognito = None
    ses = None
    sns = None

# Check if we're in development mode
DEV_MODE = os.getenv("ENVIRONMENT", "development") == "development"
MOCK_VERIFICATION = os.getenv("MOCK_VERIFICATION", "false").lower() == "true"

# Models
class VerificationRequest(BaseModel):
    method: str
    destination: str

class VerificationCodeRequest(BaseModel):
    method: str
    destination: str
    code: str

# In-memory store for development and testing
verification_codes = {}

# Helper functions
def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))

def send_email_verification(email: str, code: str):
    """Send verification code via email using AWS SES"""
    if DEV_MODE and MOCK_VERIFICATION:
        logger.info(f"DEV MODE: Mock email verification code {code} to {email}")
        verification_codes[email] = {
            "code": code,
            "expires_at": datetime.now() + timedelta(minutes=10)
        }
        return True
    
    try:
        if not ses:
            raise Exception("AWS SES client not initialized")
        
        response = ses.send_email(
            Source=AWS_SES_SENDER_EMAIL,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Your SPARC Verification Code'},
                'Body': {
                    'Text': {'Data': f'Your verification code is: {code}'},
                    'Html': {'Data': f'''
                        <html>
                            <body>
                                <h1>SPARC Club Verification</h1>
                                <p>Your verification code is: <strong>{code}</strong></p>
                                <p>This code will expire in 10 minutes.</p>
                            </body>
                        </html>
                    '''}
                }
            }
        )
        return True
    except Exception as e:
        logger.error(f"Error sending email verification: {str(e)}")
        return False

def send_sms_verification(phone_number: str, code: str):
    """Send verification code via SMS using AWS SNS"""
    if DEV_MODE and MOCK_VERIFICATION:
        logger.info(f"DEV MODE: Mock SMS verification code {code} to {phone_number}")
        verification_codes[phone_number] = {
            "code": code,
            "expires_at": datetime.now() + timedelta(minutes=10)
        }
        return True
    
    try:
        if not sns:
            raise Exception("AWS SNS client not initialized")
        
        # Format phone number if needed (should be in E.164 format)
        if not phone_number.startswith('+'):
            phone_number = f'+{phone_number}'
        
        response = sns.publish(
            PhoneNumber=phone_number,
            Message=f'Your SPARC verification code is: {code}',
            MessageAttributes={
                'AWS.SNS.SMS.SenderID': {
                    'DataType': 'String',
                    'StringValue': 'SPARC'
                }
            }
        )
        return True
    except Exception as e:
        logger.error(f"Error sending SMS verification: {str(e)}")
        return False

def verify_code_in_memory(destination: str, code: str):
    """Verify code from in-memory store (for development/testing)"""
    stored_data = verification_codes.get(destination)
    if not stored_data:
        return False
    
    if stored_data["code"] != code:
        return False
    
    if stored_data["expires_at"] < datetime.now():
        # Clean up expired code
        del verification_codes[destination]
        return False
    
    # Clean up used code
    del verification_codes[destination]
    return True

# Routes
@router.post("/send")
async def send_verification(req: VerificationRequest):
    """Send verification code via email or SMS"""
    method = req.method.lower()
    destination = req.destination
    
    if method not in ["email", "phone"]:
        raise HTTPException(status_code=400, detail="Invalid verification method")
    
    # Generate verification code
    code = generate_verification_code()
    
    # Send code via appropriate method
    if method == "email":
        success = send_email_verification(destination, code)
    else:  # phone
        success = send_sms_verification(destination, code)
    
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to send verification code via {method}")
    
    return {"success": True, "message": f"Verification code sent to your {method}"}

@router.post("/verify")
async def verify_code(req: VerificationCodeRequest):
    """Verify code sent via email or SMS"""
    method = req.method.lower()
    destination = req.destination
    code = req.code
    
    if method not in ["email", "phone"]:
        raise HTTPException(status_code=400, detail="Invalid verification method")
    
    # In development mode with mock verification, use in-memory verification
    if DEV_MODE and MOCK_VERIFICATION:
        if verify_code_in_memory(destination, code):
            return {"success": True, "message": "Verification successful"}
        else:
            raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # For production, implement verification logic using AWS Cognito or another service
    # This is a simplified example and should be expanded based on your actual verification flow
    try:
        # Here you would typically verify against your chosen auth service
        # For now, we'll use a mock verification
        if code == "123456" or (DEV_MODE and len(code) == 6):
            return {"success": True, "message": "Verification successful"}
        else:
            raise HTTPException(status_code=400, detail="Invalid verification code")
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify code")

@router.get("/check-email")
async def check_email_exists(email: str):
    """Check if an email already exists in the system"""
    try:
        if not cognito and DEV_MODE:
            # Mock response for development
            return {"exists": email.lower() in ["admin@example.com", "test@example.com"]}
        
        if not cognito:
            raise Exception("AWS Cognito client not initialized")
        
        # This tries to find a user with the given email
        # If found, it means the email exists
        response = cognito.list_users(
            UserPoolId=AWS_COGNITO_USER_POOL_ID,
            Filter=f'email = "{email}"',
            Limit=1
        )
        
        exists = len(response.get('Users', [])) > 0
        return {"exists": exists}
    except Exception as e:
        logger.error(f"Error checking email existence: {str(e)}")
        if DEV_MODE:
            return {"exists": False, "dev_mode": True}
        raise HTTPException(status_code=500, detail="Failed to check email existence")