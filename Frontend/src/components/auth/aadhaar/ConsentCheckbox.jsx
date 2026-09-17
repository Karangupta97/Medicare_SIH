import React from "react";

/**
 * Explicit consent checkbox for Aadhaar OKYC. MUST default to unchecked — the
 * backend requires an explicit `true` and logs it as the consent record. A
 * pre-checked box would be non-compliant (implied consent), so we never
 * pre-check it.
 */
const ConsentCheckbox = ({ checked, onChange, disabled }) => (
  <div className="mt-2 flex items-start gap-2.5">
    <input
      id="aadhaar-consent"
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-[#707EAE]/40 text-[#4318FF] focus:ring-[#4318FF]"
    />
    <label htmlFor="aadhaar-consent" className="text-[12px] sm:text-[13px] leading-relaxed text-[#707EAE]">
      I consent to verify my identity using Aadhaar Offline e-KYC. Medicare will
      receive my name, date of birth, address, and photo from UIDAI for this
      verification.{" "}
      <a
        href="/legal/aadhaar-consent"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#4318FF] underline"
      >
        What this covers
      </a>
      .
    </label>
  </div>
);

export default ConsentCheckbox;
