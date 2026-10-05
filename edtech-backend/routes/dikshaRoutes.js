import express from 'express';
import {
  getFilters,
  search,
  getMyContent,
  getCourses,
  getContent,
  getHierarchy,
  addBookmark,
  getBookmarks,
  removeBookmark,
  addRecentlyViewed,
  getRecentlyViewed,
} from '../controllers/dikshaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { dikshaRateLimit } from '../middleware/dikshaRateLimit.js';

const router = express.Router();

// DIKSHA proxy routes (rate limited)
router.get('/filters', dikshaRateLimit, getFilters);
router.get('/search', dikshaRateLimit, search);
router.get('/my-content', dikshaRateLimit, protect, getMyContent);
router.get('/courses', dikshaRateLimit, getCourses);
router.get('/content/:id', dikshaRateLimit, getContent);
router.get('/collections/:id/hierarchy', dikshaRateLimit, getHierarchy);

// Per-user bookmarks and recently viewed (metadata only)
router.post('/bookmarks', protect, addBookmark);
router.get('/bookmarks', protect, getBookmarks);
router.delete('/bookmarks/:contentId', protect, removeBookmark);
router.post('/recently-viewed', protect, addRecentlyViewed);
router.get('/recently-viewed', protect, getRecentlyViewed);

export default router;
