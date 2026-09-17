import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCountdown } from "../../../hooks/useCountdown";

/**
 * 6-digit OTP entry, reused by both registration and login.
 *
 * FEATURES / SECURITY:
 *  - Six individual boxes with auto-advance and backspace-to-previous.
 *  - Paste support: pasting a 6-digit code fills all boxes. Autofilled/pasted
 *    values go through the SAME validation as manual entry (we only submit when
 *    exactly 6 digits are present) — never trusted differently.
 *  - SMS autofill: on supported browsers, the WebOTP API (navigator.credentials
 *    .get with an "otp" transport) can read an incoming SMS code. We wire it
 *    defensively and ignore failures (unsupported/denied) silently.
 *  - The OTP value lives in local state only and is CLEARED immediately after
 *    submit (see clearOnSubmit) so it isn't left in devtools-visible state or
 *    re-submitted. It is never logged or sent to analytics.
 *  - Countdown is synced to the backend-provided absolute expiry; "resend" is
 *    disabled until it reaches 0. aria-live announces the countdown + states.
 */
const OtpInput = ({
  expiresAt,
  attemptsLeft,
  loading,
  onSubmit,
  onResend,
  resendDisabled,
  statusNote, // optional extra note e.g. "still processing…"
}) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const { secondsLeft, expired } = useCountdown(expiresAt);

  const value = digits.join("");
  const complete = /^\d{6}$/.test(value);

  // WebOTP SMS autofill (best-effort; harmless if unsupported).
  useEffect(() => {
    if (!("OTPCredential" in window) || !navigator.credentials?.get) return undefined;
    const ac = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((cred) => {
        const code = cred?.code?.replace(/\D/g, "").slice(0, 6);
        if (code && code.length === 6) setDigits(code.split(""));
      })
      .catch(() => {
        /* unsupported / denied / timed out — ignore */
      });
    return () => ac.abort();
  }, []);

  const setDigit = (idx, val) => {
    const d = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = d;
      return next;
    });
    if (d && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      e.preventDefault();
      const arr = pasted.split("");
      setDigits(["", "", "", "", "", ""].map((_, i) => arr[i] || ""));
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const clear = () => setDigits(["", "", "", "", "", ""]);

  const submit = (e) => {
    e?.preventDefault();
    if (!complete || loading) return;
    const otp = value;
    // Clear from component state IMMEDIATELY so it isn't retained after submit.
    clear();
    onSubmit(otp);
  };

  return (
    <form onSubmit={submit}>
      <fieldset>
        <legend className="sr-only">Enter the 6-digit one-time password sent to your Aadhaar-linked mobile</legend>
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={d}
              disabled={loading}
              aria-label={`OTP digit ${i + 1} of 6`}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent text-center text-xl font-semibold text-[#2B3674] focus:border-[#4318FF] focus:bg-white transition-all duration-300 outline-none"
            />
          ))}
        </div>
      </fieldset>

      {/* Countdown + attempts, announced to screen readers. */}
      <div aria-live="polite" className="mt-4 text-center text-[14px] text-[#707EAE]">
        {expired ? (
          <span>Your code has expired.</span>
        ) : (
          <span>
            Code expires in {Math.floor(secondsLeft / 60)}:
            {String(secondsLeft % 60).padStart(2, "0")}
          </span>
        )}
        {typeof attemptsLeft === "number" && (
          <span className="ml-2 text-[#707EAE]/70">· {attemptsLeft} attempt(s) left</span>
        )}
      </div>

      {statusNote && (
        <p className="mt-2 text-center text-[13px] text-amber-600" aria-live="polite">
          {statusNote}
        </p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!complete || loading}
        className="mt-6 w-full bg-[#4318FF] text-white py-4 sm:py-5 rounded-[12px] sm:rounded-[16px] hover:bg-[#3311DB] transition-all duration-300 font-semibold text-[16px] sm:text-[17px] shadow-lg shadow-[#4318FF]/20 hover:shadow-xl hover:shadow-[#4318FF]/30 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying…
          </span>
        ) : (
          "Verify OTP"
        )}
      </motion.button>

      <button
        type="button"
        onClick={onResend}
        disabled={resendDisabled || !expired || loading}
        className="mt-3 w-full text-[14px] font-medium text-[#4318FF] hover:text-[#3311DB] transition-colors disabled:text-[#707EAE]/50"
      >
        {expired ? "Resend OTP" : "Resend available once the code expires"}
      </button>
    </form>
  );
};

export default OtpInput;
