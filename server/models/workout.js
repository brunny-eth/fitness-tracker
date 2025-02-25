// server/models/workout.js
import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  reps: { type: Number, required: true }
});

const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Exercise' },
  name: { type: String, required: true },
  sets: [setSchema],
  notes: String
});

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  exercises: [exerciseSchema]
}, {
  timestamps: true
});

export default mongoose.model('Workout', workoutSchema);