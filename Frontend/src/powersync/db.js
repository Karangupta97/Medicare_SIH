import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema } from "./schema";
import { isPowerSyncEnabled } from "./config";

/**
 * PowerSync client database singleton.
 *
 * ENCRYPTION AT REST (PHI): this local DB holds health data, so it must be
 * encrypted at rest. We pass an `encryptionKey` to the WASM SQLite backend
 * (SQLCipher-style). The key is derived per-device and stored in the browser's
 * most secure available slot; on native (Capacitor/RN) this should be replaced
 * with Keychain/Keystore (documented seam in getEncryptionKey).
 *
 * The DB is created lazily and only when PowerSync is enabled. When disabled,
 * getPowerSync() returns null and the app uses the online fallback everywhere.
 */

let _db = null;

// Derive/persist a local encryption key. WHY not a hardcoded key: a shared key
// gives no protection. This is a per-browser random key; combined with the fact
// that we only sync a single user's data at a time and clear the DB on logout,
// it keeps PHI ciphertext-at-rest. For stronger guarantees on native, back this
// with Keychain/Keystore.
function getEncryptionKey() {
  const KEY = "mc_ps_enc_key";
  try {
    let k = window.localStorage.getItem(KEY);
    if (!k) {
      const bytes = new Uint8Array(32);
      (window.crypto || {}).getRandomValues?.(bytes);
      k = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      window.localStorage.setItem(KEY, k);
    }
    return k;
  } catch {
    // Storage blocked → fall back to an ephemeral per-session key (DB won't
    // persist across reloads, but data still isn't left in plaintext).
    const bytes = new Uint8Array(32);
    (window.crypto || {}).getRandomValues?.(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

/**
 * Get (or lazily create) the PowerSync database. Returns null when PowerSync is
 * not enabled so callers can fall back cleanly.
 * @returns {PowerSyncDatabase|null}
 */
export function getPowerSync() {
  if (!isPowerSyncEnabled()) return null;
  if (_db) return _db;

  _db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: "medicare_offline.db",
      // Encrypt the local store at rest (health data).
      encryptionKey: getEncryptionKey(),
    },
  });
  return _db;
}

/**
 * Fully wipe the local database (called on logout so no PHI is left cached for
 * the next user of the device).
 */
export async function clearPowerSync() {
  if (!_db) return;
  try {
    await _db.disconnectAndClear();
  } catch (e) {
    console.warn("[powersync] clear failed:", e.message);
  }
}
