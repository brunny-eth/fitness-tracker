// File: client/src/components/workout/ExerciseSelector.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const ExerciseSelector = ({ category, onSelectExercise, currentExercise }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (category?._id && user) {
      fetchExercises();
    }
  }, [category?._id, user]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get(`/api/exercises?categoryId=${category._id}`);
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError(`Failed to load exercises: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const data = await api.post('/api/exercises', {
        name: newExercise.trim(),
        categoryId: category._id
      });
      
      setExercises([...exercises, data]);
      setNewExercise('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding exercise:', error);
      setError(`Failed to add exercise: ${error.message}`);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Select Exercise</h3>
        <Button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null); // Clear any existing errors
          }}
          variant={showAddForm ? "outline" : "default"}
          size="sm"
        >
          {showAddForm ? 'Cancel' : 'Add New'}
        </Button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddExercise} className="mb-4">
          <div className="mb-2">
            <Label htmlFor="exerciseName">Exercise Name</Label>
            <Input
              id="exerciseName"
              type="text"
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              placeholder="Exercise name"
              required
            />
          </div>
          <Button 
            type="submit"
            disabled={!newExercise.trim()}
          >
            Save Exercise
          </Button>
        </form>
      )}

      <div className="space-y-2">
        {exercises.length === 0 && !isLoading ? (
          <p className="text-gray-500 text-center py-4">
            No exercises yet. Add your first exercise!
          </p>
        ) : (
          exercises.map((exercise) => (
            <button
              key={exercise._id}
              onClick={() => onSelectExercise(exercise)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                currentExercise?._id === exercise._id
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              {exercise.name}
            </button>
          ))
        )}
      </div>
    </Card>
  );
};

export default ExerciseSelector;