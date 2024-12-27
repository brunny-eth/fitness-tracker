def test_log_workout(authenticated_client):
    response = authenticated_client.post('/log_workout',
        json={
            'type': 'Upper Body',
            'exercises': [
                {
                    'name': 'Bench Press',
                    'weight': 135,
                    'sets': 3,
                    'reps': 10
                }
            ]
        })
    assert response.status_code == 201

def test_delete_workout(authenticated_client):
    # First create a workout
    response = authenticated_client.post('/log_workout',
        json={
            'type': 'Upper Body',
            'exercises': [{'name': 'Bench Press', 'weight': 135, 'sets': 3, 'reps': 10}]
        })
    workout_id = response.json['id']
    
    # Then delete it
    response = authenticated_client.post(f'/delete_workout/{workout_id}')
    assert response.status_code == 200