# Multi-Database Architecture Migration Guide

## Overview
The collections have been organized into separate databases based on their purpose:

### Database Organization
- **Patient Database**: User, Report, Notification collections
- **Doctor Database**: Doctor, Prescription collections  
- **Management Database**: Founder, Staff, Team collections
- **Feedback Database**: Review collection

## Important Changes for Developers

### Model Usage
All models are now **functions** that return the model instance, not direct exports.

#### Before (Old way):
```javascript
import { User } from '../models/User/user.model.js';

// Direct usage
const user = await User.findById(userId);
const newUser = new User(userData);
```

#### After (New way):
```javascript
import { User } from '../models/User/user.model.js';

// Function call to get model
const UserModel = User();
const user = await UserModel.findById(userId);
const newUser = new UserModel(userData);
```

### Updated Model Imports
Each model now requires the appropriate database connection:

- **Patient Database Models**: `User()`, `Report()`, `Notification()`
- **Doctor Database Models**: `Doctor()`, `Prescription()`
- **Management Database Models**: `Founder()`, `Staff()`, `Team()`
- **Feedback Database Models**: `Review()`

### Example Controller Updates

#### User Controller Example:
```javascript
// OLD
import { User } from '../models/User/user.model.js';
const users = await User.find();

// NEW
import { User } from '../models/User/user.model.js';
const UserModel = User();
const users = await UserModel.find();
```

#### Doctor Controller Example:
```javascript
// OLD
import { Doctor } from '../models/Doctor/doctor.model.js';
const doctors = await Doctor.find();

// NEW  
import { Doctor } from '../models/Doctor/doctor.model.js';
const DoctorModel = Doctor();
const doctors = await DoctorModel.find();
```

### Database Connections
The system automatically creates separate connections for each database:
- Patient DB: `mongodb://host/Patient`
- Doctor DB: `mongodb://host/Doctor`  
- Management DB: `mongodb://host/Management`
- Feedback DB: `mongodb://host/Feedback`

### Migration Steps for Existing Code
1. Update all model usage from direct imports to function calls
2. Update controllers, routes, and services accordingly
3. Test database connections and data isolation
4. Verify cross-reference queries work correctly

### Benefits
- **Data Isolation**: Collections are logically separated
- **Scalability**: Each database can be scaled independently
- **Security**: Different access controls per database
- **Performance**: Optimized queries within domain boundaries
- **Maintenance**: Easier backup and maintenance per domain

### Testing the Changes
Run the server and check the console for successful connections to all four databases:
```
✅ Patient Database Connected: [host]
✅ Doctor Database Connected: [host]  
✅ Management Database Connected: [host]
✅ Feedback Database Connected: [host]
```
