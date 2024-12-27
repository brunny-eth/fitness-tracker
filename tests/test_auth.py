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
    # First ensure we have the authenticated user set up
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
    }, follow_redirects=True)
    
    # Check that we got a 400 status code
    assert response.status_code == 400
    
    # The error message should be in the flashed messages
    html_response = response.data.decode()
    assert 'Email already registered' in html_response