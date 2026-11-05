"""
Complaint Support Model (Upvote / Me Too)
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class ComplaintSupport(db.Model):
    __tablename__ = 'complaint_supports'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    supported_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('complaint_id', 'user_id', name='uq_complaint_user_support'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'user_id': self.user_id,
            'supported_at': self.supported_at.isoformat() if self.supported_at else None
        }

    def __repr__(self):
        return f"<ComplaintSupport User #{self.user_id} -> Complaint #{self.complaint_id}>"
