// client/src/components/workout/WorkoutLogger.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import ExerciseSelector from './ExerciseSelector';
import SetLogger from './SetLogger';
import LastExerciseStats from './LastExerciseStats';

const WorkoutLogger = ({ category }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const storageKey = `workout-${category._id}`;
  const navigate = useNavigate();
  
  // Load saved workout from localStorage
  useEffect(() => {
    if (user) {  
      try {
        const savedWorkout = localStorage.getItem(storageKey);
        if (savedWorkout) {
          const parsedWorkout = JSON.parse(savedWorkout);
          setExercises(parsedWorkout);
        } else {
          setExercises([]);
        }
      } catch (error) {
        console.error('Error loading saved workout:', error);
        setError('Failed to load saved workout');
      }
    }
  }, [category._id, user, storageKey]);

  const handleCompleteWorkout = async () => {
    if (!user || exercises.length === 0) return;
  
    try {
      setIsCompleting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Format the exercises data properly for the API, ensuring exerciseId is included
      const formattedExercises = exercises.map(exercise => ({
        exerciseId: exercise._id, // Ensure exerciseId is explicitly passed
        name: exercise.name,
        sets: exercise.sets || []
      }));
      
      console.log('Sending workout data:', {
        categoryId: category._id,
        exercises: formattedExercises
      });
      
      // Send to API and save workout
      await api.post('/api/workouts/log', {
        categoryId: category._id,
        exercises: formattedExercises,
        completedAt: new Date().toISOString()
      });
  
      // Clear storage and state
      localStorage.removeItem(storageKey);
      setExercises([]);
      setCurrentExercise(null);
      setSuccessMessage('Workout completed successfully!');
      
      // Dispatch workout complete event
      window.dispatchEvent(new Event('workoutComplete'));
      
      // Navigate after delay
      setTimeout(() => {
        navigate('/workouts');
      }, 2000);
      
    } catch (error) {
      console.error('Error completing workout:', error);
      setError('Failed to save workout: ' + (error.message || 'Please try again.'));
    } finally {
      setIsCompleting(false);
    }
  };  

  // Save workout to localStorage whenever exercises change
  useEffect(() => {
    try {
      if (exercises.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(exercises));
      } else {
        localStorage.removeItem(storageKey); // Clean up if no exercises
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      setError('Failed to save workout progress');
    }
  }, [exercises, storageKey]);

  const handleSelectExercise = (exercise) => {
    // Check if exercise already exists in current workout
    const existingExercise = exercises.find(e => e._id === exercise._id);
    if (existingExercise) {
      setCurrentExercise(existingExercise);
    } else {
      setCurrentExercise({
        ...exercise,
        sets: []
      });
    }
    setError(null);
  };

  const handleSaveSet = (set) => {
    setExercises(prevExercises => {
      const exerciseIndex = prevExercises.findIndex(e => e._id === currentExercise._id);
      
      if (exerciseIndex === -1) {
        // New exercise
        return [...prevExercises, {
          ...currentExercise,
          sets: [set],
          lastUpdated: new Date().toISOString()
        }];
      } else {
        // Existing exercise
        const updatedExercises = [...prevExercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: [...updatedExercises[exerciseIndex].sets, set],
          lastUpdated: new Date().toISOString()
        };
        return updatedExercises;
      }
    });
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    setExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
      const exercise = updatedExercises[exerciseIndex];
      
      // Remove the set
      exercise.sets.splice(setIndex, 1);
      
      // If no sets left, remove the exercise
      if (exercise.sets.length === 0) {
        updatedExercises.splice(exerciseIndex, 1);
        // Reset currentExercise if it was the deleted one
        if (currentExercise?._id === exercise._id) {
          setCurrentExercise(null);
        }
      } else {
        exercise.lastUpdated = new Date().toISOString();
      }
      
      return updatedExercises;
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <ExerciseSelector 
        category={category}
        onSelectExercise={handleSelectExercise}
        currentExercise={currentExercise}
      />

      {currentExercise && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">{currentExercise.name}</h3>
            <LastExerciseStats 
              categoryId={category._id} 
              exerciseId={currentExercise._id}
            />
            <SetLogger onSaveSet={handleSaveSet} />
          </Card>
        </div>
      )}

      {exercises.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Workout Progress</h3>
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise._id} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{exercise.name}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(exercise.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                  <span>Set {setIndex + 1}: {set.weight}kg × {set.reps} reps</span>
                  <Button
                    onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ))}
          
          <Button 
            onClick={handleCompleteWorkout}
            className="w-full mt-4"
            isLoading={isCompleting}
          >
            Complete Workout
          </Button>
        </Card>
      )}
    </div>
  );
};

export default WorkoutLogger;