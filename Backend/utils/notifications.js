import { createNotification } from "../controllers/User/notifications.controller.js";

/**
 * Send notification to a specific user via WebSocket and database
 * @param {object} io - Socket.io instance
 * @param {Map} connectedUsers - Map of connected users (userId -> socketId)
 * @param {string} userId - ID of the user to send notification to
 * @param {string} title - Notification title
 * @param {string} message - Notification message content
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {string|null} link - Optional link to navigate to when notification is clicked
 * @returns {object|null} - Created notification object or null if error
 */
const sendNotificationToUser = async (io, connectedUsers, userId, title, message, type = 'info', link = null) => {
  try {
    // Create notification in database
    const notification = await createNotification(userId, title, message, type, link);
    
    // Send notification via WebSocket if user is connected
    const socketId = connectedUsers.get(userId.toString());
    if (socketId && io) {
      io.to(socketId).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt
      });
      console.log(`Real-time notification sent to user ${userId}`);
    } else {
      console.log(`User ${userId} not connected, notification saved to database only`);
    }
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

/**
 * Send notification to multiple users
 * @param {object} io - Socket.io instance 
 * @param {Map} connectedUsers - Map of connected users (userId -> socketId)
 * @param {Array} userIds - Array of user IDs to notify
 * @param {string} title - Notification title
 * @param {string} message - Notification message content
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {string|null} link - Optional link to navigate to when notification is clicked
 * @returns {Array} - Array of created notification objects (null entries for failed notifications)
 */
const sendNotificationToMultipleUsers = async (io, connectedUsers, userIds, title, message, type = 'info', link = null) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => sendNotificationToUser(io, connectedUsers, userId, title, message, type, link))
    );
    
    return notifications;
  } catch (error) {
    console.error('Error sending notifications to multiple users:', error);
    return [];
  }
};

/**
 * Send broadcast notification to all connected users
 * @param {object} io - Socket.io instance
 * @param {string} title - Notification title
 * @param {string} message - Notification message content 
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {string|null} link - Optional link to navigate to when notification is clicked
 */
const broadcastNotification = (io, title, message, type = 'info', link = null) => {
  try {
    if (io) {
      io.emit('broadcast', {
        type,
        title,
        message,
        link,
        createdAt: new Date()
      });
      console.log('Broadcast notification sent to all connected users');
    } else {
      console.log('Socket.io instance not available, broadcast notification not sent');
    }
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
};

export {
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  broadcastNotification
};