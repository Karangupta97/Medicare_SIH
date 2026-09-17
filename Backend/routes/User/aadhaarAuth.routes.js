import express from "express";
import {
  registerStepA,
  registerStepB,
  registerSetPin,
} from "../../controllers/User/aadhaarRegistration.controller.js";
import {
  loginIdentify,
  loginWithPin,
  loginOtpGenerate,
  loginOtpVerify,
  refreshSession,
  logoutEverywhere,
} from "../../controllers/User/aadhaarLogin.controller.js";
import { verifyToken } from "../../middleware/User/verifyToken.js";
import { requireCaptcha } from "../../middleware/User/captcha.middleware.js";
import {
  registrationStepARateLimit,
  otpVerifyRateLimit,
  loginRateLimit,
  otpGenerateRateLimit,
} from "../../middleware/User/aadhaarRateLimit.js";

/**
 * Aadhaar-based patient auth routes (replaces the email/password patient flow).
 *
 * Mounted at /api/auth/aadhaar. Each route stacks the appropriate abuse
 * controls:
 *   - captcha + tight rate limit on any endpoint that triggers a paid OKYC call
 *     (registration Step A, login OTP generation).
 *   - looser rate limits on OTP verification and PIN login (per-account lockout
 *     and per-reference attempt caps provide the tighter bounds there).
 */
const router = express.Router();

// ---- Registration (3-step stateful) ----
// Step A: submit Aadhaar + consent → OTP sent. Paid call → captcha + tight limit.
router.post("/register/step-a", registrationStepARateLimit, requireCaptcha, registerStepA);
// Step B: verify OTP → KYC captured (no account yet).
router.post("/register/step-b", otpVerifyRateLimit, registerStepB);
// Step C: set PIN → account created + first session issued.
router.post("/register/set-pin", registerSetPin);

// ---- Login ----
// Step 1: identify (generic response, no enumeration).
router.post("/login/identify", loginRateLimit, loginIdentify);
// Step 2 (PIN path).
router.post("/login/pin", loginRateLimit, loginWithPin);
// Step 2 (OTP path) — generation is a paid call → captcha + tight limit.
router.post("/login/otp/generate", otpGenerateRateLimit, requireCaptcha, loginOtpGenerate);
router.post("/login/otp/verify", otpVerifyRateLimit, loginOtpVerify);

// ---- Session lifecycle ----
router.post("/session/refresh", refreshSession);
router.post("/logout-all", verifyToken, logoutEverywhere);

export default router;
