import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStaffStore } from "../../../store/staffStore";
import { FaEye, FaEyeSlash, FaUserNurse, FaLock, FaHospital } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/Logo/textlogo.png";
import medicalIllustration from "../../../assets/Login.png";
import toast from "react-hot-toast";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, isFirstLogin, clearError } = useStaffStore();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to staff dashboard or password change based on login status
      if (isFirstLogin) {
        navigate("/staff/change-password");
      } else {
        navigate("/staff/dashboard");
      }
    }
    
    // Check if email is saved in localStorage for "remember me"
    const savedEmail = localStorage.getItem('rememberedStaffEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    // Clear any previous errors
    clearError();
  }, [isAuthenticated, isFirstLogin, navigate, clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Save email if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedStaffEmail', email);
      } else {
        localStorage.removeItem('rememberedStaffEmail');
      }
      
      // Call login function from staff store
      const response = await login(email, password);
      
      if (response.success) {
        toast.success("Login successful");
        
        // Redirect based on login status
        if (response.staff.isFirstLogin) {
          navigate("/staff/change-password");
        } else {
          navigate("/staff/dashboard");
        }
      }
    } catch (error) {
      // Error handling is already done in the store
      console.error("Login error:", error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="flex flex-col md:flex-row min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left Side - Brand and Illustration */}
      <div className="hidden lg:flex lg:w-[55%] bg-linear-to-br from-blue-600 to-indigo-800 text-white p-10 items-center justify-center">
        <div className="max-w-xl">
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-12">
              <img src={logo} alt="Medicare Logo" className="h-10" />
              <h1 className="text-3xl font-bold">Medicare</h1>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">Welcome to Staff Portal</h2>
            <p className="text-xl text-blue-100 mb-8">
              Access your secure medical dashboard to manage patient records, appointments, and more.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full opacity-20"></div>
            <img 
              src={medicalIllustration} 
              alt="Healthcare Illustration" 
              className="rounded-xl shadow-2xl max-w-md mx-auto w-full"
            />
          </motion.div>
          
          <motion.div 
            className="mt-12 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex space-x-6">
              <div className="flex flex-col">
                <span className="font-bold text-2xl">100+</span>
                <span className="text-blue-200 text-sm">Medical Staff</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl">10,000+</span>
                <span className="text-blue-200 text-sm">Patients</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl">24/7</span>
                <span className="text-blue-200 text-sm">Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] p-6 sm:p-10 md:p-16 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-md"
          variants={itemVariants}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Medicare Logo" className="h-8" />
              <h1 className="text-2xl font-bold text-blue-600">Medicare</h1>
            </div>
          </div>
          
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Login</h2>
            <p className="text-gray-600">
              Enter your credentials to access the staff portal
            </p>
          </motion.div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserNurse className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>
            
            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/staff/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </motion.div>
            
            {/* Remember Me */}
            <motion.div variants={itemVariants} className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </motion.div>
            
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
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </motion.div>
          </form>
          
          {/* Footer */}
          <motion.div 
            variants={itemVariants} 
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>Staff access only. Contact your administrator for support.</p>
            <div className="mt-4 flex items-center justify-center">
              <FaHospital className="text-gray-400 mr-2" />
              <span>Medicare Staff Portal</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StaffLogin; 