import express from 'express';
import { getAnalyticsData, getEducationalInsights } from '../controllers/analyticsController.js';

import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/analytics
router.get('/', ...adminOnly, getAnalyticsData);

// GET /api/analytics/educational-insights
router.get('/educational-insights', ...adminOnly, getEducationalInsights);

export default router;
