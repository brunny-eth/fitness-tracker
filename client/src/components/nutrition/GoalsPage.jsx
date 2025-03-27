import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowRight, Save, Undo } from 'lucide-react';

const GoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState({
    weightGoal: 'maintain',
    muscleGoal: 'maintain',
    targetWeight: '',
    currentWeight: '',
    weeklyGoal: 0.5,
    targetDate: ''
  });
  
  const [calculated, setCalculated] = useState({
    proteinTarget: 0,
    calorieTarget: 0,
    duration: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchCurrentGoals();
    }
  }, [user]);

  const fetchCurrentGoals = async () => {
    try {
      const data = await api.get('/api/goals');
      setGoals(data);
      updateCalculations(data);
      setIsNewUser(false);
      setError(''); 
    } catch (err) {
      if (err.message.includes('404') || err.message.includes('not found')) {
        setIsNewUser(true);
        setError(''); 
        
        // Set default values for a new user
        const defaultGoals = {
          weightGoal: 'maintain',
          muscleGoal: 'maintain',
          targetWeight: '',
          currentWeight: '',
          weeklyGoal: 0.5,
          targetDate: ''
        };
        setGoals(defaultGoals);
      } else {
        setError('Failed to load goals');
        setIsNewUser(false);
      }
    }
  };

  const updateCalculations = (currentGoals) => {
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
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const savedGoals = await api.post('/api/goals', {
        ...goals,
        targetDate: calculated.targetDate === 'maintain' 
          ? new Date().toISOString() 
          : calculated.targetDate
      });
      
      setGoals(savedGoals);
      setSuccessMessage('Goals saved successfully!');
      setIsNewUser(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Set Your Fitness Goals</h1>
      
      {isNewUser && (
        <Card className="mb-6 bg-blue-50">
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              FitnessTracker.Me makes it simple to get started by just setting a few high-level goals - we don't want to overthink the process.
              <br /><br />
              Start by setting these weight goals and a timeline, and your nutrition needs will change based on your daily updated weight and your goals. You can always change your goals in the future.
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
                <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={goals.currentWeight}
                  onChange={(e) => {
                    const newGoals = {
                      ...goals,
                      currentWeight: parseFloat(e.target.value)
                    };
                    setGoals(newGoals);
                    updateCalculations(newGoals);
                  }}
                  required
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={goals.targetWeight}
                  onChange={(e) => {
                    const newGoals = {
                      ...goals,
                      targetWeight: parseFloat(e.target.value)
                    };
                    setGoals(newGoals);
                    updateCalculations(newGoals);
                  }}
                  required
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="weeklyGoal">Weekly Goal (kg)</Label>
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
                  <option value="0.25">0.25 kg per week</option>
                  <option value="0.5">0.5 kg per week</option>
                  <option value="0.75">0.75 kg per week</option>
                  <option value="1">1 kg per week</option>
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
            disabled={loading}
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