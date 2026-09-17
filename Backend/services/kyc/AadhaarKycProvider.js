/**
 * AadhaarKycProvider — abstract interface (adapter seam).
 *
 * WHY: The Sandbox OKYC endpoint is UIDAI-DEPRECATED (still operational). To
 * avoid coupling the whole app to a soon-to-change provider, ALL Aadhaar KYC
 * access goes through this interface. Swapping to a DigiLocker-based provider
 * later means writing a new subclass and flipping AADHAAR_KYC_PROVIDER — no
 * controller or DB change. Controllers depend on this shape, never on axios or
 * a specific vendor's response format.
 *
 * NORMALIZED CONTRACT (every provider returns these shapes):
 *
 *   generateOtp(aadhaarNumber, { consent, reason }) -> {
 *     status: 'otp_sent' | 'source_unavailable' | 'invalid_aadhaar' | 'error',
 *     referenceId?: string,
 *     retryable: boolean,
 *     providerMessage?: string,   // for audit only, never shown raw to client
 *   }
 *
 *   verifyOtp(referenceId, otp) -> {
 *     status: 'valid' | 'invalid_otp' | 'otp_expired' | 'under_process'
 *           | 'source_unavailable' | 'error',
 *     retryable: boolean,
 *     retryAfterMs?: number,      // for 'under_process'
 *     kyc?: {                     // ONLY on 'valid'
 *       name, dob, gender, address, careOf, photoBase64, mobileHash?, email?, mobile?
 *     },
 *     providerMessage?: string,
 *   }
 *
 * IMPORTANT: implementations MUST NOT log the raw Aadhaar number or the raw KYC
 * payload (name/photo/address). Only normalized status + non-PII references.
 */
export class AadhaarKycProvider {
  /**
   * @param {string} aadhaarNumber raw 12-digit Aadhaar (in-memory only)
   * @param {{ consent: 'Y'|'N', reason: string }} opts
   * @returns {Promise<object>}
   */
  // eslint-disable-next-line no-unused-vars
  async generateOtp(aadhaarNumber, opts) {
    throw new Error("generateOtp() not implemented");
  }

  /**
   * @param {string} referenceId
   * @param {string} otp 6-digit
   * @returns {Promise<object>}
   */
  // eslint-disable-next-line no-unused-vars
  async verifyOtp(referenceId, otp) {
    throw new Error("verifyOtp() not implemented");
  }

  /** Stable provider name for audit provenance. */
  get name() {
    return "abstract";
  }
}
