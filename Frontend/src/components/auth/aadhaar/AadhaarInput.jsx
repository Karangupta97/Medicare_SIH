import React, { useMemo, useState } from "react";
import { FaIdCard } from "react-icons/fa";
import { onlyDigits, formatAadhaarGroups, isValidAadhaarNumber } from "../../../utils/aadhaar/verhoeff";

/**
 * Aadhaar number input: grouped-by-4, numeric keyboard, Verhoeff-gated.
 *
 * SECURITY / PRIVACY:
 *  - The RAW value is held only in the parent via onChange; this component keeps
 *    a display string. Once 12 valid digits are present we can privacy-mask the
 *    field (reveal toggle) so the full government ID isn't left on screen.
 *  - Client Verhoeff validation only ENABLES submit; the backend re-validates.
 *
 * A11y: inputmode=numeric brings up the numeric keypad on mobile; aria-describedby
 * ties the field to helper/validity text; the mask toggle has an explicit label.
 */
const AadhaarInput = ({ value, onChange, onValidChange, disabled }) => {
  const [reveal, setReveal] = useState(true);
  const digits = onlyDigits(value);
  const isValid = useMemo(() => isValidAadhaarNumber(digits), [digits]);

  // Notify parent about validity so it can enable/disable submit.
  React.useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  const handleChange = (e) => {
    const next = onlyDigits(e.target.value);
    onChange(next);
  };

  // Display: grouped while revealing; masked (first 8 hidden) when hidden and
  // fully entered.
  const display = reveal
    ? formatAadhaarGroups(digits)
    : digits.length === 12
    ? `XXXX XXXX ${digits.slice(8)}`
    : formatAadhaarGroups(digits);

  const showError = digits.length === 12 && !isValid;

  return (
    <div>
      <label htmlFor="aadhaar" className="block text-[14px] sm:text-[15px] font-medium text-[#2B3674] mb-2">
        Aadhaar number
      </label>
      <div className="relative">
        <FaIdCard className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-lg" />
        <input
          id="aadhaar"
          name="aadhaar"
          inputMode="numeric"
          autoComplete="off"
          // maxLength accounts for the 3 spaces added by group formatting.
          maxLength={14}
          disabled={disabled}
          value={display}
          onChange={handleChange}
          aria-describedby="aadhaar-help aadhaar-validity"
          aria-invalid={showError}
          className="w-full pl-12 sm:pl-14 pr-16 py-4 sm:py-5 text-[16px] sm:text-[17px] tracking-widest rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE] outline-none"
          placeholder="1234 5678 9012"
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#4318FF] hover:text-[#3311DB] transition-colors"
          aria-label={
            reveal
              ? "Hide Aadhaar number to protect it from onlookers"
              : "Show Aadhaar number; digits are hidden for privacy"
          }
        >
          {reveal ? "Hide" : "Show"}
        </button>
      </div>
      <p id="aadhaar-help" className="mt-2 text-[12px] sm:text-[13px] text-[#707EAE]">
        12-digit number. It's masked for your privacy once entered.
      </p>
      <p id="aadhaar-validity" className="mt-1 text-[12px] sm:text-[13px]" aria-live="polite">
        {showError ? (
          <span className="text-red-600">That doesn't look like a valid Aadhaar number.</span>
        ) : (
          ""
        )}
      </p>
    </div>
  );
};

export default AadhaarInput;
