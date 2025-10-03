"""
QR Code generation utilities.
"""
import io
import json
import uuid
from typing import Dict, Optional

import qrcode
from fastapi import UploadFile

from app.core.storage import BucketName, upload_file_to_s3


async def generate_qrcode(
    data: Dict,
    bucket: BucketName = BucketName.QRCODES,
    object_name: Optional[str] = None,
) -> str:
    """
    Generate a QR code for the given data and upload to S3.
    
    Args:
        data: The data to encode in the QR code
        bucket: The S3 bucket to store the QR code
        object_name: The S3 object name for the QR code
    
    Returns:
        URL of the uploaded QR code
    """
    # Serialize data to JSON
    json_data = json.dumps(data)
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(json_data)
    qr.make(fit=True)
    
    # Create an image from the QR Code
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    
    # Create a FastAPI UploadFile
    filename = object_name or f"qrcode_{uuid.uuid4()}.png"
    file = UploadFile(
        filename=filename,
        file=img_byte_arr,
        content_type="image/png"
    )
    
    # Upload to S3
    return await upload_file_to_s3(
        file=file,
        bucket=bucket,
        object_name=filename,
        content_type="image/png",
    )