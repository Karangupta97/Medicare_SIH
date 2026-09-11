import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const SuccessModal = ({ isOpen, onClose, message, redirectTo = '/' }) => {
  useEffect(() => {
    if (isOpen) {
      // Left corner confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0, y: 1 },
        colors: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98']
      });

      // Right corner confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 1, y: 1 },
        colors: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98']
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/0.5"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Animated background effect */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute inset-0 bg-linear-to-br from-green-50 to-blue-50"
            />

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.3 }}
                className="mb-6"
              >
                <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-800 mb-4"
              >
                Thank You for Sharing!
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-6"
              >
                {message || "Your voice matters! We're grateful for your valuable feedback and for helping us improve healthcare experiences for everyone."}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to={redirectTo}
                  className="inline-block px-6 py-3 bg-[#252A61] text-white font-medium rounded-xl hover:bg-[#363b7e] transition-colors duration-200"
                >
                  Return to Home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal; 