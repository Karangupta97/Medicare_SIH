import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Smartphone } from "lucide-react";
import { useAadhaarAuthStore, Steps } from "../../store/Patient/aadhaarAuthStore";
import AuthShell from "../../components/auth/aadhaar/AuthShell";
import AadhaarInput from "../../components/auth/aadhaar/AadhaarInput";
import CaptchaWidget from "../../components/auth/aadhaar/CaptchaWidget";
import OtpInput from "../../components/auth/aadhaar/OtpInput";
import PinPad from "../../components/auth/aadhaar/PinPad";
import DeviceTrustPrompt from "../../components/auth/aadhaar/DeviceTrustPrompt";

/**
 * Login flow orchestrator. Mirrors the registration page's transient-secret
 * discipline: the raw Aadhaar is kept in page state (needed across identify →
 * pin/otp so the backend can re-key the OKYC call and device checks), and is
 * cleared once login completes. PIN/OTP are handled + cleared inside children.
 *
 * Step-up: if PIN login returns STEP_UP_REQUIRED (new device/risk), the store
 * moves us to the OTP step carrying the challengeId, and we show a clear reason.
 * After a successful new-device login we surface the DeviceTrustPrompt as a real
 * security moment.
 */
const AadhaarLogin = () => {
  const navigate = useNavigate();
  const {
    step, error, loading, otpExpiresAt, methods, stepUp,
    startLogin, submitLoginAadhaar, chooseMethod, submitLoginPin,
    requestLoginOtp, submitLoginOtp, acknowledgeDevice, resetFlow, clearError,
  } = useAadhaarAuthStore();

  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarValid, setAadhaarValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [underProcess, setUnderProcess] = useState(false);

  useEffect(() => {
    startLogin();
    return () => setAadhaar("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate away once the flow is fully DONE.
  useEffect(() => {
    if (step === Steps.DONE) {
      setAadhaar("");
      navigate("/dashboard");
    }
  }, [step, navigate]);

  const onSubmitAadhaar = async (e) => {
    e.preventDefault();
    await submitLoginAadhaar({ aadhaarNumber: aadhaar });
  };

  const onSubmitPin = useCallback(
    (pin) => submitLoginPin({ aadhaarNumber: aadhaar, pin }),
    [submitLoginPin, aadhaar]
  );

  const onRequestOtp = async () => {
    setUnderProcess(false);
    await requestLoginOtp({ aadhaarNumber: aadhaar, captchaToken });
  };

  const onSubmitOtp = useCallback(
    async (otp) => {
      setUnderProcess(false);
      const res = await submitLoginOtp({ otp });
      if (res.code === "RETRY") setUnderProcess(true);
    },
    [submitLoginOtp]
  );

  const onResendOtp = () => {
    clearError();
    // Re-request an OTP for the same account (we still have the Aadhaar in page
    // state during login, unlike registration resend).
    onRequestOtp();
  };

  return (
    <AuthShell
      side="signin"
      title="Welcome to Medicare"
      subtitle={
        step === Steps.LOGIN_AADHAAR
          ? "Sign in securely with your Aadhaar — no passwords."
          : step === Steps.LOGIN_METHOD
          ? "Choose how you'd like to sign in"
          : undefined
      }
      error={error}
      footer={
        step === Steps.LOGIN_AADHAAR ? (
          <>
            New to Medicare?{" "}
            <Link
              to="/signup"
              className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors duration-300 hover:underline"
            >
              Create an Account
            </Link>
          </>
        ) : null
      }
    >
      {step === Steps.LOGIN_AADHAAR && (
        <form onSubmit={onSubmitAadhaar}>
          <AadhaarInput
            value={aadhaar}
            onChange={setAadhaar}
            onValidChange={setAadhaarValid}
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!aadhaarValid || loading}
            className="mt-6 w-full bg-[#4318FF] text-white py-4 sm:py-5 rounded-[12px] sm:rounded-[16px] hover:bg-[#3311DB] transition-all duration-300 font-semibold text-[16px] sm:text-[17px] shadow-lg shadow-[#4318FF]/20 hover:shadow-xl hover:shadow-[#4318FF]/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Please wait…
              </span>
            ) : (
              "Continue"
            )}
          </motion.button>
        </form>
      )}

      {step === Steps.LOGIN_METHOD && (
        <div className="space-y-3">
          {methods.includes("pin") && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => chooseMethod("pin")}
              className="flex w-full items-center gap-4 rounded-[16px] bg-[#F4F7FE] border-2 border-transparent p-4 sm:p-5 text-left hover:border-[#4318FF] hover:bg-white transition-all duration-300"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4318FF]/10">
                <KeyRound className="h-5 w-5 text-[#4318FF]" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-[#2B3674]">Use PIN</span>
                <span className="block text-[13px] text-[#707EAE]">Fastest way to sign in</span>
              </span>
            </motion.button>
          )}
          {methods.includes("otp") && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                chooseMethod("otp");
                onRequestOtp();
              }}
              className="flex w-full items-center gap-4 rounded-[16px] bg-[#F4F7FE] border-2 border-transparent p-4 sm:p-5 text-left hover:border-[#4318FF] hover:bg-white transition-all duration-300"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4318FF]/10">
                <Smartphone className="h-5 w-5 text-[#4318FF]" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-[#2B3674]">Use Aadhaar OTP</span>
                <span className="block text-[13px] text-[#707EAE]">Sent to your Aadhaar-linked mobile</span>
              </span>
            </motion.button>
          )}
          <CaptchaWidget onToken={setCaptchaToken} />
        </div>
      )}

      {step === Steps.LOGIN_PIN && (
        <>
          <PinPad mode="enter" loading={loading} onSubmit={onSubmitPin} />
          <button
            onClick={() => {
              chooseMethod("otp");
              onRequestOtp();
            }}
            className="mt-5 w-full text-[14px] font-medium text-[#4318FF] hover:text-[#3311DB] transition-colors"
          >
            Use OTP instead
          </button>
        </>
      )}

      {step === Steps.LOGIN_OTP && (
        <>
          {stepUp && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This looks like a new device, so we've sent a one-time code to your
              Aadhaar-linked mobile for extra security.
            </p>
          )}
          <OtpInput
            expiresAt={otpExpiresAt}
            loading={loading}
            onSubmit={onSubmitOtp}
            onResend={onResendOtp}
            statusNote={underProcess ? "Still processing — you can retry in a moment." : null}
          />
        </>
      )}

      {step === Steps.LOGIN_DEVICE_TRUST && (
        <DeviceTrustPrompt
          onAcknowledge={() => {
            acknowledgeDevice();
          }}
          onReviewSessions={() => {
            acknowledgeDevice();
            navigate("/dashboard/settings");
          }}
        />
      )}

      {/* Restart affordance if a step is reached without valid backing state. */}
      {step === Steps.LOGIN_OTP && !loading && (
        <button onClick={() => resetFlow("login")} className="mt-4 w-full text-xs text-gray-400">
          Start again
        </button>
      )}
    </AuthShell>
  );
};

export default AadhaarLogin;
