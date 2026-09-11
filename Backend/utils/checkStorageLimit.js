import { Report } from "../models/User/report.model.js";
import { User } from "../models/User/user.model.js";
import { getStorageLimitForPlan } from "../config/planConfig.js";

/**
 * Calculate total storage usage for a user based on their uploaded files
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} Total storage used in bytes
 */
export const calculateUserStorageUsage = async (userId) => {
  try {
    const ReportModel = Report();
    const reports = await ReportModel.find({ userId }).select('fileSize');
    const totalUsage = reports.reduce((acc, report) => acc + (report.fileSize || 0), 0);
    return totalUsage;
  } catch (error) {
    console.error('Error calculating user storage usage:', error);
    throw new Error('Failed to calculate storage usage');
  }
};

/**
 * Get user's storage limit based on their plan type
 * @param {Object} user - The user object
 * @returns {number} Storage limit in bytes
 */
export const getUserStorageLimit = (user) => {
  const planType = user.planType || 'free';
  return getStorageLimitForPlan(planType);
};


/**
 * Check if adding a new file would exceed the user's storage limit
 * @param {string} userId - The user's ID
 * @param {number} newFileSize - Size of the new file in bytes
 * @returns {Promise<Object>} Object containing limit check result
 */
export const checkStorageLimitBeforeUpload = async (userId, newFileSize) => {
  try {
    // Get user details
    const UserModel = User();
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate current storage usage
    const currentUsage = await calculateUserStorageUsage(userId);
    
    // Get user's storage limit
    const storageLimit = getUserStorageLimit(user);
    
    // Check if adding the new file would exceed the limit
    const totalAfterUpload = currentUsage + newFileSize;
    const wouldExceedLimit = totalAfterUpload > storageLimit;

    return {
      currentUsage,
      storageLimit,
      newFileSize,
      totalAfterUpload,
      wouldExceedLimit,
      availableSpace: storageLimit - currentUsage,
      usagePercentage: Math.round((currentUsage / storageLimit) * 100),
      usageAfterUploadPercentage: Math.round((totalAfterUpload / storageLimit) * 100),
      planType: user.planType || 'free'
    };
  } catch (error) {
    console.error('Error checking storage limit:', error);
    throw error;
  }
};

/**
 * Middleware to check storage limit before file upload
 * This middleware should be used before multer middleware
 */
export const checkStorageLimitMiddleware = async (req, res, next) => {
  try {
    // Skip storage check if no user is authenticated
    if (!req.user || !req.user.id) {
      return next();
    }

    // Skip if no file is being uploaded
    if (!req.file) {
      return next();
    }

    const userId = req.user.id;
    const fileSize = req.file.size;

    // Check storage limit
    const storageCheck = await checkStorageLimitBeforeUpload(userId, fileSize);

    if (storageCheck.wouldExceedLimit) {
      return res.status(413).json({
        success: false,
        error: 'STORAGE_LIMIT_EXCEEDED',
        message: 'Storage limit exceeded. Please upgrade your plan to upload more files.',
        details: {
          currentUsage: storageCheck.currentUsage,
          storageLimit: storageCheck.storageLimit,
          fileSize: storageCheck.newFileSize,
          availableSpace: storageCheck.availableSpace,
          usagePercentage: storageCheck.usagePercentage,
          planType: storageCheck.planType,
          // Convert bytes to human readable format
          currentUsageMB: Math.round(storageCheck.currentUsage / (1024 * 1024) * 100) / 100,
          storageLimitMB: Math.round(storageCheck.storageLimit / (1024 * 1024) * 100) / 100,
          fileSizeMB: Math.round(storageCheck.newFileSize / (1024 * 1024) * 100) / 100,
          availableSpaceMB: Math.round(storageCheck.availableSpace / (1024 * 1024) * 100) / 100
        }
      });
    }

    // Add storage info to request for potential use in other middleware/controllers
    req.storageInfo = storageCheck;
    next();
  } catch (error) {
    console.error('Error in storage limit middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check storage limit. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current storage usage for a user (for dashboard/profile display)
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Storage usage information
 */
export const getUserStorageInfo = async (userId) => {
  try {
    const UserModel = User();
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentUsage = await calculateUserStorageUsage(userId);
    const storageLimit = getUserStorageLimit(user);
    const usagePercentage = Math.round((currentUsage / storageLimit) * 100);

    return {
      currentUsage,
      storageLimit,
      usagePercentage,
      availableSpace: storageLimit - currentUsage,
      planType: user.planType || 'free',
      // Human readable formats
      currentUsageMB: Math.round(currentUsage / (1024 * 1024) * 100) / 100,
      storageLimitMB: Math.round(storageLimit / (1024 * 1024) * 100) / 100,
      availableSpaceMB: Math.round((storageLimit - currentUsage) / (1024 * 1024) * 100) / 100
    };
  } catch (error) {
    console.error('Error getting user storage info:', error);
    throw error;
  }
};
