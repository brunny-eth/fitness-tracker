// server/routes/history.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import Meal from '../models/meal.js';
import Workout from '../models/workout.js';
import Weight from '../models/weight.js';
import Goals from '../models/goals.js';

const router = express.Router();

// Get historical data for a date range (default last 30 days)
router.get('/stats', auth, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

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
    const goals = await Goals.find({
      userId: req.user._id,
      createdAt: { $lte: endDate }
    }).sort('-createdAt');

    // Aggregate data by day
    const dailyStats = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find meals for this day
      const dayMeals = meals.filter(meal => 
        meal.date.toISOString().split('T')[0] === dateStr
      );

      // Calculate daily totals
      const dailyProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const dailyCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);

      // Find workouts for this day
      const dayWorkouts = workouts.filter(workout =>
        workout.date.toISOString().split('T')[0] === dateStr
      );

      // Find weight entry for this day
      const weightEntry = weights.find(w => 
        w.date.toISOString().split('T')[0] === dateStr
      );

      // Find applicable goals for this day
      const applicableGoals = goals.find(g => 
        g.createdAt.toISOString().split('T')[0] <= dateStr
      ) || goals[0]; // Use most recent goals if none found

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
    // Get initial goals entry
    const initialGoals = await Goals.findOne({
      userId: req.user._id
    }).sort('createdAt');

    // Get latest goals entry
    const currentGoals = await Goals.findOne({
      userId: req.user._id
    }).sort('-createdAt');

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
        target: initialGoals?.targetWeight,
        startDate: initialGoals?.createdAt
      },
      currentStatus: {
        weight: currentGoals?.currentWeight,
        workoutCount,
        lastUpdated: currentGoals?.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;