import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the API client module so the store can be driven deterministically.
vi.mock("../../../services/aadhaarAuthAPI", () => {
  return {
    registerStepA: vi.fn(),
    registerVerifyOtp: vi.fn(),
    registerSetPin: vi.fn(),
    loginIdentify: vi.fn(),
    loginWithPin: vi.fn(),
    loginRequestOtp: vi.fn(),
    loginVerifyOtp: vi.fn(),
    logoutEverywhere: vi.fn(),
    refresh: vi.fn(),
    setOnAuthLost: vi.fn(),
    setOnTokenRefreshed: vi.fn(),
  };
});

import * as api from "../../../services/aadhaarAuthAPI";
import { useAadhaarAuthStore, Steps } from "../aadhaarAuthStore";

function store() {
  return useAadhaarAuthStore.getState();
}

beforeEach(() => {
  vi.clearAllMocks();
  useAadhaarAuthStore.setState({ status: "unauthenticated", user: null });
  store().resetFlow("login");
});

describe("login state machine", () => {
  it("a correct PIN logs in directly (no device step-up)", async () => {
    store().startLogin();
    api.loginIdentify.mockResolvedValue({ success: true, methods: ["pin", "otp"] });
    await store().submitLoginAadhaar({ aadhaarNumber: "234567890123" });
    expect(store().step).toBe(Steps.LOGIN_METHOD);

    store().chooseMethod("pin");
    expect(store().step).toBe(Steps.LOGIN_PIN);

    // Correct PIN → straight to authenticated + DONE, regardless of device.
    api.loginWithPin.mockResolvedValue({
      success: true,
      user: { id: "u1", umid: "AB12345CD", status: "active" },
      accessToken: "a",
      refreshToken: "r",
    });
    const res = await store().submitLoginPin({ aadhaarNumber: "234567890123", pin: "428173" });

    expect(res.ok).toBe(true);
    expect(store().status).toBe("authenticated");
    expect(store().step).toBe(Steps.DONE);
  });

  it("deliberate OTP login completes straight to DONE", async () => {
    store().startLogin();
    api.loginIdentify.mockResolvedValue({ success: true, methods: ["pin", "otp"] });
    await store().submitLoginAadhaar({ aadhaarNumber: "234567890123" });
    store().chooseMethod("otp");
    api.loginRequestOtp.mockResolvedValue({ success: true, challengeId: "chal-1" });
    await store().requestLoginOtp({ aadhaarNumber: "234567890123" });
    expect(store().step).toBe(Steps.LOGIN_OTP);

    api.loginVerifyOtp.mockResolvedValue({
      success: true,
      user: { id: "u1", umid: "AB12345CD", status: "active" },
      accessToken: "a",
      refreshToken: "r",
    });
    await store().submitLoginOtp({ otp: "654987" });

    expect(store().status).toBe("authenticated");
    expect(store().step).toBe(Steps.DONE);
  });

  it("wrong PIN yields generic invalid-credentials without leaking existence", async () => {
    store().startLogin();
    api.loginWithPin.mockResolvedValue({ success: false });
    const res = await store().submitLoginPin({ aadhaarNumber: "234567890123", pin: "999999" });
    expect(res.code).toBe("invalid_credentials");
    expect(store().error.toLowerCase()).toContain("invalid credentials");
  });
});

describe("session-expiry mid-flow restart", () => {
  it("registration OTP with a SESSION_EXPIRED backend error resets to Aadhaar entry", async () => {
    store().startRegistration();
    // Simulate having a session, then the verify call returns session-expired.
    useAadhaarAuthStore.setState({ sessionId: "sess-1", step: Steps.REG_OTP });
    api.registerVerifyOtp.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { code: "SESSION_EXPIRED" } },
    });

    const res = await store().submitRegistrationOtp({ otp: "123456" });
    expect(res.code).toBe("session_expired");
    // Bounced back to the entry step with a message and no stale session.
    expect(store().step).toBe(Steps.REG_AADHAAR);
    expect(store().sessionId).toBeNull();
    expect(store().error.toLowerCase()).toContain("start again");
  });

  it("guards PIN step when the session is missing (hard refresh scenario)", async () => {
    store().startRegistration();
    useAadhaarAuthStore.setState({ sessionId: null, step: Steps.REG_PIN });
    const res = await store().submitRegistrationPin({ pin: "428173" });
    expect(res.code).toBe("session_expired");
    expect(store().step).toBe(Steps.REG_AADHAAR);
    expect(api.registerSetPin).not.toHaveBeenCalled();
  });
});
