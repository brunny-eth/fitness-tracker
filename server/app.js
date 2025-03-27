// server/app.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nutritionRoutes from './routes/nutrition.js';
import exerciseRoutes from './routes/exercises.js';
import categoriesRouter from './routes/categories.js';
import historyRouter from './routes/history.js';
import goalsRouter from './routes/goals.js';
import workoutRoutes from './routes/workouts.js';
import authRoutes from './routes/auth.js';

const app = express();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined');
  process.exit(1);
}

// In your server/app.js file
const cors = require('cors');

// Add CORS middleware with proper configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://fitness-tracker.me', 'https://www.fitness-tracker.me'],
  credentials: true, // If you're using cookies or authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add explicit handling of OPTIONS requests
app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working', 
    dbStatus: mongoose.connection.readyState 
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Database connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);  
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/history', historyRouter);
app.use('/api/workouts', workoutRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;