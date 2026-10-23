import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  saveFcmToken,
  removeFcmToken,
  sendOTP,
  verifyOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

import { authAccountLimit, authIpLimit } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', authIpLimit, authAccountLimit, registerUser);
router.post('/login', authIpLimit, authAccountLimit, loginUser);
router.post('/send-otp', authIpLimit, authAccountLimit, sendOTP);
router.post('/verify-otp', authIpLimit, authAccountLimit, verifyOTP);
router.get('/profile', protect, getUserProfile);

router.post('/fcm-token', protect, saveFcmToken);
router.delete('/fcm-token', protect, removeFcmToken);

export default router;
