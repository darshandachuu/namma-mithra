"""
Student Specific Routes
CampusCare Platform
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models.complaint import Complaint
from app.models.support import ComplaintSupport
from app.utils.response import success_response, error_response
from app.utils.decorators import get_current_user, student_required

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

@student_bp.route('/complaints', methods=['GET'])
@jwt_required()
@student_required
def get_my_complaints():
    user = get_current_user()
    status_filter = request.args.get('status')
    
    query = Complaint.query.filter_by(student_id=user.id)
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    complaints = query.order_by(Complaint.created_at.desc()).all()
    return success_response(data=[c.to_dict(current_user_id=user.id) for c in complaints])

@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@student_required
def get_student_dashboard():
    user = get_current_user()
    
    my_complaints = Complaint.query.filter_by(student_id=user.id)
    total_submitted = my_complaints.count()
    pending_count = my_complaints.filter(Complaint.status.in_(['pending', 'assigned'])).count()
    in_progress_count = my_complaints.filter_by(status='in_progress').count()
    resolved_count = my_complaints.filter(Complaint.status.in_(['resolved', 'closed'])).count()
    
    # Total community supports received across my complaints
    my_complaint_ids = [c.id for c in my_complaints.all()]
    total_supports_received = ComplaintSupport.query.filter(ComplaintSupport.complaint_id.in_(my_complaint_ids)).count() if my_complaint_ids else 0
    
    # Recent complaints
    recent = my_complaints.order_by(Complaint.created_at.desc()).limit(5).all()

    return success_response(data={
        'total_submitted': total_submitted,
        'pending_count': pending_count,
        'in_progress_count': in_progress_count,
        'resolved_count': resolved_count,
        'total_supports_received': total_supports_received,
        'recent_complaints': [c.to_dict(current_user_id=user.id) for c in recent]
    })
