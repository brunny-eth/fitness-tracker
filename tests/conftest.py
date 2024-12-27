import pytest
from app import app, db
import os

@pytest.fixture
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()
            
@pytest.fixture
def authenticated_client(test_client):
    test_client.post('/register', data={
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
    return test_client