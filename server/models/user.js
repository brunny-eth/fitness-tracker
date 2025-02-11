import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);