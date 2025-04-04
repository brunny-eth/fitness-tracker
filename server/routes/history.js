// server/routes/history.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import Meal from '../models/meal.js';
import Weight from '../models/weight.js';
import Workout from '../models/workout.js';
import Goals from '../models/goals.js';
import User from '../models/user.js';

const router = express.Router();

// Helper function to get date range in user's timezone
const getDateRangeInTimezone = (dateString, timezone = 'America/New_York') => {
  // Parse the date from the input string (YYYY-MM-DD)
  const date = dateString ? new Date(dateString) : new Date();
  
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

// Get summary data for dashboard
router.get('/summary', auth, async (req, res) => {
  try {
    // Starting point data
    const firstGoal = await Goals.findOne({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(1);
      
    const firstWeight = await Weight.findOne({ userId: req.user._id })
      .sort({ date: 1 })
      .limit(1);
    
    // Current status data
    const latestGoal = await Goals.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(1);
      
    const latestWeight = await Weight.findOne({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(1);
    
    // Get workout count for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const workoutCount = await Workout.countDocuments({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo }
    });
    
    const summary = {
      startingPoint: {
        weight: firstWeight?.weight,
        weightGoal: firstGoal?.weightGoal,
        muscleGoal: firstGoal?.muscleGoal,
        startDate: firstGoal?.createdAt || firstWeight?.date
      },
      currentStatus: {
        weight: latestWeight?.weight,
        targetWeight: latestGoal?.targetWeight,
        workoutCount,
        lastUpdated: latestWeight?.date
      }
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary data' });
  }
});

// Get stats by day for the past 30 days
router.get('/stats', auth, async (req, res) => {
  try {
    // Get user timezone
    const user = await User.findById(req.user._id);
    const timezone = user.timezone || 'UTC';
    
    // Get 30 days ago date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all weights, meals, workouts
    const [weights, meals, workouts, goals] = await Promise.all([
      Weight.find({
        userId: req.user._id,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: 1 }),
      
      Meal.find({
        userId: req.user._id,
        date: { $gte: thirtyDaysAgo },
        isSaved: false
      }).sort({ date: 1 }),
      
      Workout.find({
        userId: req.user._id,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: 1 }),
      
      Goals.findOne({
        userId: req.user._id
      }).sort({ createdAt: -1 })
    ]);
    
    // Get all unique dates across all data
    const allDates = new Set();
    
    // Function to get date string (YYYY-MM-DD) in user's timezone
    const getDateString = (date) => {
      const d = new Date(date);
      const localDate = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
      return localDate.toISOString().split('T')[0];
    };
    
    // Collect all dates
    weights.forEach(w => allDates.add(getDateString(w.date)));
    meals.forEach(m => allDates.add(getDateString(m.date)));
    workouts.forEach(w => allDates.add(getDateString(w.date)));
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Create stats for each day
    const stats = sortedDates.map(dateStr => {
      // Get date range for this day in user's timezone
      const { startOfDayUTC, endOfDayUTC } = getDateRangeInTimezone(dateStr, timezone);
      
      // Get weight for this day (if any)
      const dayWeight = weights.find(w => 
        getDateString(w.date) === dateStr
      );
      
      // Get meals for this day
      const dayMeals = meals.filter(m => 
        m.date >= startOfDayUTC && m.date <= endOfDayUTC
      );
      
      // Calculate nutrition totals
      const protein = dayMeals.reduce((total, meal) => total + meal.protein, 0);
      const calories = dayMeals.reduce((total, meal) => total + meal.calories, 0);
      
      // Get workouts for this day
      const dayWorkouts = workouts.filter(w => 
        w.date >= startOfDayUTC && w.date <= endOfDayUTC
      );
      
      return {
        date: dateStr,
        weight: dayWeight ? dayWeight.weight : null,
        nutrition: {
          protein,
          calories,
          proteinGoal: goals?.proteinTarget || 150,
          calorieGoal: goals?.calorieTarget || 2000
        },
        workouts: dayWorkouts.map(workout => ({
          category: workout.category,
          exercises: workout.exercises
        }))
      };
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({ error: 'Failed to fetch history stats' });
  }
});

// Get detailed data for a specific day
router.get('/day/:date', auth, async (req, res) => {
  try {
    const dateParam = req.params.date; // Expected format: YYYY-MM-DD
    
    // Get user with timezone info
    const user = await User.findById(req.user._id);
    const timezone = user.timezone || 'UTC';
    
    // Get date range for the requested day
    const { startOfDayUTC, endOfDayUTC } = getDateRangeInTimezone(dateParam, timezone);
    
    // Get meals, weight, and workouts for this day
    const [meals, weight, workouts, goals] = await Promise.all([
      Meal.find({
        userId: req.user._id,
        date: { $gte: startOfDayUTC, $lte: endOfDayUTC },
        isSaved: false
      }).sort('date'),
      
      Weight.findOne({
        userId: req.user._id,
        date: { $gte: startOfDayUTC, $lte: endOfDayUTC }
      }),
      
      Workout.find({
        userId: req.user._id,
        date: { $gte: startOfDayUTC, $lte: endOfDayUTC }
      }).sort('date'),
      
      Goals.findOne({
        userId: req.user._id
      }).sort({ createdAt: -1 })
    ]);
    
    // Calculate nutrition totals
    const protein = meals.reduce((total, meal) => total + meal.protein, 0);
    const calories = meals.reduce((total, meal) => total + meal.calories, 0);
    
    const dayData = {
      date: dateParam,
      weight: weight ? weight.weight : null,
      meals,
      nutrition: {
        protein,
        calories,
        proteinGoal: goals?.proteinTarget || 150,
        calorieGoal: goals?.calorieTarget || 2000
      },
      workouts: workouts.map(workout => ({
        category: workout.category,
        exercises: workout.exercises
      }))
    };
    
    res.json(dayData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch day data' });
  }
});

export default router;