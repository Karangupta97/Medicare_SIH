import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
            </div>

            {/* Content */}
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Are you sure you want to logout? You will need to login again to access your account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="btn btn-secondary flex-1 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="btn btn-primary flex-1 order-1 sm:order-2 bg-red-600! hover:bg-red-700!"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;