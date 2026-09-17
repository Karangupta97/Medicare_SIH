import crypto from "crypto";

/**
 * Aadhaar identity hashing.
 *
 * WHY: We are LEGALLY FORBIDDEN (Aadhaar Act §29 storage restrictions) and
 * operationally unwilling to store raw Aadhaar numbers. Instead every account
 * is keyed by:
 *
 *     aadhaar_identity_hash = HMAC-SHA256(aadhaar_number, PEPPER)
 *
 * WHY HMAC + pepper (not plain SHA-256):
 *   - The Aadhaar number space is small and enumerable (12 digits, ~10^11
 *     candidates minus checksum). A plain hash would be trivially reversible by
 *     brute force. A server-only secret PEPPER (never in the DB, never in logs,
 *     stored in a KMS/secrets manager) makes the hash unforgeable and
 *     un-brute-forceable by anyone who steals the database alone.
 *   - Determinism: the same Aadhaar always maps to the same hash, which is what
 *     lets us enforce "exactly one account per Aadhaar" via a UNIQUE index.
 *
 * ROTATION: pepper is versioned. On rotation we keep previous pepper(s) so
 * already-registered users can still be matched, and lazily re-hash on next
 * successful OTP auth (see .env.aadhaar.example rotation plan).
 */

function loadPeppers() {
  const current = process.env.AADHAAR_HMAC_PEPPER;
  if (!current) {
    // Fail loud: without the pepper the whole identity model is insecure.
    throw new Error(
      "AADHAAR_HMAC_PEPPER is not configured. It must be loaded from the secrets manager before the app can hash Aadhaar identities."
    );
  }
  const version = process.env.AADHAAR_HMAC_PEPPER_VERSION || "1";
  const previous = (process.env.AADHAAR_HMAC_PEPPER_PREVIOUS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { current, version, previous };
}

/**
 * Compute the canonical identity hash with the CURRENT pepper.
 * @param {string} aadhaarNumber - raw 12-digit Aadhaar (never persisted)
 * @returns {{ hash: string, version: string }}
 */
export function computeAadhaarIdentityHash(aadhaarNumber) {
  const { current, version } = loadPeppers();
  const hash = crypto
    .createHmac("sha256", current)
    .update(String(aadhaarNumber), "utf8")
    .digest("hex");
  return { hash, version };
}

/**
 * Compute candidate hashes for LOOKUP during a pepper-rotation window: the
 * current pepper first, then each previous pepper. Lets already-registered
 * users authenticate before they've been lazily re-hashed.
 * @param {string} aadhaarNumber
 * @returns {Array<{ hash: string, version: string, isCurrent: boolean }>}
 */
export function computeAadhaarLookupHashes(aadhaarNumber) {
  const { current, version, previous } = loadPeppers();
  const out = [
    {
      hash: crypto.createHmac("sha256", current).update(String(aadhaarNumber), "utf8").digest("hex"),
      version,
      isCurrent: true,
    },
  ];
  previous.forEach((pep, idx) => {
    out.push({
      hash: crypto.createHmac("sha256", pep).update(String(aadhaarNumber), "utf8").digest("hex"),
      version: `prev-${idx}`,
      isCurrent: false,
    });
  });
  return out;
}
