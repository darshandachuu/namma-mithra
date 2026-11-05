"""
Complaint Priority History Model
Tracks how and why a complaint's priority score changed over time
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class ComplaintPriorityHistory(db.Model):
    __tablename__ = 'complaint_priority_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False, index=True)
    severity_score = db.Column(db.Integer, nullable=False)
    affected_score = db.Column(db.Integer, nullable=False)
    pending_score = db.Column(db.Integer, nullable=False)
    support_score = db.Column(db.Integer, nullable=False)
    total_priority_score = db.Column(db.Integer, nullable=False)
    priority_level = db.Column(db.String(20), nullable=False)
    trigger_event = db.Column(db.String(100), nullable=True) # creation, community_support, pending_escalation, status_update
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'severity_score': self.severity_score,
            'affected_score': self.affected_score,
            'pending_score': self.pending_score,
            'support_score': self.support_score,
            'total_priority_score': self.total_priority_score,
            'priority_level': self.priority_level,
            'trigger_event': self.trigger_event,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None
        }

    def __repr__(self):
        return f"<ComplaintPriorityHistory Complaint #{self.complaint_id} Score:{self.total_priority_score} ({self.trigger_event})>"
