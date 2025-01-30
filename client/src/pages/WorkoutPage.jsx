import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import WorkoutLogger from '../components/workout/WorkoutLogger';

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

const WorkoutCategories = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Categories response:', data); 
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
      setCategories([]); 
    }
  };
  

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCategoryName,
          userID: "65b9474e39d3a34e8fd3e372"
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create category');
      
      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      setError('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      setCategories(categories.filter(cat => cat._id !== categoryId));
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Workout Categories</h3>
        <Button onClick={() => setIsAddingCategory(!isAddingCategory)}>
          {isAddingCategory ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isAddingCategory && (
        <form onSubmit={handleAddCategory} className="mb-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Category name"
            required
          />
          <Button type="submit">Save Category</Button>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-gray-500">
                {category.exerciseCount || 0} exercises
                {category.lastWorkoutDate && 
                  ` • Last workout: ${new Date(category.lastWorkoutDate).toLocaleDateString()}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onSelectCategory(category)}>Start</Button>
              <Button 
                onClick={() => handleDeleteCategory(category._id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WorkoutPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workout Tracking</h1>
      <WorkoutStats />
      
      {selectedCategory ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
            <Button onClick={() => setSelectedCategory(null)}>
              Back to Categories
            </Button>
          </div>
          <WorkoutLogger category={selectedCategory} />
        </>
      ) : (
        <WorkoutCategories onSelectCategory={setSelectedCategory} />
      )}
    </div>
  );
};

export default WorkoutPage;