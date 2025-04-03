import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowRight, Save, Undo } from 'lucide-react';
import WeightInput from '../ui/weight-input';

const GoalsPage = () => {
  const { user } = useAuth();
  const [weightUnit, setWeightUnit] = useState('lb');
  const [goals, setGoals] = useState({
    weightGoal: 'maintain',
    muscleGoal: 'maintain',
    targetWeight: '',
    currentWeight: '',
    weeklyGoal: 0.5,
    targetDate: new Date().toISOString().split('T')[0]
  });
  
  const [calculated, setCalculated] = useState({
    proteinTarget: 0,
    calorieTarget: 0,
    duration: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchCurrentGoals();
    }
  }, [user]);

  const fetchCurrentGoals = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/goals');
      
      // Fix for new users - set default values if data is empty or has empty fields
      const goalsData = {
        ...goals, // Start with default values
        ...data,  // Override with any values from the API
        
        // Ensure we have values for all required fields
        weightGoal: data.weightGoal || 'maintain',
        muscleGoal: data.muscleGoal || 'maintain',
        weeklyGoal: data.weeklyGoal || 0.5,
        targetDate: data.targetDate || new Date().toISOString().split('T')[0]
      };
      
      setGoals(goalsData);
      updateCalculations(goalsData);
      
      // If we received default goals (empty values), mark as new user
      if (!data.currentWeight && !data.targetWeight) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
      
      setError(''); // Clear any errors
    } catch (err) {
      console.error('Error fetching goals:', err);
      // Only set error for actual server errors, not for new users
      if (err.message !== 'Request failed' && err.message !== 'Session expired. Please login again.') {
        setError('Problem connecting to server. Please try again later.');
      } else {
        // Handle new user case
        setIsNewUser(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCalculations = (currentGoals) => {
    // Skip calculations if input values are empty
    if (!currentGoals.currentWeight || !currentGoals.targetWeight) {
      setCalculated({
        duration: 0,
        targetDate: 'maintain',
        message: "Please enter your current and target weight to see your timeline."
      });
      return;
    }
    
    const weightDiff = Math.abs(currentGoals.targetWeight - currentGoals.currentWeight);
    
    if (weightDiff === 0) {
      setCalculated({
        duration: 0,
        targetDate: 'maintain',
        message: "Keep doing what you do! We'll help you track it."
      });
      return;
    }

    const weeksNeeded = Math.ceil(weightDiff / currentGoals.weeklyGoal);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksNeeded * 7));

    setCalculated({
      duration: weeksNeeded,
      targetDate: targetDate.toISOString().split('T')[0],
      message: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate required fields for the goals model
    if (!goals.currentWeight || !goals.targetWeight) {
      setError('Please enter your current weight and target weight');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Make sure weightGoal is properly set based on target vs current
      let weightGoal = 'maintain';
      if (goals.targetWeight > goals.currentWeight) {
        weightGoal = 'gain';
      } else if (goals.targetWeight < goals.currentWeight) {
        weightGoal = 'lose';
      }
      
      const goalsToSave = {
        ...goals,
        weightGoal,
        targetDate: calculated.targetDate === 'maintain' 
          ? new Date().toISOString() 
          : calculated.targetDate
      };
      
      const savedGoals = await api.post('/api/goals', goalsToSave);
      
      setGoals(savedGoals);
      setSuccessMessage('Goals saved successfully!');
      setIsNewUser(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving goals:', err);
      setError('Failed to save goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyGoalOptions = (unit) => {
    if (unit === 'lb') {
      return [
        { value: 0.25 * 2.20462, label: '0.5 lb per week' },
        { value: 0.5 * 2.20462, label: '1 lb per week' },
        { value: 0.75 * 2.20462, label: '1.5 lb per week' },
        { value: 1 * 2.20462, label: '2 lb per week' }
      ];
    }
    return [
      { value: 0.25, label: '0.25 kg per week' },
      { value: 0.5, label: '0.5 kg per week' },
      { value: 0.75, label: '0.75 kg per week' },
      { value: 1, label: '1 kg per week' }
    ];
  };

  if (loading && !isNewUser) {
    return <div className="max-w-2xl mx-auto p-4">Loading your fitness goals...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Set Your Fitness Goals</h1>
      
      {isNewUser && (
        <Card className="mb-6 bg-blue-50">
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              <span className="font-bold">Welcome to FitnessTracker.Me!</span> Let's get started by setting up your fitness goals.
              <br /><br />
              Simply provide your current weight, target weight, and how quickly you'd like to reach your goal. We'll calculate a personalized plan based on your inputs.
              <br /><br />
              Your nutrition needs will update automatically based on your progress and goals. You can always change these settings later.
            </p>
          </div>
        </Card>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Weight Goals</h2>
            <p className="text-gray-600 italic mb-4">
              Here, you can set some reasonable weight change goals, and the pace you'd like to achieve them at.
            </p>
            
            <div className="space-y-4">
              <div>
                <WeightInput
                  label="Current Weight"
                  value={goals.currentWeight}
                  onChange={(value) => {
                    const newGoals = {
                      ...goals,
                      currentWeight: value
                    };
                    setGoals(newGoals);
                    updateCalculations(newGoals);
                  }}
                  required
                  onUnitChange={(unit) => setWeightUnit(unit)}
                />
              </div>

              <div>
                <WeightInput
                  label="Target Weight"
                  value={goals.targetWeight}
                  onChange={(value) => {
                    const newGoals = {
                      ...goals,
                      targetWeight: value
                    };
                    setGoals(newGoals);
                    updateCalculations(newGoals);
                  }}
                  required
                  defaultUnit={weightUnit}
                />
              </div>

              <div>
                <Label htmlFor="weeklyGoal">Weekly Goal ({weightUnit})</Label>
                <select
                  id="weeklyGoal"
                  value={goals.weeklyGoal}
                  onChange={(e) => {
                    const newGoals = {
                      ...goals,
                      weeklyGoal: parseFloat(e.target.value)
                    };
                    setGoals(newGoals);
                    updateCalculations(newGoals);
                  }}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getWeeklyGoalOptions(weightUnit).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Muscle Goals</h2>
            <p className="text-gray-600 italic mb-4">
              There's only 2 options — build muscle, or maintain muscle. Losing muscle is almost always a bad option!
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="muscleGoal">Muscle Goal</Label>
                <select
                  id="muscleGoal"
                  value={goals.muscleGoal}
                  onChange={(e) => setGoals({
                    ...goals,
                    muscleGoal: e.target.value
                  })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="maintain">Maintain Muscle</option>
                  <option value="gain">Build Muscle</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            
            <div className="space-y-4">
              {calculated.message ? (
                <div className="text-gray-700">
                  {calculated.message}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span>Estimated Duration:</span>
                    <span className="font-medium">
                      {calculated.duration} weeks
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Target Date:</span>
                    <span className="font-medium">
                      {new Date(calculated.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={fetchCurrentGoals}
            disabled={loading}
          >
            <Undo className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            type="submit"
            disabled={loading || !goals.currentWeight || !goals.targetWeight}
            isLoading={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Goals
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GoalsPage;