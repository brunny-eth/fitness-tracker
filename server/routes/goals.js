import express from 'express';
import Goals from '../models/goals.js';

const router = express.Router();

// Get current goals
router.get('/', async (req, res) => {
  try {
    // Just get the most recent goals
    const goals = await Goals.findOne().sort({ createdAt: -1 });
    
    if (!goals) {
      return res.status(404).json({ message: 'No goals found' });
    }
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new goals
router.post('/', async (req, res) => {
  try {
    const goals = new Goals({
      weightGoal: req.body.weightGoal || 'maintain',
      muscleGoal: req.body.muscleGoal,
      targetWeight: req.body.targetWeight,
      currentWeight: req.body.currentWeight,
      weeklyGoal: req.body.weeklyGoal,
      targetDate: req.body.targetDate
    });

    // Calculate nutrition targets based on goals
    goals.calculateNutritionTargets();
    
    const savedGoals = await goals.save();
    res.status(201).json(savedGoals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update goals
router.put('/', async (req, res) => {
  try {
    const goals = await Goals.findOne().sort({ createdAt: -1 });
    
    if (!goals) {
      return res.status(404).json({ message: 'No goals found' });
    }
    
    Object.assign(goals, req.body);
    goals.calculateNutritionTargets();
    
    const updatedGoals = await goals.save();
    res.json(updatedGoals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get goals history
router.get('/history', async (req, res) => {
  try {
    const goals = await Goals.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;