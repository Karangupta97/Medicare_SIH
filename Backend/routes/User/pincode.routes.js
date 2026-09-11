import express from 'express';
import { lookupPincode, validateAndSaveAddress } from '../../controllers/User/pincode.controller.js';
import { verifyToken } from '../../middleware/User/verifyToken.js';

const router = express.Router();

// GET /api/pincode/:pin
router.get('/:pin', lookupPincode);

// POST /api/pincode/validate-address - Validate and save address (protected route)
router.post('/validate-address', verifyToken, validateAndSaveAddress);

export default router;