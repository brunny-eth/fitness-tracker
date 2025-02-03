// server/routes/nutrition.js
import express from 'express';
import { analyzeMeal } from '../services/mealAnalysis.js';
import Meal from '../models/meal.js';

const router = express.Router();

// Analyze a meal description
router.post('/analyze', async (req, res) => {
  try {
    console.log('Received analyze request with body:', req.body);
    
    const { description } = req.body;
    if (!description) {
      console.log('No description provided');
      return res.status(400).json({ error: 'Meal description is required' });
    }

    console.log('Analyzing meal:', description);
    const analysis = await analyzeMeal(description);
    console.log('Analysis result:', analysis);
    
    // Transform the detailed analysis into the format expected by the frontend
    const simplifiedResponse = {
      name: description,
      protein: analysis.total.protein,
      calories: analysis.total.calories,
      details: analysis.breakdown
    };

    res.json(simplifiedResponse);
  } catch (error) {
    console.error('Error in /analyze endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze meal' });
  }
});


// Get today's meal log
router.get('/log', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      date: { $gte: startOfDay },
      isSaved: false
    }).sort('date');

    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Log a new meal
router.post('/log', async (req, res) => {
  try {
    const meal = new Meal({
      name: req.body.name,
      protein: req.body.protein,
      calories: req.body.calories,
      details: req.body.details
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(400).json({ error: 'Failed to log meal' });
  }
});

// Delete a logged meal
router.delete('/log/:id', async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Get saved meals
router.get('/saved-meals', async (req, res) => {
  try {
    const meals = await Meal.find({ isSaved: true }).sort('-date');
    res.json(meals);
  } catch (error) {
    console.error('Error fetching saved meals:', error);
    res.status(500).json({ error: 'Failed to fetch saved meals' });
  }
});

// Save a meal for future use
router.post('/save-meal', async (req, res) => {
  try {
    const meal = new Meal({
      name: req.body.name,
      protein: req.body.protein,
      calories: req.body.calories,
      details: req.body.details,
      isSaved: true
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    console.error('Error saving meal:', error);
    res.status(400).json({ error: 'Failed to save meal' });
  }
});

// Delete a saved meal
router.delete('/saved-meal/:id', async (req, res) => {
  try {
    await Meal.findOneAndDelete({
      _id: req.params.id,
      isSaved: true
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting saved meal:', error);
    res.status(500).json({ error: 'Failed to delete saved meal' });
  }
});

// Get nutrition stats for today
router.get('/stats', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      date: { $gte: startOfDay },
      isSaved: false
    });

    const stats = meals.reduce((acc, meal) => ({
      currentProtein: acc.currentProtein + meal.protein,
      currentCalories: acc.currentCalories + meal.calories
    }), { currentProtein: 0, currentCalories: 0 });

    // Add the goals (these could come from user settings later)
    stats.proteinGoal = 150;
    stats.calorieGoal = 2000;

    res.json(stats);
  } catch (error) {
    console.error('Error fetching nutrition stats:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition stats' });
  }
});

export default router;