"""
Administrator Routes
CampusCare Platform
Full control: assignment management, user management, category & location management, and reporting.
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.category import Category
from app.models.location import Location
from app.models.assignment import Assignment
from app.utils.response import success_response, error_response
from app.utils.decorators import get_current_user, admin_required
from app.utils.validators import is_valid_email, is_valid_password
from app.services.complaint_service import assign_complaint_to_staff

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ----------------- Assignments ----------------- #

@admin_bp.route('/assignments', methods=['POST'])
@jwt_required()
@admin_required
def assign_complaint():
    admin = get_current_user()
    data = request.get_json() or {}
    complaint_id = data.get('complaint_id')
    staff_id = data.get('staff_id')
    notes = data.get('notes', '').strip()

    if not complaint_id or not staff_id:
        return error_response("Both complaint_id and staff_id are required.", status_code=400)

    success, result = assign_complaint_to_staff(
        complaint_id=complaint_id,
        staff_id=staff_id,
        admin_id=admin.id,
        notes=notes
    )

    if not success:
        return error_response(result, status_code=400)

    return success_response(
        data=result.to_dict(current_user_id=admin.id),
        message="Complaint assigned successfully."
    )

# ----------------- Users Management ----------------- #

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def list_users():
    role_filter = request.args.get('role')
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    users = query.order_by(User.created_at.desc()).all()
    return success_response(data=[u.to_dict() for u in users])

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'student').lower()
    department = data.get('department', '').strip()
    phone = data.get('phone', '').strip()

    if not full_name:
        return error_response("Full name is required.", status_code=400)
    valid_email, email_res = is_valid_email(email)
    if not valid_email:
        return error_response(email_res, status_code=400)
    valid_pass, pass_err = is_valid_password(password)
    if not valid_pass:
        return error_response(pass_err, status_code=400)
    if role not in ['student', 'staff', 'admin']:
        return error_response("Invalid role specified.", status_code=400)

    if User.query.filter_by(email=email).first():
        return error_response("User with this email already exists.", status_code=409)

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

    return success_response(data=user.to_dict(), message="User created successfully.", status_code=201)

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found.", status_code=404)

    data = request.get_json() or {}
    if 'full_name' in data:
        user.full_name = data['full_name'].strip()
    if 'role' in data and data['role'] in ['student', 'staff', 'admin']:
        user.role = data['role']
    if 'department' in data:
        user.department = data['department'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()
    return success_response(data=user.to_dict(), message="User updated successfully.")

# ----------------- Category Management ----------------- #

@admin_bp.route('/categories', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    default_severity = data.get('default_severity', 20)

    if not name:
        return error_response("Category name is required.", status_code=400)

    if Category.query.filter_by(name=name).first():
        return error_response("Category already exists.", status_code=409)

    cat = Category(name=name, description=description, default_severity=default_severity)
    db.session.add(cat)
    db.session.commit()

    return success_response(data=cat.to_dict(), message="Category added.", status_code=201)

@admin_bp.route('/categories/<int:cat_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category(cat_id):
    cat = Category.query.get(cat_id)
    if not cat:
        return error_response("Category not found.", status_code=404)

    data = request.get_json() or {}
    if 'name' in data and data['name'].strip():
        cat.name = data['name'].strip()
    if 'description' in data:
        cat.description = data['description'].strip()
    if 'default_severity' in data:
        cat.default_severity = int(data['default_severity'])

    db.session.commit()
    return success_response(data=cat.to_dict(), message="Category updated.")

@admin_bp.route('/categories/<int:cat_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_category(cat_id):
    cat = Category.query.get(cat_id)
    if not cat:
        return error_response("Category not found.", status_code=404)
    if cat.complaints.count() > 0:
        return error_response("Cannot delete category with associated complaints.", status_code=400)

    db.session.delete(cat)
    db.session.commit()
    return success_response(message="Category deleted.")

# ----------------- Location Management ----------------- #

@admin_bp.route('/locations', methods=['POST'])
@jwt_required()
@admin_required
def create_location():
    data = request.get_json() or {}
    building_name = data.get('building_name', '').strip()
    block = data.get('block', '').strip()
    floor = data.get('floor', '').strip()
    room_number = data.get('room_number', '').strip()

    if not building_name:
        return error_response("Building name is required.", status_code=400)

    loc = Location(building_name=building_name, block=block, floor=floor, room_number=room_number)
    db.session.add(loc)
    db.session.commit()

    return success_response(data=loc.to_dict(), message="Location added.", status_code=201)

@admin_bp.route('/locations/<int:loc_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_location(loc_id):
    loc = Location.query.get(loc_id)
    if not loc:
        return error_response("Location not found.", status_code=404)

    data = request.get_json() or {}
    if 'building_name' in data and data['building_name'].strip():
        loc.building_name = data['building_name'].strip()
    if 'block' in data:
        loc.block = data['block'].strip()
    if 'floor' in data:
        loc.floor = data['floor'].strip()
    if 'room_number' in data:
        loc.room_number = data['room_number'].strip()

    db.session.commit()
    return success_response(data=loc.to_dict(), message="Location updated.")

@admin_bp.route('/locations/<int:loc_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_location(loc_id):
    loc = Location.query.get(loc_id)
    if not loc:
        return error_response("Location not found.", status_code=404)
    if loc.complaints.count() > 0:
        return error_response("Cannot delete location with associated complaints.", status_code=400)

    db.session.delete(loc)
    db.session.commit()
    return success_response(message="Location deleted.")

# ----------------- Reports & Metrics ----------------- #

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
@admin_required
def get_reports():
    total_complaints = Complaint.query.count()
    resolved_count = Complaint.query.filter(Complaint.status.in_(['resolved', 'closed'])).count()
    resolution_rate = round((resolved_count / total_complaints * 100), 1) if total_complaints > 0 else 0

    # Severity distribution
    severity_breakdown = {
        'Critical (80-100)': Complaint.query.filter(Complaint.priority_level == 'Critical').count(),
        'High (60-79)': Complaint.query.filter(Complaint.priority_level == 'High').count(),
        'Medium (35-59)': Complaint.query.filter(Complaint.priority_level == 'Medium').count(),
        'Low (0-34)': Complaint.query.filter(Complaint.priority_level == 'Low').count()
    }

    # Category performance
    categories = Category.query.all()
    cat_metrics = []
    for c in categories:
        c_total = c.complaints.count()
        c_resolved = c.complaints.filter(Complaint.status.in_(['resolved', 'closed'])).count()
        cat_metrics.append({
            'category_name': c.name,
            'total_complaints': c_total,
            'resolved_complaints': c_resolved,
            'pending_complaints': c_total - c_resolved
        })

    # Staff performance
    staff_users = User.query.filter_by(role='staff').all()
    staff_metrics = []
    for s in staff_users:
        tasks = Complaint.query.join(Assignment, Complaint.id == Assignment.complaint_id).filter(Assignment.staff_id == s.id)
        assigned_c = tasks.count()
        resolved_c = tasks.filter(Complaint.status.in_(['resolved', 'closed'])).count()
        staff_metrics.append({
            'staff_name': s.full_name,
            'email': s.email,
            'assigned': assigned_c,
            'resolved': resolved_c,
            'in_progress': tasks.filter(Complaint.status == 'in_progress').count()
        })

    return success_response(data={
        'total_complaints': total_complaints,
        'resolved_count': resolved_count,
        'resolution_rate': resolution_rate,
        'severity_breakdown': severity_breakdown,
        'category_metrics': cat_metrics,
        'staff_metrics': staff_metrics
    })
