"""
Staff Assignment and Workflow Tests
CampusCare Platform
"""
def test_admin_assign_complaint(client, admin_auth_headers):
    payload = {
        'complaint_id': 3,
        'staff_id': 2,
        'notes': 'Please inspect network switch and replace cable if faulty.'
    }
    res = client.post('/api/admin/assignments', json=payload, headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['status'] in ['assigned', 'in_progress', 'pending']

def test_staff_update_status(client, staff_auth_headers):
    # Staff #2 was assigned to complaint #2
    payload = {
        'status': 'in_progress',
        'remarks': 'Power isolation completed. Starting wire re-routing.'
    }
    res = client.put('/api/staff/complaints/2/status', json=payload, headers=staff_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['status'] == 'in_progress'

def test_staff_cannot_update_unassigned(client, staff_auth_headers):
    # Staff #2 trying to update complaint #4 (not assigned to them)
    payload = {
        'status': 'resolved',
        'remarks': 'Testing unauthorized update'
    }
    res = client.put('/api/staff/complaints/4/status', json=payload, headers=staff_auth_headers)
    assert res.status_code == 403
