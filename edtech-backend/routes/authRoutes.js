import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  saveFcmToken,
  removeFcmToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

router.post('/fcm-token', protect, saveFcmToken);
router.delete('/fcm-token', protect, removeFcmToken);

export default router;
