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

// Middleware
app.use(cors({
  origin: ['https://www.fitness-tracker.me', 'https://fitness-tracker.me'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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