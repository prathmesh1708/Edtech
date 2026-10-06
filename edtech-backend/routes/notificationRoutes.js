import express from 'express';
import {
  broadcastNotification,
  getAdminNotifications,
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes (Student/Teacher/Parent) — registered before '/:id' so their paths aren't read as ids
router.get('/user', getUserNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.delete('/clear-all', clearAllNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id/dismiss', dismissNotification);

// Admin routes — broadcasting sends a push to every device, so admins only
router.post('/broadcast', protect, authorize('admin'), broadcastNotification);
router.get('/admin', protect, authorize('admin'), getAdminNotifications);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

export default router;
