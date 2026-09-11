import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';

const FloatingActionButton = ({ link = '/user-lookup', icon = <FiSearch size={24} />, title = 'Find Medicare User' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showRemoveIcon, setShowRemoveIcon] = useState(false);
  const [storedPosition, setStoredPosition] = useState(null);
  const buttonRef = useRef(null);
  
  // Check if button should be shown and load position on mount
  useEffect(() => {
    try {
      // Check if user previously hid the button
      const isHidden = localStorage.getItem('floatingButtonHidden') === 'true';
      
      if (isHidden) {
        setShowButton(false);
        return;
      }
      
      // If not hidden, show the button and load position
      setShowButton(true);
      
      const savedPosition = localStorage.getItem('floatingButtonPosition');
      if (savedPosition) {
        setStoredPosition(JSON.parse(savedPosition));
      } else {
        // Default position (bottom right)
        setStoredPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
      }
    } catch (error) {
      console.error('Error loading button preferences:', error);
      // Default to showing and default position
      setShowButton(true);
      setStoredPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    }
  }, []);

  // Set position after storedPosition is loaded
  useEffect(() => {
    if (storedPosition) {
      // Ensure the button stays within viewport bounds
      const adjustedPosition = constrainToViewport(storedPosition);
      setPosition(adjustedPosition);
    }
  }, [storedPosition]);

  // Save position to localStorage when position changes
  useEffect(() => {
    if (!isDragging && position.x !== 0 && position.y !== 0) {
      localStorage.setItem('floatingButtonPosition', JSON.stringify(position));
    }
  }, [position, isDragging]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (position.x !== 0 && position.y !== 0) {
        setPosition(prev => constrainToViewport(prev));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Keep button within viewport
  const constrainToViewport = (pos) => {
    if (!buttonRef.current) return pos;
    
    const buttonWidth = buttonRef.current.offsetWidth || 60;
    const buttonHeight = buttonRef.current.offsetHeight || 60;
    
    return {
      x: Math.min(Math.max(pos.x, 0), window.innerWidth - buttonWidth),
      y: Math.min(Math.max(pos.y, 0), window.innerHeight - buttonHeight)
    };
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setShowRemoveIcon(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Keep the remove icon visible for a moment after dragging stops
    setTimeout(() => {
      setShowRemoveIcon(false);
    }, 2000);
  };

  const handleRemove = () => {
    setShowButton(false);
    // Remove from localStorage
    localStorage.removeItem('floatingButtonPosition');
    
    // After animation completes, you could completely unmount if needed
    // or set a flag in localStorage to remember this preference
    localStorage.setItem('floatingButtonHidden', 'true');
  };

  // Add a method to restore the button if needed
  const restoreButton = () => {
    localStorage.removeItem('floatingButtonHidden');
    setShowButton(true);
  };

  if (!showButton) return null;

  return (
    <>
      {/* X button for removal - shows when dragging or briefly after */}
      {showRemoveIcon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-red-500 text-white p-3 rounded-full shadow-lg cursor-pointer"
          onClick={handleRemove}
        >
          <FiX size={24} />
        </motion.div>
      )}
      
      {/* Draggable button */}
      <motion.div
        ref={buttonRef}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          x: position.x,
          y: position.y,
          scale: isDragging ? 1.1 : 1,
          opacity: 1
        }}
        transition={{ duration: 0.3 }}
        whileDrag={{
          scale: 1.1,
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.3)",
        }}
        className="fixed z-50 touch-none"
        style={{ x: position.x, y: position.y }}
      >
        <Link 
          to={link}
          className="flex flex-col items-center gap-1 group"
          onClick={(e) => isDragging && e.preventDefault()}
        >
          <div className="p-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
            {icon}
          </div>
          {!isDragging && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-white px-3 py-1.5 bg-gray-800 rounded-lg whitespace-nowrap shadow-lg"
            >
              {title}
            </motion.span>
          )}
        </Link>
      </motion.div>
    </>
  );
};

export default FloatingActionButton; 