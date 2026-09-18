import { AadhaarKycProvider } from "./AadhaarKycProvider.js";

/**
 * MockAadhaarKycProvider — a deterministic, offline KYC provider for LOCAL
 * DEVELOPMENT and TESTING only.
 *
 * WHY THIS EXISTS: the real Sandbox OKYC endpoint is UIDAI-deprecated and
 * intermittently returns 503/"source unavailable", which repeatedly breaks the
 * registration and OTP-login flows during local testing. This mock lets you
 * exercise the ENTIRE flow (register -> OTP -> set PIN -> login -> photo) with
 * zero external dependency, behind the same AadhaarKycProvider interface.
 *
 * SAFETY: it is ONLY selected when AADHAAR_KYC_PROVIDER=mock (see
 * providerFactory.js). It never touches the network. Never enable it in
 * production — it accepts a fixed OTP and returns a fixed KYC payload.
 *
 * Behavior:
 *   - generateOtp(): always "otp_sent" with a deterministic reference id.
 *   - verifyOtp(): accepts the OTP from MOCK_KYC_OTP (default "123456"); any
 *     other value is treated as invalid. Returns a small VALID KYC payload with
 *     a real (tiny) base64 JPEG photo so the profile-picture pipeline works.
 */

// A tiny valid 128x128 JPEG, base64-encoded. Used so the photo decode/resize/
// upload pipeline has real image bytes to work with in dev.
const MOCK_PHOTO_BASE64 =
  "/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCACAAIADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAUG/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmAaZJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k=";

export class MockAadhaarKycProvider extends AadhaarKycProvider {
  get name() {
    return "mock";
  }

  async generateOtp(aadhaarNumber, { consent = "Y" } = {}) {
    if (consent !== "Y") {
      return { status: "error", retryable: false, providerMessage: "consent_required" };
    }
    // Deterministic reference id derived from the Aadhaar so repeat calls in a
    // flow are stable, without persisting the number.
    const last4 = String(aadhaarNumber || "").slice(-4) || "0000";
    return {
      status: "otp_sent",
      referenceId: `mock-ref-${last4}-${Date.now()}`,
      retryable: false,
      providerMessage: "MOCK_OTP_SENT",
    };
  }

  async verifyOtp(referenceId, otp) {
    const expected = (process.env.MOCK_KYC_OTP || "123456").trim();
    if (String(otp) !== expected) {
      return { status: "invalid_otp", retryable: false, providerMessage: "MOCK_INVALID_OTP" };
    }
    return {
      status: "valid",
      retryable: false,
      providerMessage: "MOCK_VALID",
      kyc: {
        name: "Test Kyc User",
        dob: "1995-06-15",
        gender: "M",
        address: "123 Test Street, Test Area, Pune, Maharashtra, 411001, India",
        careOf: "S/O Test Parent",
        photoBase64: MOCK_PHOTO_BASE64,
        mobile: "9999999999",
        email: "test.kyc@example.com",
      },
    };
  }
}
