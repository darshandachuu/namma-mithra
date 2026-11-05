"""
Dashboard & Analytics Routes
CampusCare Platform
Provides aggregate statistics and chart data for dashboards
"""
from flask import Blueprint
from sqlalchemy import func
from app.extensions import db
from app.models.complaint import Complaint
from app.models.category import Category
from app.models.user import User
from app.utils.response import success_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    total_complaints = Complaint.query.count()
    pending = Complaint.query.filter(Complaint.status == 'pending').count()
    assigned = Complaint.query.filter(Complaint.status == 'assigned').count()
    in_progress = Complaint.query.filter(Complaint.status == 'in_progress').count()
    resolved = Complaint.query.filter(Complaint.status.in_(['resolved', 'closed'])).count()

    total_students = User.query.filter_by(role='student').count()
    total_staff = User.query.filter_by(role='staff').count()
    total_admins = User.query.filter_by(role='admin').count()

    critical_priority = Complaint.query.filter(Complaint.priority_level == 'Critical').count()
    high_priority = Complaint.query.filter(Complaint.priority_level == 'High').count()

    # Average priority score
    avg_score = db.session.query(func.avg(Complaint.total_priority_score)).scalar() or 0

    return success_response(data={
        'total_complaints': total_complaints,
        'pending': pending,
        'assigned': assigned,
        'in_progress': in_progress,
        'resolved': resolved,
        'users': {
            'total': total_students + total_staff + total_admins,
            'students': total_students,
            'staff': total_staff,
            'admins': total_admins
        },
        'critical_priority': critical_priority,
        'high_priority': high_priority,
        'average_priority_score': round(float(avg_score), 1)
    })

@dashboard_bp.route('/charts', methods=['GET'])
def get_charts_data():
    # 1. Status Breakdown
    statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']
    status_data = []
    for s in statuses:
        count = Complaint.query.filter_by(status=s).count()
        if count > 0 or s in ['pending', 'in_progress', 'resolved']:
            status_data.append({
                'name': s.replace('_', ' ').title(),
                'value': count
            })

    # 2. Category Distribution
    categories = Category.query.all()
    category_data = []
    for c in categories:
        category_data.append({
            'name': c.name,
            'complaints': c.complaints.count()
        })

    # 3. Priority Levels
    priority_levels = ['Critical', 'High', 'Medium', 'Low']
    priority_data = []
    for p in priority_levels:
        count = Complaint.query.filter_by(priority_level=p).count()
        priority_data.append({
            'name': p,
            'count': count
        })

    # 4. Recent Complaints
    recent = Complaint.query.order_by(Complaint.created_at.desc()).limit(6).all()
    recent_data = [c.to_dict() for c in recent]

    return success_response(data={
        'status_distribution': status_data,
        'category_distribution': category_data,
        'priority_distribution': priority_data,
        'recent_complaints': recent_data
    })
