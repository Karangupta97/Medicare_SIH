import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/Patient/authStore";
import {
  FaEye,
  FaEyeSlash,
  FaUserMd,
  FaLock,
  FaGoogle,
  FaFacebook,
  FaStethoscope,
  FaHeartbeat,
  FaNotesMedical,
  FaEnvelope,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SignupImage from "../../assets/Sing.png";

const Signup = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false,
  });
  const navigate = useNavigate();
  const { signup, error, isLoading } = useAuthStore();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    // Length check (up to 20%)
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Character type checks (up to 40%)
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;

    // Complexity checks (up to 40%)
    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password)
    )
      strength += 10;
    if (
      password.length >= 12 &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    )
      strength += 10;
    if (
      password.length >= 16 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    )
      strength += 10;
    if (
      password.length >= 16 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    )
      strength += 10;

    return strength;
  };

  const checkRequirements = (password) => {
    setRequirements({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
    checkRequirements(newPassword);
  };

  const getStrengthColor = (strength) => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    if (strength <= 90) return "bg-green-500";
    return "bg-[#4318FF]";
  };

  const getStrengthText = (strength) => {
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    if (strength <= 90) return "Strong";
    return "Very Strong";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(name, lastname, email, password);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-2 sm:p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234318FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
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
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#4318FF] rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
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
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">
              Medical Staff
            </span>
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
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">
              Health Check
            </span>
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
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">
              Vital Signs
            </span>
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
            <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">
              Medical Records
            </span>
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
        {/* Left Side - Medical Illustration */}
        <div className="hidden lg:flex lg:w-[55%] bg-white items-center justify-center relative">
          <div className="w-full max-w-4xl p-20">
            {/* Medical Illustration with Features Overlay */}
            <div className="relative w-full h-full">
              <img
                src={SignupImage}
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
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Unique Medical ID</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Get your personal UID for seamless healthcare access</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Digital Medical Card</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Store blood group and emergency contact details</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">QR Code Access</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Quick access to complete medical history via QR</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Emergency Access</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">24/7 emergency contact information available</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Universal Access</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">Use your UID at any healthcare facility</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10">
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2"></div>
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Secure Records</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">All medical history securely stored in QR</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-8 text-center">
                      <p className="text-white/90 text-lg mb-4 drop-shadow-md">Get your unique medical ID and digital card today!</p>
                      <Link 
                        to="/signup" 
                        className="inline-block bg-white/90 text-[#4318FF] px-8 py-3 rounded-2xl font-semibold text-base hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-[2px]"
                      >
                        Create Your Medical Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
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
                Create Account
              </h1>
              <p className="text-[16px] sm:text-[19px] text-[#707EAE] leading-relaxed">
                Join Medicare to access your secure medical dashboard and
                healthcare services.
              </p>
            </motion.div>

            <form onSubmit={handleSignup} className="space-y-6 sm:space-y-8">
              {/* Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <FaUserMd className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-xl" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 text-[16px] sm:text-[17px] rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE]"
                    placeholder="First Name"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <FaUserMd className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-xl" />
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 text-[16px] sm:text-[17px] rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE]"
                    placeholder="Last Name"
                  />
                </motion.div>
              </div>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <FaEnvelope className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-xl" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 text-[16px] sm:text-[17px] rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE]"
                  placeholder="Enter your email"
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="relative">
                  <FaLock className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[#707EAE] text-xl" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    minLength={12}
                    className="w-full pl-12 sm:pl-14 pr-12 py-4 sm:py-5 text-[16px] sm:text-[17px] rounded-[12px] sm:rounded-[16px] bg-[#F4F7FE] border-2 border-transparent focus:border-[#4318FF] focus:bg-white transition-all duration-300 text-[#2B3674] placeholder-[#707EAE]"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-[#707EAE] hover:text-[#4318FF] transition-colors duration-300"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 space-y-2"
                >
                  <div className="flex justify-between text-xs text-[#707EAE]">
                    <span>Password Strength:</span>
                    <span
                      className={`font-medium ${getStrengthColor(
                        passwordStrength
                      )} bg-clip-text text-transparent`}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F4F7FE] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full ${getStrengthColor(
                        passwordStrength
                      )} rounded-full`}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          requirements.length ? "bg-green-500" : "bg-[#F4F7FE]"
                        }`}
                      >
                        {requirements.length ? (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-[#707EAE]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`${
                          requirements.length
                            ? "text-green-500"
                            : "text-[#707EAE]"
                        }`}
                      >
                        At least 12 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          requirements.uppercase
                            ? "bg-green-500"
                            : "bg-[#F4F7FE]"
                        }`}
                      >
                        {requirements.uppercase ? (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-[#707EAE]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`${
                          requirements.uppercase
                            ? "text-green-500"
                            : "text-[#707EAE]"
                        }`}
                      >
                        One uppercase letter
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          requirements.lowercase
                            ? "bg-green-500"
                            : "bg-[#F4F7FE]"
                        }`}
                      >
                        {requirements.lowercase ? (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-[#707EAE]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`${
                          requirements.lowercase
                            ? "text-green-500"
                            : "text-[#707EAE]"
                        }`}
                      >
                        One lowercase letter
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          requirements.numbers ? "bg-green-500" : "bg-[#F4F7FE]"
                        }`}
                      >
                        {requirements.numbers ? (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-[#707EAE]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`${
                          requirements.numbers
                            ? "text-green-500"
                            : "text-[#707EAE]"
                        }`}
                      >
                        One number
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          requirements.special ? "bg-green-500" : "bg-[#F4F7FE]"
                        }`}
                      >
                        {requirements.special ? (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-[#707EAE]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`${
                          requirements.special
                            ? "text-green-500"
                            : "text-[#707EAE]"
                        }`}
                      >
                        One special character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
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
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Signup Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4318FF] text-white py-4 sm:py-5 rounded-[12px] sm:rounded-[16px] hover:bg-[#3311DB] transition-all duration-300 font-semibold text-[16px] sm:text-[17px] mt-4 sm:mt-6 shadow-lg shadow-[#4318FF]/20 hover:shadow-xl hover:shadow-[#4318FF]/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </motion.button>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-center text-[14px] sm:text-[15px] text-[#707EAE]"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#4318FF] hover:text-[#3311DB] font-semibold transition-colors duration-300"
                >
                  Sign in
                </Link>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
