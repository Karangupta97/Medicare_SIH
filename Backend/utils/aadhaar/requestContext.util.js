import crypto from "crypto";

/**
 * Helpers for extracting request context used across the Aadhaar auth flows.
 */

/**
 * Derive a device fingerprint. WHY hashed: we don't store raw UA + device id;
 * we hash the combination so the fingerprint is stable per device but not itself
 * reversible PII. The client is expected to send a stable deviceId from secure
 * storage; we combine it with the User-Agent.
 */
export function deviceFingerprint(req) {
  const clientId =
    req.body?.deviceId ||
    req.headers["x-device-id"] ||
    req.body?.deviceFingerprint ||
    req.headers["x-device-fingerprint"] ||
    "";
  const ua = req.headers["user-agent"] || "";
  return crypto.createHash("sha256").update(`${clientId}|${ua}`).digest("hex");
}

export function clientIp(req) {
  // Trust proxy should be configured at the app level; fall back gracefully.
  return (
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
}

export function userAgent(req) {
  return req.headers["user-agent"] || null;
}

/**
 * Constant-time-ish response padding for the duplicate-account pre-check.
 *
 * WHY: If a duplicate Aadhaar returns instantly while a new one takes ~1s (the
 * OKYC round-trip), an attacker can enumerate which Aadhaar numbers already have
 * accounts purely from response timing. We pad the "duplicate" response so its
 * total latency approximates the non-duplicate path. Not perfect, but removes
 * the coarse timing side-channel.
 * @param {number} startMs performance start time (Date.now())
 * @param {number} targetMs target minimum total latency
 */
export async function padResponseTime(startMs, targetMs = 1200) {
  const elapsed = Date.now() - startMs;
  const remaining = targetMs - elapsed;
  if (remaining > 0) {
    await new Promise((r) => setTimeout(r, remaining));
  }
}
