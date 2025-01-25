import express from 'express';
import mongoose from 'mongoose';
import nutritionRoutes from './routes/nutrition.js';
import exerciseRoutes from './routes/exercises.js';

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.use('/api/nutrition', nutritionRoutes);
app.use('/api/exercises', exerciseRoutes);

export default app;