import express from 'express';
import ExerciseTemplate from '../models/exercise.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const exercises = await ExerciseTemplate.find({
      category: req.query.category,
      isActive: true
    });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const exercise = new ExerciseTemplate({
      name: req.body.name,
      category: req.body.category,
      userId: req.user._id 
    });
    const savedExercise = await exercise.save();
    res.status(201).json(savedExercise);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ExerciseTemplate.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;