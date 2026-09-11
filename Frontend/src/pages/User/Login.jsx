import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/Patient/authStore";
import { FaEye, FaEyeSlash, FaUserMd, FaLock, FaGoogle, FaFacebook, FaStethoscope, FaHeartbeat, FaNotesMedical } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import medicalIllustration from "@/assets/Login.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-2 sm:p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234318FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Mobile Medical Section */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-[#4318FF]/3 via-[#4318FF]/5 to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#4318FF] rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#4318FF] rounded-full blur-3xl"
          />
        </div>

        {/* Medical Icons Grid */}
        <div className="absolute inset-0 grid grid-cols-2 gap-3 p-4">
          {/* Top Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <FaUserMd className="text-2xl sm:text-3xl text-[#4318FF]" />
            </div>
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">Medical Staff</span>
          </motion.div>

          {/* Top Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <FaStethoscope className="text-2xl sm:text-3xl text-[#4318FF]" />
            </div>
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">Health Check</span>
          </motion.div>

          {/* Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <FaHeartbeat className="text-2xl sm:text-3xl text-[#4318FF]" />
            </div>
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">Vital Signs</span>
          </motion.div>

          {/* Bottom Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <FaNotesMedical className="text-2xl sm:text-3xl text-[#4318FF]" />
            </div>
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">Medical Records</span>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-2 h-2 bg-[#4318FF] rounded-full opacity-50"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-[#4318FF] rounded-full opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-[#4318FF] rounded-full opacity-50"></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#4318FF] rounded-full opacity-50"></div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1400px] min-h-screen sm:min-h-0 sm:h-[900px] flex bg-white rounded-none sm:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
      >
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-[45%] p-6 sm:p-10 md:p-20">
          <div className="max-w-[460px] mx-auto">
            {/* Welcome Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 sm:mb-16"
            >
              <h1 className="text-[32px] sm:text-[46px] font-bold text-[#2B3674] mb-4 tracking-tight">
                Welcome to Medicare
              </h1>
              <p className="text-[16px] sm:text-[19px] text-[#707EAE] leading-relaxed">
                Your trusted healthcare portal. Please sign in to access your secure medical dashboard.
              </p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
              {/* Email Input */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <FaUserMd className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-xl" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 text-[16px] sm:text-[17px] rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE]"
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="relative">
                  <FaLock className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-xl" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 sm:pl-14 pr-12 py-4 sm:py-5 text-[16px] sm:text-[17px] rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE]"
                    placeholder="Enter your password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-[#707EAE] hover:text-[#4318FF] transition-colors duration-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
                >
                  <label className="flex items-center gap-2 text-[14px] sm:text-[15px] text-[#707EAE] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#707EAE] text-[#4318FF] focus:ring-[#4318FF]"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[14px] sm:text-[15px] text-[#707EAE] hover:text-[#4318FF] transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </motion.div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-[12px] sm:rounded-[16px] text-[14px] sm:text-[15px] border border-red-100 flex items-center gap-2"
                    role="alert"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4318FF] text-white py-4 sm:py-5 rounded-[12px] sm:rounded-[16px] hover:bg-[#3311DB] transition-all duration-300 font-semibold text-[16px] sm:text-[17px] mt-4 sm:mt-6 shadow-lg shadow-[#4318FF]/20 hover:shadow-xl hover:shadow-[#4318FF]/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In Securely"
                )}
              </motion.button>

              {/* Social Login */}
              {/* <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#707EAE]/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#707EAE]">Or continue with</span>
                </div>
              </div> */}

              {/* <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-[#707EAE]/20 rounded-[16px] text-[#707EAE] hover:bg-[#F4F7FE] transition-all duration-300"
                >
                  <FaGoogle className="text-xl" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-[#707EAE]/20 rounded-[16px] text-[#707EAE] hover:bg-[#F4F7FE] transition-all duration-300"
                >
                  <FaFacebook className="text-xl" />
                  <span>Facebook</span>
                </button>
              </div> */}

              {/* Sign Up Link */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center pt-6 sm:pt-8"
              >
                <p className="text-[14px] sm:text-[16px] text-[#707EAE]">
                  New to Medicare?{" "}
                  <Link to="/signup" className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors duration-300 hover:underline">
                    Create an Account
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </div>

        {/* Right Side - Medical Illustration */}
        <div className="hidden lg:flex lg:w-[55%] bg-white items-center justify-center relative">
          <div className="w-full max-w-4xl p-20">
            {/* Medical Illustration with Features Overlay */}
            <div className="relative w-full h-full">
              <img
                src={medicalIllustration}
                alt="3D Medical Office"
                className="w-full h-full object-cover"
              />
              {/* Features Overlay */}
              <div className="absolute inset-0 flex flex-col justify-center">
                <div className="bg-linear-to-b from-[#4318FF]/70 via-[#4318FF]/50 to-[#4318FF]/30 backdrop-blur-[2px] w-full h-full rounded-[40px]">
                  <div className="h-full flex flex-col justify-center px-12">
                    <h2 className="text-[42px] font-bold text-white text-center tracking-tight mb-8 drop-shadow-lg">
                      Medicare Portal
                    </h2>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Secure Access</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">24/7 secure access to your medical records</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Appointment Management</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Schedule and manage your appointments</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Digital Records</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Access your complete medical history</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Prescription Management</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">View and manage your prescriptions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Billing & Insurance</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Track your medical bills and claims</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Health Tracking</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Monitor your health metrics</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-8 text-center">
                      <p className="text-white/90 text-lg mb-4 drop-shadow-md">Ready to take control of your healthcare journey?</p>
                      <Link 
                        to="/signup" 
                        className="inline-block bg-white/90 text-[#4318FF] px-8 py-3 rounded-2xl font-semibold text-base hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-[2px]"
                      >
                        Get Started Today
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;