import express from 'express';
import Meal from '../models/Meal.js';
import { analyzeMeal } from '../services/mealAnalysis.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const analysis = await analyzeMeal(req.body.description);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/log', async (req, res) => {
  try {
    const meal = new Meal({
      userId: req.user._id, 
      ...req.body
    });
    await meal.save();
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/log', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: today },
      isSaved: false
    });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;