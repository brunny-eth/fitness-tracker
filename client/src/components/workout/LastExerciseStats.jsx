// client/src/components/workout/LastExerciseStats.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Clock } from 'lucide-react';
import { api } from '../../utils/api';

const LastExerciseStats = ({ categoryId, exerciseId }) => {
  const [lastWorkout, setLastWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastWorkout = async () => {
      if (!categoryId || !exerciseId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await api.get(`/api/exercises/last/${categoryId}/${exerciseId}`);
        setLastWorkout(data);
      } catch (err) {
        console.error('Error fetching last workout:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLastWorkout();
  }, [categoryId, exerciseId]);

  if (loading) {
    return (
      <Card className="p-4 mb-4 bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!lastWorkout?.sets?.length) {
    return (
      <Card className="p-4 mb-4 bg-gray-50">
        <p className="text-gray-500 text-sm flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          No previous data for this exercise
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4 bg-blue-50">
      <div className="space-y-2">
        <div className="flex items-center text-sm text-blue-700">
          <Clock className="w-4 h-4 mr-2" />
          Last time ({new Date(lastWorkout.date).toLocaleDateString()}):
        </div>
        <div className="grid grid-cols-2 gap-2">
          {lastWorkout.sets.map((set, idx) => (
            <div key={idx} className="text-sm bg-white p-2 rounded">
              Set {idx + 1}: {set.weight}kg × {set.reps}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LastExerciseStats;