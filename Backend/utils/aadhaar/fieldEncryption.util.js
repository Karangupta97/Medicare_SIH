import crypto from "crypto";

/**
 * Field-level PII encryption using AES-256-GCM.
 *
 * WHY (defense in depth): Disk/at-rest encryption on the database protects
 * against stolen physical media, but NOT against a leaked DB dump, a compromised
 * DBA credential, or an app-layer injection that reads collections. Encrypting
 * each PII field (name, dob, address, PHOTO, care_of, contact hashes) with a key
 * held OUTSIDE the database (in a KMS / secrets manager) means a database
 * compromise alone yields only ciphertext.
 *
 * WHY GCM: authenticated encryption — the auth tag detects tampering, so an
 * attacker cannot silently flip bits in stored PII. Each field gets a fresh
 * random 96-bit IV (never reuse an IV/key pair with GCM).
 *
 * ENVELOPE FORMAT (stored as a single string per field):
 *     v<keyVersion>:<ivB64>:<authTagB64>:<ciphertextB64>
 * Storing the key version enables key rotation: new writes use the current key
 * version; old ciphertexts remain decryptable by looking up the historical key.
 *
 * KMS UPGRADE PATH: today we load a raw 256-bit data key from the secrets
 * manager (AADHAAR_FIELD_ENC_KEY). For full envelope encryption, replace
 * loadKey() with a call that asks KMS to decrypt a wrapped data key at boot and
 * caches it in memory only. The envelope format already carries a version, so
 * this change is transparent to stored data.
 */

const ALGO = "aes-256-gcm";
const IV_BYTES = 12; // 96-bit IV, recommended for GCM

function loadKey(version) {
  // Current key + version. During rotation, historical keys can be resolved by
  // version (extend this map from the secrets manager).
  const currentVersion = process.env.AADHAAR_FIELD_ENC_KEY_VERSION || "1";
  const keyMap = {
    [currentVersion]: process.env.AADHAAR_FIELD_ENC_KEY,
    // Add previous versions here during rotation, e.g.:
    // "0": process.env.AADHAAR_FIELD_ENC_KEY_V0,
  };
  const b64 = keyMap[version || currentVersion];
  if (!b64) {
    throw new Error(
      `AADHAAR_FIELD_ENC_KEY (version ${version || currentVersion}) is not configured. It must be loaded from the KMS/secrets manager.`
    );
  }
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error(
      "AADHAAR_FIELD_ENC_KEY must decode to exactly 32 bytes (256-bit). Generate with: openssl rand -base64 32"
    );
  }
  return { key, version: version || currentVersion };
}

/**
 * Encrypt a plaintext value (string or Buffer) into a self-describing envelope.
 * @param {string|Buffer} plaintext
 * @returns {string|null} envelope string, or null if input is null/undefined
 */
export function encryptField(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const { key, version } = loadKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const data = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(String(plaintext), "utf8");
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    `v${version}`,
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/**
 * Decrypt an envelope produced by encryptField back to a UTF-8 string.
 * @param {string} envelope
 * @returns {string|null}
 */
export function decryptField(envelope) {
  if (envelope === null || envelope === undefined) return null;
  const parts = String(envelope).split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted field envelope format");
  }
  const [vTag, ivB64, tagB64, ctB64] = parts;
  const version = vTag.replace(/^v/, "");
  const { key } = loadKey(version);
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag); // GCM: throws on tamper
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

/**
 * Decrypt an envelope to a raw Buffer (for binary PII like the KYC photo).
 * @param {string} envelope
 * @returns {Buffer|null}
 */
export function decryptFieldToBuffer(envelope) {
  if (envelope === null || envelope === undefined) return null;
  const parts = String(envelope).split(":");
  if (parts.length !== 4) throw new Error("Invalid encrypted field envelope format");
  const [vTag, ivB64, tagB64, ctB64] = parts;
  const { key } = loadKey(vTag.replace(/^v/, ""));
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]);
}

/**
 * Keyed hash for searchable-but-non-reversible contact fields (mobile, email).
 *
 * WHY: We may need to check "is this the mobile we have on file?" or dedupe on
 * contact, but we must not store raw contact PII in the clear. We reuse the
 * Aadhaar pepper as an HMAC key so the hash is unforgeable without the server
 * secret. (These are NOT the identity hash — they are separate contact hashes.)
 * @param {string} value
 * @returns {string|null}
 */
export function hashContact(value) {
  if (value === null || value === undefined || value === "") return null;
  const pepper = process.env.AADHAAR_HMAC_PEPPER;
  if (!pepper) throw new Error("AADHAAR_HMAC_PEPPER is not configured (required for contact hashing).");
  return crypto
    .createHmac("sha256", pepper)
    .update(String(value).trim().toLowerCase(), "utf8")
    .digest("hex");
}
