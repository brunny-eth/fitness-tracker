import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import WorkoutLogger from '../components/workout/WorkoutLogger';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WorkoutStats = () => {
  const [todayStatus, setTodayStatus] = useState({ completed: false, workout: null });
  const [lastWorkout, setLastWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [showAllExercises, setShowAllExercises] = useState(false);
  const MAX_VISIBLE_EXERCISES = 3;

  const fetchWorkoutStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const workouts = await api.get('/api/workouts/history');
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's workout if it exists
      const todayWorkout = workouts.find(workout => 
        new Date(workout.date).toISOString().split('T')[0] === today
      );
      
      if (todayWorkout) {
        setTodayStatus({
          completed: true,
          workout: todayWorkout
        });
      } else {
        setTodayStatus({
          completed: false,
          workout: null
        });
      }
      
      // Find the most recent workout that's not today
      const previousWorkouts = workouts.filter(workout => 
        new Date(workout.date).toISOString().split('T')[0] !== today
      );
      
      if (previousWorkouts.length > 0) {
        setLastWorkout(previousWorkouts[0]);
      }
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchWorkoutStats();
  }, [user]);

  // Re-fetch when workout is completed
  useEffect(() => {
    // Listen for workout completion event
    const handleWorkoutComplete = () => {
      fetchWorkoutStats();
    };

    window.addEventListener('workoutComplete', handleWorkoutComplete);
    return () => window.removeEventListener('workoutComplete', handleWorkoutComplete);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Today's Status</h3>
          {todayStatus.completed ? (
            <span className="text-green-600 text-sm font-medium px-2 py-1 bg-green-100 rounded-full">
              Completed
            </span>
          ) : (
            <span className="text-gray-600 text-sm font-medium px-2 py-1 bg-gray-100 rounded-full">
              Not completed
            </span>
          )}
        </div>
        
        {todayStatus.completed ? (
          <div>
            <p className="text-gray-600 font-medium mt-2">{todayStatus.workout.category}</p>
            <div className="mt-1">
              {todayStatus.workout.exercises
                .slice(0, showAllExercises ? undefined : MAX_VISIBLE_EXERCISES)
                .map((exercise, index) => (
                  <div key={index} className="text-sm text-gray-600 ml-2">
                    • {exercise.name} 
                    {exercise.sets && exercise.sets.length > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'})
                      </span>
                    )}
                  </div>
              ))}
              
              {!showAllExercises && todayStatus.workout.exercises.length > MAX_VISIBLE_EXERCISES && (
                <button 
                  onClick={() => setShowAllExercises(true)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Show {todayStatus.workout.exercises.length - MAX_VISIBLE_EXERCISES} more...
                </button>
              )}
              
              {showAllExercises && (
                <button 
                  onClick={() => setShowAllExercises(false)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mt-2">No workout logged yet today</p>
        )}
      </Card>
      
      {/* Apply similar changes to the Previous Workout card */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Previous Workout</h3>
        {lastWorkout ? (
          <div>
            <p className="text-gray-600 font-medium mt-2">
              {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
              })} - {lastWorkout.category}
            </p>
            <div className="mt-1">
              {lastWorkout.exercises
                .slice(0, showAllExercises ? undefined : MAX_VISIBLE_EXERCISES)
                .map((exercise, index) => (
                  <div key={index} className="text-sm text-gray-600 ml-2">
                    • {exercise.name} 
                    {exercise.sets && exercise.sets.length > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'})
                      </span>
                    )}
                  </div>
              ))}
              
              {!showAllExercises && lastWorkout.exercises.length > MAX_VISIBLE_EXERCISES && (
                <button 
                  onClick={() => setShowAllExercises(true)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Show {lastWorkout.exercises.length - MAX_VISIBLE_EXERCISES} more...
                </button>
              )}
              
              {showAllExercises && (
                <button 
                  onClick={() => setShowAllExercises(false)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mt-2">No previous workouts found</p>
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

  const fetchCategories = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      try {
        data = await api.get('/api/categories');
      } catch (apiError) {
        // If it's a timeout (504) and we haven't retried too many times, retry
        if (apiError.status === 504 && retryCount < 3) {
          console.log(`Retrying categories fetch (attempt ${retryCount + 1})`);
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCategories(retryCount + 1);
        }
        throw apiError;
      }
      
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
      setError('Failed to load categories. ' + 
        (error.status === 504 ? 'Request timed out. Please try again.' : error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      let finalCategoryName = newCategoryName.trim();
      if (!finalCategoryName.toLowerCase().includes('day')) {
        finalCategoryName += ' Day';
      }
      
      const newCategory = await api.post('/api/categories', { 
        name: finalCategoryName
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
        <h3 className="text-lg font-semibold">Workout Days</h3>
        <Button onClick={() => setIsAddingCategory(!isAddingCategory)}>
          {isAddingCategory ? 'Cancel' : 'Add Workout Day'}
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