import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import syllabusManagementRoutes from './routes/syllabusManagementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import subscriptionPlanRoutes from './routes/subscriptionPlanRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Standard middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://studywisely.in',
  'https://www.studywisely.in',
  'http://studywisely.in',
  'http://www.studywisely.in',
  'https://edtech-frontend-lovat.vercel.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
}

const corsOptions = {
  origin: (origin, callback) => {
    // Reflect request origin to allow credentials
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Main server status route
app.get('/', (req, res) => {
  res.json({ message: 'API is running successfully...' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/syllabus-management', syllabusManagementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);

// Error Handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
