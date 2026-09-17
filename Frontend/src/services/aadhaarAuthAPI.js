import axios from "axios";
import { getDeviceId } from "../utils/aadhaar/deviceFingerprint";

/**
 * Typed (via JSDoc) API client for the Aadhaar patient auth flows.
 *
 * ============================ SECURITY DESIGN ============================
 *  - DEDICATED axios instance (not the app-global `axios`): the global instance
 *    in authStore.js stores the JWT in localStorage. That pattern is unsafe for
 *    this flow (XSS can read localStorage), so we keep this client isolated with
 *    its own interceptors and its own IN-MEMORY access token.
 *  - ACCESS TOKEN IN MEMORY ONLY: held in a module variable, never written to
 *    localStorage/sessionStorage. Lost on full reload — which is fine because we
 *    silently re-mint it from the refresh token on the next request.
 *  - REFRESH TOKEN: on web the ideal is an httpOnly Secure cookie the JS can't
 *    read. The real backend returns a refreshToken in the JSON body (documented
 *    reconciliation), so we support BOTH: if the backend sets a cookie we rely
 *    on `withCredentials`; otherwise we hold the refresh token in memory and let
 *    the caller persist it to secure storage on native. We NEVER put it in
 *    localStorage on web.
 *  - DEVICE FINGERPRINT header on every request for backend device/risk checks.
 *  - HTTPS-ONLY guard: warns loudly in dev if the API base is plain HTTP.
 *  - 401 -> single silent refresh -> retry -> clean logout on failure.
 *  - PIN/OTP values are passed straight through to the request and never cached
 *    in this module.
 * =========================================================================
 */

// --- Base URL resolution (mirrors authStore.js convention) ---
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-backend-vl01.onrender.com";

// HTTPS-only guard. In production a plain-HTTP API base leaks Aadhaar/OTP/PIN in
// transit. We warn hard in dev and refuse in prod builds.
if (typeof window !== "undefined") {
  const isHttp = /^http:\/\//i.test(API_URL);
  const isLocalhost = /localhost|127\.0\.0\.1/.test(API_URL);
  if (isHttp && !isLocalhost) {
    const msg = `[aadhaarAuthAPI] INSECURE API base over plain HTTP: ${API_URL}. Aadhaar auth must use HTTPS.`;
    if (import.meta.env.PROD) throw new Error(msg);
    console.warn(msg);
  }
}

// Real backend base path (documented reconciliation with the spec's /auth/*).
const BASE = `${API_URL}/api/auth/aadhaar`;

// --- In-memory token state (module-scoped, never persisted here) ---
let accessToken = null;
let refreshToken = null; // held in memory on web; persist to secure storage on native
let onAuthLost = null; // callback invoked on unrecoverable 401 (clean logout)

/** Set the in-memory access token (called after login/register/refresh). */
export function setAccessToken(token) {
  accessToken = token || null;
}
/** Set the in-memory refresh token (web fallback when no httpOnly cookie). */
export function setRefreshToken(token) {
  refreshToken = token || null;
}
export function getRefreshToken() {
  return refreshToken;
}
/** Register a callback for unrecoverable auth loss (store wires this to logout). */
export function setOnAuthLost(fn) {
  onAuthLost = fn;
}
/**
 * Register a callback fired whenever the access token is (re)minted via silent
 * refresh. The store uses this to keep the bridged patient-auth localStorage
 * token in sync, so the existing dashboard's axios calls don't 401 after the
 * 15-min access token rotates.
 */
let onTokenRefreshed = null;
export function setOnTokenRefreshed(fn) {
  onTokenRefreshed = fn;
}
/** Clear all in-memory auth material. */
export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

// --- Dedicated axios instance ---
const client = axios.create({
  baseURL: BASE,
  withCredentials: true, // send/receive the refresh cookie if the backend uses one
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Request interceptor: attach device fingerprint + in-memory access token.
client.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  // Device/risk signal on every auth request. NOT a credential by itself.
  config.headers["x-device-id"] = getDeviceId();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: 401 -> single silent refresh -> retry -> logout.
let refreshInFlight = null;
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Only attempt refresh once per request, and never for the refresh call
    // itself (avoids an infinite loop).
    const isRefreshCall = original?.url?.includes("/session/refresh");
    if (status === 401 && original && !original.__retried && !isRefreshCall) {
      original.__retried = true;
      try {
        // Coalesce concurrent refreshes into a single in-flight request.
        if (!refreshInFlight) {
          refreshInFlight = doRefresh();
        }
        const ok = await refreshInFlight;
        refreshInFlight = null;
        if (ok) {
          original.headers.Authorization = `Bearer ${accessToken}`;
          return client(original); // retry once
        }
      } catch {
        refreshInFlight = null;
      }
      // Refresh failed → clean logout.
      clearTokens();
      if (onAuthLost) onAuthLost();
    }
    return Promise.reject(error);
  }
);

/**
 * Perform the token refresh. Uses the httpOnly cookie (withCredentials) and/or
 * the in-memory refresh token. Returns true on success.
 * @returns {Promise<boolean>}
 */
async function doRefresh() {
  try {
    const body = refreshToken ? { refreshToken } : {};
    const res = await client.post("/session/refresh", body, { __retried: true });
    if (res.data?.accessToken) {
      accessToken = res.data.accessToken;
      if (res.data.refreshToken) refreshToken = res.data.refreshToken;
      // Notify listeners (bridge) so the shared localStorage token stays current.
      if (onTokenRefreshed) onTokenRefreshed(accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/* ============================ Typedefs ============================ */
/**
 * @typedef {Object} RegisterStepAReq
 * @property {string} aadhaarNumber 12-digit Aadhaar
 * @property {boolean} consent explicit consent (must be true)
 * @property {string} [captchaToken] captcha/attestation token
 *
 * @typedef {Object} RegisterStepARes
 * @property {boolean} success
 * @property {string} message
 * @property {string} [sessionId]
 * @property {number} [expiresInSeconds] app-side OTP session expiry
 * @property {string} [code] e.g. ACCOUNT_EXISTS
 *
 * @typedef {Object} OtpVerifyRes
 * @property {boolean} success
 * @property {string} message
 * @property {string} [sessionId]
 * @property {number} [attemptsLeft]
 * @property {string} [code]
 * @property {number} [retryAfterMs]
 *
 * @typedef {Object} TokenBundle
 * @property {boolean} success
 * @property {{id:string, umid:string, status:string}} [user]
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} refreshTokenExpiresAt
 *
 * @typedef {Object} LoginPinRes
 * @property {boolean} success
 * @property {string} [code] STEP_UP_REQUIRED when a step-up OTP is needed
 * @property {boolean} [stepUp]
 * @property {string} [challengeId]
 * @property {string} [accessToken]
 * @property {string} [refreshToken]
 * @property {string} [refreshTokenExpiresAt]
 * @property {{id:string, umid:string, status:string}} [user]
 */

/* ============================ Registration ============================ */

/**
 * Step A — submit Aadhaar + consent, triggers generate_otp.
 * @param {RegisterStepAReq} payload
 * @returns {Promise<RegisterStepARes>}
 */
export async function registerStepA(payload) {
  const { data } = await client.post("/register/step-a", payload);
  return data;
}

/**
 * Step B — verify OTP for the registration session.
 * @param {{ sessionId: string, otp: string }} payload
 * @returns {Promise<OtpVerifyRes>}
 */
export async function registerVerifyOtp(payload) {
  const { data } = await client.post("/register/step-b", payload);
  return data;
}

/**
 * Step C — set PIN, completes account creation, returns tokens.
 * @param {{ sessionId: string, pin: string }} payload
 * @returns {Promise<TokenBundle>}
 */
export async function registerSetPin(payload) {
  const { data } = await client.post("/register/set-pin", payload);
  captureTokens(data);
  return data;
}

/* ============================ Login ============================ */

/**
 * Step 1 — identify by Aadhaar. Backend returns available methods; it never
 * reveals whether the account exists (generic response either way).
 * @param {{ aadhaarNumber: string }} payload
 * @returns {Promise<{ success: boolean, methods: string[] }>}
 */
export async function loginIdentify(payload) {
  const { data } = await client.post("/login/identify", payload);
  return data;
}

/**
 * Step 2 (PIN path).
 * @param {{ aadhaarNumber: string, pin: string }} payload
 * @returns {Promise<LoginPinRes>}
 */
export async function loginWithPin(payload) {
  const { data } = await client.post("/login/pin", payload);
  captureTokens(data);
  return data;
}

/**
 * Step 2 (OTP path) — request OTP for an existing account.
 * @param {{ aadhaarNumber: string, captchaToken?: string }} payload
 * @returns {Promise<{ success: boolean, challengeId?: string, message: string }>}
 */
export async function loginRequestOtp(payload) {
  const { data } = await client.post("/login/otp/generate", payload);
  return data;
}

/**
 * Step 2 (OTP path) — verify OTP, returns tokens.
 * @param {{ challengeId: string, otp: string }} payload
 * @returns {Promise<TokenBundle>}
 */
export async function loginVerifyOtp(payload) {
  const { data } = await client.post("/login/otp/verify", payload);
  captureTokens(data);
  return data;
}

/* ============================ Session ============================ */

/** Explicit refresh (also invoked transparently by the 401 interceptor). */
export async function refresh() {
  const ok = await doRefresh();
  return ok;
}

/** Log out of all sessions (requires a valid access token). */
export async function logoutEverywhere() {
  try {
    await client.post("/logout-all", {});
  } finally {
    clearTokens();
  }
}

/** Capture tokens from a successful auth response into in-memory state. */
function captureTokens(data) {
  if (data?.accessToken) accessToken = data.accessToken;
  if (data?.refreshToken) refreshToken = data.refreshToken;
}

// Exposed for tests only.
export const __test = { doRefresh, getAccessToken: () => accessToken };
