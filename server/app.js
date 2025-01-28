// server/app.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nutritionRoutes from './routes/nutrition.js';
import exerciseRoutes from './routes/exercises.js';
import categoriesRouter from './routes/categories.js';

const app = express();

// Middleware
app.use(cors());  // Enable CORS
app.use(express.json());

// Database connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/categories', categoriesRouter);

export default app;