// server/models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;