import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

/**
 * Append-only, tamper-evident compliance audit log.
 *
 * WHY: This system touches health data + government ID. Every Aadhaar API call
 * and every auth decision must be recorded for DPDP/Aadhaar-Act auditability.
 *
 * TAMPER EVIDENCE (hash chain): each row stores
 *     prev_hash  = row_hash of the immediately preceding row
 *     row_hash   = SHA-256(prev_hash + canonical(payload))
 * so silently altering or deleting any historical row breaks the chain from
 * that point forward — an auditor can detect it by recomputing the chain. This
 * is not a substitute for a WORM store, but gives cryptographic evidence on top
 * of ordinary Mongo storage. (The writer in audit.service.js enforces
 * append-only ordering; the schema forbids updates via a pre-hook.)
 *
 * PII DISCIPLINE: we log the aadhaar_identity_hash (never the raw number), the
 * event, and non-PII context. Raw Aadhaar and raw KYC payloads must NEVER reach
 * this collection.
 */
const auditLogSchema = new mongoose.Schema(
  {
    event_type: {
      type: String,
      required: true,
      enum: [
        "register_attempt",
        "otp_generated",
        "otp_verified",
        "otp_failed",
        "duplicate_rejected",
        "pin_set",
        "account_created",
        "login_success",
        "login_failed",
        "pin_locked",
        "account_frozen",
        "session_revoked",
        "session_refreshed",
        "step_up_triggered",
        "pii_access",
        "kyc_provider_error",
        // Separate, explicit consent for reusing the Aadhaar photo as the app
        // profile picture (captured at the set-PIN step). Distinct from the
        // main KYC/account-creation consent.
        "profile_photo_consent",
        // User-initiated profile-picture changes (change/remove) after
        // registration. These only ever touch users.photoURL, never the KYC copy.
        "profile_photo_updated",
      ],
      index: true,
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    aadhaar_identity_hash: { type: String, default: null, index: true },
    ip_address: { type: String, default: null },
    device_fingerprint: { type: String, default: null },
    consent_flag: { type: Boolean, default: null },
    // Free-form audit-friendly reason (e.g. "OTP Expired", "duplicate pre-check").
    reason_field: { type: String, default: null },
    // Extra structured, non-PII metadata (method used, step-up status, etc.).
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Hash-chain fields.
    seq: { type: Number, required: true, index: true }, // monotonic sequence
    prev_hash: { type: String, default: null },
    row_hash: { type: String, required: true },

    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

// Enforce append-only: block updates/deletes at the model layer. WHY: makes
// accidental or casual tampering fail loudly; combined with the hash chain this
// gives tamper-evidence. (A determined attacker with DB access is deterred by
// the chain, not by these hooks.)
function blockMutation(next) {
  next(new Error("audit_log is append-only; updates/deletes are not permitted."));
}
auditLogSchema.pre("updateOne", blockMutation);
auditLogSchema.pre("updateMany", blockMutation);
auditLogSchema.pre("findOneAndUpdate", blockMutation);
auditLogSchema.pre("deleteOne", blockMutation);
auditLogSchema.pre("deleteMany", blockMutation);
auditLogSchema.pre("findOneAndDelete", blockMutation);

export const AuditLog = () => getPatientDB().model("AuditLog", auditLogSchema);
