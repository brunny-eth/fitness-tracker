import express from 'express';
import Category from '../models/category.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category
      .find({ userId: req.user._id })
      .sort({ name: 1 });
    
    res.json(categories);
  } catch (error) {
    console.error('Category fetch error:', error); 
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
    console.error('Category creation error:', error); 
    res.status(400).json({ message: 'Error creating category' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Category deletion error:', error); 
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router;