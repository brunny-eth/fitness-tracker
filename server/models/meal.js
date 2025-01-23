import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  protein: { type: Number, required: true },
  calories: { type: Number, required: true },
  isSaved: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Meal', mealSchema);