"""
Complaint Routes
Supports complaint listing, submission with photo uploads, details, similar issue lookup, and community supports.
CampusCare Platform
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.complaint import Complaint
from app.models.category import Category
from app.models.location import Location
from app.models.user import User
from app.utils.response import success_response, error_response
from app.utils.decorators import get_current_user, role_required
from app.services.complaint_service import create_new_complaint, support_complaint, unsupport_complaint
from app.services.duplicate_service import find_similar_complaints
from app.services.image_service import save_complaint_image

complaint_bp = Blueprint('complaints', __name__, url_prefix='/api/complaints')

@complaint_bp.route('', methods=['GET'])
def get_complaints():
    """
    List complaints with optional filtering by status, category, priority, and search keyword.
    Accessible to all users.
    """
    status_filter = request.args.get('status')
    category_id = request.args.get('category_id', type=int)
    location_id = request.args.get('location_id', type=int)
    priority_level = request.args.get('priority')
    search = request.args.get('search', '').strip()
    sort_by = request.args.get('sort_by', 'priority') # 'priority', 'newest', 'oldest'

    query = Complaint.query

    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category_id:
        query = query.filter(Complaint.category_id == category_id)
    if location_id:
        query = query.filter(Complaint.location_id == location_id)
    if priority_level:
        query = query.filter(Complaint.priority_level == priority_level)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Complaint.title.ilike(search_term)) |
            (Complaint.description.ilike(search_term))
        )

    # Sorting
    if sort_by == 'newest':
        query = query.order_by(Complaint.created_at.desc())
    elif sort_by == 'oldest':
        query = query.order_by(Complaint.created_at.asc())
    else: # default: priority score descending
        query = query.order_by(Complaint.total_priority_score.desc(), Complaint.created_at.desc())

    complaints = query.all()

    # Identify user if authenticated
    current_user_id = None
    try:
        user = get_current_user()
        if user:
            current_user_id = user.id
    except Exception:
        pass

    data = [c.to_dict(current_user_id=current_user_id) for c in complaints]
    return success_response(data=data)

@complaint_bp.route('', methods=['POST'])
@jwt_required()
def create_complaint():
    """
    Submit a new campus complaint.
    Accepts multipart/form-data (for direct image uploads) or JSON.
    """
    user = get_current_user()
    if not user:
        return error_response("User not authenticated", status_code=401)

    # Handle multipart or JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        category_id = request.form.get('category_id', type=int)
        location_id = request.form.get('location_id', type=int)
        severity_input = request.form.get('severity_score', type=int) or request.form.get('severity', 20)
        affected_input = request.form.get('affected_score', type=int) or request.form.get('affected', 15)
        images = request.files.getlist('images') or request.files.getlist('image')
    else:
        json_data = request.get_json() or {}
        title = json_data.get('title', '').strip()
        description = json_data.get('description', '').strip()
        category_id = json_data.get('category_id')
        location_id = json_data.get('location_id')
        severity_input = json_data.get('severity_score', 20)
        affected_input = json_data.get('affected_score', 15)
        images = []

    # Validations
    if not title:
        return error_response("Complaint title is required.", status_code=400)
    if not description:
        return error_response("Complaint description is required.", status_code=400)
    if not category_id or not Category.query.get(category_id):
        return error_response("A valid category must be selected.", status_code=400)
    if not location_id or not Location.query.get(location_id):
        return error_response("A valid location must be selected.", status_code=400)

    try:
        complaint = create_new_complaint(
            student_id=user.id,
            title=title,
            description=description,
            category_id=category_id,
            location_id=location_id,
            severity_input=severity_input,
            affected_input=affected_input
        )

        # Handle image files if provided
        uploaded_images = []
        for img_file in images:
            if img_file and img_file.filename:
                success, res = save_complaint_image(img_file, complaint.id)
                if success:
                    uploaded_images.append(res.to_dict())
                else:
                    print(f"[Image Upload Notice] {res}")

        response_data = complaint.to_dict(current_user_id=user.id)
        return success_response(
            data=response_data,
            message="Complaint registered successfully! Campus staff will review it.",
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to submit complaint: {str(e)}", status_code=500)

@complaint_bp.route('/<int:complaint_id>', methods=['GET'])
def get_complaint_details(complaint_id):
    """
    Retrieves full details for a single complaint, including:
    - Author information
    - Uploaded photographs
    - Assigned staff
    - Status history timeline
    - Priority calculation breakdown and history
    - Community support count
    """
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error_response("Complaint not found.", status_code=404)

    current_user_id = None
    try:
        user = get_current_user()
        if user:
            current_user_id = user.id
    except Exception:
        pass

    data = complaint.to_dict(current_user_id=current_user_id)
    data['status_history'] = [h.to_dict() for h in complaint.status_history.all()]
    data['priority_history'] = [p.to_dict() for p in complaint.priority_history.all()]

    return success_response(data=data)

@complaint_bp.route('/<int:complaint_id>/images', methods=['POST'])
@jwt_required()
def upload_complaint_photo(complaint_id):
    """
    Upload an additional photograph for an existing complaint.
    """
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error_response("Complaint not found.", status_code=404)

    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    # Only student owner, assigned staff, or admin can upload
    if user.role == 'student' and complaint.student_id != user.id:
        return error_response("You are not authorized to upload images for this complaint.", status_code=403)

    if 'image' not in request.files:
        return error_response("No image file provided in request.", status_code=400)

    file = request.files['image']
    success, res = save_complaint_image(file, complaint.id)
    if not success:
        return error_response(res, status_code=400)

    return success_response(data=res.to_dict(), message="Photograph uploaded successfully.")

@complaint_bp.route('/<int:complaint_id>/support', methods=['POST'])
@jwt_required()
def support_route(complaint_id):
    """
    Support (+1 / Upvote) an active complaint.
    Increases community support score and recalculates total priority!
    """
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    success, result = support_complaint(complaint_id, user.id)
    if not success:
        return error_response(result, status_code=400)

    return success_response(
        data=result.to_dict(current_user_id=user.id),
        message="Thank you! Your support was added and the complaint priority was updated."
    )

@complaint_bp.route('/<int:complaint_id>/support', methods=['DELETE'])
@jwt_required()
def unsupport_route(complaint_id):
    """
    Remove support vote from a complaint.
    """
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    success, result = unsupport_complaint(complaint_id, user.id)
    if not success:
        return error_response(result, status_code=400)

    return success_response(
        data=result.to_dict(current_user_id=user.id),
        message="Support vote removed."
    )

@complaint_bp.route('/duplicates', methods=['GET'])
def check_duplicates():
    """
    Finds active complaints with matching category and/or location.
    Enables students to find open issues and support them instead of re-reporting.
    """
    category_id = request.args.get('category_id', type=int)
    location_id = request.args.get('location_id', type=int)
    exclude_id = request.args.get('exclude_id', type=int)

    current_user_id = None
    try:
        user = get_current_user()
        if user:
            current_user_id = user.id
    except Exception:
        pass

    results = find_similar_complaints(
        category_id=category_id,
        location_id=location_id,
        exclude_complaint_id=exclude_id,
        current_user_id=current_user_id
    )

    return success_response(data=results)

@complaint_bp.route('/categories', methods=['GET'])
def list_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return success_response(data=[c.to_dict() for c in categories])

@complaint_bp.route('/locations', methods=['GET'])
def list_locations():
    locations = Location.query.order_by(Location.building_name.asc(), Location.room_number.asc()).all()
    return success_response(data=[l.to_dict() for l in locations])
