import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

/**
 * Short-lived, server-side registration session (multi-step flow state).
 *
 * DESIGN DEFAULT / DEVIATION: the requirement suggests Redis. This repo has no
 * Redis (confirmed — no ioredis/redis dependency), so we back the ephemeral
 * registration state with a MongoDB TTL collection instead. This preserves the
 * intent — short-lived, server-only, auto-expiring, never a single fat request —
 * without introducing new infrastructure. Swap to Redis by replacing this model
 * + the store helper if/when Redis is added; the flow code depends only on the
 * store interface, not on Mongo directly.
 *
 * SECURITY CONTROLS:
 *  - Holds the provider reference_id and an app-side expiry INDEPENDENT of the
 *    provider's OTP expiry.
 *  - Caps OTP verification attempts (otp_attempts) — exceeding invalidates the
 *    reference and forces a restart.
 *  - Stores the identity hash (not the raw Aadhaar). The raw Aadhaar is held in
 *    memory only for the duration of a single request and never persisted here.
 *  - After OTP success, the ENCRYPTED KYC payload is parked here (already
 *    field-encrypted) until the PIN is set and the real account is created in a
 *    transaction. Raw KYC payload is discarded immediately after encryption.
 *  - TTL index auto-purges abandoned sessions.
 */
const registrationSessionSchema = new mongoose.Schema(
  {
    // Opaque session id handed to the client between steps (not guessable).
    session_id: { type: String, required: true, unique: true, index: true },

    aadhaar_identity_hash: { type: String, required: true, index: true },
    aadhaar_hash_version: { type: String, default: "1" },

    // Provider OTP reference.
    reference_id: { type: String, default: null },
    provider: { type: String, default: "sandbox" },

    // Flow state machine: which step we're on.
    step: {
      type: String,
      enum: ["otp_pending", "otp_verified", "completed"],
      default: "otp_pending",
    },

    otp_attempts: { type: Number, default: 0 },
    max_otp_attempts: { type: Number, default: 3 },

    consent_flag: { type: Boolean, default: false },
    consent_at: { type: Date, default: null },
    consent_ip: { type: String, default: null },

    // Parked ENCRYPTED KYC fields (AES-256-GCM envelopes) after OTP success.
    // Present only once step === 'otp_verified'.
    encrypted_kyc: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Display profile fields derived from the verified KYC (name, dob, gender,
    // address parts) that are written onto the User document in Step C. These
    // are the government-verified values shown in the app. Held only for the
    // short life of this session, then discarded with it. Not maximally
    // sensitive (name/dob are shown in the UI anyway), but still short-lived.
    profile_from_kyc: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    ip_address: { type: String, default: null },
    device_fingerprint: { type: String, default: null },

    // Reused as an OTP-challenge store for the login/step-up OTP paths.
    // user_ref links a login/step-up challenge to an existing account (null for
    // registration sessions). step_up marks a PIN-then-OTP step-up challenge.
    user_ref: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    step_up: { type: Boolean, default: false },

    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
  },
  { versionKey: false }
);

// TTL: Mongo purges the doc once expires_at passes (app-side independent expiry).
registrationSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const RegistrationSession = () =>
  getPatientDB().model("RegistrationSession", registrationSessionSchema);
