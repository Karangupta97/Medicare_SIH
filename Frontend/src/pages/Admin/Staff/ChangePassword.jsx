import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffStore } from "../../../store/staffStore";
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/Logo/textlogo.png";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  
  const { 
    changePassword, 
    isLoading, 
    error, 
    clearError, 
    isAuthenticated, 
    isFirstLogin,
    staffData 
  } = useStaffStore();

  // Password validation criteria
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    isMatching: false
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/staff/login");
    }
    
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  // Check password strength
  useEffect(() => {
    const criteria = {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
      isMatching: newPassword === confirmPassword && newPassword !== ""
    };
    
    setPasswordCriteria(criteria);
    
    // Calculate strength
    const metCriteriaCount = Object.values(criteria).filter(Boolean).length;
    setPasswordStrength(Math.floor((metCriteriaCount / 6) * 100));
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordStrength < 50) {
      toast.error("Please choose a stronger password");
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      
      // Redirect to dashboard
      navigate("/staff/dashboard");
    } catch (error) {
      // Error is already handled in the store
      console.error("Password change error:", error);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={logo} alt="Medicare Logo" className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isFirstLogin ? "Change Your Temporary Password" : "Update Your Password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isFirstLogin 
            ? "For security reasons, you need to change your temporary password before proceeding" 
            : "Create a strong, unique password to protect your account"
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="current-password"
                  name="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={isFirstLogin ? "Enter temporary password" : "Enter current password"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      passwordStrength < 30 
                        ? 'bg-red-500' 
                        : passwordStrength < 70 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password strength: {
                    passwordStrength < 30 
                      ? 'Weak' 
                      : passwordStrength < 70 
                        ? 'Medium' 
                        : 'Strong'
                  }
                </p>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-md bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Password requirements:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className={`flex items-center text-sm ${passwordCriteria.minLength ? 'text-green-700' : 'text-gray-500'}`}>
                  {passwordCriteria.minLength ? (
                    <FaCheck className="mr-2 text-green-500" />
                  ) : (
                    <FaTimes className="mr-2 text-gray-400" />
                  )}
                  At least 8 characters
                </div>
                <div className={`flex items-center text-sm ${passwordCriteria.hasUppercase ? 'text-green-700' : 'text-gray-500'}`}>
                  {passwordCriteria.hasUppercase ? (
                    <FaCheck className="mr-2 text-green-500" />
                  ) : (
                    <FaTimes className="mr-2 text-gray-400" />
                  )}
                  Uppercase letter
                </div>
                <div className={`flex items-center text-sm ${passwordCriteria.hasLowercase ? 'text-green-700' : 'text-gray-500'}`}>
                  {passwordCriteria.hasLowercase ? (
                    <FaCheck className="mr-2 text-green-500" />
                  ) : (
                    <FaTimes className="mr-2 text-gray-400" />
                  )}
                  Lowercase letter
                </div>
                <div className={`flex items-center text-sm ${passwordCriteria.hasNumber ? 'text-green-700' : 'text-gray-500'}`}>
                  {passwordCriteria.hasNumber ? (
                    <FaCheck className="mr-2 text-green-500" />
                  ) : (
                    <FaTimes className="mr-2 text-gray-400" />
                  )}
                  Number
                </div>
                <div className={`flex items-center text-sm ${passwordCriteria.hasSpecial ? 'text-green-700' : 'text-gray-500'}`}>
                  {passwordCriteria.hasSpecial ? (
                    <FaCheck className="mr-2 text-green-500" />
                  ) : (
                    <FaTimes className="mr-2 text-gray-400" />
                  )}
                  Special character
                </div>
                <div className={`flex items-center text-sm ${passwordCriteria.isMatching ? 'text-green-700' : 'text-gray-500'}`}>
                  {passwordCriteria.isMatching ? (
                    <FaCheck className="mr-2 text-green-500" />
                  ) : (
                    <FaTimes className="mr-2 text-gray-400" />
                  )}
                  Passwords match
                </div>
              </div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-50 text-red-800 p-3 rounded-lg text-sm flex items-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || passwordStrength < 50 || !passwordCriteria.isMatching}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            <span className="font-medium">{staffData?.name}</span> • {staffData?.staffId}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChangePassword; 