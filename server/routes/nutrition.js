// server/routes/nutrition.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { analyzeMeal } from '../services/mealAnalysis.js';
import Meal from '../models/meal.js';
import Goals from '../models/goals.js';
import Weight from '../models/weight.js';

const router = express.Router();

// Analyze a meal description
router.post('/analyze', auth, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    const analysis = await analyzeMeal(description);
    const simplifiedResponse = {
      name: description,
      protein: analysis.total.protein,
      calories: analysis.total.calories,
      details: analysis.breakdown
    };

    res.json(simplifiedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to analyze meal' });
  }
});

// Get today's meal log
router.get('/log', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startOfDay },
      isSaved: false
    }).sort('date');

    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Log a new meal
router.post('/log', auth, async (req, res) => {
  try {
    const meal = new Meal({
      userId: req.user._id,
      name: req.body.name,
      protein: req.body.protein,
      calories: req.body.calories,
      details: req.body.details
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to log meal' });
  }
});

// Delete a logged meal
router.delete('/log/:id', auth, async (req, res) => {
  try {
    await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Get saved meals
router.get('/saved-meals', auth, async (req, res) => {
  try {
    const meals = await Meal.find({
      userId: req.user._id,
      isSaved: true
    }).sort('-date');
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved meals' });
  }
});

// Save a meal for future use
router.post('/save-meal', auth, async (req, res) => {
  try {
    const meal = new Meal({
      userId: req.user._id,
      name: req.body.name,
      protein: req.body.protein,
      calories: req.body.calories,
      details: req.body.details,
      isSaved: true
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save meal' });
  }
});

// Delete a saved meal
router.delete('/saved-meal/:id', auth, async (req, res) => {
  try {
    await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      isSaved: true
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete saved meal' });
  }
});

// Get nutrition stats for today
router.get('/stats', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startOfDay },
      isSaved: false
    });

    const stats = meals.reduce((acc, meal) => ({
      currentProtein: acc.currentProtein + meal.protein,
      currentCalories: acc.currentCalories + meal.calories
    }), { currentProtein: 0, currentCalories: 0 });

    const currentGoals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    
    if (currentGoals) {
      stats.proteinGoal = currentGoals.proteinTarget;
      stats.calorieGoal = currentGoals.calorieTarget;
    } else {
      stats.proteinGoal = 150;
      stats.calorieGoal = 2000;
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nutrition stats' });
  }
});

// Log weight
router.post('/weight', auth, async (req, res) => {
  try {
    const { weight } = req.body;
    
    const weightEntry = new Weight({
      userId: req.user._id,
      weight
    });
    await weightEntry.save();

    const currentGoals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    
    if (currentGoals) {
      currentGoals.currentWeight = weight;
      currentGoals.calculateNutritionTargets();
      await currentGoals.save();
    }

    res.status(201).json(weightEntry);
  } catch (error) {
    res.status(400).json({ error: 'Failed to log weight' });
  }
});

// Get weight history
router.get('/weight/history', auth, async (req, res) => {
  try {
    const weights = await Weight.find({
      userId: req.user._id
    })
      .sort({ date: -1 })
      .limit(30);
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weight history' });
  }
});

export default router;