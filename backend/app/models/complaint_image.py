"""
Complaint Image Model
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class ComplaintImage(db.Model):
    __tablename__ = 'complaint_images'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False, index=True)
    image_url = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=True) # in bytes
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'image_url': self.image_url,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

    def __repr__(self):
        return f"<ComplaintImage #{self.id} for Complaint #{self.complaint_id}>"
