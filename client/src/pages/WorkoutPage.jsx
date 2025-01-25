import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';

const WorkoutStats = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Today's Status</h3>
        <p className="text-gray-600">No workout logged yet</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Last Workout</h3>
        <p className="text-gray-600">2 days ago - Push day</p>
      </Card>
    </div>
  );
};

const WorkoutCategories = () => {
  const [categories, setCategories] = useState([]);

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Workout Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-gray-500">{category.exerciseCount} exercises</p>
            </div>
            <Button>Start</Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WorkoutPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workout Tracking</h1>
      <WorkoutStats />
      <WorkoutCategories />
    </div>
  );
};

export default WorkoutPage;