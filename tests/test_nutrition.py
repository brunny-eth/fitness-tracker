def test_add_nutrition(authenticated_client):
    response = authenticated_client.post('/add_nutrition', 
        json={
            'protein_amount': 30,
            'calorie_amount': 500,
            'meal_name': 'Test Meal'
        })
    assert response.status_code == 201
    
def test_invalid_nutrition(authenticated_client):
    response = authenticated_client.post('/add_nutrition', 
        json={
            'protein_amount': -1,
            'calorie_amount': 500
        })
    assert response.status_code == 400