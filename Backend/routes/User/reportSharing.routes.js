import express from "express";
import { verifyToken } from "../../middleware/User/verifyToken.js";
import {
  shareReports,
  getMyShares,
  revokeShare,
  getShareAccessLog,
  validateDoctorId,
} from "../../controllers/User/reportSharing.controller.js";

const router = express.Router();

// All routes require patient authentication
router.use(verifyToken);

// Share reports with a doctor
router.post("/", shareReports);

// Get all shares for the authenticated patient
router.get("/", getMyShares);

// Validate a doctor ID (for the share modal)
router.get("/validate-doctor/:doctorId", validateDoctorId);

// Revoke a share
router.patch("/:shareId/revoke", revokeShare);

// Get access log for a share
router.get("/:shareId/access-log", getShareAccessLog);

export default router;
