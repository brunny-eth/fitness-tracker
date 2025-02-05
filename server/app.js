// server/app.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nutritionRoutes from './routes/nutrition.js';
import exerciseRoutes from './routes/exercises.js';
import categoriesRouter from './routes/categories.js';
import historyRouter from './routes/history.js';
import goalsRouter from './routes/goals.js';

const app = express();

// Middleware
app.use(cors());  // Enable CORS
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
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/history', historyRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;