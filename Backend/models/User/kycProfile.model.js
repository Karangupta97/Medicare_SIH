import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

/**
 * KYC profile — 1:1 with AadhaarUser, holds all PII returned by the OKYC call.
 *
 * SECURITY CONTROLS:
 *  - Every PII field is stored as an AES-256-GCM envelope (encryptField), NOT
 *    plaintext. The encryption key lives in the KMS/secrets manager, so a DB
 *    compromise alone yields only ciphertext (defense in depth over disk
 *    encryption). See utils/aadhaar/fieldEncryption.util.js.
 *  - We NEVER store the Aadhaar number and NEVER store the OKYC share_code.
 *  - Contact fields are stored as keyed hashes (mobile_hash, email_hash) so we
 *    can match/dedupe without holding raw contact PII. If we need to actually
 *    SEND to the mobile (e.g. freeze alert), we keep an encrypted copy too.
 *  - Separated from the account row so PII access can be audited independently
 *    and the hot auth path (account lookup by identity hash) never loads PII.
 */
const kycProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // enforce 1:1
      index: true,
    },

    // --- Encrypted PII (AES-256-GCM envelopes) ---
    encrypted_name: { type: String, default: null },
    encrypted_dob: { type: String, default: null },
    encrypted_gender: { type: String, default: null },
    encrypted_address: { type: String, default: null },
    encrypted_photo: { type: String, default: null }, // base64 photo, encrypted
    care_of: { type: String, default: null }, // encrypted "C/O" field

    // Encrypted copy of the contact channel we may need to message (freeze
    // alerts). Optional — only if OKYC returned it.
    encrypted_mobile: { type: String, default: null },

    // --- Searchable, non-reversible contact hashes ---
    mobile_hash: { type: String, default: null, index: true },
    email_hash: { type: String, default: null, index: true },

    // Provenance for audit: which KYC provider + a non-PII reference id.
    kyc_provider: { type: String, default: "sandbox" },
    kyc_verified_at: { type: Date, default: null },
  },
  { timestamps: true }
);

export const KycProfile = () => getPatientDB().model("KycProfile", kycProfileSchema);
