"""
Assignment Model
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assigner = db.relationship('User', foreign_keys=[assigned_by])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'staff_id': self.staff_id,
            'staff_name': self.staff.full_name if self.staff else 'Unknown',
            'staff_email': self.staff.email if self.staff else 'Unknown',
            'assigned_by': self.assigned_by,
            'assigned_by_name': self.assigner.full_name if self.assigner else 'Unknown',
            'notes': self.notes,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Assignment Complaint #{self.complaint_id} -> Staff #{self.staff_id}>"
