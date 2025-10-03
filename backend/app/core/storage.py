"""
AWS S3 utilities for file storage.
"""
import uuid
from enum import Enum
from typing import Optional

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


class BucketName(str, Enum):
    """Enum for S3 bucket names."""
    GALLERY = settings.S3_BUCKET_GALLERY
    QRCODES = settings.S3_BUCKET_QRCODES
    PROFILEPICS = settings.S3_BUCKET_PROFILEPICS


def get_s3_client():
    """Get a boto3 S3 client."""
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


async def upload_file_to_s3(
    file: UploadFile,
    bucket: BucketName,
    object_name: Optional[str] = None,
    content_type: Optional[str] = None,
) -> str:
    """
    Upload a file to an S3 bucket.
    
    Args:
        file: The file to upload
        bucket: Bucket to upload to
        object_name: S3 object name. If not specified, file.filename is used
        content_type: Content type of the file
    
    Returns:
        URL of the uploaded file
    """
    if not object_name:
        # Generate unique name if not provided
        suffix = file.filename.split(".")[-1] if "." in file.filename else ""
        object_name = f"{uuid.uuid4()}.{suffix}" if suffix else str(uuid.uuid4())
    
    # Get the file data
    file_data = await file.read()
    
    # Upload the file
    s3_client = get_s3_client()
    try:
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
        
        s3_client.put_object(
            Body=file_data,
            Bucket=bucket,
            Key=object_name,
            **extra_args
        )
        
        # Reset file read pointer
        await file.seek(0)
        
        # Return the URL
        return f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
    
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file to S3: {str(e)}",
        )


def create_presigned_url(
    bucket: BucketName, 
    object_name: str, 
    expiration: int = 3600,
    http_method: str = "PUT",
) -> str:
    """
    Generate a presigned URL for S3 operations.
    
    Args:
        bucket: The S3 bucket name
        object_name: The S3 object name
        expiration: Time in seconds for the URL to remain valid
        http_method: The HTTP method for the generated URL
    
    Returns:
        Presigned URL as string
    """
    s3_client = get_s3_client()
    try:
        return s3_client.generate_presigned_url(
            ClientMethod=f"{http_method.lower()}_object",
            Params={
                "Bucket": bucket,
                "Key": object_name,
            },
            ExpiresIn=expiration,
            HttpMethod=http_method.upper(),
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating presigned URL: {str(e)}",
        )


def generate_presigned_download_url(
    bucket: BucketName,
    object_name: str,
    expiration: int = 3600,
    response_content_type: Optional[str] = None,
) -> str:
    """
    Generate a presigned URL for downloading a file from S3.
    
    Args:
        bucket: The S3 bucket name
        object_name: The S3 object name
        expiration: Time in seconds for the URL to remain valid
        response_content_type: Content type to set in the response
    
    Returns:
        Presigned download URL as string
    """
    s3_client = get_s3_client()
    params = {
        "Bucket": bucket,
        "Key": object_name,
    }
    
    if response_content_type:
        params["ResponseContentType"] = response_content_type
    
    try:
        return s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params=params,
            ExpiresIn=expiration,
        )
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating presigned download URL: {str(e)}",
        )


def delete_s3_object(bucket: BucketName, object_name: str) -> bool:
    """
    Delete an object from S3.
    
    Args:
        bucket: The S3 bucket name
        object_name: The S3 object name
    
    Returns:
        True if object was deleted, else False
    """
    s3_client = get_s3_client()
    try:
        s3_client.delete_object(Bucket=bucket, Key=object_name)
        return True
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting object from S3: {str(e)}",
        )