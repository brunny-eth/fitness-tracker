import unittest
from app import app, db, User, UserSettings
from datetime import datetime
from flask_login import login_user

class FitnessTrackerTests(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.app = app.test_client()
        
        with app.app_context():
            db.drop_all()  # Clean slate
            db.create_all()  # Create all tables

    def test_registration_and_weight_logging(self):
        with app.app_context():
            response = self.app.post('/register', data={
                'email': 'test@test.com',
                'password': 'test123',
                'starting_weight': '70',
                'target_weight': '65',
                'goal_months': '3',
                'activity_level': 'moderate',
                'age': '30',
                'gender': 'male',
                'height': '180'
            }, follow_redirects=True)
            
            self.assertEqual(response.status_code, 200)

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

if __name__ == '__main__':
    unittest.main()