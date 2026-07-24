import express from 'express';
import { getAnalyticsData, getEducationalInsights } from '../controllers/analyticsController.js';

const router = express.Router();

// GET /api/analytics
router.get('/', getAnalyticsData);

// GET /api/analytics/educational-insights
router.get('/educational-insights', getEducationalInsights);

export default router;
