// NutritionPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
  const [todayWeight, setTodayWeight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkTodayWeight = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Fetch the most recent weight entry
        const weights = await api.get('/api/nutrition/weight/history');
        
        if (weights && weights.length > 0) {
          const mostRecent = weights[0]; // Already sorted by date desc
          
          // Check if the most recent entry is from today
          const today = new Date().toISOString().split('T')[0];
          const entryDate = new Date(mostRecent.date).toISOString().split('T')[0];
          
          if (today === entryDate) {
            setTodayWeight(mostRecent);
          }
        }
      } catch (error) {
        console.error('Error checking today\'s weight:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTodayWeight();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (weight) {
      onSave(parseFloat(weight));
      // Update the UI immediately after saving
      setTodayWeight({ 
        weight: parseFloat(weight), 
        date: new Date() 
      });
      setWeight('');
    }
  };

  if (isLoading) {
    return <Card className="p-4 mb-6"><div>Loading...</div></Card>;
  }

  return (
    <Card className="p-4 mb-6">
      {todayWeight ? (
        <div>
          <h3 className="font-medium mb-2">Today's Weight</h3>
          <div className="text-lg font-semibold">{todayWeight.weight.toFixed(1)} kg</div>
          <p className="text-sm text-gray-500 mt-2">
            You've already logged your weight today.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-4 items-center">
          <div className="flex-1">
            <Label htmlFor="weight">Today's Weight (kg)</Label>
            <Input
              type="number"
              id="weight"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
            />
          </div>
          <Button type="submit" className="mt-6">
            Save
          </Button>
        </form>
      )}
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ai">Ask AI</TabsTrigger>
          <TabsTrigger value="saved">Saved Meals</TabsTrigger>
        </TabsList>
        
        {activeTab === 'ai' && (
          <div className="space-y-4 mt-4">
            <textarea
              id="mealDescription"
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your meal..."
              rows={3}
            />
            <Button 
              onClick={handleAnalyze} 
              className="w-full" 
              isLoading={isAnalyzing}
              disabled={!mealDescription.trim()}
            >
              Analyze Meal
            </Button>

            {analysisResult && (
              <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Protein</span>
                  <span>{analysisResult.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Calories</span>
                  <span>{analysisResult.calories}</span>
                </div>
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
        )}
        
        {activeTab === 'saved' && (
          <SavedMealsList onSelectMeal={onAddMeal} />
        )}
      </Tabs>
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
    <div className="space-y-2 mt-4">
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
                variant="destructive" 
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
      {meals.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No meals logged today. Use the AI to analyze and add meals.
        </p>
      ) : (
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
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
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