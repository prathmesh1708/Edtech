import express from 'express';
import {
  broadcastNotification,
  getAdminNotifications,
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

// Admin routes
router.post('/broadcast', broadcastNotification);
router.get('/admin', getAdminNotifications);
router.delete('/:id', deleteNotification);

// User routes (Student/Teacher/Parent)
router.get('/user', getUserNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

export default router;
