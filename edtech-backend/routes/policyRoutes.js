import express from 'express';
import {
  getPublicCustomerPolicy,
  getAdminCustomerPolicy,
  updateCustomerPolicy,
} from '../controllers/policyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public — the privacy policy must be readable before signing up or logging in
router.get('/customer', getPublicCustomerPolicy);

// Admin — editing
router.get('/admin/customer', protect, authorize('admin'), getAdminCustomerPolicy);
router.put('/admin/customer', protect, authorize('admin'), updateCustomerPolicy);

export default router;
