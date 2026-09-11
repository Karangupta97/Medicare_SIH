import express from 'express';
import { verifyToken } from '../../middleware/User/verifyToken.js';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
  createNotificationEndpoint,
  deleteNotification
} from '../../controllers/User/notifications.controller.js';

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(verifyToken);

// Get all notifications for the authenticated user
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadNotificationsCount);

// Mark a notification as read
router.patch('/:id/read', markNotificationRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllNotificationsRead);

// Create a new notification
router.post('/', createNotificationEndpoint);

// Delete a notification
router.delete('/:id', deleteNotification);

export default router;