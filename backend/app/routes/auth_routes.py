"""
Authentication Routes
Handles registration, login, profile, and logout
CampusCare Platform
"""
from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.utils.response import success_response, error_response
from app.utils.validators import is_valid_email, is_valid_password
from app.utils.decorators import get_current_user

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    department = data.get('department', '').strip()
    phone = data.get('phone', '').strip()
    role = data.get('role', 'student').lower()

    # Enforce role safety: public registration can only create 'student'
    if role not in ['student']:
        role = 'student'

    if not full_name:
        return error_response("Full name is required.", status_code=400)

    valid_email, email_res = is_valid_email(email)
    if not valid_email:
        return error_response(f"Invalid email: {email_res}", status_code=400)

    valid_pass, pass_err = is_valid_password(password)
    if not valid_pass:
        return error_response(pass_err, status_code=400)

    # Check existing user
    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists.", status_code=409)

    user = User(
        full_name=full_name,
        email=email,
        role=role,
        department=department or None,
        phone=phone or None,
        is_active=True
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return success_response(
        data={
            'user': user.to_dict(),
            'token': token
        },
        message="Registration successful. Welcome to CampusCare!",
        status_code=201
    )

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return error_response("Email and password are required.", status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password.", status_code=401)

    if not user.is_active:
        return error_response("This account has been deactivated. Please contact campus admin.", status_code=403)

    token = create_access_token(identity=str(user.id))

    return success_response(
        data={
            'user': user.to_dict(),
            'token': token
        },
        message=f"Welcome back, {user.full_name}!"
    )

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = get_current_user()
    if not user:
        return error_response("User not found.", status_code=404)
    return success_response(data=user.to_dict())

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user()
    if not user:
        return error_response("User not found.", status_code=404)

    data = request.get_json() or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'department' in data:
        user.department = data['department'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()

    # Optional password change
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    if new_password:
        if not current_password or not user.check_password(current_password):
            return error_response("Current password is incorrect.", status_code=400)
        valid_pass, pass_err = is_valid_password(new_password)
        if not valid_pass:
            return error_response(pass_err, status_code=400)
        user.set_password(new_password)

    db.session.commit()
    return success_response(data=user.to_dict(), message="Profile updated successfully.")

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return success_response(message="Logged out successfully.")
