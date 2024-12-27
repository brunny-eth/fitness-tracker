def test_register_success(test_client):
    response = test_client.post('/register', data={
        'email': 'user@test.com',
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

def test_register_duplicate_email(test_client, authenticated_client):
    response = test_client.post('/register', data={
        'email': 'test@test.com',  # Already registered in authenticated_client
        'password': 'test123',
        'starting_weight': '70',
        'target_weight': '65',
        'goal_months': '3',
        'activity_level': 'moderate',
        'age': '25',
        'gender': 'male',
        'height': '170'
    })
    assert b'Email already registered' in response.data