import express from 'express';
import Category from '../models/category.js';
import { auth } from '../middleware/auth.js';
import ExerciseTemplate from '../models/exercise.js';

const router = express.Router();

// Helper function to handle MongoDB timeouts
const withTimeout = (promise, timeoutMs = 5000) => {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  });
};

router.get('/', auth, async (req, res) => {
  try {
    // Get categories with a 5 second timeout
    const categories = await withTimeout(
      Category.find({ userId: req.user._id }).sort({ name: 1 }),
      5000
    );
    
    // Get exercise counts with a 5 second timeout for each category
    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
      try {
        const count = await withTimeout(
          ExerciseTemplate.countDocuments({
            categoryId: category._id,
            userId: req.user._id,
            isActive: true
          }),
          5000
        );
        
        const categoryObj = category.toObject();
        categoryObj.exerciseCount = count;
        return categoryObj;
      } catch (countError) {
        console.error(`Error getting count for category ${category._id}:`, countError);
        // Return category with count 0 if count query fails
        const categoryObj = category.toObject();
        categoryObj.exerciseCount = 0;
        return categoryObj;
      }
    }));
    
    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Category fetch error:', error); 
    // Send a more detailed error message
    res.status(error.message === 'Operation timed out' ? 504 : 500)
       .json({ 
         message: 'Error fetching categories',
         details: error.message
       });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      userId: req.user._id
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Category creation error:', error); 
    res.status(400).json({ message: 'Error creating category' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Category deletion error:', error); 
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router;