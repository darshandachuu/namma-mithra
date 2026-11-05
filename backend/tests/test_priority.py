"""
Priority Engine Tests
Verifies P = S + A + T + C rule-based calculation
CampusCare Platform
"""
from datetime import datetime, timedelta
from app.services.priority_service import evaluate_complaint_priority, calculate_pending_score, calculate_support_score, determine_priority_level

def test_priority_score_calculation():
    # Test maximum values
    calc_max = evaluate_complaint_priority(
        severity_input=40,
        affected_input=30,
        created_at=datetime.utcnow() - timedelta(days=8), # >7 days -> 20 marks
        support_count=5 # 5*2 = 10 marks
    )
    assert calc_max['severity_score'] == 40
    assert calc_max['affected_score'] == 30
    assert calc_max['pending_score'] == 20
    assert calc_max['support_score'] == 10
    assert calc_max['total_priority_score'] == 100
    assert calc_max['priority_level'] == 'Critical'

def test_priority_levels():
    assert determine_priority_level(85) == 'Critical'
    assert determine_priority_level(65) == 'High'
    assert determine_priority_level(45) == 'Medium'
    assert determine_priority_level(20) == 'Low'

def test_support_impact_on_complaint(client, student_auth_headers):
    # Support complaint #4 (not yet supported by student 4)
    res_before = client.get('/api/complaints/4')
    score_before = res_before.get_json()['data']['priority']['total_priority_score']
    
    # Add support
    res_sup = client.post('/api/complaints/4/support', headers=student_auth_headers)
    assert res_sup.status_code == 200
    
    res_after = client.get('/api/complaints/4')
    score_after = res_after.get_json()['data']['priority']['total_priority_score']
    
    # Priority score should increase or stay updated
    assert score_after >= score_before
