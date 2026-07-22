import express from 'express';
import jwt from 'jsonwebtoken';
import {
  getSyllabuses,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from '../controllers/syllabusController.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to extract user from token if provided, without strictly failing if missing
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      let user = await Admin.findById(decoded.id).select('-password');
      if (!user) {
        user = await User.findById(decoded.id).select('-password');
      }
      req.user = user;
    } catch (err) {
      console.warn('Token validation warning in optionalAuth:', err.message);
    }
  }
  next();
};

// Public routes for fetching syllabus
router.route('/').get(getSyllabuses);
router.route('/:id').get(getSyllabusById);

// Admin / Content Management routes for managing syllabus dynamically
router.route('/').post(optionalAuth, createSyllabus);
router.route('/:id').put(optionalAuth, updateSyllabus);
router.route('/:id').delete(optionalAuth, deleteSyllabus);

export default router;
