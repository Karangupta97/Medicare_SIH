import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AadhaarSession } from "../../models/User/aadhaarSession.model.js";
import { logEvent } from "./audit.service.js";

/**
 * Session / token issuance and rotation.
 *
 * MODEL:
 *  - Access token: short-lived JWT (~15m). Stateless; carries user id + umid.
 *    Short life limits the blast radius of a leaked access token.
 *  - Refresh token: long-lived (default 30d) opaque random string, returned to
 *    the client ONCE. We store only its SHA-256 hash (refresh_token_hash). It is
 *    single-use and device-bound: every refresh consumes the current token and
 *    issues a new one (rotation). Presenting a revoked/unknown token is treated
 *    as a replay and revokes the whole user's sessions.
 */

const ACCESS_TTL = process.env.AADHAAR_ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL_DAYS = parseInt(process.env.AADHAAR_REFRESH_TOKEN_TTL_DAYS || "30", 10);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user) {
  // WHY minimal claims: the JWT is bearer — keep PII out of it. No Aadhaar, no
  // name/lastname are included to mirror the LEGACY email JWT: several existing
  // endpoints (report upload, profile/address update, activity feed) read
  // req.user.name from the decoded token. Omitting them broke those endpoints
  // after the Aadhaar migration ("User ID and name are required" / upload 500).
  // These are the government-verified names already shown in-app, so including
  // them in the bearer token is consistent with the prior design.
  return jwt.sign(
    {
      id: String(user._id),
      umid: user.umid,
      name: user.name,
      lastname: user.lastname,
      typ: "access",
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

/**
 * Issue a fresh access + refresh pair and persist the refresh session.
 * @returns {Promise<{ accessToken, refreshToken, expiresAt }>}
 */
export async function issueSession(user, { deviceFingerprint, ip, userAgent }) {
  const Session = AadhaarSession();
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await Session.create({
    user_id: user._id,
    device_fingerprint: deviceFingerprint,
    refresh_token_hash: hashToken(refreshToken),
    ip_address: ip,
    user_agent: userAgent,
    expires_at: expiresAt,
  });

  const accessToken = signAccessToken(user);
  return { accessToken, refreshToken, expiresAt };
}

/**
 * Rotate a refresh token: validate → single-use consume → issue new pair.
 * Detects replay (revoked/unknown token) and revokes the whole chain.
 * @returns {Promise<{ ok, accessToken?, refreshToken?, expiresAt?, reason? }>}
 */
export async function rotateRefreshToken(user, presentedRefreshToken, { deviceFingerprint, ip, userAgent }) {
  const Session = AadhaarSession();
  const presentedHash = hashToken(presentedRefreshToken);
  const existing = await Session.findOne({ refresh_token_hash: presentedHash });

  // Unknown token — never issued or already purged. Treat as replay.
  if (!existing) {
    await revokeAllSessions(user._id, "refresh_replay_unknown", { ip, deviceFingerprint });
    return { ok: false, reason: "invalid" };
  }
  // Already revoked (single-use violated) — replay. Revoke everything.
  if (existing.revoked_at) {
    await revokeAllSessions(user._id, "refresh_replay_reused", { ip, deviceFingerprint });
    return { ok: false, reason: "replay" };
  }
  // Expired.
  if (existing.expires_at < new Date()) {
    existing.revoked_at = new Date();
    await existing.save();
    return { ok: false, reason: "expired" };
  }
  // Device binding: refresh must come from the device it was issued to.
  if (existing.device_fingerprint !== deviceFingerprint) {
    await revokeAllSessions(user._id, "refresh_device_mismatch", { ip, deviceFingerprint });
    return { ok: false, reason: "device_mismatch" };
  }

  // Consume current (single-use) and issue the next.
  existing.revoked_at = new Date();
  await existing.save();

  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await Session.create({
    user_id: user._id,
    device_fingerprint: deviceFingerprint,
    refresh_token_hash: hashToken(refreshToken),
    ip_address: ip,
    user_agent: userAgent,
    expires_at: expiresAt,
    rotated_from: presentedHash,
  });

  await logEvent("session_refreshed", {
    userId: user._id,
    ip,
    deviceFingerprint,
    reason: "rotation",
  });

  const accessToken = signAccessToken(user);
  return { ok: true, accessToken, refreshToken, expiresAt };
}

/**
 * Revoke every active session for a user. Used on PIN change, suspected
 * compromise, replay detection, and explicit "log out everywhere".
 */
export async function revokeAllSessions(userId, reason, ctx = {}) {
  const Session = AadhaarSession();
  const res = await Session.updateMany(
    { user_id: userId, revoked_at: null },
    { $set: { revoked_at: new Date() } }
  );
  await logEvent("session_revoked", {
    userId,
    ip: ctx.ip || null,
    deviceFingerprint: ctx.deviceFingerprint || null,
    reason: reason || "revoke_all",
    meta: { revokedCount: res.modifiedCount },
  });
  return res.modifiedCount;
}

/**
 * Revoke a single session (single-device logout) by its refresh token.
 */
export async function revokeSessionByRefreshToken(userId, refreshToken, ctx = {}) {
  const Session = AadhaarSession();
  const res = await Session.updateOne(
    { user_id: userId, refresh_token_hash: hashToken(refreshToken), revoked_at: null },
    { $set: { revoked_at: new Date() } }
  );
  await logEvent("session_revoked", {
    userId,
    ip: ctx.ip || null,
    deviceFingerprint: ctx.deviceFingerprint || null,
    reason: "single_logout",
  });
  return res.modifiedCount;
}
