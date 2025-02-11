// server/routes/goals.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import Goals from '../models/goals.js';

const router = express.Router();

// Get current goals
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    
    if (!goals) {
      return res.status(404).json({ message: 'No goals found' });
    }
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new goals
router.post('/', auth, async (req, res) => {
  try {
    const goals = new Goals({
      userId: req.user._id,
      weightGoal: req.body.weightGoal || 'maintain',
      muscleGoal: req.body.muscleGoal,
      targetWeight: req.body.targetWeight,
      currentWeight: req.body.currentWeight,
      weeklyGoal: req.body.weeklyGoal,
      targetDate: req.body.targetDate
    });

    goals.calculateNutritionTargets();
    
    const savedGoals = await goals.save();
    res.status(201).json(savedGoals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update goals
router.put('/', auth, async (req, res) => {
  try {
    const goals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    
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
router.get('/history', auth, async (req, res) => {
  try {
    const goals = await Goals.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;