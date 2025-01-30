import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const ExerciseSelector = ({ category, onSelectExercise, currentExercise }) => {
  const [exercises, setExercises] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (category?._id) {
      fetchExercises();
    }
  }, [category?._id]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/exercises?categoryId=${category._id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch exercises');
      }
      
      const data = await response.json();
      console.log('Fetched exercises:', data);
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
      console.log('Attempting to create exercise:', {
        name: newExercise.trim(),
        categoryId: category._id
      });

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newExercise.trim(), 
          categoryId: category._id 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create exercise');
      }
      
      const data = await response.json();
      console.log('Created exercise:', data);
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
          variant="outline"
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
          <input
            type="text"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Exercise name"
            required
          />
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