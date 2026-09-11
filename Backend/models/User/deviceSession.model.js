import mongoose from 'mongoose';

const deviceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // Ensure one document per user
  },
  // Array of devices for this user
  devices: [{
    deviceName: {
      type: String,
      required: true,
      trim: true
    },
    deviceType: {
      type: String,
      required: true,
      enum: ['mobile', 'tablet', 'desktop', 'laptop', 'smartwatch', 'other'],
      default: 'other'
    },
    deviceInfo: {
      userAgent: {
        type: String,
        required: true
      },
      platform: String,
      browser: String,
      os: String,
      ipAddress: String
    },
    deviceFingerprint: {
      type: String,
      required: true
    },
    isCurrentDevice: {
      type: Boolean,
      default: false
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    location: {
      city: String,
      country: String,
      latitude: Number,
      longitude: Number
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked', 'removed'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Session tokens management for all devices
  activeSessions: [{
    token: {
      type: String,
      required: true
    },
    deviceFingerprint: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }],
  // Blacklisted tokens for all devices
  blacklistedTokens: [{
    token: {
      type: String,
      required: true
    },
    deviceFingerprint: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      enum: ['device_removed', 'manual_logout', 'security_breach', 'expired', 'session_terminated'],
      default: 'device_removed'
    },
    blacklistedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient lookups
deviceSessionSchema.index({ 'devices.deviceFingerprint': 1 });
deviceSessionSchema.index({ 'activeSessions.token': 1 });
deviceSessionSchema.index({ 'blacklistedTokens.token': 1 });
deviceSessionSchema.index({ 'blacklistedTokens.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to ensure only one current device
deviceSessionSchema.pre('save', function(next) {
  // Ensure only one device is marked as current
  let currentDeviceCount = 0;
  let lastCurrentIndex = -1;
  
  this.devices.forEach((device, index) => {
    if (device.isCurrentDevice) {
      currentDeviceCount++;
      lastCurrentIndex = index;
    }
  });
  
  // If more than one current device, keep only the last one
  if (currentDeviceCount > 1) {
    this.devices.forEach((device, index) => {
      device.isCurrentDevice = (index === lastCurrentIndex);
    });
  }
  
  next();
});

// Method to find a device by fingerprint
deviceSessionSchema.methods.findDeviceByFingerprint = function(deviceFingerprint) {
  return this.devices.find(device => device.deviceFingerprint === deviceFingerprint);
};

// Method to add or update a device
deviceSessionSchema.methods.addOrUpdateDevice = function(deviceData) {
  const existingDeviceIndex = this.devices.findIndex(
    device => device.deviceFingerprint === deviceData.deviceFingerprint
  );
  
  if (existingDeviceIndex !== -1) {
    // Update existing device
    const existingDevice = this.devices[existingDeviceIndex];
    Object.assign(existingDevice, deviceData);
    existingDevice.lastActiveAt = new Date();
  } else {
    // Add new device
    this.devices.push({
      ...deviceData,
      lastActiveAt: new Date(),
      createdAt: new Date()
    });
  }
  
  // If this is marked as current device, unmark all others
  if (deviceData.isCurrentDevice) {
    this.devices.forEach((device, index) => {
      device.isCurrentDevice = (device.deviceFingerprint === deviceData.deviceFingerprint);
    });
  }
  
  return this.save();
};

// Method to remove a device
deviceSessionSchema.methods.removeDevice = function(deviceFingerprint) {
  // Find device
  const deviceIndex = this.devices.findIndex(device => device.deviceFingerprint === deviceFingerprint);
  if (deviceIndex === -1) return false;
  
  // Get all active sessions for this device
  const deviceSessions = this.activeSessions.filter(session => session.deviceFingerprint === deviceFingerprint);
  
  // Batch blacklist all sessions without calling save() each time
  deviceSessions.forEach(session => {
    // Remove from active sessions
    this.activeSessions = this.activeSessions.filter(s => s.token !== session.token);
    
    // Add to blacklisted tokens
    this.blacklistedTokens.push({
      token: session.token,
      deviceFingerprint,
      reason: 'device_removed',
      blacklistedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  });
  
  // Remove device from array or mark as removed
  this.devices[deviceIndex].status = 'removed';
  this.devices[deviceIndex].isCurrentDevice = false;
  
  // Save only once after all modifications
  return this.save();
};

// Method to add a new session token
deviceSessionSchema.methods.addSession = function(token, deviceFingerprint, expiresAt) {
  this.activeSessions.push({
    token,
    deviceFingerprint,
    expiresAt,
    createdAt: new Date(),
    lastUsedAt: new Date()
  });
  
  // Update device's last active time
  const device = this.findDeviceByFingerprint(deviceFingerprint);
  if (device) {
    device.lastActiveAt = new Date();
  }
  
  return this.save();
};

// Method to update session last used time
deviceSessionSchema.methods.updateSessionActivity = function(token) {
  const session = this.activeSessions.find(s => s.token === token);
  if (session) {
    session.lastUsedAt = new Date();
    
    // Update device's last active time
    const device = this.findDeviceByFingerprint(session.deviceFingerprint);
    if (device) {
      device.lastActiveAt = new Date();
    }
    
    return this.save();
  }
  return false;
};

// Method to blacklist a token
deviceSessionSchema.methods.blacklistToken = function(token, deviceFingerprint, reason = 'device_removed') {
  // Remove from active sessions
  this.activeSessions = this.activeSessions.filter(s => s.token !== token);
  
  // Add to blacklisted tokens
  this.blacklistedTokens.push({
    token,
    deviceFingerprint,
    reason,
    blacklistedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  
  return this.save();
};

// Method to check if a token is blacklisted
deviceSessionSchema.methods.isTokenBlacklisted = function(token) {
  return this.blacklistedTokens.some(bt => bt.token === token);
};

// Method to check if a token is active
deviceSessionSchema.methods.isTokenActive = function(token) {
  const session = this.activeSessions.find(s => s.token === token);
  if (!session) return false;
  
  // Check if token is expired
  if (session.expiresAt < new Date()) {
    return false;
  }
  
  return true;
};

// Method to get active devices
deviceSessionSchema.methods.getActiveDevices = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.devices.filter(device => 
    device.lastActiveAt > thirtyDaysAgo && 
    device.status === 'active'
  );
};

// Method to remove expired sessions
deviceSessionSchema.methods.cleanupExpiredSessions = function() {
  const now = new Date();
  this.activeSessions = this.activeSessions.filter(s => s.expiresAt > now);
  return this.save();
};

// Static method to check if a token is blacklisted globally
deviceSessionSchema.statics.isTokenBlacklisted = async function(token) {
  const userSession = await this.findOne({ 'blacklistedTokens.token': token });
  return !!userSession;
};

// Static method to blacklist a token globally
deviceSessionSchema.statics.blacklistToken = async function(token, deviceFingerprint, userId, reason = 'device_removed') {
  const userSession = await this.findOne({ userId });
  if (userSession) {
    return userSession.blacklistToken(token, deviceFingerprint, reason);
  }
  return null;
};

// Static method to find user session by token
deviceSessionSchema.statics.findByToken = async function(token) {
  return this.findOne({
    $or: [
      { 'activeSessions.token': token },
      { 'blacklistedTokens.token': token }
    ]
  });
};

// Static method to find or create user session
deviceSessionSchema.statics.findOrCreateUserSession = async function(userId) {
  let userSession = await this.findOne({ userId });
  if (!userSession) {
    userSession = new this({
      userId,
      devices: [],
      activeSessions: [],
      blacklistedTokens: []
    });
    await userSession.save();
  }
  return userSession;
};

// Static method to clean up old inactive devices
deviceSessionSchema.statics.cleanupOldDevices = async function() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  return this.updateMany(
    { 'devices.lastActiveAt': { $lt: ninetyDaysAgo } },
    { 
      $set: { 
        'devices.$.status': 'removed',
        'devices.$.isCurrentDevice': false
      }
    }
  );
};

// Static method to cleanup expired blacklisted tokens
deviceSessionSchema.statics.cleanupExpiredBlacklistedTokens = async function() {
  const now = new Date();
  return this.updateMany(
    { 'blacklistedTokens.expiresAt': { $lt: now } },
    { $pull: { blacklistedTokens: { expiresAt: { $lt: now } } } }
  );
};

// Function to get the model with the appropriate database connection
function getDeviceSessionModel(dbConnection) {
  return dbConnection.model('DeviceSession', deviceSessionSchema);
}

export {
  deviceSessionSchema,
  getDeviceSessionModel
};
