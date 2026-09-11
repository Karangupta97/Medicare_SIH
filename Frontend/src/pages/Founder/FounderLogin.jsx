import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiKey, 
  FiLock, 
  FiMail, 
  FiShield, 
  FiAlertCircle, 
  FiArrowLeft,
  FiUser
} from "react-icons/fi";
import Logo from "../../assets/Logo/textlogo.png";
import { useFounderStore } from "../../store/founderStore";

const FounderLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();
  
  // Use founder store hooks
  const { 
    initiateLogin, 
    verifyOtp, 
    resendOtp,
    isLoading,
    error,
    tempToken
  } = useFounderStore();

  useEffect(() => {
    // If there's an error, trigger shake animation
    if (error) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  }, [error]);

  // Auto focus when switching steps
  useEffect(() => {
    const activeInput = document.querySelector(step === 1 ? '#email' : '#otp');
    if (activeInput) {
      setTimeout(() => activeInput.focus(), 300);
    }
  }, [step]);

  // Escape key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && step === 2) {
        setStep(1);
        setOtp("");
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [step]);

  // Handle first login step (email/password)
  const handleFirstStep = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      const response = await initiateLogin(email, password);
      
      if (response.success) {
        toast.success("OTP sent to your email");
        setStep(2); // Move to OTP verification step
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(error || "Login failed. Please try again.");
    }
  };

  // Handle OTP verification step
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    try {
      const response = await verifyOtp(otp);
      
      if (response.success) {
        toast.success("Login successful");
        // Use a fade-out animation before navigating
        setTimeout(() => {
          navigate("/founder/dashboard");
        }, 800);
      } else {
        toast.error(response.message || "Verification failed");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error(error || "Verification failed. Please try again.");
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      const response = await resendOtp();
      if (response.success) {
        toast.success("New OTP sent to your email");
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(error || "Failed to resend OTP. Please try again.");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle OTP input changes with auto-formatting
  const handleOtpChange = (e) => {
    const input = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(input) && input.length <= 6) {
      setOtp(input);
      
      // Auto submit when 6 digits are entered
      if (input.length === 6 && formRef.current) {
        setTimeout(() => formRef.current.requestSubmit(), 300);
      }
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, -3, 3, 0],
      transition: { duration: 0.5 }
    }
  };

  // Render the first step (email/password form)
  const renderLoginForm = () => (
    <motion.form 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      onSubmit={handleFirstStep} 
      className="space-y-6"
    >
      <div className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base dark:bg-gray-800/50 dark:border-gray-700 dark:text-white transition-all duration-200"
            placeholder="founder@medicare.com"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="appearance-none block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base dark:bg-gray-800/50 dark:border-gray-700 dark:text-white transition-all duration-200"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            {passwordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </>
          ) : (
            "Proceed to Verification"
          )}
        </button>
      </div>

      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <FiShield className="text-blue-600 dark:text-blue-400" />
          <span>Secured by Medicare</span>
        </div>
      </div>
    </motion.form>
  );

  // Render the OTP verification form
  const renderOtpForm = () => (
    <motion.form 
      ref={formRef}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      onSubmit={handleOtpVerification} 
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <FiKey className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Enter the verification code sent to your email
        </p>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          6-Digit Security Code
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiKey className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            required
            className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg tracking-wide text-center font-bold dark:bg-gray-800/50 dark:border-gray-700 dark:text-white transition-all duration-200 letter-spacing-2"
            placeholder="• • • • • •"
            autoComplete="one-time-code"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center dark:text-gray-400">
          The code will expire in 10 minutes
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : (
            "Verify & Access Dashboard"
          )}
        </button>
      </div>
      
      <div className="flex justify-between items-center text-sm pt-2">
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setOtp("");
          }}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <FiArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </button>
        
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Resend code
        </button>
      </div>
      
      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <FiShield className="text-blue-600 dark:text-blue-400" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </motion.form>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background abstract elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-600/10 blur-3xl"></div>
        <div className="absolute top-[30%] left-[60%] w-[25%] h-[25%] rounded-full bg-blue-400/10 blur-3xl"></div>
      </div>
      
      {/* Toast container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Main content container */}
      <div className="max-w-md w-full z-10">
        {/* Login card */}
        <motion.div 
          animate={shakeError ? "shake" : "idle"}
          variants={shakeVariants}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* Card header */}
          <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200 dark:from-gray-800 dark:to-gray-800/80 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <FiUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {step === 1 ? "Founder Authentication" : "Verify Identity"}
                </h2>
              </div>
              <div className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                <FiLock className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
          
          {/* Card body */}
          <div className="p-6">
            {/* Security warning */}
            <div className="mb-6 py-3 px-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
              <div className="flex items-start">
                <FiAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <p className="ml-3 text-xs text-yellow-700 dark:text-yellow-500">
                  This secure area is restricted to Medicare founding members only. All access attempts are logged.
                </p>
              </div>
            </div>
            
            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 py-3 px-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Login forms */}
            <AnimatePresence mode="wait">
              {step === 1 ? renderLoginForm() : renderOtpForm()}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-200">
            Medicare &copy; {new Date().getFullYear()} • Founder Authentication System
          </p>
        </div>
      </div>
    </div>
  );
};

export default FounderLogin; 