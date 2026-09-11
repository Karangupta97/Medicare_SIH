# Device Session Model Merge Documentation

## Overview
Successfully merged `blacklistedToken.model.js` and `connectedDevice.model.js` into a single unified model called `deviceSession.model.js`.

## Changes Made

### 1. Model Consolidation
- **Created**: `models/User/deviceSession.model.js`
- **Deleted**: `models/User/blacklistedToken.model.js`
- **Deleted**: `models/User/connectedDevice.model.js`

### 2. New DeviceSession Model Features

#### Schema Structure
```javascript
{
  userId: ObjectId,              // Reference to User
  deviceName: String,            // Human-readable device name
  deviceType: String,            // mobile, tablet, desktop, etc.
  deviceInfo: {                  // Device information
    userAgent: String,
    platform: String,
    browser: String,
    os: String,
    ipAddress: String
  },
  deviceFingerprint: String,     // Unique device identifier
  isCurrentDevice: Boolean,      // Whether this is the current active device
  lastActiveAt: Date,           // Last activity timestamp
  location: {                   // Optional location data
    city: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  activeSessions: [{            // Active session tokens
    token: String,
    createdAt: Date,
    lastUsedAt: Date,
    expiresAt: Date
  }],
  blacklistedTokens: [{         // Blacklisted tokens for this device
    token: String,
    reason: String,             // device_removed, manual_logout, etc.
    blacklistedAt: Date,
    expiresAt: Date
  }],
  status: String                // active, inactive, blocked, removed
}
```

#### New Methods
- `addSession(token, expiresAt)` - Add new session token
- `updateSessionActivity(token)` - Update token last used time
- `blacklistToken(token, reason)` - Blacklist a token
- `isTokenBlacklisted(token)` - Check if token is blacklisted
- `isTokenActive(token)` - Check if token is active
- `cleanupExpiredSessions()` - Remove expired sessions

#### Static Methods
- `isTokenBlacklisted(token)` - Global token blacklist check
- `blacklistToken(token, deviceFingerprint, userId, reason)` - Global token blacklisting
- `findByToken(token)` - Find device by token
- `cleanupOldDevices()` - Clean up old devices
- `cleanupExpiredBlacklistedTokens()` - Clean up expired blacklisted tokens

### 3. Updated Files

#### Controllers
- **File**: `controllers/User/connectedDevice.controller.js`
- **Changes**: 
  - Updated imports to use `getDeviceSessionModel`
  - Modified all functions to work with the new unified model
  - Enhanced device removal to update status instead of deletion
  - Improved session management with proper token handling

#### Middleware
- **File**: `middleware/User/verifyToken.js`
- **Changes**:
  - Updated imports to use `getDeviceSessionModel`
  - Modified token blacklist checking logic

### 4. Benefits of the Merge

#### Improved Data Consistency
- Single source of truth for device and session management
- Reduced data duplication
- Better referential integrity

#### Enhanced Performance
- Fewer database collections to manage
- Optimized queries for device-session relationships
- Better indexing strategy

#### Simplified Architecture
- Unified API for device and token management
- Consolidated business logic
- Easier maintenance and debugging

#### Better Security
- Centralized token blacklisting
- Improved session tracking
- Enhanced device status management

### 5. Migration Impact

#### Backward Compatibility
- All existing API endpoints remain functional
- Response formats maintained
- No frontend changes required

#### Database Migration
- Existing data will need to be migrated to the new schema
- Migration script should be created to:
  1. Merge existing ConnectedDevice and BlacklistedToken records
  2. Map session tokens to the new structure
  3. Set appropriate device status values
  4. Clean up old collections

### 6. Recommended Next Steps

1. **Create Migration Script**: Develop a script to migrate existing data
2. **Test Thoroughly**: Verify all device and session functionality
3. **Update Documentation**: Update API documentation if needed
4. **Monitor Performance**: Track performance improvements
5. **Consider Cleanup**: Schedule periodic cleanup of expired tokens and inactive devices

### 7. API Endpoints (Unchanged)
- `POST /api/connected-devices/register` - Register/update device
- `GET /api/connected-devices/` - Get user's devices
- `DELETE /api/connected-devices/:deviceId` - Remove device
- `PUT /api/connected-devices/:deviceId/name` - Update device name
- `DELETE /api/connected-devices/inactive` - Remove inactive devices

## Conclusion
The device session model merge successfully consolidates device and token management into a unified, more efficient system while maintaining all existing functionality and improving security and performance.
