// server/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password
    });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Create and return JWT token
    const payload = {
      id: user._id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists - FIXED: looking for email field instead of username
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user._id.toString());
    
    // Verify password
    console.log('Attempting password verification');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    console.log('Creating token for user:', user._id.toString());
    const payload = {
      id: user._id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        console.log('Token created successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;