import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const SummaryCards = ({ startingPoint, currentStatus }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Starting Point</h3>
      <div className="space-y-2">
        <p>Starting weight: {startingPoint?.weight?.toFixed(1)} kg</p>
        <p>Initial goal: {startingPoint?.weightGoal === 'gain' ? 'Gain Weight' : 
          startingPoint?.weightGoal === 'lose' ? 'Lose Weight' : 'Maintain Weight'}</p>
        <p>Target: {startingPoint?.muscleGoal === 'gain' ? 'Build Muscle' : 'Maintain Muscle'}</p>
        <p className="text-sm text-gray-500">
          Started {new Date(startingPoint?.startDate).toLocaleDateString()}
        </p>
      </div>
    </Card>

    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Current Status</h3>
      <div className="space-y-2">
        <p>Current weight: {currentStatus?.weight?.toFixed(1)} kg</p>
        <p>Target weight: {currentStatus?.targetWeight?.toFixed(1)} kg</p>
        <p>Exercised {currentStatus?.workoutCount} times in the last 30 days</p>
        <p className="text-sm text-gray-500">
          Last weighed: {new Date(currentStatus?.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </Card>
  </div>
);

const ProgressChart = ({ data }) => {
  // Define consistent colors
  const colors = {
    weight: '#8884d8',    // Purple
    protein: '#82ca9d',   // Green
    calories: '#ffc658'   // Yellow
  };

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="date" 
              tickFormatter={str => {
                const date = new Date(str);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="weight" 
              orientation="right" 
              domain={['dataMin - 2', 'dataMax + 2']}
              label={{ 
                value: 'Weight (kg)', 
                angle: 90, 
                position: 'right',
                offset: 0
              }}
            />
            <YAxis 
              yAxisId="nutrition" 
              orientation="left"
              domain={[0, 'dataMax + 20']}
              label={{ 
                value: 'Protein (g) / Calories', 
                angle: -90, 
                position: 'left',
                offset: 0
              }}
            />
            <Tooltip 
              labelFormatter={value => new Date(value).toLocaleDateString()}
              formatter={(value, name) => {
                if (!value && value !== 0) return ['N/A', name];
                switch (name) {
                  case 'weight':
                    return [`${value.toFixed(1)} kg`, 'Weight'];
                  case 'protein':
                    return [`${value}g`, 'Protein'];
                  case 'calories':
                    return [value, 'Calories'];
                  default:
                    return [value, name];
                }
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              yAxisId="weight"
              type="monotone" 
              dataKey="weight" 
              stroke={colors.weight}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Weight"
            />
            <Line 
              yAxisId="nutrition"
              type="monotone" 
              dataKey="nutrition.protein" 
              stroke={colors.protein}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Protein"
            />
            <Line 
              yAxisId="nutrition"
              type="monotone" 
              dataKey="nutrition.calories" 
              stroke={colors.calories}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Calories"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const DailyEntry = ({ entry }) => (
  <Card className="p-4 mb-4">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold">
        {new Date(entry.date).toLocaleDateString()}
      </h3>
      {entry.weight && (
        <span className="text-gray-500">
          {entry.weight.toFixed(1)} kg
        </span>
      )}
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Protein</span>
          <span className={
            entry.nutrition.protein >= entry.nutrition.proteinGoal 
              ? 'text-green-600 font-semibold' 
              : ''
          }>
            {entry.nutrition.protein}g / {entry.nutrition.proteinGoal}g
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Calories</span>
          <span className={
            entry.nutrition.calories <= entry.nutrition.calorieGoal 
              ? 'text-green-600 font-semibold' 
              : entry.nutrition.calories > 0 
                ? 'text-red-600 font-semibold'
                : ''
          }>
            {entry.nutrition.calories} / {entry.nutrition.calorieGoal}
          </span>
        </div>
      </div>

      {entry.workouts && entry.workouts.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Workouts</h4>
          {entry.workouts.map((workout, i) => (
            <div key={i} className="ml-4">
              <h5 className="font-medium text-gray-700">{workout.category}</h5>
              {workout.exercises.map((exercise, j) => (
                <div key={j} className="ml-4 text-sm text-gray-600">
                  {exercise.name}: {exercise.sets.map(set => 
                    `${set.weight}kg×${set.reps}`
                  ).join(', ')}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  </Card>
);

const HistoryPage = () => {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, statsData] = await Promise.all([
        api.get('/api/history/summary'),
        api.get('/api/history/stats')
      ]);

      setSummary(summaryData);
      
      // Sort data chronologically
      const sortedData = [...statsData].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setHistoryData(sortedData);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-4 bg-red-50 text-red-700">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-sm underline"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Progress History</h1>
      
      <SummaryCards 
        startingPoint={summary?.startingPoint}
        currentStatus={summary?.currentStatus}
      />

      <ProgressChart data={historyData} />

      <div className="space-y-4">
        {[...historyData].reverse().map((entry) => (
          <DailyEntry key={entry.date} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;