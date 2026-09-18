import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAadhaarAuthStore, Steps } from "../../store/Patient/aadhaarAuthStore";
import AuthShell from "../../components/auth/aadhaar/AuthShell";
import AadhaarInput from "../../components/auth/aadhaar/AadhaarInput";
import ConsentCheckbox from "../../components/auth/aadhaar/ConsentCheckbox";
import CaptchaWidget from "../../components/auth/aadhaar/CaptchaWidget";
import OtpInput from "../../components/auth/aadhaar/OtpInput";
import PinPad from "../../components/auth/aadhaar/PinPad";

/**
 * Registration flow orchestrator. Renders the current step from the auth-flow
 * store. The RAW Aadhaar number is held here in transient component state only
 * (not the store) and cleared after Step A submission — so it never lingers in
 * global state. PIN/OTP are handled inside their child components and cleared on
 * submit.
 *
 * Back/refresh safety: the store guards OTP/PIN steps on a valid sessionId; if
 * it's missing (e.g. hard refresh cleared the in-memory session), the store
 * bounces back to Aadhaar entry with a "session expired" message rather than
 * showing an orphaned PIN screen.
 */
const AadhaarRegister = () => {
  const navigate = useNavigate();
  const {
    step, error, loading, otpExpiresAt, attemptsLeft, sessionId,
    startRegistration, submitRegistrationAadhaar, submitRegistrationOtp,
    submitRegistrationPin, resetFlow, clearError,
  } = useAadhaarAuthStore();

  // Transient, page-local secrets.
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarValid, setAadhaarValid] = useState(false);
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [underProcess, setUnderProcess] = useState(false);
  // SEPARATE, OPTIONAL consent (default OFF): reuse the Aadhaar photo as the
  // app profile picture. Distinct from the KYC consent captured on Step A.
  const [usePhotoAsProfile, setUsePhotoAsProfile] = useState(false);

  // Enter the register flow on mount; clean up transient secrets on unmount.
  useEffect(() => {
    startRegistration();
    return () => {
      setAadhaar("");
      setConsent(false);
      setCaptchaToken(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitAadhaar = async (e) => {
    e.preventDefault();
    const res = await submitRegistrationAadhaar({ aadhaarNumber: aadhaar, consent, captchaToken });
    // Once submitted, drop the raw Aadhaar from memory — the flow continues on
    // the server-side sessionId alone.
    if (res.ok) setAadhaar("");
  };

  const onSubmitOtp = useCallback(
    async (otp) => {
      setUnderProcess(false);
      const res = await submitRegistrationOtp({ otp });
      if (res.code === "RETRY") setUnderProcess(true);
    },
    [submitRegistrationOtp]
  );

  const onResendOtp = async () => {
    // Resend restarts from Step A (a fresh OKYC generate). We don't keep the raw
    // Aadhaar, so we send the user back to the entry screen to re-enter it —
    // documented tradeoff of never persisting the number client-side.
    clearError();
    resetFlow("register");
  };

  const canSubmitAadhaar = aadhaarValid && consent && !!captchaToken && !loading;

  return (
    <AuthShell
      side="signup"
      title="Create your Medicare account"
      subtitle={
        step === Steps.REG_AADHAAR
          ? "Verify your identity with Aadhaar to get started"
          : step === Steps.REG_OTP
          ? "Enter the OTP sent to your Aadhaar-linked mobile"
          : step === Steps.REG_PIN
          ? "Set a PIN you'll use to sign in"
          : undefined
      }
      error={error}
      footer={
        step === Steps.REG_AADHAAR ? (
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors duration-300 hover:underline"
            >
              Log in
            </Link>
          </>
        ) : null
      }
    >
      {step === Steps.REG_AADHAAR && (
        <form onSubmit={onSubmitAadhaar}>
          <AadhaarInput
            value={aadhaar}
            onChange={setAadhaar}
            onValidChange={setAadhaarValid}
            disabled={loading}
          />
          <ConsentCheckbox checked={consent} onChange={setConsent} disabled={loading} />
          <CaptchaWidget onToken={setCaptchaToken} disabled={!captchaToken} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!canSubmitAadhaar}
            className="mt-6 w-full bg-[#4318FF] text-white py-4 sm:py-5 rounded-[12px] sm:rounded-[16px] hover:bg-[#3311DB] transition-all duration-300 font-semibold text-[16px] sm:text-[17px] shadow-lg shadow-[#4318FF]/20 hover:shadow-xl hover:shadow-[#4318FF]/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending OTP…
              </span>
            ) : (
              "Continue"
            )}
          </motion.button>
        </form>
      )}

      {step === Steps.REG_OTP && (
        <OtpInput
          expiresAt={otpExpiresAt}
          attemptsLeft={attemptsLeft}
          loading={loading}
          onSubmit={onSubmitOtp}
          onResend={onResendOtp}
          statusNote={underProcess ? "Still processing — you can retry in a moment." : null}
        />
      )}

      {step === Steps.REG_PIN && (
        <>
          <PinPad
            mode="set"
            loading={loading}
            onSubmit={(pin) => submitRegistrationPin({ pin, usePhotoAsProfile })}
            subtitle="6 digits. Avoid sequences (123456) or repeats (111111)."
          />

          {/* Separate, explicit, default-OFF consent to reuse the Aadhaar photo
              as the profile picture. Kept distinct from the KYC consent. */}
          <div className="mt-5 flex items-start gap-3 rounded-[12px] border border-[#E0E5F2] bg-[#F4F7FE] p-3.5">
            <input
              id="use-aadhaar-photo"
              type="checkbox"
              checked={usePhotoAsProfile}
              disabled={loading}
              onChange={(e) => setUsePhotoAsProfile(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#707EAE]/40 text-[#4318FF] focus:ring-[#4318FF]"
            />
            <label
              htmlFor="use-aadhaar-photo"
              className="text-[12px] sm:text-[13px] leading-relaxed text-[#707EAE]"
            >
              Use your Aadhaar photo as your profile picture? You can change or
              remove it anytime in your profile settings. Leave this off to start
              with a default avatar.
            </label>
          </div>
        </>
      )}

      {step === Steps.REG_SUCCESS && (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="text-[22px] font-bold text-[#2B3674]">You're all set</h2>
          <p className="mt-2 text-[15px] text-[#707EAE]">
            Your account is created and you're signed in.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="mt-6 w-full bg-[#4318FF] text-white py-4 sm:py-5 rounded-[12px] sm:rounded-[16px] hover:bg-[#3311DB] transition-all duration-300 font-semibold text-[16px] sm:text-[17px] shadow-lg shadow-[#4318FF]/20"
          >
            Go to dashboard
          </motion.button>
        </div>
      )}

      {/* Guard: if we somehow reach OTP/PIN with no session, offer a restart. */}
      {(step === Steps.REG_OTP || step === Steps.REG_PIN) && !sessionId && !loading && (
        <button
          onClick={() => resetFlow("register")}
          className="mt-4 w-full text-[14px] font-medium text-[#4318FF] hover:text-[#3311DB] transition-colors"
        >
          Start again
        </button>
      )}
    </AuthShell>
  );
};

export default AadhaarRegister;
