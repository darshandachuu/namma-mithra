"""
Image Upload & Storage Service
Handles manual photograph uploads for complaints:
- Validates JPG, JPEG, PNG, WEBP
- Generates safe UUID-based filenames
- Saves to backend uploads directory
- No AI or ML processing
CampusCare Platform
"""
import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
from flask import current_app
from app.extensions import db
from app.models.complaint_image import ComplaintImage
from app.utils.validators import validate_image_file

def save_complaint_image(file_storage, complaint_id):
    """
    Validates and stores an uploaded complaint photo.
    Returns: (success: bool, ComplaintImage or error_message)
    """
    is_valid, error = validate_image_file(file_storage)
    if not is_valid:
        return False, error

    try:
        # Create complaints upload directory if it does not exist
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'complaints')
        os.makedirs(upload_folder, exist_ok=True)

        original_filename = secure_filename(file_storage.filename)
        extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
        unique_name = f"comp_{complaint_id}_{uuid.uuid4().hex[:10]}.{extension}"
        destination_path = os.path.join(upload_folder, unique_name)

        # Open with PIL to verify integrity and re-save
        image = Image.open(file_storage.stream)
        # Convert RGBA to RGB if saving as JPEG
        if extension in ['jpg', 'jpeg'] and image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Save image (with reasonable optimization)
        image.save(destination_path, quality=85, optimize=True)

        file_size = os.path.getsize(destination_path)
        relative_url = f"/uploads/complaints/{unique_name}"

        # Persist record in database
        complaint_image = ComplaintImage(
            complaint_id=complaint_id,
            image_url=relative_url,
            file_name=original_filename,
            file_size=file_size
        )
        db.session.add(complaint_image)
        db.session.commit()

        return True, complaint_image

    except Exception as e:
        db.session.rollback()
        return False, f"Failed to process image: {str(e)}"
