"""
Priority Calculation Engine
Calculates rule-based priority score out of 100:
P = S + A + T + C
Where:
- Severity (S): Max 40 marks
- Affected Users (A): Max 30 marks
- Pending Time (T): Max 20 marks
- Community Support (C): Max 10 marks

Total: 100 marks
Priority levels:
- 80 to 100: Critical
- 60 to 79: High
- 35 to 59: Medium
- 0 to 34: Low

CampusCare Platform
"""
from datetime import datetime
from app.extensions import db
from app.models.priority_history import ComplaintPriorityHistory

# Severity presets / mappings
SEVERITY_MAPPING = {
    'critical': 40,
    'high': 32,
    'medium': 22,
    'low': 10
}

# Affected users presets / mappings
AFFECTED_MAPPING = {
    'campus_wide': 30, # Whole campus or department building
    'block_wide': 24,  # Entire floor or wing
    'room_shared': 16, # Classrooms, computer labs, library section
    'individual': 8    # Single workstation or individual room desk
}

def calculate_pending_score(created_at):
    """
    Calculates pending time score (0 to 20 marks) based on hours/days since complaint was filed.
    Aging formula:
    - Over 7 days (168h): 20 marks
    - 5 to 7 days (120h - 168h): 16 marks
    - 3 to 5 days (72h - 120h): 12 marks
    - 1 to 3 days (24h - 72h): 8 marks
    - 12 to 24 hours: 4 marks
    - Under 12 hours: 2 marks
    """
    if not created_at:
        return 0
    
    elapsed_seconds = (datetime.utcnow() - created_at).total_seconds()
    elapsed_hours = max(0, elapsed_seconds / 3600.0)

    if elapsed_hours >= 168: # >= 7 days
        return 20
    elif elapsed_hours >= 120: # 5 - 7 days
        return 16
    elif elapsed_hours >= 72: # 3 - 5 days
        return 12
    elif elapsed_hours >= 24: # 1 - 3 days
        return 8
    elif elapsed_hours >= 12: # 12 - 24 hours
        return 4
    else:
        return 2

def calculate_support_score(support_count):
    """
    Calculates community support score (0 to 10 marks).
    Each support vote adds 2 marks, capped at 10 marks (5 or more votes).
    """
    count = max(0, int(support_count or 0))
    return min(10, count * 2)

def determine_priority_level(total_score):
    if total_score >= 80:
        return 'Critical'
    elif total_score >= 60:
        return 'High'
    elif total_score >= 35:
        return 'Medium'
    else:
        return 'Low'

def evaluate_complaint_priority(severity_input, affected_input, created_at, support_count):
    """
    Computes complete priority breakdown and returns tuple:
    (severity_score, affected_score, pending_score, support_score, total_score, priority_level, explanation)
    """
    # Severity score (0-40)
    if isinstance(severity_input, str):
        severity_score = SEVERITY_MAPPING.get(severity_input.lower(), 20)
    else:
        severity_score = max(0, min(40, int(severity_input or 20)))

    # Affected score (0-30)
    if isinstance(affected_input, str):
        affected_score = AFFECTED_MAPPING.get(affected_input.lower(), 15)
    else:
        affected_score = max(0, min(30, int(affected_input or 15)))

    # Pending score (0-20)
    pending_score = calculate_pending_score(created_at)

    # Support score (0-10)
    support_score = calculate_support_score(support_count)

    total_score = severity_score + affected_score + pending_score + support_score
    total_score = max(0, min(100, total_score))
    priority_level = determine_priority_level(total_score)

    explanation = (
        f"Severity: {severity_score}/40, "
        f"Affected Impact: {affected_score}/30, "
        f"Pending Time: {pending_score}/20, "
        f"Community Support: {support_score}/10. "
        f"Total: {total_score}/100 [{priority_level}]"
    )

    return {
        'severity_score': severity_score,
        'affected_score': affected_score,
        'pending_score': pending_score,
        'support_score': support_score,
        'total_priority_score': total_score,
        'priority_level': priority_level,
        'explanation': explanation
    }

def update_complaint_priority(complaint, trigger_event="system_recalculation", commit=True):
    """
    Recalculates a complaint's priority, updates complaint record, and logs to history.
    """
    breakdown = evaluate_complaint_priority(
        severity_input=complaint.severity_score,
        affected_input=complaint.affected_score,
        created_at=complaint.created_at,
        support_count=complaint.support_count
    )

    complaint.pending_score = breakdown['pending_score']
    complaint.support_score = breakdown['support_score']
    complaint.total_priority_score = breakdown['total_priority_score']
    complaint.priority_level = breakdown['priority_level']

    # Record history
    history_entry = ComplaintPriorityHistory(
        complaint_id=complaint.id,
        severity_score=complaint.severity_score,
        affected_score=complaint.affected_score,
        pending_score=complaint.pending_score,
        support_score=complaint.support_score,
        total_priority_score=complaint.total_priority_score,
        priority_level=complaint.priority_level,
        trigger_event=trigger_event,
        calculated_at=datetime.utcnow()
    )
    db.session.add(history_entry)

    if commit:
        db.session.commit()

    return breakdown
