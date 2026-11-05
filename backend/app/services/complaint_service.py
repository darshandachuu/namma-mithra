"""
Complaint Service
Manages full complaint lifecycle: submission, updates, assignments, supports, and timeline logging.
CampusCare Platform
"""
from datetime import datetime
from app.extensions import db
from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.models.support import ComplaintSupport
from app.models.assignment import Assignment
from app.models.user import User
from app.services.priority_service import evaluate_complaint_priority, update_complaint_priority
from app.services.notification_service import create_notification

def create_new_complaint(student_id, title, description, category_id, location_id, severity_input=20, affected_input=15):
    """
    Creates a new complaint and calculates its initial priority score.
    """
    priority_calc = evaluate_complaint_priority(
        severity_input=severity_input,
        affected_input=affected_input,
        created_at=datetime.utcnow(),
        support_count=0
    )

    complaint = Complaint(
        title=title.strip(),
        description=description.strip(),
        category_id=category_id,
        location_id=location_id,
        student_id=student_id,
        status='pending',
        severity_score=priority_calc['severity_score'],
        affected_score=priority_calc['affected_score'],
        pending_score=priority_calc['pending_score'],
        support_score=priority_calc['support_score'],
        total_priority_score=priority_calc['total_priority_score'],
        priority_level=priority_calc['priority_level']
    )
    db.session.add(complaint)
    db.session.flush() # Generate complaint.id

    # Add initial status history
    history = StatusHistory(
        complaint_id=complaint.id,
        changed_by=student_id,
        old_status='none',
        new_status='pending',
        remarks='Complaint submitted by student'
    )
    db.session.add(history)

    # Initial priority history entry
    update_complaint_priority(complaint, trigger_event="initial_submission", commit=False)

    # Notify student
    create_notification(
        user_id=student_id,
        title="Complaint Submitted",
        message=f"Your complaint #{complaint.id} ('{complaint.title}') was successfully registered.",
        notif_type="status_change",
        commit=False
    )

    db.session.commit()
    return complaint

def support_complaint(complaint_id, user_id):
    """
    Allows a student or user to upvote / support an existing complaint.
    Recalculates priority score dynamically.
    """
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return False, "Complaint not found"

    existing_support = ComplaintSupport.query.filter_by(complaint_id=complaint_id, user_id=user_id).first()
    if existing_support:
        return False, "You have already supported this complaint"

    new_support = ComplaintSupport(complaint_id=complaint_id, user_id=user_id)
    db.session.add(new_support)
    db.session.flush()

    # Recalculate priority
    update_complaint_priority(complaint, trigger_event="community_support_upvote", commit=False)

    # Notify complaint author
    if complaint.student_id != user_id:
        supporter = User.query.get(user_id)
        supporter_name = supporter.full_name if supporter else "A fellow student"
        create_notification(
            user_id=complaint.student_id,
            title="Community Support Received",
            message=f"{supporter_name} supported your complaint #{complaint.id}. Priority recalculated to {complaint.total_priority_score} points.",
            notif_type="support",
            commit=False
        )

    db.session.commit()
    return True, complaint

def unsupport_complaint(complaint_id, user_id):
    """
    Removes support vote and recalculates priority score.
    """
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return False, "Complaint not found"

    support = ComplaintSupport.query.filter_by(complaint_id=complaint_id, user_id=user_id).first()
    if not support:
        return False, "You have not supported this complaint"

    db.session.delete(support)
    db.session.flush()

    update_complaint_priority(complaint, trigger_event="community_support_removed", commit=False)
    db.session.commit()
    return True, complaint

def assign_complaint_to_staff(complaint_id, staff_id, admin_id, notes=None):
    """
    Assigns a complaint to a staff member.
    """
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return False, "Complaint not found"

    staff = User.query.get(staff_id)
    if not staff or staff.role != 'staff':
        return False, "Invalid staff member"

    old_status = complaint.status

    # Check existing assignment
    assignment = Assignment.query.filter_by(complaint_id=complaint_id).first()
    if assignment:
        assignment.staff_id = staff_id
        assignment.assigned_by = admin_id
        assignment.notes = notes
        assignment.updated_at = datetime.utcnow()
    else:
        assignment = Assignment(
            complaint_id=complaint_id,
            staff_id=staff_id,
            assigned_by=admin_id,
            notes=notes
        )
        db.session.add(assignment)

    if complaint.status == 'pending':
        complaint.status = 'assigned'

    # Record status history
    history = StatusHistory(
        complaint_id=complaint.id,
        changed_by=admin_id,
        old_status=old_status,
        new_status=complaint.status,
        remarks=f"Assigned to {staff.full_name}. Notes: {notes or 'None'}"
    )
    db.session.add(history)

    # Notify staff
    create_notification(
        user_id=staff_id,
        title="New Complaint Assigned",
        message=f"You have been assigned to Complaint #{complaint.id}: '{complaint.title}'.",
        notif_type="assignment",
        commit=False
    )

    # Notify student
    create_notification(
        user_id=complaint.student_id,
        title="Complaint Assigned",
        message=f"Your complaint #{complaint.id} has been assigned to maintenance staff {staff.full_name}.",
        notif_type="assignment",
        commit=False
    )

    db.session.commit()
    return True, complaint

def update_status(complaint_id, user_id, new_status, remarks=None):
    """
    Updates the status of a complaint and notifies the student.
    Allowed statuses: pending, assigned, in_progress, resolved, closed, rejected
    """
    valid_statuses = {'pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'}
    if new_status not in valid_statuses:
        return False, f"Invalid status '{new_status}'"

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return False, "Complaint not found"

    old_status = complaint.status
    complaint.status = new_status

    history = StatusHistory(
        complaint_id=complaint.id,
        changed_by=user_id,
        old_status=old_status,
        new_status=new_status,
        remarks=remarks or f"Status changed from {old_status} to {new_status}"
    )
    db.session.add(history)

    # Notify student
    create_notification(
        user_id=complaint.student_id,
        title="Complaint Status Updated",
        message=f"Complaint #{complaint.id} status changed to '{new_status.replace('_', ' ').title()}'. Remarks: {remarks or 'None'}",
        notif_type="status_change",
        commit=False
    )

    db.session.commit()
    return True, complaint
