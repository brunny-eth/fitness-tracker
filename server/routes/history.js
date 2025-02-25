// server/routes/history.js - Fixed summary endpoint
import express from 'express';
import { auth } from '../middleware/auth.js';
import Meal from '../models/meal.js';
import Workout from '../models/workout.js';
import Weight from '../models/weight.js';
import Goals from '../models/goals.js';
import User from '../models/user.js';

const router = express.Router();

// Helper function for consistent date string conversion - defined at the module level
const getDateString = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

router.get('/stats', auth, async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of current day in user's timezone
    
    // Get user info to check creation date
    const user = await User.findById(req.user._id);
    
    // Use either user creation date or 30 days ago, whichever is more recent
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of day 30 days ago
    
    const startDate = user.createdAt > thirtyDaysAgo ? 
      new Date(user.createdAt) : thirtyDaysAgo;
    
    // Helper function for consistent date string conversion
    const getDateString = (date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    // Fetch all data in parallel for better performance
    const [meals, workouts, weights, allGoals] = await Promise.all([
      // Get all meals in date range
      Meal.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort('date'),

      // Get all workouts in date range
      Workout.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort('date'),

      // Get all weight entries in date range
      Weight.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort('date'),

      // Get the goals that were active during this period
      Goals.find({
        userId: req.user._id,
        createdAt: { $lte: endDate }
      }).sort('createdAt')
    ]);

    // Log weight entries to debug
    console.log('Weight entries:', weights.map(w => ({ 
      date: w.date, 
      dateStr: getDateString(w.date), 
      weight: w.weight 
    })));

    // Create a map of dates with actual data
    const dateMap = new Map();
    
    // Process all meal dates
    meals.forEach(meal => {
      const dateStr = getDateString(meal.date);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { 
          date: dateStr,
          nutrition: { protein: 0, calories: 0, proteinGoal: 0, calorieGoal: 0 },
          workouts: [],
          hasData: true
        });
      }
    });
    
    // Process all workout dates
    workouts.forEach(workout => {
      const dateStr = getDateString(workout.date);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { 
          date: dateStr,
          nutrition: { protein: 0, calories: 0, proteinGoal: 0, calorieGoal: 0 },
          workouts: [],
          hasData: true
        });
      }
    });
    
    // Process all weight dates
    weights.forEach(weight => {
      const dateStr = getDateString(weight.date);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { 
          date: dateStr,
          nutrition: { protein: 0, calories: 0, proteinGoal: 0, calorieGoal: 0 },
          workouts: [],
          hasData: true
        });
      }
      
      const entry = dateMap.get(dateStr);
      entry.weight = weight.weight;
    });

    // Only include dates that have actual data
    const dailyStats = [];
    
    // Now process each date with data
    for (const [dateStr, entry] of dateMap.entries()) {
      const dateObj = new Date(dateStr + 'T00:00:00.000Z');
      
      // Find goals that apply to this date
      let applicableGoals = null;
      for (let i = allGoals.length - 1; i >= 0; i--) {
        if (allGoals[i].createdAt <= dateObj) {
          applicableGoals = allGoals[i];
          break;
        }
      }
      // Use the earliest goals if no applicable goals were found
      if (!applicableGoals && allGoals.length > 0) {
        applicableGoals = allGoals[0];
      }

      // Find meals for this day and calculate totals
      const dayMeals = meals.filter(meal => getDateString(meal.date) === dateStr);
      entry.nutrition.protein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      entry.nutrition.calories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      
      // Add goal values if available
      if (applicableGoals) {
        entry.nutrition.proteinGoal = applicableGoals.proteinTarget;
        entry.nutrition.calorieGoal = applicableGoals.calorieTarget;
        entry.weightGoal = applicableGoals.targetWeight;
      }

      // Find workouts for this day
      const dayWorkouts = workouts.filter(workout => getDateString(workout.date) === dateStr);
      entry.workouts = dayWorkouts.map(w => ({
        category: w.category,
        exercises: w.exercises.map(e => ({
          name: e.name,
          sets: e.sets
        }))
      }));

      // Add to the final result if there's actual data
      if (entry.workouts.length > 0 || entry.nutrition.protein > 0 || entry.nutrition.calories > 0 || entry.weight) {
        dailyStats.push(entry);
      }
    }

    // Sort by date
    dailyStats.sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(dailyStats);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get summary stats (for the header cards)
router.get('/summary', auth, async (req, res) => {
  try {
    const initialGoals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: 1 });

    const currentGoals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    // Get latest weight entry
    const latestWeight = await Weight.findOne({
      userId: req.user._id
    }).sort({ date: -1 });

    // Get workout count for last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const workoutCount = await Workout.countDocuments({
      userId: req.user._id,
      date: { $gte: startDate }
    });

    const lastUpdated = latestWeight ? new Date(latestWeight.date) : 
                       (currentGoals ? new Date(currentGoals.updatedAt) : new Date());
    
    // Convert to UTC ISO string to avoid timezone issues
    const lastUpdatedISO = lastUpdated.toISOString();

    res.json({
      startingPoint: {
        weight: initialGoals?.currentWeight,
        targetWeight: initialGoals?.targetWeight, 
        weightGoal: initialGoals?.weightGoal,
        muscleGoal: initialGoals?.muscleGoal,
        startDate: initialGoals?.createdAt
      },
      currentStatus: {
        weight: latestWeight?.weight || currentGoals?.currentWeight,
        targetWeight: currentGoals?.targetWeight,  
        workoutCount,
        lastUpdated: lastUpdatedISO
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;