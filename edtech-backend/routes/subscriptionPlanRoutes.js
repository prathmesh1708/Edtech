import express from 'express';
import { 
  getSubscriptionPlans, 
  createSubscriptionPlan,
  getSubjectPricing,
  updateSubjectPricing 
} from '../controllers/subscriptionPlanController.js';

const router = express.Router();

router.get('/', getSubscriptionPlans);
router.post('/', createSubscriptionPlan);
router.get('/subject-pricing', getSubjectPricing);
router.post('/subject-pricing', updateSubjectPricing);

export default router;
