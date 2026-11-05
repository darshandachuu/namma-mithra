"""
Authentication and Role-Based Authorization Decorators
CampusCare Platform
"""
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User
from app.utils.response import error_response

def get_current_user():
    """Helper to retrieve active User object from current JWT identity"""
    user_id = get_jwt_identity()
    if not user_id:
        return None
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return None
    return User.query.get(user_id)

def role_required(allowed_roles):
    """
    Decorator to restrict route access to users with specified roles.
    allowed_roles: list or tuple of role strings e.g. ['admin', 'staff']
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            if not user:
                return error_response("User account not found or token invalid.", status_code=401)
            if not user.is_active:
                return error_response("Account has been deactivated. Please contact administrator.", status_code=403)
            if user.role not in allowed_roles:
                return error_response(f"Access denied. Requires one of roles: {', '.join(allowed_roles)}.", status_code=403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def student_required(fn):
    return role_required(['student'])(fn)

def staff_required(fn):
    return role_required(['staff'])(fn)

def admin_required(fn):
    return role_required(['admin'])(fn)

def staff_or_admin_required(fn):
    return role_required(['staff', 'admin'])(fn)

def any_authenticated_user(fn):
    return role_required(['student', 'staff', 'admin'])(fn)
