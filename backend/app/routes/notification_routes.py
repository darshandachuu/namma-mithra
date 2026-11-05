"""
Notification Routes
CampusCare Platform
"""
from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.notification import Notification
from app.utils.response import success_response, error_response
from app.utils.decorators import get_current_user

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_user_notifications():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    notifs = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).all()
    return success_response(data=[n.to_dict() for n in notifs])

@notification_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return success_response(data={'unread_count': count})

@notification_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(notif_id):
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    notif = Notification.query.filter_by(id=notif_id, user_id=user.id).first()
    if not notif:
        return error_response("Notification not found.", status_code=404)

    notif.is_read = True
    db.session.commit()
    return success_response(data=notif.to_dict(), message="Marked as read.")

@notification_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", status_code=401)

    Notification.query.filter_by(user_id=user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return success_response(message="All notifications marked as read.")
