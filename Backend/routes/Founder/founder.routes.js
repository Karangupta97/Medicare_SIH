import express from "express";
import {
  founderLogin,
  verifyFounderOTP,
  resendFounderOTP,
  founderLogout,
  checkFounderAuth,
  getDashboardData,
  requestSensitiveActionOTP,
  verifySensitiveActionOTP
} from "../../controllers/Founder/founder.controller.js";
import { verifyFounder } from "../../middleware/Founder/verifyFounder.js";

const router = express.Router();

// Authentication routes (public)
router.post("/login", founderLogin);
router.post("/verify-otp", verifyFounderOTP);
router.post("/resend-otp", resendFounderOTP);
router.post("/logout", founderLogout);

// Protected routes (require founder authentication)
router.get("/check-auth", verifyFounder, checkFounderAuth);
router.get("/dashboard", verifyFounder, getDashboardData);

// OTP verification for sensitive actions
router.post("/request-action-otp", verifyFounder, requestSensitiveActionOTP);
router.post("/verify-action-otp", verifyFounder, verifySensitiveActionOTP);

export default router; 