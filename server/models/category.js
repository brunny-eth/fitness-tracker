// server/models/category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lastCompletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.virtual('exerciseCount', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category;