// server/routes/nutrition.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { analyzeMeal } from '../services/mealAnalysis.js';
import Meal from '../models/meal.js';
import Goals from '../models/goals.js';
import Weight from '../models/weight.js';
import User from '../models/user.js';

const router = express.Router();

// Helper function to get date range in user's timezone
const getDateRangeInTimezone = (dateString = null, timezone = 'UTC') => {
  // Parse the date from the input string (YYYY-MM-DD) or use current date
  const date = dateString ? new Date(dateString + 'T00:00:00.000Z') : new Date();
  
  // Create date with time set to 00:00:00 in user's timezone
  const startOfDay = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  startOfDay.setHours(0, 0, 0, 0);
  
  // Create date with time set to 23:59:59 in user's timezone
  const endOfDay = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  endOfDay.setHours(23, 59, 59, 999);
  
  // Convert back to UTC for database queries
  const startOfDayUTC = new Date(startOfDay.toLocaleString('en-US', { timeZone: 'UTC' }));
  const endOfDayUTC = new Date(endOfDay.toLocaleString('en-US', { timeZone: 'UTC' }));
  
  return { startOfDayUTC, endOfDayUTC };
};

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
    // Get user with timezone info
    const user = await User.findById(req.user._id);
    const timezone = user.timezone || 'UTC';
    
    // Get date range in user's timezone
    const { startOfDayUTC, endOfDayUTC } = getDateRangeInTimezone(null, timezone);

    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
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
    // Get user with timezone info
    const user = await User.findById(req.user._id);
    const timezone = user.timezone || 'UTC';
    
    // Get date range in user's timezone
    const { startOfDayUTC, endOfDayUTC } = getDateRangeInTimezone(null, timezone);

    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
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

// Get meals for a specific date
router.get('/log/date/:date', auth, async (req, res) => {
  try {
    const dateParam = req.params.date; // Expected format: YYYY-MM-DD
    
    // Get user with timezone info
    const user = await User.findById(req.user._id);
    const timezone = user?.timezone || 'UTC';
    
    // Validate the date format
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
    if (!isValidDate) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Create date range for the requested day in user's timezone
    const { startOfDayUTC, endOfDayUTC } = getDateRangeInTimezone(dateParam, timezone);

    console.log('Fetching meals between:', startOfDayUTC, 'and', endOfDayUTC);

    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
      isSaved: false
    }).sort('date');

    console.log(`Found ${meals.length} meals for date ${dateParam}`);
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals for date:', error);
    res.status(500).json({ error: 'Failed to fetch meals for date' });
  }
});

// Update a meal entry
router.put('/log/:id', auth, async (req, res) => {
  try {
    const { name, protein, calories, details } = req.body;
    
    const updatedMeal = await Meal.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        $set: {
          name: name,
          protein: protein,
          calories: calories,
          details: details
        }
      },
      { new: true }
    );
    
    if (!updatedMeal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json(updatedMeal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update meal' });
  }
});

// Edit nutrition for a specific date
router.post('/edit-date/:date', auth, async (req, res) => {
  try {
    const dateParam = req.params.date; // Expected format: YYYY-MM-DD
    const { protein, calories } = req.body;
    
    // Get user with timezone info
    const user = await User.findById(req.user._id);
    const timezone = user?.timezone || 'UTC';
    
    // Validate the date format
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
    if (!isValidDate) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Create date range for the requested day in user's timezone
    const { startOfDayUTC, endOfDayUTC } = getDateRangeInTimezone(dateParam, timezone);

    // Step 1: Delete all meals for this date
    await Meal.deleteMany({
      userId: req.user._id,
      date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
      isSaved: false
    });

    // Step 2: Create a single manual entry with the totals
    const manualEntry = new Meal({
      userId: req.user._id,
      name: "Manual Entry",
      protein: protein,
      calories: calories,
      date: startOfDayUTC, // Use start of day for consistency
      isSaved: false
    });

    await manualEntry.save();

    res.json(manualEntry);
  } catch (error) {
    console.error('Error editing nutrition for date:', error);
    res.status(500).json({ error: 'Failed to edit nutrition for date' });
  }
});

export default router;