// server/models/Meal.js
import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  isSaved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;