import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const SetLogger = ({ onSaveSet, onDeleteSet, initialSet = null }) => {
  const [weight, setWeight] = useState(initialSet?.weight || '');
  const [reps, setReps] = useState(initialSet?.reps || '');

  const commonWeights = [5, 10, 20, 40];
  const commonReps = [8, 10, 12, 15];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (weight && reps) {
      onSaveSet({ weight: Number(weight), reps: Number(reps) });
      if (!initialSet) {
        setWeight('');
        setReps('');
      }
    }
  };

  return (
    <Card className="p-4 mb-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-24 p-2 border rounded"
              placeholder="Weight"
              min="0"
              step="0.5"
            />
            <span className="text-gray-500">kg</span>
          </div>
          <div className="flex space-x-2">
            {commonWeights.map((w) => (
              <Button
                key={w}
                type="button"
                onClick={() => setWeight(w)}
                className="px-2 py-1"
              >
                {w}kg
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-24 p-2 border rounded"
              placeholder="Reps"
              min="1"
            />
            <span className="text-gray-500">reps</span>
          </div>
          <div className="flex space-x-2">
            {commonReps.map((r) => (
              <Button
                key={r}
                type="button"
                onClick={() => setReps(r)}
                className="px-2 py-1"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="submit">
            {initialSet ? 'Update Set' : 'Add Set'}
          </Button>
          {initialSet && onDeleteSet && (
            <Button 
              type="button"
              onClick={() => onDeleteSet()}
              className="bg-red-500 hover:bg-red-600"
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