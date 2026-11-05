"""
Complaint API Tests
CampusCare Platform
"""
def test_get_complaints_list(client):
    res = client.get('/api/complaints')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert isinstance(data['data'], list)
    assert len(data['data']) >= 4

def test_create_complaint(client, student_auth_headers):
    payload = {
        'title': 'Leaking faucet in 2nd Floor Washroom',
        'description': 'Water is continuously dripping from the washbasin tap causing water wastage.',
        'category_id': 3,
        'location_id': 1,
        'severity_score': 25,
        'affected_score': 15
    }
    res = client.post('/api/complaints', json=payload, headers=student_auth_headers)
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['title'] == payload['title']
    assert data['data']['status'] == 'pending'
    assert 'priority' in data['data']
    assert data['data']['priority']['total_priority_score'] > 0

def test_get_complaint_details(client):
    res = client.get('/api/complaints/1')
    assert res.status_code == 200
    data = res.get_json()['data']
    assert data['id'] == 1
    assert 'priority' in data
    assert 'status_history' in data
    assert 'priority_history' in data

def test_duplicate_complaint_lookup(client):
    # Lookup complaints for category 1 (Projector) and location 1 (Seminar Hall 204)
    res = client.get('/api/complaints/duplicates?category_id=1&location_id=1')
    assert res.status_code == 200
    data = res.get_json()['data']
    assert len(data) >= 1
    assert data[0]['match_type'] == 'Exact Category & Location Match'
