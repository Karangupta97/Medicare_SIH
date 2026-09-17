import axios from "axios";
import https from "https";
import { AadhaarKycProvider } from "./AadhaarKycProvider.js";

/**
 * Sandbox (sandbox.co.in) Aadhaar Offline e-KYC provider.
 *
 * Endpoints:
 *   POST /kyc/aadhaar/okyc/otp          -> generate OTP, returns reference_id
 *   POST /kyc/aadhaar/okyc/otp/verify   -> verify OTP, returns KYC on success
 *
 * SECURITY CONTROLS:
 *  - Credentials (x-api-key, Authorization JWT) are read from the secrets
 *    manager via process.env at call time — never hardcoded, never sent to the
 *    client. The Sandbox access token is short-lived; we mint it from
 *    api-key/api-secret if a pre-issued token is not supplied.
 *  - TLS 1.3 minimum enforced on the outbound agent (minVersion TLSv1.3). WHY:
 *    this call carries an Aadhaar number in transit; nothing below TLS 1.3 is
 *    acceptable for government-ID data.
 *  - We NEVER log the raw Aadhaar or the raw KYC payload. Only normalized
 *    status codes and non-PII reference ids are surfaced to callers/audit.
 *  - Every documented provider response state is mapped explicitly to our
 *    normalized contract so the flow can react (retry vs restart vs fail).
 *
 * NOTE: This endpoint is UIDAI-deprecated but operational. It lives behind
 * AadhaarKycProvider so a DigiLocker provider can replace it with zero changes
 * to controllers or DB code.
 */
export class SandboxAadhaarKycProvider extends AadhaarKycProvider {
  constructor() {
    super();
    // Sanitize env values: strip stray whitespace / CR that can sneak in from
    // CRLF-edited .env files and corrupt the URL / token / headers.
    this.baseURL = (process.env.SANDBOX_BASE_URL || "https://api.sandbox.co.in").trim().replace(/\/+$/, "");
    // TLS 1.3 minimum for all outbound Sandbox traffic.
    this._httpsAgent = new https.Agent({ minVersion: "TLSv1.3" });
    // Only treat a pre-issued token as valid if it's actually a non-trivial
    // string — an empty/whitespace value must NOT be used (it would be sent as a
    // garbage Authorization header and rejected).
    const envToken = (process.env.SANDBOX_ACCESS_TOKEN || "").trim();
    this._cachedToken = envToken.length > 20 ? envToken : null;
  }

  get name() {
    return "sandbox";
  }

  /**
   * Obtain a Sandbox access token. Prefer a pre-issued token from the secrets
   * manager; otherwise authenticate with api-key + api-secret. Cached in memory
   * only (never persisted/logged).
   */
  async _getAccessToken({ force = false } = {}) {
    // force=true skips the cache to re-mint after a rejected token.
    if (this._cachedToken && !force) return this._cachedToken;
    const apiKey = (process.env.SANDBOX_API_KEY || "").trim();
    const apiSecret = (process.env.SANDBOX_API_SECRET || "").trim();
    if (!apiKey || !apiSecret) {
      throw Object.assign(new Error("Sandbox credentials not configured"), {
        code: "KYC_CONFIG_ERROR",
      });
    }
    const resp = await axios.post(
      `${this.baseURL}/authenticate`,
      {},
      {
        headers: { "x-api-key": apiKey, "x-api-secret": apiSecret },
        httpsAgent: this._httpsAgent,
        timeout: 15000,
      }
    );
    this._cachedToken = resp.data?.access_token || resp.data?.data?.access_token;
    if (!this._cachedToken) {
      throw Object.assign(new Error("Sandbox authenticate returned no token"), {
        code: "KYC_AUTH_ERROR",
      });
    }
    return this._cachedToken;
  }

  _headers(accessToken) {
    return {
      Authorization: accessToken,
      "x-api-key": (process.env.SANDBOX_API_KEY || "").trim(),
      "x-api-version": (process.env.SANDBOX_API_VERSION || "2.0").trim(),
      "Content-Type": "application/json",
    };
  }

  /**
   * Generate OTP. Consent MUST be "Y" (explicit) and reason is an audit-friendly
   * string. Returns a normalized result — raw Aadhaar never logged.
   */
  async generateOtp(aadhaarNumber, { consent = "Y", reason = "Patient registration KYC" } = {}) {
    let accessToken;
    try {
      accessToken = await this._getAccessToken();
    } catch (e) {
      return { status: "error", retryable: true, providerMessage: e.code || "auth_failed" };
    }

    const doPost = (token) =>
      axios.post(
        `${this.baseURL}/kyc/aadhaar/okyc/otp`,
        {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
          aadhaar_number: String(aadhaarNumber),
          consent, // explicit consent flag, must be "Y"
          reason, // audit-friendly reason string
        },
        { headers: this._headers(token), httpsAgent: this._httpsAgent, timeout: 20000 }
      );

    try {
      let resp;
      try {
        resp = await doPost(accessToken);
      } catch (e) {
        // If the (possibly stale/cached) token was rejected, re-mint once and retry.
        if (e.response?.status === 401 || e.response?.status === 403) {
          accessToken = await this._getAccessToken({ force: true });
          resp = await doPost(accessToken);
        } else {
          throw e;
        }
      }

      const data = resp.data?.data || resp.data || {};
      const referenceId =
        data.reference_id || data.ref_id || data.referenceId || null;

      if (referenceId) {
        return { status: "otp_sent", referenceId: String(referenceId), retryable: false };
      }
      // Some deployments signal source problems in the message body.
      const msg = (data.message || resp.data?.message || "").toString();
      if (/source.*unavailable|try again/i.test(msg)) {
        return { status: "source_unavailable", retryable: true, providerMessage: msg };
      }
      return { status: "error", retryable: true, providerMessage: msg || "no_reference_id" };
    } catch (err) {
      return this._mapAxiosError(err);
    }
  }

  /**
   * Verify OTP. Maps every documented state explicitly.
   */
  async verifyOtp(referenceId, otp) {
    let accessToken;
    try {
      accessToken = await this._getAccessToken();
    } catch (e) {
      return { status: "error", retryable: true, providerMessage: e.code || "auth_failed" };
    }

    try {
      const resp = await axios.post(
        `${this.baseURL}/kyc/aadhaar/okyc/otp/verify`,
        {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
          reference_id: String(referenceId),
          otp: String(otp),
        },
        { headers: this._headers(accessToken), httpsAgent: this._httpsAgent, timeout: 20000 }
      );

      const data = resp.data?.data || resp.data || {};
      const statusStr = (data.status || data.message || resp.data?.message || "").toString();

      // VALID success — extract KYC. Field names normalized defensively because
      // provider payloads vary across versions.
      const looksValid =
        /^valid$/i.test(statusStr) ||
        (/success/i.test(statusStr) && (data.name || data.full_name));
      if (looksValid) {
        return {
          status: "valid",
          retryable: false,
          kyc: this._normalizeKyc(data),
          providerMessage: "VALID",
        };
      }
      if (/invalid.*otp/i.test(statusStr)) {
        return { status: "invalid_otp", retryable: false, providerMessage: statusStr };
      }
      if (/expired/i.test(statusStr)) {
        return { status: "otp_expired", retryable: false, providerMessage: statusStr };
      }
      if (/under process|processing|try again/i.test(statusStr)) {
        // Provider asks us to retry after a short delay — do NOT hammer it.
        return { status: "under_process", retryable: true, retryAfterMs: 3000, providerMessage: statusStr };
      }
      if (/source.*unavailable/i.test(statusStr)) {
        return { status: "source_unavailable", retryable: true, providerMessage: statusStr };
      }
      return { status: "error", retryable: false, providerMessage: statusStr || "unknown" };
    } catch (err) {
      return this._mapAxiosError(err);
    }
  }

  /**
   * Normalize the provider KYC payload into our internal shape. This is the ONE
   * place raw KYC is touched; callers immediately encrypt the result and the
   * raw object is dropped. We deliberately do not log any field here.
   */
  _normalizeKyc(data) {
    return {
      name: data.name || data.full_name || null,
      dob: data.date_of_birth || data.dob || null,
      gender: data.gender || null,
      address: this._flattenAddress(data),
      careOf: data.care_of || data.co || null,
      photoBase64: data.photo || data.photo_base64 || null,
      mobile: data.mobile || data.mobile_number || null,
      email: data.email || null,
    };
  }

  _flattenAddress(data) {
    if (typeof data.address === "string") return data.address;
    const a = data.address || data.full_address || {};
    if (typeof a === "string") return a;
    // Compose from split_address components if present.
    const parts = [
      a.house, a.street, a.landmark, a.vtc, a.subdistrict, a.district,
      a.state, a.pincode, a.country,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : (data.full_address || null);
  }

  _mapAxiosError(err) {
    const httpStatus = err.response?.status;
    // 503 Source Unavailable — clear retry-later, never silent failure.
    if (httpStatus === 503) {
      return { status: "source_unavailable", retryable: true, providerMessage: "http_503" };
    }
    if (httpStatus === 429) {
      return { status: "source_unavailable", retryable: true, providerMessage: "http_429_provider_rate_limit" };
    }
    const body = err.response?.data || {};
    const msg = (body.message || err.code || err.message || "request_failed").toString();
    if (/invalid.*otp/i.test(msg)) return { status: "invalid_otp", retryable: false, providerMessage: msg };
    if (/expired/i.test(msg)) return { status: "otp_expired", retryable: false, providerMessage: msg };
    // Default: transient network/error — retryable.
    return { status: "error", retryable: true, providerMessage: msg };
  }
}
