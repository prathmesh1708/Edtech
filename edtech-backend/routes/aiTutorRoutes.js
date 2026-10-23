import express from 'express';
import {
  getStatus,
  listConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  sendMessage,
} from '../controllers/aiTutorController.js';
import { createQuiz, listQuizzes, getQuiz, submitQuiz } from '../controllers/aiPracticeController.js';
import { getInsights, listFlags, getFlag, updateFlag } from '../controllers/aiAdminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { aiRateLimit } from '../middleware/aiRateLimit.js';

const router = express.Router();

// Every AI route needs a signed-in user: chats are private and requests cost quota.
router.use(protect);

router.get('/status', getStatus);
router.post('/chat', aiRateLimit, sendMessage);

router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.patch('/conversations/:id', renameConversation);
router.delete('/conversations/:id', deleteConversation);

// Practice quizzes (generation calls Gemini, so it shares the rate limit and daily cap)
router.post('/practice/quizzes', aiRateLimit, createQuiz);
router.get('/practice/quizzes', listQuizzes);
router.get('/practice/quizzes/:id', getQuiz);
router.post('/practice/quizzes/:id/submit', submitQuiz);

// Admin: usage insights and safety review (shows students' messages, so admins only)
router.get('/admin/insights', authorize('admin'), getInsights);
router.get('/admin/flags', authorize('admin'), listFlags);
router.get('/admin/flags/:id', authorize('admin'), getFlag);
router.patch('/admin/flags/:id', authorize('admin'), updateFlag);

export default router;
