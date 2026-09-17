import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

/**
 * Auth session — one row per issued refresh token (device-bound).
 *
 * SECURITY CONTROLS:
 *  - refresh_token_hash: we store only a SHA-256 hash of the refresh token, not
 *    the token itself. A DB leak therefore cannot be replayed to mint sessions.
 *  - Single-use rotation: each refresh consumes the current token (revoked_at
 *    set) and issues a new one. If a revoked/absent token is presented, that's
 *    a replay signal → we can revoke the whole chain.
 *  - device_fingerprint binds the token to the device it was issued to, so a
 *    stolen refresh token used from a different device is detectable.
 *  - TTL index on expires_at auto-purges expired sessions.
 */
const aadhaarSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    device_fingerprint: { type: String, required: true },
    // SHA-256 hex of the opaque refresh token. Unique so a token maps to one row.
    refresh_token_hash: { type: String, required: true, unique: true, index: true },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date, default: null },
    // Links a rotated token back to the one it replaced (chain for replay detect).
    rotated_from: { type: String, default: null },
  },
  { versionKey: false }
);

// Auto-expire sessions at expires_at (Mongo TTL monitor).
aadhaarSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const AadhaarSession = () => getPatientDB().model("AadhaarSession", aadhaarSessionSchema);
