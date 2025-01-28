import express from 'express';
import mongoose from 'mongoose';
import nutritionRoutes from './routes/nutrition.js';
import exerciseRoutes from './routes/exercises.js';
import categoriesRouter from './routes/categories.js';

const categoriesRouter = require('./routes/categories');
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.use('/api/nutrition', nutritionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/categories', categoriesRouter);

export default app;