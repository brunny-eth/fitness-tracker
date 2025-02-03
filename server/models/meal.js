// server/models/meal.js
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
  },
  details: [{
    item: String,
    portion: String,
    protein: Number,
    calories: Number
  }]
}, {
  timestamps: true
});

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;