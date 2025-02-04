import mongoose from 'mongoose';

const weightSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Weight', weightSchema);