import crypto from "crypto";
import dotenv from "dotenv";

// NOTE: Aadhaar auth is merged into the existing User model/collection (not a
// separate AadhaarUser), so all existing patient fields/relations are preserved.
import { User } from "../../models/User/user.model.js";
import { KycProfile } from "../../models/User/kycProfile.model.js";
import { RegistrationSession } from "../../models/User/registrationSession.model.js";
import { getKycProvider } from "../../services/kyc/providerFactory.js";
import { logEvent } from "../../services/aadhaar/audit.service.js";
import { issueSession } from "../../services/aadhaar/session.service.js";
import { isValidAadhaarNumber } from "../../utils/aadhaar/verhoeff.util.js";
import { computeAadhaarIdentityHash } from "../../utils/aadhaar/identityHash.util.js";
import { encryptField, hashContact } from "../../utils/aadhaar/fieldEncryption.util.js";
import { validatePinStrength, hashPin } from "../../utils/aadhaar/pin.util.js";
import { deviceFingerprint, clientIp, userAgent, padResponseTime } from "../../utils/aadhaar/requestContext.util.js";
import generatePatientUMID from "../../UMID/patient.UMID.js";

dotenv.config();

// Generic, non-distinguishing client messages. Full detail always goes to audit.
const GENERIC_TRY_LATER = "We couldn't complete that request right now. Please try again later.";
const REG_SESSION_TTL_SECONDS = parseInt(process.env.REGISTRATION_SESSION_TTL_SECONDS || "600", 10);

/**
 * ============================================================================
 * STEP A — Aadhaar number submission + OTP generation
 * ============================================================================
 * Controls in order:
 *   1. Server-side format + Verhoeff validation (reject before any API call).
 *   2. (rate limit + captcha applied as route middleware, upstream).
 *   3. Compute identity hash; pre-check duplicate BEFORE calling generate_otp
 *      (saves paid calls) — but pad response time to prevent timing enumeration.
 *   4. Explicit consent required (checkbox), logged with ip/timestamp.
 *   5. Call provider generateOtp with consent="Y" + audit reason.
 *   6. Store reference_id in a short-lived server-side registration session.
 *   7. Audit every branch.
 */
export const registerStepA = async (req, res) => {
  const start = Date.now();
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { aadhaarNumber, consent } = req.body;

  try {
    // 1. Format + checksum. Never trust the client; reject malformed numbers
    //    before spending a paid OKYC call or leaking timing.
    if (!isValidAadhaarNumber(String(aadhaarNumber || ""))) {
      await logEvent("register_attempt", {
        ip, deviceFingerprint: fp, reason: "invalid_aadhaar_format",
      });
      await padResponseTime(start);
      // Generic message — do not reveal checksum specifics.
      return res.status(400).json({ success: false, message: "Please enter a valid Aadhaar number." });
    }

    // 4. Explicit consent gate. Must be a real boolean true (checkbox), not implied.
    if (consent !== true) {
      await logEvent("register_attempt", {
        ip, deviceFingerprint: fp, consentFlag: false, reason: "consent_missing",
      });
      await padResponseTime(start);
      return res.status(400).json({
        success: false,
        message: "You must provide consent to proceed with Aadhaar verification.",
      });
    }

    // 3. Compute identity hash + duplicate pre-check.
    const { hash: identityHash, version } = computeAadhaarIdentityHash(String(aadhaarNumber));
    const UserModel = User();
    const existing = await UserModel.findOne({ aadhaar_identity_hash: identityHash })
      .select("_id status")
      .lean();

    await logEvent("register_attempt", {
      ip, deviceFingerprint: fp, aadhaarIdentityHash: identityHash, consentFlag: true,
      reason: existing ? "duplicate_precheck" : "new_identity",
    });

    if (existing) {
      await logEvent("duplicate_rejected", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: identityHash, reason: "pre_check",
      });
      // Constant-time padding so a duplicate can't be distinguished from a new
      // registration purely by response latency (the new path pays the OKYC RTT).
      await padResponseTime(start);
      return res.status(200).json({
        success: false,
        code: "ACCOUNT_EXISTS",
        message: "An account already exists for these details. Please log in instead.",
      });
    }

    // 5. Call provider to generate OTP. Consent "Y" + audit-friendly reason.
    const provider = getKycProvider();
    const result = await provider.generateOtp(String(aadhaarNumber), {
      consent: "Y",
      reason: "Patient registration KYC",
    });

    // 6/7. Handle provider outcomes explicitly + audit.
    if (result.status !== "otp_sent") {
      await logEvent("otp_generated", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: identityHash, consentFlag: true,
        reason: `generate_failed:${result.status}`, meta: { providerMessage: result.providerMessage },
      });
      const msg =
        result.status === "source_unavailable"
          ? "Aadhaar verification is temporarily unavailable. Please try again in a few minutes."
          : GENERIC_TRY_LATER;
      // Server-side diagnostics only (never sent to the client — keeps the
      // response generic to prevent enumeration). Useful for support/debugging
      // provider failures from the backend logs.
      console.error(
        `[registerStepA] KYC generateOtp failed: status=${result.status} providerMessage=${result.providerMessage}`
      );
      await padResponseTime(start);
      return res.status(result.status === "source_unavailable" ? 503 : 502).json({
        success: false,
        message: msg,
      });
    }

    // Create the short-lived registration session (server-side state).
    const sessionId = crypto.randomBytes(24).toString("base64url");
    const RegSession = RegistrationSession();
    await RegSession.create({
      session_id: sessionId,
      aadhaar_identity_hash: identityHash,
      aadhaar_hash_version: version,
      reference_id: result.referenceId,
      provider: provider.name,
      step: "otp_pending",
      consent_flag: true,
      consent_at: new Date(),
      consent_ip: ip,
      ip_address: ip,
      device_fingerprint: fp,
      expires_at: new Date(Date.now() + REG_SESSION_TTL_SECONDS * 1000),
    });

    await logEvent("otp_generated", {
      ip, deviceFingerprint: fp, aadhaarIdentityHash: identityHash, consentFlag: true,
      reason: "generate_success",
    });

    // NOTE: raw Aadhaar number goes out of scope here and is never persisted.
    return res.status(200).json({
      success: true,
      message: "An OTP has been sent to your Aadhaar-linked mobile number.",
      sessionId,
      // App-side expiry so the client can show a countdown independent of the provider.
      expiresInSeconds: REG_SESSION_TTL_SECONDS,
    });
  } catch (err) {
    console.error("[registerStepA] error:", err.message);
    await logEvent("kyc_provider_error", { ip, deviceFingerprint: fp, reason: "step_a_exception" });
    await padResponseTime(start);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/**
 * ============================================================================
 * STEP B — OTP verification
 * ============================================================================
 *   - Max 3 attempts per reference_id; exceeding invalidates the reference and
 *     forces a restart from Step A.
 *   - Handles every documented provider state.
 *   - On success: re-check uniqueness (final authority is the DB unique index
 *     at account creation in Step C), encrypt KYC into the session, discard raw.
 *   - Does NOT create the account yet (no "verified-but-no-PIN" limbo).
 */
export const registerStepB = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { sessionId, otp } = req.body;

  try {
    if (!/^\d{6}$/.test(String(otp || ""))) {
      return res.status(400).json({ success: false, message: "Enter the 6-digit OTP." });
    }
    const RegSession = RegistrationSession();
    const session = await RegSession.findOne({ session_id: sessionId });
    if (!session || session.expires_at < new Date() || session.step !== "otp_pending") {
      // DEV-ONLY diagnostics: which precondition failed. Never sent in prod.
      const reason = !session
        ? "no_session_found"
        : session.expires_at < new Date()
        ? "session_expired"
        : `wrong_step:${session.step}`;
      console.error(`[registerStepB] session precondition failed: ${reason} (sessionId=${sessionId})`);
      return res.status(400).json({
        success: false, code: "SESSION_EXPIRED",
        message: "Your session has expired. Please start again.",
        ...(process.env.NODE_ENV !== "production" ? { debug: { reason } } : {}),
      });
    }

    // Per-reference attempt cap.
    if (session.otp_attempts >= session.max_otp_attempts) {
      await RegSession.deleteOne({ _id: session._id }); // invalidate reference
      await logEvent("otp_failed", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
        reason: "max_attempts_exceeded",
      });
      return res.status(429).json({
        success: false, code: "RESTART_REQUIRED",
        message: "Too many incorrect attempts. Please start again.",
      });
    }

    const provider = getKycProvider();
    const result = await provider.verifyOtp(session.reference_id, String(otp));

    // Under process — ask client to retry after the provider's delay. Don't hammer.
    if (result.status === "under_process") {
      await logEvent("otp_verified", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
        reason: "under_process",
      });
      return res.status(202).json({
        success: false, code: "RETRY",
        retryAfterMs: result.retryAfterMs || 3000,
        message: "Verification is still processing. Please retry shortly.",
      });
    }

    if (result.status === "source_unavailable") {
      await logEvent("kyc_provider_error", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
        reason: "verify_source_unavailable",
      });
      return res.status(503).json({
        success: false,
        message: "Aadhaar verification is temporarily unavailable. Please try again in a few minutes.",
      });
    }

    if (result.status !== "valid") {
      // Invalid/expired OTP or generic error: count the attempt.
      session.otp_attempts += 1;
      await session.save();
      await logEvent("otp_failed", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
        reason: result.status, meta: { attempts: session.otp_attempts },
      });
      const attemptsLeft = Math.max(0, session.max_otp_attempts - session.otp_attempts);
      const msg =
        result.status === "otp_expired"
          ? "That OTP has expired. Please request a new one."
          : `Incorrect OTP.${attemptsLeft > 0 ? ` ${attemptsLeft} attempt(s) left.` : ""}`;
      console.error(
        `[registerStepB] OTP verify rejected: providerStatus=${result.status} providerMessage=${result.providerMessage} attemptsLeft=${attemptsLeft}`
      );
      return res.status(400).json({
        success: false,
        message: msg,
        attemptsLeft,
        ...(process.env.NODE_ENV !== "production"
          ? { debug: { providerStatus: result.status, providerMessage: result.providerMessage } }
          : {}),
      });
    }

    // --- OTP VALID ---
    await logEvent("otp_verified", {
      ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
      reason: "valid",
    });

    // Re-check uniqueness (a race may have created the account between Step A and
    // now). The DB unique index at Step C is the FINAL authority; this is an
    // early, friendly rejection.
    const UserModel = User();
    const dup = await UserModel.findOne({ aadhaar_identity_hash: session.aadhaar_identity_hash })
      .select("_id").lean();
    if (dup) {
      await RegSession.deleteOne({ _id: session._id });
      await logEvent("duplicate_rejected", {
        ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
        reason: "post_otp_recheck",
      });
      return res.status(200).json({
        success: false, code: "ACCOUNT_EXISTS",
        message: "An account already exists for these details. Please log in instead.",
      });
    }

    // Encrypt KYC fields, then discard the raw payload. WHY: the raw payload
    // includes the full name, address and PHOTO — it must never reach logs or
    // persistent storage in the clear, and must leave memory ASAP.
    const kyc = result.kyc || {};
    const encrypted_kyc = {
      encrypted_name: encryptField(kyc.name),
      encrypted_dob: encryptField(kyc.dob),
      encrypted_gender: encryptField(kyc.gender),
      encrypted_address: encryptField(kyc.address),
      encrypted_photo: encryptField(kyc.photoBase64),
      care_of: encryptField(kyc.careOf),
      encrypted_mobile: encryptField(kyc.mobile),
      mobile_hash: hashContact(kyc.mobile),
      email_hash: hashContact(kyc.email),
    };

    // Profile fields that we DO surface on the User document for display
    // (name is required on User; dob/gender/address power the profile UI).
    // These come straight from the verified Aadhaar KYC — the name shown in the
    // app is therefore the government-verified name, not user-entered. Parsed
    // out of split-name where needed. Stored on the short-lived reg session so
    // Step C can write them onto the User record.
    const parsedName = parseKycName(kyc.name);
    const profile_from_kyc = {
      name: parsedName.first,
      lastname: parsedName.last,
      dob: parseKycDob(kyc.dob),
      gender: normalizeKycGender(kyc.gender),
      // Address components split into the User schema's address fields.
      ...splitKycAddress(kyc.address),
    };

    // Explicitly drop references to the raw KYC before proceeding.
    result.kyc = null;

    session.encrypted_kyc = encrypted_kyc;
    session.profile_from_kyc = profile_from_kyc;
    session.step = "otp_verified";
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Aadhaar verified. Set a 6-digit login PIN to finish.",
      sessionId: session.session_id,
      nextStep: "set_pin",
    });
  } catch (err) {
    console.error("[registerStepB] error:", err.message);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/**
 * ============================================================================
 * STEP C — Set login PIN + create account
 * ============================================================================
 *   - Validates PIN (6 digits, no sequential/repeated/common).
 *   - Hashes with argon2id (+ per-user salt).
 *   - Creates AadhaarUser + KycProfile. The UNIQUE index on
 *     aadhaar_identity_hash is the FINAL race authority: if a concurrent
 *     registration already created the account, the insert throws E11000 and we
 *     reject as duplicate. This is what guarantees "one account per Aadhaar,
 *     ever" even under concurrent OTP completions.
 *   - Destroys the registration session, audits account_created, issues session.
 */
export const registerSetPin = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  const { sessionId, pin } = req.body;

  try {
    const strength = validatePinStrength(String(pin || ""));
    if (!strength.valid) {
      return res.status(400).json({ success: false, message: strength.reason });
    }

    const RegSession = RegistrationSession();
    const session = await RegSession.findOne({ session_id: sessionId });
    if (!session || session.expires_at < new Date() || session.step !== "otp_verified") {
      return res.status(400).json({
        success: false, code: "SESSION_EXPIRED",
        message: "Your session has expired. Please start again.",
      });
    }

    const { hash, salt, algo } = await hashPin(String(pin));
    const UserModel = User();
    const KycModel = KycProfile();

    // Government-verified display fields captured from the KYC in Step B.
    const prof = session.profile_from_kyc || {};

    // Create account on the EXISTING User model (merged Aadhaar auth). All the
    // existing patient fields/relations (medicalInfo, reports, familyVaultId,
    // planType, etc.) remain intact — we just create the record with Aadhaar
    // credentials + the verified name/profile instead of email/password.
    // Rely on the aadhaar_identity_hash unique index as the final race authority.
    let user;
    try {
      user = await UserModel.create({
        aadhaar_identity_hash: session.aadhaar_identity_hash,
        aadhaar_hash_version: session.aadhaar_hash_version,
        umid: generatePatientUMID(),
        pin_hash: hash,
        pin_salt: salt,
        pin_algo: algo,
        pin_set_at: new Date(),
        status: "active",
        role: "patient",
        // Aadhaar identity is inherently verified, so mark the account verified
        // (there is no separate email verification step in this flow).
        isverified: true,
        known_devices: [{ fingerprint: fp, first_seen_at: new Date(), last_seen_at: new Date() }],
        // --- Verified profile from Aadhaar KYC ---
        name: prof.name || "Patient", // required field; KYC name is authoritative
        lastname: prof.lastname || "",
        dob: prof.dob || null,
        gender: prof.gender || "",
        addressLine1: prof.addressLine1 || "",
        addressLine2: prof.addressLine2 || "",
        district: prof.district || "",
        state: prof.state || "",
        postalCode: prof.postalCode || "",
      });
    } catch (e) {
      // E11000 duplicate key — the definitive race guard fired.
      if (e.code === 11000) {
        await RegSession.deleteOne({ _id: session._id });
        await logEvent("duplicate_rejected", {
          ip, deviceFingerprint: fp, aadhaarIdentityHash: session.aadhaar_identity_hash,
          reason: "unique_index_race",
        });
        return res.status(200).json({
          success: false, code: "ACCOUNT_EXISTS",
          message: "An account already exists for these details. Please log in instead.",
        });
      }
      throw e;
    }

    // Create the 1:1 KYC profile from the encrypted payload parked in the session.
    const k = session.encrypted_kyc || {};
    try {
      await KycModel.create({
        userId: user._id,
        encrypted_name: k.encrypted_name || null,
        encrypted_dob: k.encrypted_dob || null,
        encrypted_gender: k.encrypted_gender || null,
        encrypted_address: k.encrypted_address || null,
        encrypted_photo: k.encrypted_photo || null,
        care_of: k.care_of || null,
        encrypted_mobile: k.encrypted_mobile || null,
        mobile_hash: k.mobile_hash || null,
        email_hash: k.email_hash || null,
        kyc_provider: session.provider,
        kyc_verified_at: new Date(),
      });
    } catch (e) {
      // If profile creation fails, roll back the user so we never leave a
      // PIN-set account with no KYC profile.
      await UserModel.deleteOne({ _id: user._id });
      throw e;
    }

    // Destroy the registration session and audit.
    await RegSession.deleteOne({ _id: session._id });
    await logEvent("pin_set", { userId: user._id, ip, deviceFingerprint: fp, reason: "registration" });
    await logEvent("account_created", {
      userId: user._id, ip, deviceFingerprint: fp,
      aadhaarIdentityHash: session.aadhaar_identity_hash, consentFlag: true,
    });

    // Issue the first session immediately after account creation.
    const { accessToken, refreshToken, expiresAt } = await issueSession(user, {
      deviceFingerprint: fp, ip, userAgent: userAgent(req),
    });
    await logEvent("login_success", {
      userId: user._id, ip, deviceFingerprint: fp, reason: "first_session",
      meta: { method: "registration", stepUp: false },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
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
  } catch (err) {
    console.error("[registerSetPin] error:", err.message);
    return res.status(500).json({ success: false, message: GENERIC_TRY_LATER });
  }
};

/* ------------------------------------------------------------------ helpers */

/**
 * Split the Aadhaar full name into first + last for the User schema. Aadhaar
 * returns a single full name; we treat the last whitespace-separated token as
 * the surname and the rest as the given name. Best-effort — the full verified
 * name is also preserved (encrypted) in the KYC profile.
 */
function parseKycName(fullName) {
  const clean = String(fullName || "").trim().replace(/\s+/g, " ");
  if (!clean) return { first: "", last: "" };
  const parts = clean.split(" ");
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/** Parse the KYC DOB (string) into a Date for the User.dob (Date) field. */
function parseKycDob(dob) {
  if (!dob) return null;
  // Handle common Aadhaar formats: "DD-MM-YYYY", "YYYY-MM-DD", or just "YYYY".
  const s = String(dob).trim();
  let d;
  if (/^\d{4}$/.test(s)) {
    d = new Date(`${s}-01-01`);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-");
    d = new Date(`${yyyy}-${mm}-${dd}`);
  } else {
    d = new Date(s);
  }
  return isNaN(d.getTime()) ? null : d;
}

/** Normalize KYC gender to the User schema enum (lowercased by a pre-save hook). */
function normalizeKycGender(g) {
  const v = String(g || "").trim().toLowerCase();
  if (v.startsWith("m")) return "male";
  if (v.startsWith("f")) return "female";
  if (v) return "other";
  return "";
}

/**
 * Split a flattened KYC address string into the User schema's address fields.
 * The Aadhaar address is a comma-joined string; we map the tail to
 * state/postalCode/district where detectable and put the remainder in line1.
 * Best-effort — the full address is preserved (encrypted) in the KYC profile.
 */
function splitKycAddress(address) {
  const out = { addressLine1: "", addressLine2: "", district: "", state: "", postalCode: "" };
  const clean = String(address || "").trim();
  if (!clean) return out;
  const parts = clean.split(",").map((p) => p.trim()).filter(Boolean);
  // Pull a 6-digit pincode if present anywhere.
  const pinIdx = parts.findIndex((p) => /^\d{6}$/.test(p));
  if (pinIdx !== -1) {
    out.postalCode = parts[pinIdx];
    parts.splice(pinIdx, 1);
  }
  if (parts.length) out.state = parts.pop();
  if (parts.length) out.district = parts.pop();
  out.addressLine1 = parts.join(", ").slice(0, 200);
  return out;
}
