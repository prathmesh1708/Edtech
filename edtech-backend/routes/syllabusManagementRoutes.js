import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import {
  getGlobalSyllabuses, createGlobalSyllabus, updateGlobalSyllabus, deleteGlobalSyllabus,
  getBoards, createBoard, updateBoard, deleteBoard,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getChapters, createChapter, updateChapter, deleteChapter,
  getContentApprovals, updateApprovalStatus,
  getEducationalMaterials, createEducationalMaterial, updateEducationalMaterial, deleteEducationalMaterial
} from '../controllers/syllabusManagementController.js';

const router = express.Router();

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
      console.warn('Optional auth check warning:', err.message);
    }
  }
  next();
};

// Global Syllabus Routes
router.get('/global-syllabus', optionalAuth, getGlobalSyllabuses);
router.post('/global-syllabus', optionalAuth, createGlobalSyllabus);
router.put('/global-syllabus/:id', optionalAuth, updateGlobalSyllabus);
router.delete('/global-syllabus/:id', optionalAuth, deleteGlobalSyllabus);

// Board-wise Routes
router.get('/boards', optionalAuth, getBoards);
router.post('/boards', optionalAuth, createBoard);
router.put('/boards/:id', optionalAuth, updateBoard);
router.delete('/boards/:id', optionalAuth, deleteBoard);

// Subject Routes
router.get('/subjects', optionalAuth, getSubjects);
router.post('/subjects', optionalAuth, createSubject);
router.put('/subjects/:id', optionalAuth, updateSubject);
router.delete('/subjects/:id', optionalAuth, deleteSubject);

// Chapter Routes
router.get('/chapters', optionalAuth, getChapters);
router.post('/chapters', optionalAuth, createChapter);
router.put('/chapters/:id', optionalAuth, updateChapter);
router.delete('/chapters/:id', optionalAuth, deleteChapter);

// Content Approval System Routes
router.get('/content-approvals', optionalAuth, getContentApprovals);
router.put('/content-approvals/:id', optionalAuth, updateApprovalStatus);

// Educational Materials Routes
router.get('/educational-materials', optionalAuth, getEducationalMaterials);
router.post('/educational-materials', optionalAuth, createEducationalMaterial);
router.put('/educational-materials/:id', optionalAuth, updateEducationalMaterial);
router.delete('/educational-materials/:id', optionalAuth, deleteEducationalMaterial);

export default router;
