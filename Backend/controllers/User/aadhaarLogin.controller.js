import crypto from "crypto";
import dotenv from "dotenv";

// Aadhaar auth is merged into the existing User model (not a separate collection).
import { User } from "../../models/User/user.model.js";
import { RegistrationSession } from "../../models/User/registrationSession.model.js";
import { getKycProvider } from "../../services/kyc/providerFactory.js";
import { logEvent } from "../../services/aadhaar/audit.service.js";
import {
  issueSession,
  rotateRefreshToken,
  revokeAllSessions,
} from "../../services/aadhaar/session.service.js";
import { isValidAadhaarNumber } from "../../utils/aadhaar/verhoeff.util.js";
import { computeAadhaarLookupHashes } from "../../utils/aadhaar/identityHash.util.js";
import { verifyPin } from "../../utils/aadhaar/pin.util.js";
import { deviceFingerprint, clientIp, userAgent, padResponseTime } from "../../utils/aadhaar/requestContext.util.js";

dotenv.config();

/**
 * GENERIC error used for EVERY auth failure (no such account, frozen, wrong PIN,
 * wrong Aadhaar). WHY: distinguishing these lets an attacker enumerate which
 * Aadhaar numbers have accounts and confirm PINs. Full detail always goes to the
 * internal audit log for support/investigation.
 */
const GENERIC_INVALID = "Invalid credentials. Please check your details and try again.";
const GENERIC_TRY_LATER = "We couldn't complete that request right now. Please try again later.";

// Lockout policy (per requirement).
const LOCK_AFTER_ATTEMPTS = 3;         // start locking after 3 consecutive failures
const OTP_RESET_AFTER = 5;             // after 5 failures in window, force OTP reset
const FREEZE_AFTER_24H = 10;           // freeze + notify after 10 failures in 24h
const MAX_KNOWN_DEVICES = 10;          // bounded known-device list

function backoffMs(consecutiveFailures) {
  // Exponential backoff starting once we cross LOCK_AFTER_ATTEMPTS.
  // e.g. 4th fail -> 30s, 5th -> 60s, 6th -> 120s ... capped at 30m.
  const over = Math.max(0, consecutiveFailures - LOCK_AFTER_ATTEMPTS);
  const ms = 30 * 1000 * Math.pow(2, over);
  return Math.min(ms, 30 * 60 * 1000);
}

/** Resolve an active account by Aadhaar, honoring pepper rotation. Generic-safe. */
async function findActiveUserByAadhaar(aadhaarNumber) {
  const UserModel = User();
  const candidates = computeAadhaarLookupHashes(String(aadhaarNumber));
  for (const c of candidates) {
    const user = await UserModel.findOne({ aadhaar_identity_hash: c.hash });
    if (user) return { user, matchedHash: c.hash, isCurrentPepper: c.isCurrent };
  }
  return { user: null };
}

/**
 * ============================================================================
 * STEP 1 — Identify (Aadhaar submission)
 * ============================================================================
 * Returns a generic response whether or not an account exists (no enumeration).
 * We do NOT reveal existence; the client simply proceeds to choose a credential.
 */
export const loginIdentify = async (req, res) => {
  const start = Date.now();
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { aadhaarNumber } = req.body;

  try {
    if (!isValidAadhaarNumber(String(aadhaarNumber || ""))) {
      await padResponseTime(start, 400);
      return res.status(400).json({ success: false, message: "Please enter a valid Aadhaar number." });
    }

    // We intentionally return the SAME response regardless of whether the
    // account exists / is frozen. The client always sees "choose a method".
    await padResponseTime(start, 400);
    return res.status(200).json({
      success: true,
      message: "Choose how you'd like to sign in.",
      methods: ["pin", "otp"],
    });
  } catch (err) {
    console.error("[loginIdentify] error:", err.message);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/**
 * ============================================================================
 * STEP 2 (PIN path) — verify PIN with lockout/backoff/freeze
 * ============================================================================
 */
export const loginWithPin = async (req, res) => {
  const start = Date.now();
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { aadhaarNumber, pin } = req.body;

  try {
    if (!isValidAadhaarNumber(String(aadhaarNumber || "")) || !/^\d{6}$/.test(String(pin || ""))) {
      await padResponseTime(start);
      return res.status(400).json({ success: false, message: GENERIC_INVALID });
    }

    const { user } = await findActiveUserByAadhaar(aadhaarNumber);

    // No account OR frozen/deleted → identical generic response (no enumeration).
    if (!user || user.status !== "active") {
      await logEvent("login_failed", {
        userId: user?._id || null, ip, deviceFingerprint: fp,
        reason: user ? `status_${user.status}` : "no_account",
      });
      await padResponseTime(start);
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    // Locked out? (temporary backoff window still active)
    if (user.pin_locked_until && user.pin_locked_until > new Date()) {
      await logEvent("login_failed", {
        userId: user._id, ip, deviceFingerprint: fp, reason: "locked_out",
      });
      await padResponseTime(start);
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    const ok = await verifyPin(String(pin), user.pin_hash, user.pin_salt, user.pin_algo);

    if (!ok) {
      await handleFailedPin(user, { ip, fp });
      await padResponseTime(start);
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    // --- PIN correct: reset failure counters ---
    user.failed_pin_attempts = 0;
    user.pin_locked_until = null;

    // STEP 3 — device/risk check + step-up.
    const known = user.known_devices?.some((d) => d.fingerprint === fp);
    if (!known) {
      // Unknown device: require OTP step-up even though PIN succeeded, and send
      // a login notification. We start an OTP challenge tied to THIS account.
      await user.save();
      // Step-up needs to call the OKYC generate endpoint, which requires the raw
      // Aadhaar number. It's already in-request (the PIN login submitted it), so
      // we forward it explicitly — never persisted.
      const challenge = await startOtpChallenge(user, { ip, fp, purpose: "step_up", rawAadhaar: String(aadhaarNumber) });
      await logEvent("step_up_triggered", {
        userId: user._id, ip, deviceFingerprint: fp, reason: "unknown_device_pin_login",
      });
      // NOTE: real deployment sends an SMS/push login alert here via the
      // encrypted mobile on the kyc_profile (never the Aadhaar number).
      if (!challenge.ok) {
        return res.status(challenge.httpStatus || 502).json({ success: false, message: challenge.message });
      }
      return res.status(200).json({
        success: true,
        code: "STEP_UP_REQUIRED",
        message: "For your security, verify with the OTP sent to your Aadhaar-linked mobile.",
        challengeId: challenge.challengeId,
        stepUp: true,
      });
    }

    // Known device: record activity + issue session directly.
    touchDevice(user, fp);
    await user.save();
    return finalizeLogin(res, user, { ip, fp, req, method: "pin", stepUp: false });
  } catch (err) {
    console.error("[loginWithPin] error:", err.message);
    await padResponseTime(start);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/**
 * Handle a failed PIN attempt: increment counters, apply exponential backoff,
 * force OTP reset at 5 failures, freeze + notify at 10 failures in 24h.
 */
async function handleFailedPin(user, { ip, fp }) {
  const now = new Date();

  // Rolling 24h window for the freeze rule.
  if (!user.pin_failures_window_start || now - user.pin_failures_window_start > 24 * 60 * 60 * 1000) {
    user.pin_failures_window_start = now;
    user.pin_failures_in_window = 0;
  }
  user.failed_pin_attempts += 1;
  user.pin_failures_in_window += 1;

  // Freeze after 10 failures / 24h → notify + revoke sessions.
  if (user.pin_failures_in_window >= FREEZE_AFTER_24H) {
    user.status = "frozen";
    await user.save();
    await revokeAllSessions(user._id, "account_frozen_bruteforce", { ip, deviceFingerprint: fp });
    await logEvent("account_frozen", {
      userId: user._id, ip, deviceFingerprint: fp, reason: "10_failures_24h",
    });
    // Real deployment: SMS/push to the Aadhaar-linked mobile (from encrypted
    // kyc_profile.encrypted_mobile) — never the Aadhaar number itself.
    return;
  }

  // Exponential backoff once past the threshold.
  if (user.failed_pin_attempts >= LOCK_AFTER_ATTEMPTS) {
    user.pin_locked_until = new Date(now.getTime() + backoffMs(user.failed_pin_attempts));
    await logEvent("pin_locked", {
      userId: user._id, ip, deviceFingerprint: fp,
      reason: "backoff", meta: { attempts: user.failed_pin_attempts, until: user.pin_locked_until },
    });
  }

  await user.save();

  await logEvent("login_failed", {
    userId: user._id, ip, deviceFingerprint: fp,
    reason: "wrong_pin",
    meta: {
      attempts: user.failed_pin_attempts,
      forceOtpReset: user.failed_pin_attempts >= OTP_RESET_AFTER,
    },
  });
}

/**
 * ============================================================================
 * STEP 2 (OTP path) — generate OTP for an EXISTING account
 * ============================================================================
 * Same provider flow as registration, but tied to an already-identified account
 * (never creates a new one). Uses a RegistrationSession row with a purpose tag
 * as the challenge store (reuses the TTL/attempt machinery).
 */
export const loginOtpGenerate = async (req, res) => {
  const start = Date.now();
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { aadhaarNumber } = req.body;

  try {
    if (!isValidAadhaarNumber(String(aadhaarNumber || ""))) {
      await padResponseTime(start);
      return res.status(400).json({ success: false, message: "Please enter a valid Aadhaar number." });
    }
    const { user } = await findActiveUserByAadhaar(aadhaarNumber);

    // Generic: even if no account/frozen, we return the same "OTP sent" shape to
    // avoid enumeration — but we DON'T actually call the paid API for a
    // non-existent/frozen account. We fake the challenge id + latency.
    if (!user || user.status !== "active") {
      await logEvent("login_failed", {
        userId: user?._id || null, ip, deviceFingerprint: fp,
        reason: user ? `otp_gen_status_${user.status}` : "otp_gen_no_account",
      });
      await padResponseTime(start, 1200);
      return res.status(200).json({
        success: true,
        message: "If an account exists, an OTP has been sent to the Aadhaar-linked mobile.",
        challengeId: crypto.randomBytes(24).toString("base64url"), // decoy
      });
    }

    const challenge = await startOtpChallenge(user, { ip, fp, purpose: "login", rawAadhaar: String(aadhaarNumber) });
    if (!challenge.ok) {
      await padResponseTime(start, 1200);
      return res.status(challenge.httpStatus || 502).json({ success: false, message: challenge.message });
    }
    await padResponseTime(start, 1200);
    return res.status(200).json({
      success: true,
      message: "If an account exists, an OTP has been sent to the Aadhaar-linked mobile.",
      challengeId: challenge.challengeId,
    });
  } catch (err) {
    console.error("[loginOtpGenerate] error:", err.message);
    await padResponseTime(start, 1200);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/**
 * STEP 2 (OTP path) — verify OTP for login / step-up. On success, issues session.
 */
export const loginOtpVerify = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { challengeId, otp } = req.body;

  try {
    if (!/^\d{6}$/.test(String(otp || ""))) {
      return res.status(400).json({ success: false, message: "Enter the 6-digit OTP." });
    }
    const RegSession = RegistrationSession();
    const challenge = await RegSession.findOne({ session_id: challengeId });
    if (!challenge || challenge.expires_at < new Date() || challenge.step !== "otp_pending") {
      return res.status(400).json({ success: false, message: GENERIC_INVALID });
    }

    if (challenge.otp_attempts >= challenge.max_otp_attempts) {
      await RegSession.deleteOne({ _id: challenge._id });
      return res.status(429).json({
        success: false, code: "RESTART_REQUIRED",
        message: "Too many incorrect attempts. Please start again.",
      });
    }

    const provider = getKycProvider();
    const result = await provider.verifyOtp(challenge.reference_id, String(otp));

    if (result.status === "under_process") {
      return res.status(202).json({ success: false, code: "RETRY", retryAfterMs: result.retryAfterMs || 3000, message: "Still processing. Retry shortly." });
    }
    if (result.status === "source_unavailable") {
      return res.status(503).json({ success: false, message: "Verification temporarily unavailable. Try again shortly." });
    }
    if (result.status !== "valid") {
      challenge.otp_attempts += 1;
      await challenge.save();
      await logEvent("otp_failed", {
        userId: challenge.user_ref || null, ip, deviceFingerprint: fp,
        aadhaarIdentityHash: challenge.aadhaar_identity_hash, reason: result.status,
      });
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    // OTP valid → load account by the challenge's identity hash.
    const UserModel = User();
    const user = await UserModel.findOne({ aadhaar_identity_hash: challenge.aadhaar_identity_hash });
    if (!user || user.status !== "active") {
      await RegSession.deleteOne({ _id: challenge._id });
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    await logEvent("otp_verified", {
      userId: user._id, ip, deviceFingerprint: fp,
      aadhaarIdentityHash: challenge.aadhaar_identity_hash, reason: "login_otp",
    });

    // OTP is itself a strong factor → clear PIN lockouts and register the device.
    user.failed_pin_attempts = 0;
    user.pin_locked_until = null;
    touchDevice(user, fp);
    await user.save();
    await RegSession.deleteOne({ _id: challenge._id });

    return finalizeLogin(res, user, { ip, fp, req, method: "otp", stepUp: challenge.step_up === true });
  } catch (err) {
    console.error("[loginOtpVerify] error:", err.message);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/**
 * ============================================================================
 * Token refresh + logout everywhere
 * ============================================================================
 */
export const refreshSession = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) return res.status(401).json({ success: false, message: GENERIC_INVALID });

    // We must resolve the user from the token's session row to rotate safely.
    const { AadhaarSession } = await import("../../models/User/aadhaarSession.model.js");
    const Session = AadhaarSession();
    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const row = await Session.findOne({ refresh_token_hash: hash }).lean();
    if (!row) return res.status(401).json({ success: false, message: GENERIC_INVALID });

    const UserModel = User();
    const user = await UserModel.findById(row.user_id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    const rotated = await rotateRefreshToken(user, refreshToken, {
      deviceFingerprint: fp, ip, userAgent: userAgent(req),
    });
    if (!rotated.ok) {
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }
    return res.status(200).json({
      success: true,
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      refreshTokenExpiresAt: rotated.expiresAt,
    });
  } catch (err) {
    console.error("[refreshSession] error:", err.message);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

export const logoutEverywhere = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  try {
    // Requires an authenticated access token (verifyToken sets req.user.id).
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const count = await revokeAllSessions(userId, "logout_everywhere", { ip, deviceFingerprint: fp });
    return res.status(200).json({ success: true, message: "Signed out of all devices.", revoked: count });
  } catch (err) {
    console.error("[logoutEverywhere] error:", err.message);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/* ------------------------------------------------------------------ helpers */

/**
 * Start an OTP challenge tied to an existing account (login or step-up). Stores
 * a RegistrationSession row reused as the challenge record.
 */
async function startOtpChallenge(user, { ip, fp, purpose, rawAadhaar }) {
  const provider = getKycProvider();
  // The OKYC generate endpoint is keyed by the raw Aadhaar number, which we
  // never store. Callers that reach here always have the number in-request
  // (the client submitted it for this login/step-up), so it is forwarded
  // explicitly and stays in memory only for the duration of this call.
  if (!rawAadhaar) {
    return {
      ok: false,
      httpStatus: 400,
      message: "Additional verification requires re-entering your Aadhaar number.",
    };
  }

  const result = await provider.generateOtp(String(rawAadhaar), {
    consent: "Y",
    reason: purpose === "step_up" ? "Step-up login verification" : "Patient login verification",
  });
  if (result.status !== "otp_sent") {
    await logEvent("kyc_provider_error", {
      userId: user._id, ip, deviceFingerprint: fp, reason: `login_otp_gen:${result.status}`,
    });
    return {
      ok: false,
      httpStatus: result.status === "source_unavailable" ? 503 : 502,
      message:
        result.status === "source_unavailable"
          ? "Verification temporarily unavailable. Try again shortly."
          : GENERIC_TRY_LATER,
    };
  }

  const RegSession = RegistrationSession();
  const challengeId = crypto.randomBytes(24).toString("base64url");
  const ttl = parseInt(process.env.REGISTRATION_SESSION_TTL_SECONDS || "600", 10);
  await RegSession.create({
    session_id: challengeId,
    aadhaar_identity_hash: user.aadhaar_identity_hash,
    aadhaar_hash_version: user.aadhaar_hash_version,
    reference_id: result.referenceId,
    provider: provider.name,
    step: "otp_pending",
    ip_address: ip,
    device_fingerprint: fp,
    user_ref: user._id,
    step_up: purpose === "step_up",
    expires_at: new Date(Date.now() + ttl * 1000),
  });
  await logEvent("otp_generated", {
    userId: user._id, ip, deviceFingerprint: fp,
    aadhaarIdentityHash: user.aadhaar_identity_hash, reason: `login_${purpose}`,
  });
  return { ok: true, challengeId };
}

/** Add/refresh a device in the bounded known-device list. */
function touchDevice(user, fp) {
  const existing = user.known_devices?.find((d) => d.fingerprint === fp);
  if (existing) {
    existing.last_seen_at = new Date();
    return;
  }
  user.known_devices = user.known_devices || [];
  user.known_devices.push({ fingerprint: fp, first_seen_at: new Date(), last_seen_at: new Date() });
  // Bound the list: keep the most-recently-seen MAX_KNOWN_DEVICES.
  if (user.known_devices.length > MAX_KNOWN_DEVICES) {
    user.known_devices.sort((a, b) => b.last_seen_at - a.last_seen_at);
    user.known_devices = user.known_devices.slice(0, MAX_KNOWN_DEVICES);
  }
}

/** Issue tokens and return the success response. */
async function finalizeLogin(res, user, { ip, fp, req, method, stepUp }) {
  user.lastLOGIN = new Date();
  const { accessToken, refreshToken, expiresAt } = await issueSession(user, {
    deviceFingerprint: fp, ip, userAgent: userAgent(req),
  });
  await logEvent("login_success", {
    userId: user._id, ip, deviceFingerprint: fp,
    reason: method, meta: { method, stepUp: !!stepUp },
  });
  return res.status(200).json({
    success: true,
    message: "Signed in successfully.",
    user: {
      id: user._id,
      umid: user.umid,
      status: user.status,
      name: user.name,
      lastname: user.lastname,
    },
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  });
}
