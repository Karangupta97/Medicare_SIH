import { SandboxAadhaarKycProvider } from "./SandboxAadhaarKycProvider.js";

/**
 * KYC provider factory — the single adapter seam.
 *
 * WHY: controllers call getKycProvider() and never name a concrete vendor. To
 * migrate off the UIDAI-deprecated Sandbox OKYC endpoint to a DigiLocker-based
 * flow, add a DigiLockerAadhaarKycProvider (implementing AadhaarKycProvider) and
 * register it below. Flipping AADHAAR_KYC_PROVIDER=digilocker then swaps the
 * implementation app-wide with ZERO changes to controllers, services, or DB
 * code — that's the whole point of routing everything through the interface.
 */

let _instance = null;

export function getKycProvider() {
  if (_instance) return _instance;
  const which = (process.env.AADHAAR_KYC_PROVIDER || "sandbox").toLowerCase();
  switch (which) {
    case "sandbox":
      _instance = new SandboxAadhaarKycProvider();
      break;
    // Future:
    // case "digilocker":
    //   _instance = new DigiLockerAadhaarKycProvider();
    //   break;
    default:
      throw new Error(`Unknown AADHAAR_KYC_PROVIDER: ${which}`);
  }
  return _instance;
}

/** Test hook: allow injecting a fake provider (used by integration tests). */
export function __setKycProviderForTests(provider) {
  _instance = provider;
}
