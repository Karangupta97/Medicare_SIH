/**
 * PowerSync enablement + config resolution.
 *
 * GRACEFUL FALLBACK is the key contract: PowerSync is only "enabled" when a
 * VITE_POWERSYNC_URL is configured (or VITE_POWERSYNC_ENABLED=true). When it is
 * NOT enabled, the whole PowerSync layer no-ops and every read hook falls back
 * to the existing online axios stores — so the app behaves exactly as before.
 */

const rawApiUrl = import.meta.env.VITE_API_URL;
export const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-sih.onrender.com";

export const POWERSYNC_URL = import.meta.env.VITE_POWERSYNC_URL || "";

export const TOKEN_ENDPOINT =
  import.meta.env.VITE_POWERSYNC_TOKEN_ENDPOINT ||
  `${API_URL}/api/powersync/token`;

export const WRITE_ENDPOINT = `${API_URL}/api/powersync/write`;

/** True only when PowerSync should be active. */
export function isPowerSyncEnabled() {
  const explicit = import.meta.env.VITE_POWERSYNC_ENABLED;
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return Boolean(POWERSYNC_URL);
}
