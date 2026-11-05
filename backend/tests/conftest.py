"""
Pytest Fixtures for CampusCare Test Suite
"""
import pytest
from app import create_app
from app.config import TestingConfig
from app.extensions import db

@pytest.fixture
def test_app():
    flask_app = create_app(config_class=TestingConfig)
    with flask_app.app_context():
        yield flask_app

@pytest.fixture
def client(test_app):
    return test_app.test_client()

@pytest.fixture
def student_auth_headers(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@campuscare.edu',
        'password': 'password123'
    })
    token = res.get_json()['data']['token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def staff_auth_headers(client):
    res = client.post('/api/auth/login', json={
        'email': 'staff@campuscare.edu',
        'password': 'password123'
    })
    token = res.get_json()['data']['token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def admin_auth_headers(client):
    res = client.post('/api/auth/login', json={
        'email': 'admin@campuscare.edu',
        'password': 'password123'
    })
    token = res.get_json()['data']['token']
    return {'Authorization': f'Bearer {token}'}
