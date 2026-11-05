"""
Status History Model
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class StatusHistory(db.Model):
    __tablename__ = 'status_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False, index=True)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    old_status = db.Column(db.String(50), nullable=False)
    new_status = db.Column(db.String(50), nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', foreign_keys=[changed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'changed_by': self.changed_by,
            'changed_by_name': self.user.full_name if self.user else 'System',
            'changed_by_role': self.user.role if self.user else 'System',
            'old_status': self.old_status,
            'new_status': self.new_status,
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<StatusHistory Complaint #{self.complaint_id}: {self.old_status} -> {self.new_status}>"
