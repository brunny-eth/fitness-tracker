import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  reps: { type: Number, required: true }
});

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: [setSchema],
  notes: String
});

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, required: true },
  exercises: [exerciseSchema]
});

export default mongoose.model('Workout', workoutSchema);