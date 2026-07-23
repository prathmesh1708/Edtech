import express from 'express';
import jwt from 'jsonwebtoken';
import {
  getDashboardData,
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo,
  getStudentsAdmin,
  createStudentAdmin,
  updateStudentAdmin,
  deleteStudentAdmin
} from '../controllers/studentController.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper middleware for optional authentication
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      let user = await User.findById(decoded.id).select('-password');
      if (!user) {
        user = await Admin.findById(decoded.id).select('-password');
      }
      req.user = user;
    } catch (err) {
      console.warn('Optional auth check warning:', err.message);
    }
  }
  next();
};

router.get('/dashboard', optionalAuth, getDashboardData);

// To-Do Checklist Routes
router.get('/todos', optionalAuth, getTodos);
router.post('/todos', optionalAuth, createTodo);
router.put('/todos/:id', optionalAuth, toggleTodo);
router.delete('/todos/:id', optionalAuth, deleteTodo);

// Admin Student CRUD Routes
router.get('/admin', protect, authorize('admin'), getStudentsAdmin);
router.post('/admin', protect, authorize('admin'), createStudentAdmin);
router.put('/admin/:id', protect, authorize('admin'), updateStudentAdmin);
router.delete('/admin/:id', protect, authorize('admin'), deleteStudentAdmin);

export default router;
