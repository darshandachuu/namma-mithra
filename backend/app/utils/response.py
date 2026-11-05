"""
API Response Utility
Provides consistent REST API response formats
CampusCare Platform
"""
from flask import jsonify

def api_response(success=True, message="", data=None, errors=None, status_code=200):
    payload = {
        'success': success,
        'message': message,
        'data': data
    }
    if errors is not None:
        payload['errors'] = errors
        
    return jsonify(payload), status_code

def success_response(data=None, message="Operation successful", status_code=200):
    return api_response(success=True, message=message, data=data, status_code=status_code)

def error_response(message="An error occurred", errors=None, status_code=400):
    return api_response(success=False, message=message, errors=errors, status_code=status_code)
