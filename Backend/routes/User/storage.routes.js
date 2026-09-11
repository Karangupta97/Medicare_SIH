import express from "express";
import { verifyToken } from "../../middleware/User/verifyToken.js";
import { getStorageInfo } from "../../controllers/User/storage.controller.js";

const router = express.Router();

// All routes are protected with verifyToken middleware
router.use(verifyToken);

// Get user's storage information
router.get("/storage-info", getStorageInfo);

export default router;