"""
Authentication Tests
CampusCare Platform
"""
def test_login_successful(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@campuscare.edu',
        'password': 'password123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['email'] == 'student@campuscare.edu'
    assert data['data']['user']['role'] == 'student'

def test_login_invalid_password(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@campuscare.edu',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data['success'] is False

def test_register_new_student(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'Test New Student',
        'email': 'new.student@campuscare.edu',
        'password': 'password123',
        'department': 'Mechanical Engineering'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['user']['email'] == 'new.student@campuscare.edu'
    assert data['data']['user']['role'] == 'student'

def test_register_duplicate_email(client):
    res = client.post('/api/auth/register', json={
        'full_name': 'Duplicate User',
        'email': 'student@campuscare.edu',
        'password': 'password123'
    })
    assert res.status_code == 409
    assert res.get_json()['success'] is False

def test_get_profile(client, student_auth_headers):
    res = client.get('/api/auth/profile', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['data']['email'] == 'student@campuscare.edu'
