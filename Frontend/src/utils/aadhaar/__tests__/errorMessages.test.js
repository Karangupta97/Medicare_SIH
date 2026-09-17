import { describe, it, expect } from "vitest";
import { classifyAuthError, messageForCode, authErrorMessage, AuthErrorCode } from "../errorMessages";

describe("error-code → message mapping", () => {
  it("every canonical code has a non-empty message", () => {
    for (const code of Object.values(AuthErrorCode)) {
      const msg = messageForCode(code);
      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it("classifies backend `code` values (real repo shape)", () => {
    expect(classifyAuthError({ response: { status: 200, data: { code: "ACCOUNT_EXISTS" } } })).toBe(
      AuthErrorCode.ACCOUNT_EXISTS
    );
    expect(classifyAuthError({ response: { status: 400, data: { code: "SESSION_EXPIRED" } } })).toBe(
      AuthErrorCode.SESSION_EXPIRED
    );
    expect(classifyAuthError({ response: { status: 429, data: { code: "RESTART_REQUIRED" } } })).toBe(
      AuthErrorCode.RESTART_REQUIRED
    );
    expect(classifyAuthError({ response: { status: 200, data: { code: "STEP_UP_REQUIRED" } } })).toBe(
      AuthErrorCode.STEP_UP_REQUIRED
    );
  });

  it("classifies the spec's `{ error }` shape too", () => {
    expect(classifyAuthError({ response: { status: 400, data: { error: "invalid_credentials" } } })).toBe(
      AuthErrorCode.INVALID_CREDENTIALS
    );
    expect(classifyAuthError({ response: { status: 400, data: { error: "otp_expired" } } })).toBe(
      AuthErrorCode.OTP_EXPIRED
    );
    expect(classifyAuthError({ response: { status: 400, data: { error: "account_locked" } } })).toBe(
      AuthErrorCode.ACCOUNT_LOCKED
    );
  });

  it("falls back on HTTP status when no code/error present", () => {
    expect(classifyAuthError({ response: { status: 429, data: {} } })).toBe(AuthErrorCode.RATE_LIMITED);
    expect(classifyAuthError({ response: { status: 503, data: {} } })).toBe(AuthErrorCode.SOURCE_UNAVAILABLE);
    expect(classifyAuthError({ response: { status: 401, data: {} } })).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(classifyAuthError({ response: { status: 500, data: {} } })).toBe(AuthErrorCode.SERVER);
  });

  it("treats a no-response axios error as network", () => {
    expect(classifyAuthError({ isAxiosError: true, response: undefined })).toBe(AuthErrorCode.NETWORK);
  });

  it("never reveals account existence for invalid_credentials", () => {
    const msg = authErrorMessage({ response: { status: 401, data: {} } });
    expect(msg.toLowerCase()).not.toMatch(/no account|not registered|unknown user|doesn't exist/);
  });
});
