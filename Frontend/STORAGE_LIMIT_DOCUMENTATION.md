# Storage Limit Detection and Handling System

## Overview
This system provides comprehensive storage limit detection and handling for the Medicare application, including backend middleware, frontend modal components, and integration with existing upload functionality.

## Backend Components

### 1. Storage Limit Utility (`/Backend/utils/checkStorageLimit.js`)

**Functions:**
- `calculateUserStorageUsage(userId)` - Calculates total storage usage for a user
- `getStorageLimitForPlan(planType)` - Returns storage limits based on plan type
- `checkStorageLimitBeforeUpload(userId, newFileSize)` - Checks if upload would exceed limit
- `getUserStorageInfo(userId)` - Gets comprehensive storage information

**Plan Storage Limits:**
- **Free Plan**: 5MB
- **Basic Plan**: 50MB  
- **Premium Plan**: 500MB
- **Pro Plan**: 2GB

### 2. User Model Updates (`/Backend/models/User/user.model.js`)

Added `planType` field with enum values:
```javascript
planType: {
  type: String,
  enum: ['free', 'basic', 'premium', 'pro'],
  default: 'free'
}
```

### 3. Reports Controller (`/Backend/controllers/User/reports.controller.js`)

**Updated Functions:**
- `uploadReport()` - Added pre-upload storage checking
- `getStorageInfo()` - New endpoint to get user storage information

**Storage Check Integration:**
- Validates storage limits before file upload
- Returns detailed error response with usage statistics
- Provides human-readable format for storage values

### 4. Routes (`/Backend/routes/User/reports.routes.js`)

**New Endpoint:**
- `GET /reports/storage-info` - Returns user's current storage information

## Frontend Components

### 1. Storage Limit Modal (`/Frontend/src/components/StorageLimitModal.jsx`)

**Features:**
- Displays current storage usage with progress bar
- Shows available upgrade plans with features
- Responsive design with modern UI
- Plan recommendation based on current plan type

**Props:**
- `isOpen` - Controls modal visibility
- `onClose` - Callback for closing modal
- `storageDetails` - Storage usage details from backend
- `planType` - Current user plan type

### 2. Storage Usage Widget (`/Frontend/src/components/StorageUsageWidget.jsx`)

**Features:**
- Compact storage usage display
- Real-time storage information
- Color-coded usage indicators (green/yellow/red)
- Optional upgrade button for high usage
- Responsive design for dashboard integration

**Props:**
- `showUpgradeButton` - Show/hide upgrade button
- `compact` - Compact display mode

### 3. Storage API Service (`/Frontend/src/services/storageAPI.js`)

**Functions:**
- `getStorageInfo()` - Fetches user storage information from backend

## Integration Points

### 1. Reports Page (`/Frontend/src/pages/User/Reports.jsx`)

**Integration:**
- Imports and uses StorageLimitModal
- Handles storage limit errors in upload functionality
- Shows storage modal when upload exceeds limits
- Displays storage usage details in error scenarios

### 2. Upload Page (`/Frontend/src/pages/User/Upload.jsx`)

**Integration:**
- Imports and uses StorageLimitModal
- Handles storage limit errors in upload functionality
- Shows storage modal when upload exceeds limits
- Provides upgrade path when limits are reached

## Error Handling

### Backend Error Response (Status 413)
```javascript
{
  success: false,
  error: 'STORAGE_LIMIT_EXCEEDED',
  message: 'Storage limit exceeded. Please upgrade your plan to upload more files.',
  details: {
    currentUsage: 5242880,      // bytes
    storageLimit: 5242880,      // bytes
    fileSize: 1048576,          // bytes
    availableSpace: 0,          // bytes
    usagePercentage: 100,       // percentage
    planType: 'free',           // plan type
    currentUsageMB: 5.0,        // human-readable MB
    storageLimitMB: 5.0,        // human-readable MB
    fileSizeMB: 1.0,           // human-readable MB
    availableSpaceMB: 0.0      // human-readable MB
  }
}
```

### Frontend Error Detection
```javascript
if (error.response?.status === 413 && 
    error.response?.data?.error === 'STORAGE_LIMIT_EXCEEDED') {
  // Show storage limit modal with details
  setStorageModal({ 
    show: true, 
    details: error.response.data.details
  });
}
```

## Usage Examples

### 1. Basic Usage in React Component
```jsx
import StorageLimitModal from '../components/StorageLimitModal';
import StorageUsageWidget from '../components/StorageUsageWidget';

const MyComponent = () => {
  const [storageModal, setStorageModal] = useState({ show: false, details: null });

  return (
    <div>
      {/* Storage usage display */}
      <StorageUsageWidget />
      
      {/* Storage limit modal */}
      <StorageLimitModal
        isOpen={storageModal.show}
        onClose={() => setStorageModal({ show: false, details: null })}
        storageDetails={storageModal.details}
      />
    </div>
  );
};
```

### 2. Upload Error Handling
```javascript
try {
  await uploadFile(fileData);
} catch (error) {
  if (error.response?.status === 413 && 
      error.response?.data?.error === 'STORAGE_LIMIT_EXCEEDED') {
    setStorageModal({ 
      show: true, 
      details: error.response.data.details
    });
  } else {
    // Handle other errors
    setError(error.message);
  }
}
```

## Testing

### Manual Testing Checklist
- [ ] Upload file when storage is available (should succeed)
- [ ] Upload file when storage limit is exceeded (should show modal)
- [ ] Verify storage usage display accuracy
- [ ] Test different plan types and their limits
- [ ] Verify modal displays correct upgrade options
- [ ] Test storage info API endpoint
- [ ] Verify responsive design on mobile/desktop

### Automated Testing
Run the storage limit test:
```bash
cd Backend
node tests/testStorageLimit.js
```

## Configuration

### Environment Variables
Make sure these are set in your `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development|production
```

### Plan Limits Configuration
To modify storage limits, update the `getStorageLimitForPlan()` function in `/Backend/utils/checkStorageLimit.js`:

```javascript
const getStorageLimitForPlan = (planType) => {
  const limits = {
    free: 5 * 1024 * 1024,      // 5MB
    basic: 50 * 1024 * 1024,    // 50MB
    premium: 500 * 1024 * 1024, // 500MB
    pro: 2 * 1024 * 1024 * 1024 // 2GB
  };
  return limits[planType] || limits.free;
};
```

## Security Considerations

1. **Server-side Validation**: All storage checks are performed on the backend
2. **User Authentication**: All endpoints require valid authentication
3. **File Size Limits**: Additional file size validation (5MB per file)
4. **Plan Verification**: Storage limits are based on user's current plan type

## Future Enhancements

1. **Real-time Usage Updates**: WebSocket integration for live storage updates
2. **File Compression**: Automatic compression to optimize storage usage
3. **Storage Analytics**: Detailed usage analytics and trends
4. **Bulk Operations**: Batch file operations with storage validation
5. **CDN Integration**: External storage for large files
6. **Storage Cleanup**: Automatic cleanup of old/unused files
