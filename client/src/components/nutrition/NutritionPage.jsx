// NutritionPage.jsx
import { useState, useEffect } from 'react';
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

  const handleAnalyze = async () => {
    try {
      const response = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: mealDescription }),
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing meal:', error);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <Tabs defaultValue="ai">
        <TabsList>
          <TabsTrigger value="ai">Ask AI</TabsTrigger>
          <TabsTrigger value="saved">Saved Meals</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <div className="space-y-4">
            <textarea
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Describe your meal..."
              rows={3}
            />
            <Button onClick={handleAnalyze} className="w-full">
              Analyze Meal
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
        </TabsContent>

        <TabsContent value="saved">
          <SavedMealsList onSelectMeal={onAddMeal} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const SavedMealsList = ({ onSelectMeal }) => {
  const [savedMeals, setSavedMeals] = useState([]);

  useEffect(() => {
    const fetchSavedMeals = async () => {
      try {
        const response = await fetch('/api/nutrition/saved-meals');
        const data = await response.json();
        setSavedMeals(data);
      } catch (error) {
        console.error('Error fetching saved meals:', error);
      }
    };

    fetchSavedMeals();
  }, []);

  return (
    <div className="space-y-2">
      {savedMeals.map((meal) => (
        <Card key={meal._id} className="p-3 hover:bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{meal.name}</h4>
              <p className="text-sm text-gray-500">
                {meal.protein}g protein • {meal.calories} calories
              </p>
            </div>
            <Button onClick={() => onSelectMeal(meal)}>Add</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const TodaysMeals = ({ meals, onDeleteMeal }) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
      <div className="space-y-3">
        {meals.map((meal) => (
          <div
            key={meal._id}
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
          >
            <div>
              <h4 className="font-medium">{meal.name}</h4>
              <p className="text-sm text-gray-500">
                {meal.protein}g protein • {meal.calories} calories
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
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [stats, setStats] = useState({
    currentProtein: 0,
    proteinGoal: 150,
    currentCalories: 0,
    calorieGoal: 2000,
  });

  const handleAddMeal = async (meal) => {
    try {
      const response = await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      const newMeal = await response.json();
      setTodaysMeals([...todaysMeals, newMeal]);
      updateStats();
    } catch (error) {
      console.error('Error logging meal:', error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await fetch(`/api/nutrition/log/${mealId}`, { method: 'DELETE' });
      setTodaysMeals(todaysMeals.filter((meal) => meal._id !== mealId));
      updateStats();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const updateStats = async () => {
    try {
      const response = await fetch('/api/nutrition/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  useEffect(() => {
    const fetchTodaysMeals = async () => {
      try {
        const response = await fetch('/api/nutrition/log');
        const data = await response.json();
        setTodaysMeals(data);
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    };

    fetchTodaysMeals();
    updateStats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nutrition Tracking</h1>
      <NutritionStats {...stats} />
      <WeightInput onSave={async (weight) => {
        await fetch('/api/progress/weight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight }),
        });
      }} />
      <MealEntry
        onAddMeal={handleAddMeal}
        onSaveMeal={async (meal) => {
          try {
            await fetch('/api/nutrition/save-meal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(meal),
            });
          } catch (error) {
            console.error('Error saving meal:', error);
          }
        }}
      />
      <TodaysMeals meals={todaysMeals} onDeleteMeal={handleDeleteMeal} />
    </div>
  );
};

export default NutritionPage;