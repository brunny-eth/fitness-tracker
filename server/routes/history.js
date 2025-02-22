// server/routes/history.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import Meal from '../models/meal.js';
import Workout from '../models/workout.js';
import Weight from '../models/weight.js';
import Goals from '../models/goals.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const endDate = new Date();
    
    // Get user info to check creation date
    const user = await User.findById(req.user._id);
    
    // Use either user creation date or 30 days ago, whichever is more recent
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const startDate = user.createdAt > thirtyDaysAgo ? 
      new Date(user.createdAt) : thirtyDaysAgo;
    
    // Helper function for consistent date string conversion
    const getDateString = (date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    // Get all meals in date range
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');

    // Get all workouts in date range
    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');

    // Get all weight entries in date range
    const weights = await Weight.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');

    // Get the goals that were active during this period
    const allGoals = await Goals.find({
      userId: req.user._id,
      createdAt: { $lte: endDate }
    }).sort('createdAt');

    // Aggregate data by day
    const dailyStats = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = getDateString(currentDate);
      
      // Find goals that apply to this date
      let applicableGoals = null;
      for (let i = allGoals.length - 1; i >= 0; i--) {
        if (getDateString(allGoals[i].createdAt) <= dateStr) {
          applicableGoals = allGoals[i];
          break;
        }
      }
      // Use the earliest goals if no applicable goals were found
      if (!applicableGoals && allGoals.length > 0) {
        applicableGoals = allGoals[0];
      }

      // Find meals for this day - ensure date comparison is done properly
      const dayMeals = meals.filter(meal => {
        return getDateString(meal.date) === dateStr;
      });

      // Calculate daily totals
      const dailyProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const dailyCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);

      // Find workouts for this day
      const dayWorkouts = workouts.filter(workout => 
        getDateString(workout.date) === dateStr
      );

      // Find weight entry for this day
      const weightEntry = weights.find(w => 
        getDateString(w.date) === dateStr
      );

      dailyStats.push({
        date: dateStr,
        nutrition: {
          protein: dailyProtein,
          proteinGoal: applicableGoals?.proteinTarget || 0,
          calories: dailyCalories,
          calorieGoal: applicableGoals?.calorieTarget || 0
        },
        workouts: dayWorkouts.map(w => ({
          category: w.category,
          exercises: w.exercises.map(e => ({
            name: e.name,
            sets: e.sets
          }))
        })),
        weight: weightEntry?.weight,
        weightGoal: applicableGoals?.targetWeight
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

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
    console.log('Initial goals:', initialGoals);

    const currentGoals = await Goals.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    console.log('Current goals:', currentGoals);

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
        lastUpdated: latestWeight?.date || currentGoals?.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;