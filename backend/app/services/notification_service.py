"""
Notification Service
CampusCare Platform
"""
from app.extensions import db
from app.models.notification import Notification

def create_notification(user_id, title, message, notif_type='info', commit=True):
    """
    Creates an in-app notification record for a user.
    """
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            is_read=False
        )
        db.session.add(notif)
        if commit:
            db.session.commit()
        return notif
    except Exception as e:
        db.session.rollback()
        print(f"[Notification Service Error] {e}")
        return None
