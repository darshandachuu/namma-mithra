"""
Staff Routes
Handles maintenance staff task dashboard and status updates
CampusCare Platform
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.complaint import Complaint
from app.models.assignment import Assignment
from app.utils.response import success_response, error_response
from app.utils.decorators import get_current_user, staff_required
from app.services.complaint_service import update_status

staff_bp = Blueprint('staff', __name__, url_prefix='/api/staff')

@staff_bp.route('/complaints', methods=['GET'])
@jwt_required()
@staff_required
def get_assigned_complaints():
    user = get_current_user()
    status_filter = request.args.get('status')
    
    # Query assignments for this staff
    query = Complaint.query.join(Assignment, Complaint.id == Assignment.complaint_id).filter(Assignment.staff_id == user.id)
    
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
        
    complaints = query.order_by(Complaint.total_priority_score.desc(), Complaint.created_at.desc()).all()
    return success_response(data=[c.to_dict(current_user_id=user.id) for c in complaints])

@staff_bp.route('/complaints/<int:complaint_id>/status', methods=['PUT'])
@jwt_required()
@staff_required
def update_complaint_status(complaint_id):
    user = get_current_user()
    data = request.get_json() or {}
    new_status = data.get('status')
    remarks = data.get('remarks', '').strip()

    if not new_status:
        return error_response("Status field is required.", status_code=400)

    # Check assignment: staff must be assigned to this complaint
    assignment = Assignment.query.filter_by(complaint_id=complaint_id, staff_id=user.id).first()
    if not assignment:
        return error_response("You are not assigned to this complaint.", status_code=403)

    success, result = update_status(complaint_id, user.id, new_status, remarks)
    if not success:
        return error_response(result, status_code=400)

    return success_response(
        data=result.to_dict(current_user_id=user.id),
        message=f"Complaint #{complaint_id} status updated to {new_status}."
    )

@staff_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@staff_required
def get_staff_dashboard():
    user = get_current_user()
    
    query = Complaint.query.join(Assignment, Complaint.id == Assignment.complaint_id).filter(Assignment.staff_id == user.id)
    total_assigned = query.count()
    pending_tasks = query.filter(Complaint.status == 'assigned').count()
    in_progress_tasks = query.filter(Complaint.status == 'in_progress').count()
    resolved_tasks = query.filter(Complaint.status.in_(['resolved', 'closed'])).count()

    recent_assigned = query.order_by(Complaint.total_priority_score.desc()).limit(5).all()

    return success_response(data={
        'total_assigned': total_assigned,
        'pending_tasks': pending_tasks,
        'in_progress_tasks': in_progress_tasks,
        'resolved_tasks': resolved_tasks,
        'recent_tasks': [c.to_dict(current_user_id=user.id) for c in recent_assigned]
    })
