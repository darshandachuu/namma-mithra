"""
Category Model
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    default_severity = db.Column(db.Integer, default=20, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaints = db.relationship('Complaint', backref='category', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'default_severity': self.default_severity,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'complaint_count': self.complaints.count()
        }

    def __repr__(self):
        return f"<Category {self.name}>"
