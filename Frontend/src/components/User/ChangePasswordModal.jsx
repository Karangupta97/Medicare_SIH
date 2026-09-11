import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Lock, Shield, CheckCircle2, AlertTriangle, Key, Zap } from "lucide-react";
import useAuthStore from "@/store/Patient/authStore";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { changePassword, isLoading, error: apiError } = useAuthStore();

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setSuccess(false);
      setIsSubmitting(false);
      setFocusedField(null);
    }
  }, [isOpen]);

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "Enter password", color: "bg-gray-300", textColor: "text-gray-500" };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    const strengthMap = {
      0: { label: "Very Weak", color: "bg-red-500", textColor: "text-red-600" },
      1: { label: "Weak", color: "bg-red-400", textColor: "text-red-600" },
      2: { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-600" },
      3: { label: "Good", color: "bg-blue-500", textColor: "text-blue-600" },
      4: { label: "Strong", color: "bg-green-500", textColor: "text-green-600" },
      5: { label: "Excellent", color: "bg-emerald-500", textColor: "text-emerald-600" }
    };

    return { strength, checks, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // Form validation
  const validateCurrentPassword = () => {
    if (!formData.currentPassword) {
      setErrors(prev => ({ ...prev, currentPassword: "Current password is required" }));
      return false;
    }
    setErrors(prev => ({ ...prev, currentPassword: "" }));
    return true;
  };

  const validateNewPassword = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNext = () => {
    if (step === 1 && validateCurrentPassword()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNewPassword()) return;

    setIsSubmitting(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      setStep(3);
      
      // Auto-close modal after success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Change password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Security Update</h2>
                <p className="text-indigo-100 text-sm">Change your account password</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mt-6 space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step >= stepNum ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Current Password */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                      <Key className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Verify Current Password</h3>
                    <p className="text-sm text-gray-600 mt-2">Please enter your current password to continue</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('current')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                            errors.currentPassword 
                              ? "border-red-300 focus:border-red-500" 
                              : focusedField === 'current'
                              ? "border-indigo-500 ring-4 ring-indigo-100"
                              : "border-gray-200 focus:border-indigo-500"
                          }`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                          <p className="text-sm text-red-700">{apiError}</p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={!formData.currentPassword || isLoading}
                      className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      Continue
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: New Password */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                      <Lock className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Create New Password</h3>
                    <p className="text-sm text-gray-600 mt-2">Choose a strong password to protect your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('new')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                            errors.newPassword 
                              ? "border-red-300 focus:border-red-500" 
                              : focusedField === 'new'
                              ? "border-indigo-500 ring-4 ring-indigo-100"
                              : "border-gray-200 focus:border-indigo-500"
                          }`}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength */}
                      {formData.newPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                            <span className={`text-xs font-semibold ${passwordStrength.textColor}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              className={`h-2 rounded-full ${passwordStrength.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          
                          {/* Password Requirements */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {Object.entries(passwordStrength.checks || {}).map(([key, met]) => (
                              <div key={key} className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${met ? 'bg-green-100' : 'bg-gray-100'}`}>
                                  {met && <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />}
                                </div>
                                <span className="capitalize">
                                  {key === 'length' ? '8+ chars' : 
                                   key === 'special' ? 'Symbol' : 
                                   key}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {errors.newPassword && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('confirm')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                            errors.confirmPassword 
                              ? "border-red-300 focus:border-red-500" 
                              : focusedField === 'confirm'
                              ? "border-indigo-500 ring-4 ring-indigo-100"
                              : "border-gray-200 focus:border-indigo-500"
                          }`}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                        disabled={isSubmitting}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.newPassword || !formData.confirmPassword}
                        className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 3 && success && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-3"
                  >
                    Password Updated Successfully!
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-6"
                  >
                    Your password has been changed successfully. Your account is now more secure.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"
                  >
                    <p className="text-sm text-emerald-700">
                      <strong>Tip:</strong> Make sure to update your password manager and remember your new password for future logins.
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={handleClose}
                    className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Done
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
