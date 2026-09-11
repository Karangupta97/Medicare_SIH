import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

const RestoreButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if the floating button is hidden
    const isButtonHidden = localStorage.getItem('floatingButtonHidden') === 'true';
    setIsVisible(isButtonHidden);
  }, []);
  
  const handleRestore = () => {
    // Remove the hidden flag
    localStorage.removeItem('floatingButtonHidden');
    // Refresh the page to restore the button
    window.location.reload();
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleRestore}
        className="flex items-center gap-2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg"
      >
        <FiPlus className="text-white" />
        Restore Quick Search
      </motion.button>
    </motion.div>
  );
};

export default RestoreButton; 