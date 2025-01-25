// client/src/components/workout/ExerciseSelector.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const ExerciseSelector = ({ category, onSelectExercise }) => {
  const [exercises, setExercises] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState('');

  useEffect(() => {
    fetchExercises();
  }, [category]);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`/api/exercises?category=${category}`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newExercise, category }),
      });
      const data = await response.json();
      setExercises([...exercises, data]);
      setNewExercise('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Select Exercise</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New'}
        </Button>
      </div>

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
          <Button type="submit">Save Exercise</Button>
        </form>
      )}

      <div className="space-y-2">
        {exercises.map((exercise) => (
          <button
            key={exercise._id}
            onClick={() => onSelectExercise(exercise)}
            className="w-full text-left p-3 hover:bg-gray-50 rounded border"
          >
            {exercise.name}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default ExerciseSelector;