"""
Location Model
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db

class Location(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    building_name = db.Column(db.String(100), nullable=False, index=True)
    block = db.Column(db.String(50), nullable=True)
    floor = db.Column(db.String(30), nullable=True)
    room_number = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaints = db.relationship('Complaint', backref='location', lazy='dynamic')

    @property
    def display_name(self):
        parts = [self.building_name]
        if self.block:
            parts.append(self.block)
        if self.floor:
            parts.append(self.floor)
        if self.room_number:
            parts.append(self.room_number)
        return " - ".join(parts)

    def to_dict(self):
        return {
            'id': self.id,
            'building_name': self.building_name,
            'block': self.block,
            'floor': self.floor,
            'room_number': self.room_number,
            'display_name': self.display_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'complaint_count': self.complaints.count()
        }

    def __repr__(self):
        return f"<Location {self.display_name}>"
