import express from 'express';
import mongoose from 'mongoose';
import nutritionRoutes from './routes/nutrition.js';

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.use('/api/nutrition', nutritionRoutes);

export default app;