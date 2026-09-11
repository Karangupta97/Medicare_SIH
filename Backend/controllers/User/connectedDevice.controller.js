import { getDeviceSessionModel } from '../../models/User/deviceSession.model.js';
import { getDBConnection } from '../../DB/db.js';
import crypto from 'crypto';

// Helper function to generate device fingerprint
const generateDeviceFingerprint = (userAgent, ipAddress, userId) => {
  const data = `${userAgent}-${ipAddress}-${userId}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  const platform = userAgent.includes('Mobile') ? 'mobile' : 
                  userAgent.includes('Tablet') || userAgent.includes('iPad') ? 'tablet' :
                  'desktop';
  
  let browser = 'Unknown';
  let os = 'Unknown';
  
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  return { platform, browser, os };
};

// Helper function to determine device type
const determineDeviceType = (userAgent, platform) => {
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone')) return 'mobile';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) return 'tablet';
  if (userAgent.includes('Mac') && !userAgent.includes('iPad')) return 'laptop';
  if (userAgent.includes('Windows') || userAgent.includes('Linux')) return 'desktop';
  return 'other';
};

// Register or update current device
const registerDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const currentToken = req.token; // Token attached by verifyToken middleware
    
    const dbConnection = getDBConnection(req.get('origin'));
    const DeviceSession = getDeviceSessionModel(dbConnection);
    
    const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress, userId);
    const { platform, browser, os } = parseUserAgent(userAgent);
    const deviceType = determineDeviceType(userAgent, platform);
    
    // Generate a device name based on browser and OS
    const deviceName = `${browser} on ${os}`;
    
    // Find or create user session document
    let userSession = await DeviceSession.findOrCreateUserSession(userId);
    
    // Add or update device
    const deviceData = {
      deviceName,
      deviceType,
      deviceInfo: {
        userAgent,
        platform,
        browser,
        os,
        ipAddress
      },
      deviceFingerprint,
      isCurrentDevice: true,
      status: 'active'
    };
    
    await userSession.addOrUpdateDevice(deviceData);
    
    // Add session token
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await userSession.addSession(currentToken, deviceFingerprint, tokenExpiry);
    
    // Get the updated device info
    const device = userSession.findDeviceByFingerprint(deviceFingerprint);
    
    res.status(200).json({
      success: true,
      message: 'Device registered successfully',
      device: {
        id: device._id,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isCurrentDevice: device.isCurrentDevice,
        lastActiveAt: device.lastActiveAt,
        status: device.status
      }
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error.message
    });
  }
};

// Get all connected devices for the user
const getConnectedDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const dbConnection = getDBConnection(req.get('origin'));
    const DeviceSession = getDeviceSessionModel(dbConnection);
    
    const userSession = await DeviceSession.findOne({ userId });
    
    if (!userSession) {
      return res.status(200).json({
        success: true,
        devices: []
      });
    }
    
    // Filter out removed devices and format response
    const activeDevices = userSession.devices.filter(device => device.status !== 'removed');
    const formattedDevices = activeDevices.map(device => ({
      id: device._id,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      browser: device.deviceInfo.browser,
      os: device.deviceInfo.os,
      platform: device.deviceInfo.platform,
      isCurrentDevice: device.isCurrentDevice,
      lastActiveAt: device.lastActiveAt,
      isActive: userSession.getActiveDevices().some(d => d.deviceFingerprint === device.deviceFingerprint),
      location: device.location,
      status: device.status,
      activeSessionsCount: userSession.activeSessions.filter(s => s.deviceFingerprint === device.deviceFingerprint).length
    }));
    
    res.status(200).json({
      success: true,
      devices: formattedDevices
    });
  } catch (error) {
    console.error('Error fetching connected devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected devices',
      error: error.message
    });
  }
};

// Remove a connected device
const removeDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    const dbConnection = getDBConnection(req.get('origin'));
    const DeviceSession = getDeviceSessionModel(dbConnection);
    
    const userSession = await DeviceSession.findOne({ userId });
    
    if (!userSession) {
      return res.status(404).json({
        success: false,
        message: 'User session not found'
      });
    }
    
    // Find device by ID
    const device = userSession.devices.find(d => d._id.toString() === deviceId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    // Don't allow removing the current device
    if (device.isCurrentDevice) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the current device'
      });
    }
    
    // Remove device using the method (this will blacklist tokens and mark as removed)
    await userSession.removeDevice(device.deviceFingerprint);
    
    res.status(200).json({
      success: true,
      message: 'Device removed successfully. All associated sessions have been terminated.',
      tokensBlacklisted: userSession.blacklistedTokens.filter(bt => bt.deviceFingerprint === device.deviceFingerprint).length
    });
  } catch (error) {
    console.error('Error removing device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove device',
      error: error.message
    });
  }
};

// Update device name
const updateDeviceName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const { deviceName } = req.body;
    
    if (!deviceName || deviceName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Device name is required'
      });
    }
    
    const dbConnection = getDBConnection(req.get('origin'));
    const DeviceSession = getDeviceSessionModel(dbConnection);
    
    const userSession = await DeviceSession.findOne({ userId });
    
    if (!userSession) {
      return res.status(404).json({
        success: false,
        message: 'User session not found'
      });
    }
    
    const device = userSession.devices.find(d => d._id.toString() === deviceId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    device.deviceName = deviceName.trim();
    await userSession.save();
    
    res.status(200).json({
      success: true,
      message: 'Device name updated successfully',
      device: {
        id: device._id,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isCurrentDevice: device.isCurrentDevice,
        lastActiveAt: device.lastActiveAt
      }
    });
  } catch (error) {
    console.error('Error updating device name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device name',
      error: error.message
    });
  }
};

// Remove all inactive devices (older than 30 days)
const removeInactiveDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const dbConnection = getDBConnection(req.get('origin'));
    const DeviceSession = getDeviceSessionModel(dbConnection);
    
    const userSession = await DeviceSession.findOne({ userId });
    
    if (!userSession) {
      return res.status(200).json({
        success: true,
        message: 'No devices found for user',
        modifiedCount: 0
      });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let modifiedCount = 0;
    
    // Mark inactive devices as 'inactive' status
    userSession.devices.forEach(device => {
      if (device.lastActiveAt < thirtyDaysAgo && 
          !device.isCurrentDevice && 
          device.status === 'active') {
        device.status = 'inactive';
        modifiedCount++;
      }
    });
    
    if (modifiedCount > 0) {
      await userSession.save();
    }
    
    res.status(200).json({
      success: true,
      message: `Marked ${modifiedCount} devices as inactive`,
      modifiedCount: modifiedCount
    });
  } catch (error) {
    console.error('Error removing inactive devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove inactive devices',
      error: error.message
    });
  }
};

export {
  registerDevice,
  getConnectedDevices,
  removeDevice,
  updateDeviceName,
  removeInactiveDevices
};
