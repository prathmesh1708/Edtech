import express from 'express';
import {
  getGlobalSyllabuses, createGlobalSyllabus, updateGlobalSyllabus, deleteGlobalSyllabus,
  getBoards, createBoard, updateBoard, deleteBoard,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getChapters, getChapterById, createChapter, updateChapter, deleteChapter,
  getContentApprovals, updateApprovalStatus,
  getEducationalMaterials, createEducationalMaterial, updateEducationalMaterial, deleteEducationalMaterial
} from '../controllers/syllabusManagementController.js';

import { optionalAuth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


// Global Syllabus Routes
router.get('/global-syllabus', optionalAuth, getGlobalSyllabuses);
router.post('/global-syllabus', ...adminOnly, createGlobalSyllabus);
router.put('/global-syllabus/:id', ...adminOnly, updateGlobalSyllabus);
router.delete('/global-syllabus/:id', ...adminOnly, deleteGlobalSyllabus);

// Board-wise Routes
router.get('/boards', optionalAuth, getBoards);
router.post('/boards', ...adminOnly, createBoard);
router.put('/boards/:id', ...adminOnly, updateBoard);
router.delete('/boards/:id', ...adminOnly, deleteBoard);

// Subject Routes
router.get('/subjects', optionalAuth, getSubjects);
router.post('/subjects', ...adminOnly, createSubject);
router.put('/subjects/:id', ...adminOnly, updateSubject);
router.delete('/subjects/:id', ...adminOnly, deleteSubject);

// Chapter Routes
router.get('/chapters', optionalAuth, getChapters);
router.get('/chapters/:id', optionalAuth, getChapterById);
router.post('/chapters', ...adminOnly, createChapter);
router.put('/chapters/:id', ...adminOnly, updateChapter);
router.delete('/chapters/:id', ...adminOnly, deleteChapter);

// Content Approval System Routes
router.get('/content-approvals', ...adminOnly, getContentApprovals);
router.put('/content-approvals/:id', ...adminOnly, updateApprovalStatus);

// Educational Materials Routes
router.get('/educational-materials', optionalAuth, getEducationalMaterials);
router.post('/educational-materials', ...adminOnly, createEducationalMaterial);
router.put('/educational-materials/:id', ...adminOnly, updateEducationalMaterial);
router.delete('/educational-materials/:id', ...adminOnly, deleteEducationalMaterial);

export default router;
