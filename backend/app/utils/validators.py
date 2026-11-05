"""
Input Validation Utilities
CampusCare Platform
"""
import re
from email_validator import validate_email, EmailNotValidError

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB per image

def is_valid_email(email_str):
    if not email_str or not isinstance(email_str, str):
        return False, "Email address is required."
    try:
        valid = validate_email(email_str.strip(), check_deliverability=False)
        return True, valid.normalized
    except EmailNotValidError as e:
        return False, str(e)

def is_valid_password(password_str):
    if not password_str or not isinstance(password_str, str):
        return False, "Password cannot be empty."
    if len(password_str) < 6:
        return False, "Password must be at least 6 characters long."
    return True, None

def allowed_file(filename):
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def validate_image_file(file_storage):
    """
    Validates uploaded file: existence, filename extension, content type and size
    """
    if not file_storage or file_storage.filename == '':
        return False, "No file selected."
    
    if not allowed_file(file_storage.filename):
        return False, f"Unsupported file type. Only {', '.join(sorted(ALLOWED_EXTENSIONS)).upper()} images are allowed."
    
    # Read chunk to check size
    file_storage.seek(0, 2) # Seek to end
    file_size = file_storage.tell()
    file_storage.seek(0)    # Reset seek
    
    if file_size > MAX_FILE_SIZE:
        return False, f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE // (1024 * 1024)}MB."
        
    return True, None
