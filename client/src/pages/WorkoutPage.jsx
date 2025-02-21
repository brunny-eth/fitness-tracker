import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import WorkoutLogger from '../components/workout/WorkoutLogger';
import { api } from '../utils/api';

const WorkoutStats = () => {
  const [todayStatus, setTodayStatus] = useState({ completed: false, workout: null });
  const [lastWorkout, setLastWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get workout history
        const workouts = await api.get('/api/workouts/history');
        
        // Check if we have a workout today
        const today = new Date().toISOString().split('T')[0];
        const todayWorkout = workouts.find(workout => 
          new Date(workout.date).toISOString().split('T')[0] === today
        );
        
        if (todayWorkout) {
          setTodayStatus({
            completed: true,
            workout: todayWorkout
          });
        }
        
        // Find the most recent workout that's not today
        const recentWorkouts = workouts.filter(workout => 
          new Date(workout.date).toISOString().split('T')[0] !== today
        );
        
        if (recentWorkouts.length > 0) {
          setLastWorkout(recentWorkouts[0]); // First one is the most recent
        }
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Today's Status</h3>
          <p className="text-gray-600">Loading...</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Last Workout</h3>
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Today's Status</h3>
        {todayStatus.completed ? (
          <>
            <p className="text-green-600 font-medium">Workout completed</p>
            <p className="text-gray-600">{todayStatus.workout.category}</p>
            <p className="text-gray-600 text-sm">
              {todayStatus.workout.exercises.length} exercises
            </p>
          </>
        ) : (
          <p className="text-gray-600">No workout logged yet today</p>
        )}
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Last Workout</h3>
        {lastWorkout ? (
          <>
            <p className="text-gray-600 font-medium">
              {new Date(lastWorkout.date).toLocaleDateString()} - {lastWorkout.category}
            </p>
            <p className="text-gray-600 text-sm">
              {lastWorkout.exercises.length} exercises
            </p>
          </>
        ) : (
          <p className="text-gray-600">No previous workouts found</p>
        )}
      </Card>
    </div>
  );
};

const WorkoutCategories = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.get('/api/categories');
      
      // Make sure we have an array of categories
      const categoryArray = Array.isArray(data) ? data : [];
      
      // Add exercise count for each category if it doesn't exist
      const categoriesWithCounts = await Promise.all(categoryArray.map(async (category) => {
        if (category.exerciseCount === undefined) {
          // If exerciseCount is not populated, get exercises for this category
          try {
            const exercises = await api.get(`/api/exercises?categoryId=${category._id}`);
            return {
              ...category,
              exerciseCount: Array.isArray(exercises) ? exercises.length : 0
            };
          } catch (err) {
            console.error(`Error fetching exercises for category ${category._id}:`, err);
            return {
              ...category,
              exerciseCount: 0
            };
          }
        }
        return category;
      }));
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const newCategory = await api.post('/api/categories', { 
        name: newCategoryName 
      });
      
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      setError('Failed to create category: ' + error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setError(null);
      await api.delete(`/api/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat._id !== categoryId));
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category: ' + error.message);
    }
  };
  
  return (
    <Card className="p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Workout Categories</h3>
        <Button onClick={() => setIsAddingCategory(!isAddingCategory)}>
          {isAddingCategory ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isAddingCategory && (
        <form onSubmit={handleAddCategory} className="mb-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Category name"
            required
          />
          <Button type="submit">Save Category</Button>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-gray-500">
                {category.exerciseCount || 0} exercises
                {category.lastWorkoutDate && 
                  ` • Last workout: ${new Date(category.lastWorkoutDate).toLocaleDateString()}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onSelectCategory(category)}>Start</Button>
              <Button 
                onClick={() => handleDeleteCategory(category._id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WorkoutPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workout Tracking</h1>
      <WorkoutStats />
      
      {selectedCategory ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
            <Button onClick={() => setSelectedCategory(null)}>
              Back to Categories
            </Button>
          </div>
          <WorkoutLogger category={selectedCategory} />
        </>
      ) : (
        <WorkoutCategories onSelectCategory={setSelectedCategory} />
      )}
    </div>
  );
};

export default WorkoutPage;