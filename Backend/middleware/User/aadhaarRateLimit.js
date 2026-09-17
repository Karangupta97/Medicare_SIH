import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Rate limiting + bot attestation for the Aadhaar auth flows.
 *
 * WHY: The OKYC generate/verify calls COST MONEY and are an abuse vector:
 *   - OTP bombing (spamming generate_otp to a victim's mobile).
 *   - Aadhaar enumeration (probing many numbers to discover which have accounts).
 * We throttle by BOTH client IP and device fingerprint so a single attacker
 * can't rotate one dimension to bypass the other. Limits are deliberately tight
 * (per requirement: ~5 attempts/hour on registration/OTP generation).
 *
 * These middlewares stack on top of the flow's own per-reference attempt caps
 * and the global provider-side limits.
 */

/** Derive a stable key from IP + device fingerprint. */
function ipAndDeviceKey(req, res) {
  const fp =
    req.body?.deviceFingerprint ||
    req.headers["x-device-fingerprint"] ||
    "no-fp";
  // ipKeyGenerator normalizes IPv6; combine with fingerprint.
  return `${ipKeyGenerator(req, res)}:${fp}`;
}

function limitHandler(label) {
  return (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000 / 60) || 60;
    console.warn(`[Aadhaar RateLimit:${label}] key blocked. Retry ~${retryAfter}m`);
    // Generic, non-distinguishing message (no hint about accounts/numbers).
    return res.status(429).json({
      success: false,
      message: `Too many attempts. Please try again in about ${retryAfter} minute${retryAfter > 1 ? "s" : ""}.`,
      retryAfter,
    });
  };
}

/**
 * Registration Step A (Aadhaar submission + OTP generation).
 * Max 5 attempts / hour per IP+device. Prevents enumeration and OTP bombing.
 */
export const registrationStepARateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: ipAndDeviceKey,
  handler: limitHandler("register-stepA"),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP verification attempts (registration Step B and login OTP path).
 * Slightly higher ceiling than generation, but still tight. Per-reference
 * attempt caps (3) are enforced separately in the flow.
 */
export const otpVerifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: ipAndDeviceKey,
  handler: limitHandler("otp-verify"),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login attempts (identify + PIN). IP+device keyed. Complements the per-account
 * exponential lockout in the login service.
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: ipAndDeviceKey,
  handler: limitHandler("login"),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login OTP generation (existing-account OTP path) — same tight limit as
 * registration OTP generation to prevent OTP bombing of known accounts.
 */
export const otpGenerateRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: ipAndDeviceKey,
  handler: limitHandler("otp-generate"),
  standardHeaders: true,
  legacyHeaders: false,
});
