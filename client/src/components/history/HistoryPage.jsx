import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts';


const SummaryCards = ({ startingPoint, currentStatus }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Starting Point</h3>
        <div className="space-y-2">
          <p><span className="font-semibold">Starting weight:</span> {startingPoint?.weight?.toFixed(1) || 'N/A'} kg</p>
          <p><span className="font-semibold">Initial goal:</span> {startingPoint?.weightGoal === 'gain' ? 'Gain Weight' : 
            startingPoint?.weightGoal === 'lose' ? 'Lose Weight' : 'Maintain Weight'}</p>
          <p><span className="font-semibold">Target:</span> {startingPoint?.muscleGoal === 'gain' ? 'Build Muscle' : 'Maintain Muscle'}</p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Started</span> {formatDate(startingPoint?.startDate)}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="space-y-2">
          <p><span className="font-semibold">Current weight:</span> {currentStatus?.weight?.toFixed(1) || 'N/A'} kg</p>
          <p><span className="font-semibold">Target weight:</span> {currentStatus?.targetWeight?.toFixed(1) || 'N/A'} kg</p>
          <p><span className="font-semibold">Exercised</span> {currentStatus?.workoutCount || 0} times in the last 30 days</p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Last weighed:</span> {formatDate(currentStatus?.lastUpdated)}
          </p>
        </div>
      </Card>
    </div>
  );
};

const ProgressChart = ({ data, targetWeight }) => {
  // Define consistent colors
  const colors = {
    weight: '#8884d8',    // Purple
    protein: '#22c55e',   // Green
    calories: '#f59e0b',  // Amber/Yellow
    targetWeight: '#9ca3af'  // Gray for target line
  };

  // Format date for chart display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00.000Z');
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Create custom tooltip to ensure percentages have % signs
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium mb-1">{formatDate(label)}</p>
        {payload.map((entry, index) => {
          let valueDisplay = '';
          let name = '';
          
          // Format based on the data type
          switch(entry.dataKey) {
            case 'weight':
              valueDisplay = `${entry.value.toFixed(1)} kg`;
              name = 'Weight';
              break;
            case 'nutrition.proteinPercentage':
              valueDisplay = `${entry.value}% of daily goal`;
              name = 'Protein';
              break;
            case 'nutrition.caloriesPercentage':
              valueDisplay = `${entry.value}% of daily goal`;
              name = 'Calories';
              break;
            default:
              valueDisplay = entry.value;
              name = entry.name;
          }
          
          return (
            <div key={index} style={{ color: entry.color }} className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium">{name}:</span> <span className="ml-1">{valueDisplay}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Transform data to add percentage calculations
  const transformedData = data.map(day => {
    // Calculate percentages for nutrition
    const proteinPercentage = day.nutrition.proteinGoal > 0 
      ? (day.nutrition.protein / day.nutrition.proteinGoal) * 100
      : 0;
    
    const caloriesPercentage = day.nutrition.calorieGoal > 0 
      ? (day.nutrition.calories / day.nutrition.calorieGoal) * 100
      : 0;

    return {
      ...day,
      nutrition: {
        ...day.nutrition,
        proteinPercentage: Math.round(proteinPercentage),
        caloriesPercentage: Math.round(caloriesPercentage)
      }
    };
  });

  // Target weight is now passed as a prop

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={transformedData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="percentage" 
              orientation="left"
              domain={[0, 200]}
              label={{ 
                value: 'Goal Percentage (%)', 
                angle: -90, 
                position: 'left',
                offset: 0
              }}
              ticks={[0, 50, 100, 150, 200]}
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
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            
            {/* Reference line for 100% goal */}
            <ReferenceLine 
              yAxisId="percentage"
              y={100}
              stroke="#e5e7eb"
              strokeWidth={1}
              label={{
                value: "100%",
                position: "left",
                fill: "#9ca3af",
                fontSize: 11
              }}
            />
            
            {/* Target weight reference line (if available) */}
            {targetWeight && (
              <ReferenceLine
                yAxisId="weight"
                y={targetWeight}
                label={{
                  value: `Target: ${targetWeight}kg`,
                  position: 'insideTopRight',
                  fill: colors.targetWeight,
                  fontSize: 12
                }}
                stroke={colors.targetWeight}
                strokeDasharray="3 3"
              />
            )}
            
            {/* Weight line */}
            <Line 
              yAxisId="weight"
              type="monotone" 
              dataKey="weight" 
              stroke={colors.weight}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Weight"
              connectNulls={true}
            />
            
            {/* Protein percentage line */}
            <Line 
              yAxisId="percentage"
              type="monotone" 
              dataKey="nutrition.proteinPercentage" 
              stroke={colors.protein}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Protein"
              connectNulls={true}
            />
            
            {/* Calories percentage line */}
            <Line 
              yAxisId="percentage"
              type="monotone" 
              dataKey="nutrition.caloriesPercentage" 
              stroke={colors.calories}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Calories"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2 text-s text-gray-500 italic">
        Don't forget: protein should be above 100%; calories should be below 100%.
      </div>
    </Card>
  );
};

const DailyEntry = ({ entry, onUpdate }) => {
  const [showWorkouts, setShowWorkouts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProtein, setEditedProtein] = useState(entry.nutrition.protein);
  const [editedCalories, setEditedCalories] = useState(entry.nutrition.calories);
  const [isSaving, setIsSaving] = useState(false);

  const workoutCount = entry.workouts?.length || 0;
  const workoutLabel = workoutCount === 1 ? "Workout" : "Workouts";

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Use the date string directly to avoid timezone conversion issues
    // The date is already in YYYY-MM-DD format from the server
    return new Date(dateString + 'T00:00:00.000Z').toLocaleDateString();
  };

// Updated handleSave and handleCancel functions in DailyEntry component
const handleCancel = () => {
  setEditedProtein(entry.nutrition.protein);
  setEditedCalories(entry.nutrition.calories);
  setIsEditing(false);
};

const handleSave = async () => {
  try {
    setIsSaving(true);
    
    // The entry.date is already in YYYY-MM-DD format and represents the correct date
    // in the user's timezone, so we use it directly
    await api.post(`/api/nutrition/edit-date/${entry.date}`, {
      protein: editedProtein,
      calories: editedCalories
    });
    
    // Call the parent component's update function with the new values
    onUpdate(entry.date, {
      protein: editedProtein,
      calories: editedCalories
    });
    
    setIsEditing(false);
  } catch (error) {
    console.error('Error saving changes:', error);
    alert('Failed to save changes. Please try again.');
  } finally {
    setIsSaving(false);
  }
};

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">
          {formatDate(entry.date)}
        </h3>
        <div className="flex items-center">
          {entry.weight && (
            <span className="text-gray-500 mr-3">
              Weight: {entry.weight.toFixed(1)} kg
            </span>
          )}
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium">Protein (g):</label>
                <Input
                  type="number"
                  value={editedProtein}
                  onChange={(e) => setEditedProtein(Number(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium">Calories:</label>
                <Input
                  type="number"
                  value={editedCalories}
                  onChange={(e) => setEditedCalories(Number(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
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
        )}

        {workoutCount > 0 && (
          <div>
            <button
              onClick={() => setShowWorkouts(!showWorkouts)}
              className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            >
              <span>{workoutLabel} ({workoutCount})</span>
              <svg 
                className={`w-4 h-4 transform transition-transform ${showWorkouts ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </button>
            
            {showWorkouts && (
              <div className="mt-2">
                {entry.workouts.map((workout, i) => (
                  <div key={i} className="ml-4 mt-2">
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
        )}
      </div>
    </Card>
  );
};

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
      
      // Filter out dates with no data
      const filteredData = statsData.filter(day => 
        day.weight || day.nutrition.protein > 0 || day.nutrition.calories > 0 || day.workouts.length > 0
      );
      
      // Sort data chronologically
      const sortedData = [...filteredData].sort((a, b) => 
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

  // Function to handle updates to nutrition data
  const handleNutritionUpdate = (date, updatedNutrition) => {
    // Update the local state
    setHistoryData(prevData => 
      prevData.map(entry => {
        if (entry.date === date) {
          return {
            ...entry,
            nutrition: {
              ...entry.nutrition,
              protein: updatedNutrition.protein,
              calories: updatedNutrition.calories
            }
          };
        }
        return entry;
      })
    );
    
    // Refresh data from server
    fetchData();
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

  // Only filter out records with no data for the daily entries, not the chart
  const entriesWithData = historyData.filter(entry => 
    entry.weight || entry.nutrition.protein > 0 || entry.nutrition.calories > 0 || entry.workouts.length > 0
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Progress History</h1>
      
      <SummaryCards 
        startingPoint={summary?.startingPoint}
        currentStatus={summary?.currentStatus}
      />

      <ProgressChart 
        data={historyData} 
        targetWeight={summary?.currentStatus?.targetWeight} 
      />

      <div className="space-y-4">
        {[...entriesWithData].reverse().map((entry) => (
          <DailyEntry 
            key={entry.date} 
            entry={entry} 
            onUpdate={handleNutritionUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;