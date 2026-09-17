import { create } from "zustand";
import * as api from "../../services/aadhaarAuthAPI";
import { setOnAuthLost, setOnTokenRefreshed } from "../../services/aadhaarAuthAPI";
import { classifyAuthError, messageForCode, AuthErrorCode } from "../../utils/aadhaar/errorMessages";
import { useAuthStore } from "./authStore";

/**
 * Bridge a successful Aadhaar auth into the existing patient auth store so the
 * SAME dashboard flow (ProtectedRoute / DashboardLayout / /api/auth/user) works
 * unchanged. Called on both registration completion and login completion.
 */
function bridgeToPatientAuth(res) {
  if (res?.accessToken) {
    useAuthStore.getState().hydrateFromAadhaar({
      accessToken: res.accessToken,
      user: res.user || {},
    });
  }
}

/**
 * Aadhaar auth flow state machine (Zustand — matches repo store convention).
 *
 * WHAT IT HOLDS (and deliberately does NOT):
 *  - flow: "idle" | "register" | "login"
 *  - step: the current screen in the flow (see Steps below)
 *  - sessionId / challengeId: server-issued flow tokens (SAFE to hold — they're
 *    opaque, short-lived, and useless without the OTP).
 *  - otpExpiresAt: absolute timestamp for the countdown (backend-synced, not a
 *    client-guessed duration).
 *  - status: "unauthenticated" | "in_flow" | "authenticated".
 *  - user: NON-SENSITIVE profile only (id, umid, status). Never KYC PII.
 *  - error: user-facing message string.
 *
 *  NEVER stored here: the Aadhaar number (kept only in the page component's
 *  transient state and cleared after use), the PIN, or the OTP. Those live in
 *  component state for the minimum time and are cleared on submit.
 *
 * The store is the single authority for transitions so back/forward/refresh
 * can't strand the UI on, say, the PIN screen with no valid session behind it
 * (guards check for sessionId/challengeId before allowing those steps).
 */

export const Steps = {
  // Registration
  REG_AADHAAR: "reg_aadhaar",
  REG_OTP: "reg_otp",
  REG_PIN: "reg_pin",
  REG_SUCCESS: "reg_success",
  // Login
  LOGIN_AADHAAR: "login_aadhaar",
  LOGIN_METHOD: "login_method",
  LOGIN_PIN: "login_pin",
  LOGIN_OTP: "login_otp",
  LOGIN_DEVICE_TRUST: "login_device_trust",
  DONE: "done",
};

const initialFlowState = {
  flow: "idle",
  step: Steps.REG_AADHAAR,
  sessionId: null,
  challengeId: null,
  otpExpiresAt: null,
  attemptsLeft: null,
  methods: ["pin", "otp"],
  stepUp: false,
  newDevice: false,
  error: null,
  loading: false,
};

export const useAadhaarAuthStore = create((set, get) => ({
  ...initialFlowState,
  status: "unauthenticated",
  user: null,

  /** Reset the flow to a clean start (used on session-expiry restart). */
  resetFlow: (flow = "idle") =>
    set({ ...initialFlowState, flow, step: flow === "login" ? Steps.LOGIN_AADHAAR : Steps.REG_AADHAAR }),

  clearError: () => set({ error: null }),

  /** Centralized error handling: classify → user message, plus flow control for
   *  session-expiry / restart-required so the UI never strands. */
  _handleError: (err) => {
    const code = classifyAuthError(err);
    const message = messageForCode(code);
    // Session expired or forced restart → bounce back to the flow's entry step.
    if (code === AuthErrorCode.SESSION_EXPIRED || code === AuthErrorCode.RESTART_REQUIRED) {
      const flow = get().flow;
      set({
        ...initialFlowState,
        flow,
        step: flow === "login" ? Steps.LOGIN_AADHAAR : Steps.REG_AADHAAR,
        error: message,
      });
      return code;
    }
    set({ error: message, loading: false });
    return code;
  },

  /* ----------------------------- Registration ----------------------------- */

  startRegistration: () => set({ ...initialFlowState, flow: "register", step: Steps.REG_AADHAAR }),

  /**
   * Step A. Caller passes the raw Aadhaar (transient), consent, captcha token.
   * The raw Aadhaar is NOT stored in the store — only the returned sessionId is.
   */
  submitRegistrationAadhaar: async ({ aadhaarNumber, consent, captchaToken }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.registerStepA({ aadhaarNumber, consent, captchaToken });
      if (res.code === "ACCOUNT_EXISTS" || res.success === false) {
        // Duplicate account is surfaced as a friendly "please log in" message.
        set({ loading: false, error: messageForCode(AuthErrorCode.ACCOUNT_EXISTS) });
        return { ok: false, code: "ACCOUNT_EXISTS" };
      }
      set({
        loading: false,
        sessionId: res.sessionId,
        otpExpiresAt: Date.now() + (res.expiresInSeconds || 600) * 1000,
        attemptsLeft: null,
        step: Steps.REG_OTP,
      });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  /** Step B — verify the registration OTP. */
  submitRegistrationOtp: async ({ otp }) => {
    const { sessionId } = get();
    if (!sessionId) {
      // Guard: no valid session behind this step → restart.
      get().resetFlow("register");
      set({ error: messageForCode(AuthErrorCode.SESSION_EXPIRED) });
      return { ok: false, code: AuthErrorCode.SESSION_EXPIRED };
    }
    set({ loading: true, error: null });
    try {
      const res = await api.registerVerifyOtp({ sessionId, otp });
      if (res.code === "RETRY") {
        // "under process" — keep the user on the OTP screen with a retry hint.
        set({ loading: false, error: messageForCode(AuthErrorCode.OTP_UNDER_PROCESS) });
        return { ok: false, code: "RETRY", retryAfterMs: res.retryAfterMs };
      }
      if (!res.success) {
        set({ loading: false, attemptsLeft: res.attemptsLeft ?? null });
        // Distinguish expired vs invalid for messaging, both non-revealing.
        const isExpired = /expired/i.test(res.message || "");
        set({ error: messageForCode(isExpired ? AuthErrorCode.OTP_EXPIRED : AuthErrorCode.OTP_INVALID) });
        return { ok: false, code: isExpired ? AuthErrorCode.OTP_EXPIRED : AuthErrorCode.OTP_INVALID };
      }
      set({ loading: false, step: Steps.REG_PIN });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  /** Step C — set PIN, create account, auto-authenticate. */
  submitRegistrationPin: async ({ pin }) => {
    const { sessionId } = get();
    if (!sessionId) {
      get().resetFlow("register");
      set({ error: messageForCode(AuthErrorCode.SESSION_EXPIRED) });
      return { ok: false, code: AuthErrorCode.SESSION_EXPIRED };
    }
    set({ loading: true, error: null });
    try {
      const res = await api.registerSetPin({ sessionId, pin });
      if (res.code === "ACCOUNT_EXISTS") {
        set({ loading: false, error: messageForCode(AuthErrorCode.ACCOUNT_EXISTS) });
        return { ok: false, code: "ACCOUNT_EXISTS" };
      }
      // Success → authenticated. Backend issued the first session.
      // Bridge into the existing patient auth store so the dashboard flow works.
      bridgeToPatientAuth(res);
      set({
        loading: false,
        status: "authenticated",
        user: res.user || null,
        step: Steps.REG_SUCCESS,
        sessionId: null,
      });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  /* -------------------------------- Login -------------------------------- */

  startLogin: () => set({ ...initialFlowState, flow: "login", step: Steps.LOGIN_AADHAAR }),

  /** Step 1 — identify. Always advances to the method-choice screen (no leak). */
  submitLoginAadhaar: async ({ aadhaarNumber }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.loginIdentify({ aadhaarNumber });
      set({
        loading: false,
        methods: res.methods || ["pin", "otp"],
        step: Steps.LOGIN_METHOD,
      });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  chooseMethod: (method) =>
    set({ step: method === "otp" ? Steps.LOGIN_OTP : Steps.LOGIN_PIN, error: null }),

  /** Step 2 (PIN). Handles STEP_UP_REQUIRED → OTP redirect. */
  submitLoginPin: async ({ aadhaarNumber, pin }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.loginWithPin({ aadhaarNumber, pin });
      if (res.code === "STEP_UP_REQUIRED" || res.stepUp) {
        // New device / risk → force OTP. Carry the challengeId to the OTP screen.
        set({
          loading: false,
          stepUp: true,
          newDevice: true,
          challengeId: res.challengeId,
          otpExpiresAt: Date.now() + 600 * 1000,
          step: Steps.LOGIN_OTP,
          error: null,
        });
        return { ok: false, code: "STEP_UP_REQUIRED" };
      }
      if (!res.success) {
        set({ loading: false, error: messageForCode(AuthErrorCode.INVALID_CREDENTIALS) });
        return { ok: false, code: AuthErrorCode.INVALID_CREDENTIALS };
      }
      get()._finishLogin(res, { newDevice: false });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  /** Step 2 (OTP) — request OTP for an existing account. */
  requestLoginOtp: async ({ aadhaarNumber, captchaToken }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.loginRequestOtp({ aadhaarNumber, captchaToken });
      set({
        loading: false,
        challengeId: res.challengeId,
        otpExpiresAt: Date.now() + 600 * 1000,
        step: Steps.LOGIN_OTP,
      });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  /** Step 2 (OTP) — verify OTP, complete login. */
  submitLoginOtp: async ({ otp }) => {
    const { challengeId } = get();
    if (!challengeId) {
      get().resetFlow("login");
      set({ error: messageForCode(AuthErrorCode.SESSION_EXPIRED) });
      return { ok: false, code: AuthErrorCode.SESSION_EXPIRED };
    }
    set({ loading: true, error: null });
    try {
      const res = await api.loginVerifyOtp({ challengeId, otp });
      if (res.code === "RETRY") {
        set({ loading: false, error: messageForCode(AuthErrorCode.OTP_UNDER_PROCESS) });
        return { ok: false, code: "RETRY", retryAfterMs: res.retryAfterMs };
      }
      if (!res.success) {
        set({ loading: false, error: messageForCode(AuthErrorCode.OTP_INVALID) });
        return { ok: false, code: AuthErrorCode.OTP_INVALID };
      }
      get()._finishLogin(res, { newDevice: get().newDevice });
      return { ok: true };
    } catch (err) {
      const code = get()._handleError(err);
      return { ok: false, code };
    }
  },

  /** Shared login completion. Shows the device-trust moment for new devices. */
  _finishLogin: (res, { newDevice }) => {
    // Bridge into the existing patient auth store so ProtectedRoute passes and
    // the dashboard hydrates via /api/auth/user — same flow as email login.
    bridgeToPatientAuth(res);
    set({
      loading: false,
      status: "authenticated",
      user: res.user || null,
      challengeId: null,
      stepUp: false,
      // If this was a new device, surface the security moment before DONE.
      step: newDevice ? Steps.LOGIN_DEVICE_TRUST : Steps.DONE,
      newDevice,
    });
  },

  acknowledgeDevice: () => set({ step: Steps.DONE, newDevice: false }),

  logout: async () => {
    try {
      await api.logoutEverywhere();
    } finally {
      // Also clear the bridged patient auth store so ProtectedRoute logs out.
      try {
        await useAuthStore.getState().logout();
      } catch {
        /* ignore — best effort */
      }
      set({ ...initialFlowState, status: "unauthenticated", user: null });
    }
  },
}));

// Wire the API client's "auth lost" callback to store logout so an
// unrecoverable 401 cleanly resets to unauthenticated.
setOnAuthLost(() => {
  useAadhaarAuthStore.setState({ status: "unauthenticated", user: null });
  // Also clear the bridged patient auth store so the dashboard logs out.
  try {
    useAuthStore.getState().logout();
  } catch {
    /* best effort */
  }
});

// Keep the bridged patient-auth token in sync when the Aadhaar access token is
// silently refreshed, so the existing dashboard's axios calls keep working past
// the 15-minute access-token lifetime.
setOnTokenRefreshed((newAccessToken) => {
  if (newAccessToken) {
    useAuthStore.getState().setToken(newAccessToken);
  }
});

export default useAadhaarAuthStore;
