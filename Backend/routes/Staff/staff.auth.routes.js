import express from "express";
import {
  staffLogin,
  staffLogout,
  changePassword,
  requestPasswordReset,
  checkStaffAuth
} from "../../controllers/Admin/Staff/StaffWorks/staffAuth.controller.js";
import { verifyStaff } from "../../middleware/Admin/Staff/verifyStaff.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", staffLogin);
router.post("/forgot-password", requestPasswordReset);

// Protected routes (authentication required)
router.use(verifyStaff);
router.post("/logout", staffLogout);
router.post("/change-password", changePassword);
router.get("/me", checkStaffAuth);

export default router; 