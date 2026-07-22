import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Main server status route
app.get('/', (req, res) => {
  res.json({ message: 'API is running successfully...' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/student', studentRoutes);

// Error Handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
