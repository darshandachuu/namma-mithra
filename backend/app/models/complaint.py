"""
Complaint Model
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    status = db.Column(
        db.Enum('pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected', name='complaint_status_types'),
        nullable=False,
        default='pending',
        index=True
    )

    # Priority Scores (Rule-based: 0-100 total)
    severity_score = db.Column(db.Integer, nullable=False, default=20)   # 0 to 40
    affected_score = db.Column(db.Integer, nullable=False, default=15)   # 0 to 30
    pending_score = db.Column(db.Integer, nullable=False, default=0)     # 0 to 20
    support_score = db.Column(db.Integer, nullable=False, default=0)     # 0 to 10
    total_priority_score = db.Column(db.Integer, nullable=False, default=35, index=True)
    priority_level = db.Column(
        db.Enum('Low', 'Medium', 'High', 'Critical', name='priority_levels'),
        nullable=False,
        default='Medium'
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    images = db.relationship('ComplaintImage', backref='complaint', lazy='dynamic', cascade="all, delete-orphan")
    supports = db.relationship('ComplaintSupport', backref='complaint', lazy='dynamic', cascade="all, delete-orphan")
    assignment = db.relationship('Assignment', backref='complaint', uselist=False, cascade="all, delete-orphan")
    status_history = db.relationship('StatusHistory', backref='complaint', lazy='dynamic', cascade="all, delete-orphan", order_by="StatusHistory.created_at.desc()")
    priority_history = db.relationship('ComplaintPriorityHistory', backref='complaint', lazy='dynamic', cascade="all, delete-orphan", order_by="ComplaintPriorityHistory.calculated_at.desc()")

    @property
    def support_count(self):
        return self.supports.count()

    def is_supported_by(self, user_id):
        if not user_id:
            return False
        return self.supports.filter_by(user_id=user_id).first() is not None

    def to_dict(self, current_user_id=None):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'Unknown',
            'location_id': self.location_id,
            'location_name': self.location.display_name if self.location else 'Unknown',
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else 'Unknown',
            'student_email': self.student.email if self.student else 'Unknown',
            'status': self.status,
            'priority': {
                'severity_score': self.severity_score,
                'affected_score': self.affected_score,
                'pending_score': self.pending_score,
                'support_score': self.support_score,
                'total_priority_score': self.total_priority_score,
                'priority_level': self.priority_level,
                'explanation': f"Severity ({self.severity_score}/40) + Affected Impact ({self.affected_score}/30) + Pending Duration ({self.pending_score}/20) + Support ({self.support_score}/10) = {self.total_priority_score}/100"
            },
            'support_count': self.support_count,
            'has_supported': self.is_supported_by(current_user_id) if current_user_id else False,
            'images': [img.to_dict() for img in self.images.all()],
            'assignment': self.assignment.to_dict() if self.assignment else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Complaint #{self.id} '{self.title}' [{self.status}] Score:{self.total_priority_score}>"
