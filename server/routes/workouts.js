import express from 'express';
import { auth } from '../middleware/auth.js';
import Workout from '../models/workout.js';
import Category from '../models/category.js';

const router = express.Router();

// Log a completed workout
router.post('/log', auth, async (req, res) => {
  try {
    const { categoryId, exercises, completedAt } = req.body;

    // Validate request body
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: 'Invalid exercises data' });
    }

    // Get category name
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create workout
    const workout = new Workout({
      userId: req.user._id,
      category: category.name,
      exercises: exercises,
      date: completedAt || new Date()
    });

    await workout.save();

    // Update category's lastCompletedAt
    await Category.findByIdAndUpdate(categoryId, {
      lastCompletedAt: completedAt || new Date()
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// Get workout history
router.get('/history', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({
      userId: req.user._id
    })
    .sort('-date')
    .limit(30);
    
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workout history:', error);
    res.status(500).json({ error: 'Failed to fetch workout history' });
  }
});

export default router;