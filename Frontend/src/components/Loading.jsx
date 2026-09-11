import React from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat } from 'react-icons/fa';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-indigo-50" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        
        {/* Logo Background Effects - Removed large stretched background circles */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-lg px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-8 sm:mb-12"
        >
          <FaHeartbeat className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 animate-pulse" />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3">
            Loading Medicare
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Please wait while we prepare your health dashboard
          </p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="w-full max-w-xs sm:max-w-sm mt-8 sm:mt-12 h-1 bg-blue-600 rounded-full"
        />
      </div>
    </div>
  );
};

export default Loading;
