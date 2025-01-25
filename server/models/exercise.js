import mongoose from 'mongoose';

const exerciseTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('ExerciseTemplate', exerciseTemplateSchema);