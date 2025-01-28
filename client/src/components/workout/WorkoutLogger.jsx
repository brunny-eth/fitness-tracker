import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import ExerciseSelector from './ExerciseSelector';
import SetLogger from './SetLogger';

const WorkoutLogger = ({ category }) => {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  
  useEffect(() => {
    const savedWorkout = localStorage.getItem(`workout-${category}`);
    if (savedWorkout) {
      setExercises(JSON.parse(savedWorkout));
    }
  }, [category]);

  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem(`workout-${category}`, JSON.stringify(exercises));
    }
  }, [exercises, category]);

  const handleSelectExercise = (exercise) => {
    setCurrentExercise(exercise);
  };

  const handleSaveSet = (set) => {
    const exerciseIndex = exercises.findIndex(e => e._id === currentExercise._id);
    
    if (exerciseIndex === -1) {
      setExercises([
        ...exercises,
        {
          ...currentExercise,
          sets: [set]
        }
      ]);
    } else {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: [...updatedExercises[exerciseIndex].sets, set]
      };
      setExercises(updatedExercises);
    }
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setExercises(updatedExercises);
  };

  const handleCompleteWorkout = async () => {
    try {
      const response = await fetch('/api/workouts/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          exercises,
          date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        localStorage.removeItem(`workout-${category}`);
        setExercises([]);
        setCurrentExercise(null);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  return (
    <div className="space-y-4">
      <ExerciseSelector 
        category={category}
        onSelectExercise={handleSelectExercise}
      />

      {currentExercise && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">{currentExercise.name}</h3>
          <SetLogger onSaveSet={handleSaveSet} />
        </Card>
      )}

      {exercises.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Workout Progress</h3>
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise._id} className="mb-6">
              <h4 className="font-medium mb-2">{exercise.name}</h4>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                  <span>Set {setIndex + 1}: {set.weight}kg × {set.reps} reps</span>
                  <Button
                    onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                    className="text-red-500"
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
          >
            Complete Workout
          </Button>
        </Card>
      )}
    </div>
  );
};

export default WorkoutLogger;