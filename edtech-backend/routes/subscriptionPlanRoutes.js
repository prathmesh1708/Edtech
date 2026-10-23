import express from 'express';
import { 
  getSubscriptionPlans, 
  createSubscriptionPlan,
  getSubjectPricing,
  updateSubjectPricing 
} from '../controllers/subscriptionPlanController.js';

import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSubscriptionPlans);
router.post('/', ...adminOnly, createSubscriptionPlan);
router.get('/subject-pricing', getSubjectPricing);
router.post('/subject-pricing', ...adminOnly, updateSubjectPricing);

export default router;
