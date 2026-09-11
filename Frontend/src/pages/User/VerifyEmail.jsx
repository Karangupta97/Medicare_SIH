import React, { useState, useRef, useEffect } from "react";
import myVideo from "../../assets/Email.mp4";
import { useAuthStore } from "../../store/Patient/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const VerifyEmail = () => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { error, isLoading, verifyEmail, resendOtp } = useAuthStore();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;
    
    setOtp(new Array(6).fill(""));
    setTimer(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    
    try {
      await resendOtp();
      toast.success("OTP resent successfully!");
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.");
      console.error("resend OTP error:", err);
    }
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (e.key === "Delete") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      pastedData.split("").forEach((digit, idx) => {
        inputRefs.current[idx].value = digit;
      });
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    
    const verificationCode = otp.join("");
    if (verificationCode.length !== 6) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(verificationCode);
      toast.success("Email verified successfully!");
      navigate("/");
    } catch (error) {
      console.error("Verification error:", error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto submit when all fields filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [otp]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-b from-[#B8C5FD] to-[#E8C3D5] px-4 py-8">
      {/* Background Blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5 }}
        className="absolute w-[95%] md:w-[1700px] h-[80%] md:h-[900px] bg-[#f0f7ff] rounded-[50px] blur-[3px] backdrop-blur-[80px]" 
      />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col md:flex-row items-center w-full max-w-6xl bg-transparent md:space-x-10 space-y-10 md:space-y-0"
      >
        {/* Video */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 flex justify-center"
        >
          <video
            className="w-full max-w-md rounded-[40px] opacity-80 shadow-2xl"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={myVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        {/* Verification Box */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 bg-white/0.6 p-8 rounded-[30px] shadow-lg flex flex-col items-center backdrop-blur-sm"
        >
          <h2 className="text-2xl md:text-3xl text-[#252A61] font-bold mb-4 text-center">
            Verify Your Email
          </h2>
          <p className="text-center text-[#252A61] mb-6 text-sm md:text-base">
            Enter the 6-digit code sent to your email address
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6 w-full">
            <motion.div 
              animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="flex space-x-2 md:space-x-3"
              onPaste={handlePaste}
            >
              {otp.map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  className="w-10 h-10 md:w-14 md:h-14 text-center text-xl border-2 border-gray-400 rounded-full focus:border-[#252A61] focus:outline-none text-[#252A61] transition-all duration-200"
                  value={otp[index]}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </motion.div>

            <div className="mt-2">
              {canResend ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="text-[#252A61] hover:text-[#1c204f] transition-colors duration-200 font-medium"
                  onClick={handleResend}
                  disabled={isSubmitting}
                >
                  Resend Code
                </motion.button>
              ) : (
                <p className="text-gray-600">
                  Resend Code in {timer}s
                </p>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#252A61] w-full py-3 rounded-full text-white font-semibold hover:bg-[#1c204f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
