import express from 'express';
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
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/dashboard', protect, getDashboardData);

// To-Do Checklist Routes
router.get('/todos', protect, getTodos);
router.post('/todos', protect, createTodo);
router.put('/todos/:id', protect, toggleTodo);
router.delete('/todos/:id', protect, deleteTodo);

// Admin Student CRUD Routes
router.get('/admin', ...adminOnly, getStudentsAdmin);
router.post('/admin', ...adminOnly, createStudentAdmin);
router.put('/admin/:id', ...adminOnly, updateStudentAdmin);
router.delete('/admin/:id', ...adminOnly, deleteStudentAdmin);

export default router;
