import express from 'express';
import {
  getSyllabuses,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from '../controllers/syllabusController.js';

import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


// Public routes for fetching syllabus
router.route('/').get(getSyllabuses);
router.route('/:id').get(getSyllabusById);

// Admin / Content Management routes for managing syllabus dynamically
router.route('/').post(...adminOnly, createSyllabus);
router.route('/:id').put(...adminOnly, updateSyllabus);
router.route('/:id').delete(...adminOnly, deleteSyllabus);

export default router;
