import { getUserStorageInfo } from "../../utils/checkStorageLimit.js";

// Get user's storage information
export const getStorageInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID is missing.',
      });
    }

    const storageInfo = await getUserStorageInfo(userId);
    
    res.json({
      success: true,
      storageInfo
    });
  } catch (error) {
    console.error('Error getting storage info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage information. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};