import express from 'express';
import {
  registerDevice,
  getConnectedDevices,
  removeDevice,
  updateDeviceName,
  removeInactiveDevices
} from '../../controllers/User/connectedDevice.controller.js';
import { verifyToken } from '../../middleware/User/verifyToken.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Register or update current device
router.post('/register', registerDevice);

// Get all connected devices for the user
router.get('/', getConnectedDevices);

// Update device name
router.put('/:deviceId/name', updateDeviceName);

// Remove a specific device
router.delete('/:deviceId', removeDevice);

// Remove all inactive devices
router.delete('/inactive/cleanup', removeInactiveDevices);

export default router;
