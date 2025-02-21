import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SummaryCards = ({ startingPoint, currentStatus }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Starting Point</h3>
      <div className="space-y-2">
        <p>Starting weight: {startingPoint?.weight?.toFixed(1)} kg</p>
        <p>Weight Target: {startingPoint?.target?.toFixed(1)} kg</p>
        <p className="text-sm text-gray-500">
          Started {new Date(startingPoint?.startDate).toLocaleDateString()}
        </p>
      </div>
    </Card>

    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Current Status</h3>
      <div className="space-y-2">
        <p>Current weight: {currentStatus?.weight?.toFixed(1)} kg</p>
        <p>Exercised {currentStatus?.workoutCount} times in the last 30 days</p>
        <p className="text-sm text-gray-500">
          Last weighed: {new Date(currentStatus?.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </Card>
  </div>
);

const ProgressChart = ({ data }) => (
  <Card className="p-4 mb-6">
    <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            dataKey="date" 
            tickFormatter={str => {
              const date = new Date(str);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            tick={{ fontSize: 12 }}
          />
          {/* Separate Y axis for weight */}
          <YAxis 
            yAxisId="weight" 
            orientation="right" 
            domain={['dataMin - 5', 'dataMax + 5']}
            label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight' }}
          />
          {/* Separate Y axis for nutrition */}
          <YAxis 
            yAxisId="nutrition" 
            orientation="left"
            domain={[0, 'dataMax + 20']}
            label={{ value: 'Protein/Calories', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            labelFormatter={value => new Date(value).toLocaleDateString()}
            formatter={(value, name) => {
              if (!value && value !== 0) return ['N/A', name];
              
              switch (name) {
                case 'weight':
                  return [`${value} kg`, 'Weight'];
                case 'protein':
                  return [`${value}g`, 'Protein'];
                case 'calories':
                  return [value, 'Calories'];
                default:
                  return [value, name];
              }
            }}
          />
          <Legend />
          <Line 
            yAxisId="weight"
            type="monotone" 
            dataKey="weight" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Weight"
          />
          <Line 
            yAxisId="nutrition"
            type="monotone" 
            dataKey="nutrition.protein" 
            name="Protein"
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line 
            yAxisId="nutrition"
            type="monotone" 
            dataKey="nutrition.calories" 
            name="Calories"
            stroke="#ffc658" 
            stroke={Theme.warning}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const DailyEntry = ({ entry }) => (
  <Card className="p-4 mb-4">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold">
        {new Date(entry.date).toLocaleDateString()}
      </h3>
      {entry.weight && (
        <span className="text-gray-500">
          {entry.weight} kg
        </span>
      )}
    </div>

    <div className="space-y-4">
      {/* Nutrition Summary */}
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

      {/* Workouts - Only show if there are workouts */}
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

      // Fetch summary data
      const summaryData = await api.get('/api/history/summary');
      setSummary(summaryData);

      // Fetch historical stats
      const statsData = await api.get('/api/history/stats');
      
      // Ensure data is sorted chronologically for the chart
      const sortedData = [...statsData].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setHistoryData(sortedData);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
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
        {historyData.map((entry) => (
          <DailyEntry key={entry.date} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;