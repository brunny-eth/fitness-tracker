import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const SetLogger = ({ onSaveSet, onDeleteSet, initialSet = null }) => {
  const [weight, setWeight] = useState(initialSet?.weight || '');
  const [reps, setReps] = useState(initialSet?.reps || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    const weightNum = Number(weight);
    const repsNum = Number(reps);

    if (weightNum < 0 || weightNum > 500) {
      setError('Weight must be between 0 and 500 kg');
      return;
    }

    if (repsNum < 1 || repsNum > 100) {
      setError('Reps must be between 1 and 100');
      return;
    }

    onSaveSet({ weight: weightNum, reps: repsNum });
    if (!initialSet) {
      setWeight('');
      setReps('');
    }
  };

  return (
    <Card className="p-4 mb-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-24 p-2 border rounded"
            placeholder="Weight"
            min="0"
            max="500"
            step="0.5"
            required
          />
          <span className="text-gray-500">kg</span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-24 p-2 border rounded"
            placeholder="Reps"
            min="1"
            max="100"
            required
          />
          <span className="text-gray-500">reps</span>
        </div>

        <div className="flex justify-between">
          <Button type="submit">
            {initialSet ? 'Update Set' : 'Add Set'}
          </Button>
          {initialSet && onDeleteSet && (
            <Button 
              type="button"
              onClick={onDeleteSet}
              variant="destructive"
            >
              Delete Set
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default SetLogger;