import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiCheck, FiX, FiLock, FiArrowLeft, FiAlertCircle } from "react-icons/fi";

const ResetPassword = () => {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword, error, isSubmitting, message } = useAuthStore();

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: "" });
      return;
    }

    // Simple password strength calculation
    let score = 0;
    let feedback = "";

    if (password.length >= 8) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[a-z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^A-Za-z0-9]/)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = "Very weak";
        break;
      case 2:
        feedback = "Weak";
        break;
      case 3:
        feedback = "Moderate";
        break;
      case 4:
        feedback = "Strong";
        break;
      case 5:
        feedback = "Very strong";
        break;
      default:
        feedback = "";
    }

    setPasswordStrength({ score, feedback });
  }, [password]);

  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("Please choose a stronger password");
      return;
    }

    try {
      await resetPassword(token, password);

      setIsSuccess(true);
      toast.success("Password reset successfully. Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <Link 
          to="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4 transition-colors group"
        >
          <FiArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-6 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <FiCheck size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Password Reset Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been updated successfully. You'll be redirected to the login page shortly.
                </p>
                <Link
                  to="/login"
                  className="inline-block py-2.5 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  Go to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <FiLock size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Reset Your Password
            </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Create a strong, secure password for your account.
            </p>
          </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
                    <div className="relative group">
              <input
                        id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 transition-all"
                placeholder="Enter new password"
                        autoComplete="new-password"
                required
              />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <FiLock size={16} />
                      </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
              >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

                    <AnimatePresence>
                      {password && (
                        <motion.div 
                          className="mt-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Password strength:
                            </span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score <= 2 ? "text-red-500" : 
                              passwordStrength.score === 3 ? "text-yellow-500" : 
                              "text-green-500"
                            }`}>
                              {passwordStrength.feedback}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full ${getStrengthColor()}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            ></motion.div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                            <div className="flex items-center">
                              {password.length >= 8 ? 
                                <FiCheck className="text-green-500 mr-1.5 shrink-0" /> : 
                                <FiX className="text-red-500 mr-1.5 shrink-0" />}
                              <span className="text-gray-600 dark:text-gray-400">At least 8 characters</span>
                            </div>
                            <div className="flex items-center">
                              {password.match(/[A-Z]/) ? 
                                <FiCheck className="text-green-500 mr-1.5 shrink-0" /> : 
                                <FiX className="text-red-500 mr-1.5 shrink-0" />}
                              <span className="text-gray-600 dark:text-gray-400">Uppercase letter</span>
                            </div>
                            <div className="flex items-center">
                              {password.match(/[a-z]/) ? 
                                <FiCheck className="text-green-500 mr-1.5 shrink-0" /> : 
                                <FiX className="text-red-500 mr-1.5 shrink-0" />}
                              <span className="text-gray-600 dark:text-gray-400">Lowercase letter</span>
                            </div>
                            <div className="flex items-center">
                              {password.match(/[0-9]/) ? 
                                <FiCheck className="text-green-500 mr-1.5 shrink-0" /> : 
                                <FiX className="text-red-500 mr-1.5 shrink-0" />}
                              <span className="text-gray-600 dark:text-gray-400">Number</span>
                            </div>
                            <div className="flex items-center">
                              {password.match(/[^A-Za-z0-9]/) ? 
                                <FiCheck className="text-green-500 mr-1.5 shrink-0" /> : 
                                <FiX className="text-red-500 mr-1.5 shrink-0" />}
                              <span className="text-gray-600 dark:text-gray-400">Special character</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
                    <div className="relative group">
              <input
                        id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                          confirmPassword && password !== confirmPassword 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-gray-300 dark:border-gray-600"
                        } focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 transition-all`}
                placeholder="Confirm new password"
                        autoComplete="new-password"
                required
              />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <FiLock size={16} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {confirmPassword && (
                        <motion.div 
                          className="mt-2 flex items-center"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {password === confirmPassword ? (
                            <>
                              <FiCheck className="text-green-500 mr-1.5" />
                              <span className="text-xs text-green-500">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <FiX className="text-red-500 mr-1.5" />
                              <span className="text-xs text-red-500">Passwords don't match</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
            </div>

            <button
              type="submit"
                    disabled={isSubmitting || password !== confirmPassword || passwordStrength.score < 3 || !password}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 relative overflow-hidden group"
            >
                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></span>
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
            </button>

                  <AnimatePresence>
            {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start"
                      >
                        <FiAlertCircle className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
            )}
                  </AnimatePresence>

                  <AnimatePresence>
            {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-start"
                      >
                        <FiCheck className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>{message}</span>
                      </motion.div>
            )}
                  </AnimatePresence>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                to="/login"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
