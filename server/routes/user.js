// server/routes/user.js
import express from 'express';
import User from '../models/user.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Update user's timezone
router.post('/timezone', auth, async (req, res) => {
  try {
    const { timezone } = req.body;
    
    if (!timezone) {
      return res.status(400).json({ message: 'Timezone is required' });
    }
    
    // Update the user's timezone in the database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { timezone },
      { new: true, select: '-password' } // Return updated user without password
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating timezone:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;