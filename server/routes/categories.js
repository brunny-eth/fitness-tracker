import express from 'express';
import Category from '../models/category.js';
import Exercise from '../models/exercise.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category
      .find({ userId: req.user._id })
      .populate('exerciseCount')
      .sort({ name: 1 });
    
    const categoriesWithLastWorkout = await Promise.all(
      categories.map(async (category) => {
        const lastWorkout = await Workout.findOne(
          { 
            userId: req.user._id,
            category: category._id 
          },
          { date: 1 }
        ).sort({ date: -1 });

        return {
          ...category.toObject(),
          lastWorkoutDate: lastWorkout?.date || null
        };
      })
    );
    
    res.json(categoriesWithLastWorkout);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      userId: req.user._id
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = req.body.name;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Exercise.deleteMany({ categoryId: category._id });
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.lastCompletedAt = new Date();
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating completion time' });
  }
});

export default router;