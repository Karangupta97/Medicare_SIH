/**
 * Central error-code → user-facing message map for the Aadhaar auth flows.
 *
 * WHY one file: the spec requires a single source of truth so messages stay
 * consistent and non-revealing across every screen. Never map an error to a
 * message that reveals whether an Aadhaar number is registered.
 *
 * BACKEND CONTRACT RECONCILIATION (documented default):
 *   The task spec lists a `{ error: "invalid_credentials" | ... }` shape, but
 *   the ACTUAL backend in this repo returns `{ success: false, message, code }`
 *   where `code` is one of: ACCOUNT_EXISTS, SESSION_EXPIRED, RESTART_REQUIRED,
 *   RETRY, STEP_UP_REQUIRED (plus HTTP status for rate-limit/lock cases). We
 *   normalize BOTH shapes here so the UI is decoupled from the wire format and
 *   this file is the only place that needs to change if the backend switches to
 *   the `{ error }` shape.
 */

// Canonical internal codes the UI reasons about.
export const AuthErrorCode = {
  INVALID_CREDENTIALS: "invalid_credentials",
  RATE_LIMITED: "rate_limited",
  OTP_EXPIRED: "otp_expired",
  OTP_INVALID: "otp_invalid",
  OTP_UNDER_PROCESS: "otp_under_process",
  SOURCE_UNAVAILABLE: "source_unavailable",
  ACCOUNT_LOCKED: "account_locked",
  ACCOUNT_FROZEN: "account_frozen",
  ACCOUNT_EXISTS: "account_exists",
  SESSION_EXPIRED: "session_expired",
  RESTART_REQUIRED: "restart_required",
  STEP_UP_REQUIRED: "step_up_required",
  NETWORK: "network_error",
  SERVER: "server_error",
};

// Non-revealing, user-friendly copy for each canonical code.
const MESSAGES = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "Invalid credentials. Please check your details and try again.",
  [AuthErrorCode.RATE_LIMITED]:
    "Too many attempts. Please wait a little while before trying again.",
  [AuthErrorCode.OTP_EXPIRED]:
    "That OTP has expired. Please request a new one.",
  [AuthErrorCode.OTP_INVALID]:
    "The OTP you entered is incorrect. Please try again.",
  [AuthErrorCode.OTP_UNDER_PROCESS]:
    "Your verification is still processing. Hang on a moment and we'll retry.",
  [AuthErrorCode.SOURCE_UNAVAILABLE]:
    "Aadhaar verification is temporarily unavailable. Please try again in a few minutes.",
  // Account-locked/frozen CAN carry extra detail: the user already proved they
  // know the Aadhaar number via a prior identify step, so this isn't enumeration.
  [AuthErrorCode.ACCOUNT_LOCKED]:
    "Too many incorrect attempts. Your account is temporarily locked. Please try again later or use OTP sign-in.",
  [AuthErrorCode.ACCOUNT_FROZEN]:
    "For your security, this account has been frozen after multiple failed attempts. Please contact support to restore access.",
  [AuthErrorCode.ACCOUNT_EXISTS]:
    "An account already exists for these details. Please log in instead.",
  [AuthErrorCode.SESSION_EXPIRED]:
    "Your session expired. Please start again.",
  [AuthErrorCode.RESTART_REQUIRED]:
    "Too many incorrect attempts. Please start again.",
  [AuthErrorCode.STEP_UP_REQUIRED]:
    "For your security, please verify with the OTP sent to your Aadhaar-linked mobile.",
  [AuthErrorCode.NETWORK]:
    "We couldn't reach the server. Check your connection and try again.",
  [AuthErrorCode.SERVER]:
    "Something went wrong on our end. Please try again in a moment.",
};

/**
 * Map a raw backend `code` string (or the spec's `error` string) to a canonical
 * code. Unknown values fall back to a generic server error.
 */
function normalizeCode(raw) {
  if (!raw) return null;
  const c = String(raw).toLowerCase();
  const map = {
    // Backend `code` values (real repo).
    account_exists: AuthErrorCode.ACCOUNT_EXISTS,
    session_expired: AuthErrorCode.SESSION_EXPIRED,
    restart_required: AuthErrorCode.RESTART_REQUIRED,
    step_up_required: AuthErrorCode.STEP_UP_REQUIRED,
    retry: AuthErrorCode.OTP_UNDER_PROCESS,
    // Spec `error` values.
    invalid_credentials: AuthErrorCode.INVALID_CREDENTIALS,
    rate_limited: AuthErrorCode.RATE_LIMITED,
    otp_expired: AuthErrorCode.OTP_EXPIRED,
    otp_invalid: AuthErrorCode.OTP_INVALID,
    account_locked: AuthErrorCode.ACCOUNT_LOCKED,
    server_error: AuthErrorCode.SERVER,
  };
  return map[c] || null;
}

/**
 * Derive a canonical code from an axios error / response payload. This is the
 * single place that inspects HTTP status + body to classify a failure.
 * @param {any} err axios error (has err.response) OR a plain payload
 * @returns {string} canonical AuthErrorCode
 */
export function classifyAuthError(err) {
  // Network / no response at all.
  if (err && err.isAxiosError && !err.response) {
    return AuthErrorCode.NETWORK;
  }
  const status = err?.response?.status ?? err?.status;
  const body = err?.response?.data ?? err?.data ?? err ?? {};

  // Explicit code/error from the body wins.
  const fromCode = normalizeCode(body.code || body.error);
  if (fromCode) return fromCode;

  // HTTP status heuristics for the generic-shaped failures.
  if (status === 429) return AuthErrorCode.RATE_LIMITED;
  if (status === 503) return AuthErrorCode.SOURCE_UNAVAILABLE;
  if (status === 401) return AuthErrorCode.INVALID_CREDENTIALS;
  if (status >= 500) return AuthErrorCode.SERVER;
  if (status === 400) return AuthErrorCode.INVALID_CREDENTIALS;
  return AuthErrorCode.SERVER;
}

/** Get the display message for a canonical code. */
export function messageForCode(code) {
  return MESSAGES[code] || MESSAGES[AuthErrorCode.SERVER];
}

/** Convenience: classify + message in one call. */
export function authErrorMessage(err) {
  return messageForCode(classifyAuthError(err));
}
