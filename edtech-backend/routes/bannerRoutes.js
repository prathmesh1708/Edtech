import express from 'express';
import {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';

import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Student route for active banners
router.get('/active', getActiveBanners);

// Admin CRUD routes
router.get('/', ...adminOnly, getBanners);
router.post('/', ...adminOnly, createBanner);
router.put('/:id', ...adminOnly, updateBanner);
router.delete('/:id', ...adminOnly, deleteBanner);

export default router;
