/**
 * Stable client device identifier for backend device/risk checks.
 *
 * SECURITY NOTES:
 *  - This ID is a RISK-SIGNAL, never an auth credential on its own. The backend
 *    treats an unknown device as "step-up required", it does NOT grant access
 *    based on the ID alone. So its confidentiality is not security-critical, but
 *    its STABILITY is (a churning ID would force step-up on every login).
 *  - Web has no Keychain/Keystore. We use localStorage as the most stable
 *    option available in-browser and document that on native (React Native /
 *    Capacitor) this should be replaced with secure storage (Keychain/Keystore).
 *    We intentionally do NOT fingerprint the browser (canvas/font probing) —
 *    that's privacy-invasive and brittle; a random persisted UUID is sufficient
 *    as a "have I seen this browser before" signal.
 *  - The value sent to the backend is combined server-side with the User-Agent
 *    and hashed, so the raw ID is never stored server-side in the clear.
 */

import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "mc_device_id";

/**
 * Native secure-storage seam. On React Native/Capacitor, replace the body with
 * Keychain/Keystore access. On web we fall back to localStorage.
 */
function readPersisted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePersisted(id) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage blocked (private mode / policy). We fall back to a per-session id
    // held in memory so the app still works; it just won't be "remembered".
  }
}

let inMemoryId = null;

/**
 * Get (or lazily create) the stable device id.
 * @returns {string}
 */
export function getDeviceId() {
  if (inMemoryId) return inMemoryId;
  let id = readPersisted();
  if (!id) {
    id = uuidv4();
    writePersisted(id);
  }
  inMemoryId = id;
  return id;
}
