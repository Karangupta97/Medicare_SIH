import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/Patient/authStore";
import { toast } from "react-hot-toast";
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const { forgotPassword } = useAuthStore();

  // Validate email format
  useEffect(() => {
    if (!email) {
      setIsValidEmail(true);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await forgotPassword(email);
      toast.success("Password reset link sent successfully!");
      setEmail("");
      setSuccess("Password reset link sent successfully! Please check your email inbox.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send reset link");
      setError(error.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to login
          </Link>
          
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg mb-6"
            >
              <div className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={18} />
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-300">Success!</h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">{success}</p>
                  <button 
                    onClick={() => setSuccess(null)} 
                    className="mt-3 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                  >
                    Send another reset link
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      email && !isValidEmail 
                        ? "border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500" 
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                    } focus:border-transparent dark:bg-gray-700 dark:text-white`}
                    placeholder="Enter your email"
                    required
                  />
                  <Mail 
                    size={18} 
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      email && !isValidEmail 
                        ? "text-red-500" 
                        : "text-gray-500 dark:text-gray-400"
                    }`} 
                  />
                </div>
                {email && !isValidEmail && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (email && !isValidEmail)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Instructions...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start">
                  <AlertCircle className="text-red-500 mr-3 mt-0.5 shrink-0" size={18} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          )}

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
      </div>
    </div>
  );
};

export default ForgotPassword;
