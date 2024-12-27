import pytest
from app import app, db
import os

@pytest.fixture(scope='session')
def test_client():
    # Use an in-memory SQLite database for testing
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False

    # Create all tables
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

@pytest.fixture
def init_database():
    # Create tables
    with app.app_context():
        db.create_all()
        yield db  # this is where the testing happens
        db.session.remove()
        db.drop_all()

@pytest.fixture
def authenticated_client(test_client, init_database):
    with app.app_context():
        response = test_client.post('/register', data={
            'email': 'test@test.com',
            'password': 'test123',
            'starting_weight': '70',
            'target_weight': '65',
            'goal_months': '3',
            'activity_level': 'moderate',
            'age': '25',
            'gender': 'male',
            'height': '170'
        })
        assert response.status_code == 302
    return test_client