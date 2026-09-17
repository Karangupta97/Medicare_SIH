import crypto from "crypto";
import bcryptjs from "bcryptjs";

/**
 * Login PIN hashing and strength validation.
 *
 * WHY argon2id: a 6-digit PIN has only 10^6 (1,000,000) possible values — tiny.
 * Offline brute force of a leaked hash is the primary threat. argon2id is a
 * memory-hard KDF that makes each guess expensive in both CPU and RAM, which is
 * the strongest widely-available defense for low-entropy secrets. We also add a
 * unique per-user random salt so identical PINs across users produce different
 * hashes (defeats precomputation / rainbow tables and cross-account correlation).
 *
 * FALLBACK: if argon2 native bindings are unavailable in the deploy
 * environment, we transparently fall back to bcrypt with cost >= 12. Online
 * brute force is separately throttled by the lockout logic in the login flow;
 * the KDF here is the offline-leak backstop.
 */

// Lazy, optional import of argon2 so the module still loads (with bcrypt
// fallback) even if the native addon failed to build on this platform.
let argon2 = null;
let argon2Load = null;
async function getArgon2() {
  if (argon2) return argon2;
  if (!argon2Load) {
    argon2Load = import("argon2")
      .then((m) => {
        argon2 = m.default || m;
        return argon2;
      })
      .catch(() => null);
  }
  return argon2Load;
}

const BCRYPT_COST = 12; // fallback cost; >= 12 per requirement

// argon2id parameters — tuned to be interactive-fast but memory-hard.
const ARGON2_OPTS = {
  type: 2, // argon2id (0=d, 1=i, 2=id). Set concretely at call time from the lib.
  memoryCost: 19456, // ~19 MiB
  timeCost: 2,
  parallelism: 1,
};

/**
 * A small denylist of trivially guessable 6-digit PINs. WHY: even with a KDF,
 * an attacker's first guesses are the obvious ones. Rejecting them at set-time
 * removes the highest-probability online-guess targets. This list is
 * intentionally short and illustrative — extend from a breached-PIN corpus in
 * production.
 */
const PIN_DENYLIST = new Set([
  "000000", "111111", "222222", "333333", "444444", "555555",
  "666666", "777777", "888888", "999999",
  "123456", "654321", "123123", "112233", "121212", "123321",
  "789456", "159357", "100000", "101010", "011011", "696969",
]);

/**
 * Validate a candidate PIN for format and weakness.
 * @param {string} pin
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validatePinStrength(pin) {
  if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
    return { valid: false, reason: "PIN must be exactly 6 digits." };
  }
  // Repeated single digit, e.g. 111111
  if (/^(\d)\1{5}$/.test(pin)) {
    return { valid: false, reason: "PIN cannot be a single repeated digit." };
  }
  // Sequential ascending or descending, e.g. 123456 / 654321
  const digits = pin.split("").map(Number);
  const ascending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
  const descending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
  if (ascending || descending) {
    return { valid: false, reason: "PIN cannot be a sequential run of digits." };
  }
  if (PIN_DENYLIST.has(pin)) {
    return { valid: false, reason: "PIN is too common. Choose a less predictable PIN." };
  }
  return { valid: true };
}

/**
 * Hash a PIN. Returns the algorithm used so the verifier can pick the right path.
 * A unique random salt is generated per user; with argon2 the salt is embedded
 * in the encoded hash, but we ALSO return an explicit salt to satisfy the data
 * model's pin_salt column and to support a future pepper-style peppering.
 * @param {string} pin
 * @returns {Promise<{ hash: string, salt: string, algo: 'argon2id'|'bcrypt' }>}
 */
export async function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const a2 = await getArgon2();
  if (a2) {
    // argon2 embeds its own salt; we combine the app salt as an associated
    // secret by prepending it to the input, then also persist it explicitly.
    const hash = await a2.hash(salt + pin, {
      type: a2.argon2id,
      memoryCost: ARGON2_OPTS.memoryCost,
      timeCost: ARGON2_OPTS.timeCost,
      parallelism: ARGON2_OPTS.parallelism,
    });
    return { hash, salt, algo: "argon2id" };
  }
  // Fallback: bcrypt cost >= 12.
  const hash = await bcryptjs.hash(salt + pin, BCRYPT_COST);
  return { hash, salt, algo: "bcrypt" };
}

/**
 * Verify a PIN against a stored hash + salt.
 * @param {string} pin
 * @param {string} hash
 * @param {string} salt
 * @param {'argon2id'|'bcrypt'} algo
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin, hash, salt, algo) {
  const candidate = salt + pin;
  if (algo === "argon2id") {
    const a2 = await getArgon2();
    if (!a2) {
      // Hash was made with argon2 but the lib is now unavailable — cannot verify.
      throw new Error("argon2 hash present but argon2 module is unavailable in this environment.");
    }
    return a2.verify(hash, candidate);
  }
  return bcryptjs.compare(candidate, hash);
}
