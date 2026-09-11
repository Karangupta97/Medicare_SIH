import Notification from '../../models/User/notification.model.js';
import asyncHandler from 'express-async-handler';
import { sendNotificationToUser } from '../../utils/socket.js';

// Get all notifications for a user
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build filter query
  const filter = { userId: req.user.id }; // Changed from req.user._id to req.user.id
  
  // Add type filter if provided
  if (type && type !== 'all') {
    filter.type = type;
  }
  
  // Add search filter if provided
  if (search) {
    filter.$or = [
      { message: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } }
    ];
  }

  // Get notifications with filters and pagination
  const NotificationModel = Notification();
  const notifications = await NotificationModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalItems = await NotificationModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / parseInt(limit));
  
  // Get unread count
  const unreadCount = await NotificationModel.countDocuments({ 
    userId: req.user.id, // Changed from req.user._id to req.user.id
    read: false 
  });

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      limit: parseInt(limit)
    }
  });
});

// Get unread notification count for a user
const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
  try {
    const { userId } = req;
    
    // Count unread notifications for this user
    const NotificationModel = Notification();
    const count = await NotificationModel.countDocuments({ 
      userId, 
      read: false 
    });
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notifications count',
      error: error.message
    });
  }
});

// Mark a notification as read
const markNotificationRead = asyncHandler(async (req, res) => {
  const NotificationModel = Notification();
  const notification = await NotificationModel.findOne({
    _id: req.params.id,
    userId: req.user.id // Changed from req.user._id to req.user.id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    notification
  });
});

// Mark all notifications as read
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const NotificationModel = Notification();
  await NotificationModel.updateMany(
    { userId: req.user.id, read: false }, // Changed from req.user._id to req.user.id
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Create a new notification (internal use)
const createNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    const NotificationModel = Notification();
    const notification = await NotificationModel.create({
      userId,
      title,
      message,
      type,
      link
    });
    
    // Emit socket event for real-time notification
    sendNotificationToUser(userId, notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Create a notification (API endpoint)
const createNotificationEndpoint = asyncHandler(async (req, res) => {
  const { userId, title, message, type, link } = req.body;

  // Check authorization - only admins or system can create notifications for others
  if (userId !== req.user.id && req.user.role !== 'admin') { // Changed from req.user._id.toString() to req.user.id
    res.status(403);
    throw new Error('Not authorized to create notifications for other users');
  }

  const notification = await createNotification(userId, title, message, type, link);
  
  if (!notification) {
    res.status(500);
    throw new Error('Failed to create notification');
  }

  res.status(201).json({
    success: true,
    notification
  });
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
  const NotificationModel = Notification();
  const notification = await NotificationModel.findOne({
    _id: req.params.id,
    userId: req.user.id // Changed from req.user._id to req.user.id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

export {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  createNotificationEndpoint,
  deleteNotification
};