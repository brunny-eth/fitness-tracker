// NutritionPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

const NutritionStats = ({ currentProtein, proteinGoal, currentCalories, calorieGoal }) => {
  const proteinProgress = (currentProtein / proteinGoal) * 100;
  const calorieProgress = (currentCalories / calorieGoal) * 100;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Protein</h3>
        <div className="flex justify-between mb-2">
          <span>{currentProtein}g</span>
          <span>{proteinGoal}g</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              proteinProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(proteinProgress, 100)}%` }}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Calories</h3>
        <div className="flex justify-between mb-2">
          <span>{currentCalories}</span>
          <span>{calorieGoal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              calorieProgress >= 100 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(calorieProgress, 100)}%` }}
          />
        </div>
      </Card>
    </div>
  );
};

const WeightInput = ({ onSave }) => {
  const [weight, setWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (weight) {
      onSave(parseFloat(weight));
      setWeight('');
    }
  };

  return (
    <Card className="p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex gap-4 items-center">
        <div className="flex-1">
          <label htmlFor="weight" className="block text-sm font-medium mb-1">
            Today's Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter weight"
          />
        </div>
        <Button type="submit" className="mt-6">
          Save
        </Button>
      </form>
      <p className="text-sm text-gray-500 mt-2">
        Tip: Weigh yourself at the same time each day for consistency
      </p>
    </Card>
  );
};

const MealEntry = ({ onAddMeal, onSaveMeal }) => {
  const [mealDescription, setMealDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!user || !mealDescription.trim()) return;
    
    try {
      setIsAnalyzing(true);
      const data = await api.post('/api/nutrition/analyze', { 
        description: mealDescription 
      });
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing meal:', error);
      alert('Failed to analyze meal: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'ai'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('ai')}
          >
            Ask AI
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'saved'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Meals
          </button>
        </div>
      </div>

      {activeTab === 'ai' ? (
        <div className="space-y-4">
          <textarea
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Describe your meal..."
            rows={3}
          />
          <Button 
            onClick={handleAnalyze} 
            className="w-full" 
            disabled={isAnalyzing || !mealDescription.trim()}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Meal'
            )}
          </Button>

          {analysisResult && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between">
                <span>Protein: {analysisResult.protein}g</span>
                <span>Calories: {analysisResult.calories}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => onAddMeal(analysisResult)}>
                  Add to Today
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSaveMeal(analysisResult)}
                >
                  Save for Later
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <SavedMealsList onSelectMeal={onAddMeal} />
      )}
    </Card>
  );
};

const SavedMealsList = ({ onSelectMeal }) => {
  const [savedMeals, setSavedMeals] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSavedMeals();
  }, [user]);

  const fetchSavedMeals = async () => {
    if (!user) return;
    
    try {
      const data = await api.get('/api/nutrition/saved-meals');
      setSavedMeals(data);
    } catch (error) {
      console.error('Error fetching saved meals:', error);
    }
  };

  const handleDeleteMeal = async (mealId, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (!user || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/api/nutrition/saved-meal/${mealId}`);
      setSavedMeals(savedMeals.filter(meal => meal._id !== mealId));
      alert('Meal deleted successfully!');
    } catch (error) {
      console.error('Error deleting saved meal:', error);
      alert('Failed to delete meal: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (savedMeals.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No saved meals found. Use "Ask AI" to analyze and save meals.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {savedMeals.map((meal) => (
        <Card key={meal._id} className="p-3 hover:bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{meal.name}</h4>
              <p className="text-sm text-gray-500">
                {meal.protein}g protein | {meal.calories} cal
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onSelectMeal(meal)}>Add</Button>
              <Button 
                variant="outline" 
                className="text-red-500 hover:bg-red-50"
                onClick={(e) => handleDeleteMeal(meal._id, e)}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};


const TodaysMeals = ({ meals = [], onDeleteMeal }) => {  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
      <div className="space-y-3">
        {Array.isArray(meals) && meals.map((meal) => (
          <div
            key={meal._id}
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
          >
            <div>
              <h4 className="font-medium">{meal.name}</h4>
              <p className="text-sm text-gray-500">
                {meal.protein}g protein | {meal.calories} cal
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteMeal(meal._id)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};


const NutritionPage = () => {
  const { user } = useAuth();
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [stats, setStats] = useState({
    currentProtein: 0,
    proteinGoal: 150,
    currentCalories: 0,
    calorieGoal: 2000,
  });
  const [activeTab, setActiveTab] = useState('ai');
  const [mealDescription, setMealDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAddMeal = async (meal) => {
    if (!user) return;
    
    try {
      const newMeal = await api.post('/api/nutrition/log', meal);
      setTodaysMeals([...todaysMeals, newMeal]);
      updateStats();
    } catch (error) {
      console.error('Error logging meal:', error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!user) return;
    
    try {
      await api.delete(`/api/nutrition/log/${mealId}`);
      setTodaysMeals(todaysMeals.filter((meal) => meal._id !== mealId));
      updateStats();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const updateStats = async () => {
    if (!user) return;
    
    try {
      const data = await api.get('/api/nutrition/stats');
      setStats(data);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  useEffect(() => {
    const fetchTodaysMeals = async () => {
      try {
        const data = await api.get('/api/nutrition/log');
        setTodaysMeals(data);
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    };

    if (user) {
      fetchTodaysMeals();
      updateStats();
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nutrition Tracking</h1>
      <NutritionStats {...stats} />
      <WeightInput onSave={async (weight) => {
        if (!user) return;
        try {
          await api.post('/api/nutrition/weight', { weight });
          alert('Weight saved successfully!');
          updateStats();
        } catch (error) {
          console.error('Error saving weight:', error);
          alert('Failed to save weight: ' + error.message);
        }
      }} />
      <MealEntry
        onAddMeal={handleAddMeal}
        onSaveMeal={async (meal) => {
          if (!user) return;
          try {
            await api.post('/api/nutrition/save-meal', {
              name: meal.name,
              protein: meal.protein,
              calories: meal.calories,
              details: meal.details || []
            });
            
            // Clear the analysis result
            setMealDescription('');
            setAnalysisResult(null);
            
            // Provide feedback
            alert('Meal saved for future use!');
          
          } catch (error) {
            console.error('Error saving meal:', error);
            alert('Failed to save meal: ' + error.message);
          }
        }}
      />
      <TodaysMeals meals={todaysMeals} onDeleteMeal={handleDeleteMeal} />
    </div>
  );
};

export default NutritionPage;