import express from 'express';
import ExerciseTemplate from '../models/exercise.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// test route
router.get('/test', (req, res) => {
  console.log('Exercise test route hit!');
  res.json({ message: 'Exercise route is working' });
});

// Create new exercise
router.post('/', auth, async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    console.log('Received exercise creation request:', { name, categoryId });

    if (!name) {
      return res.status(400).json({ message: 'Exercise name is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    console.log('Full request body:', req.body);
    console.log('User from auth:', req.user);

    const exercise = new ExerciseTemplate({
      name: name.trim(),
      categoryId,
      userId: req.user._id,
      isActive: true
    });

    console.log('Created exercise object:', exercise);

    const savedExercise = await exercise.save();
    console.log('Saved exercise:', savedExercise);
    
    res.status(201).json(savedExercise);
  } catch (error) {
    console.error('Detailed error creating exercise:', error);
    res.status(400).json({ 
      message: 'Error creating exercise',
      details: error.message 
    });
  }
});

// Get exercises for a category
router.get('/', auth, async (req, res) => {
  try {
    const { categoryId } = req.query;
    console.log('Fetching exercises for category:', categoryId);
    
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    const exercises = await ExerciseTemplate.find({
      categoryId,
      userId: req.user._id,
      isActive: true
    }).sort({ name: 1 });

    console.log(`Found ${exercises.length} exercises`);
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Error fetching exercises' });
  }
});

router.get('/last/:categoryId/:exerciseId', auth, async (req, res) => {
  try {
    const { categoryId, exerciseId } = req.params;
    
    // Find the most recent workout in this category that includes this exercise
    const lastWorkout = await Workout.findOne({
      userId: req.user._id,
      'exercises.exerciseId': exerciseId,
      categoryId: categoryId
    })
    .sort({ date: -1 })
    .select('date exercises');

    if (!lastWorkout) {
      return res.json({ message: 'No previous data found' });
    }

    // Find the specific exercise data from this workout
    const exerciseData = lastWorkout.exercises.find(e => 
      e.exerciseId.toString() === exerciseId
    );

    res.json({
      date: lastWorkout.date,
      sets: exerciseData.sets
    });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({ message: 'Error fetching exercise history' });
  }
});

// Soft delete exercise
router.delete('/:id', auth, async (req, res) => {
  try {
    const exercise = await ExerciseTemplate.findOneAndUpdate(
      { 
        _id: req.params.id,
        userId: req.user._id
      },
      { isActive: false },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({ message: 'Exercise deleted' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Error deleting exercise' });
  }
});

export default router;