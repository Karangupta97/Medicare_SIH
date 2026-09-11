import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import usericon from "../../assets/user.png";
import MedicareLogo from "../../assets/Logo/Medicare logo 1.png"; // Import the Medicare logo
  import HandLogo from "../../assets/Logo/hand logo.png"; // Import the hand logo
  import {
  FiGrid,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiActivity,
  FiX,
  FiSearch} from "react-icons/fi";
import { useAuthStore } from "../../store/Patient/authStore";
import LogoutModal from "../User/LogoutModal";

const HospitalDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Initialize from localStorage on component mount
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });
  const location = useLocation();
  const { user, logout, refreshUserData } = useAuthStore();

  // Refresh user data on component mount to get the latest profile picture
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // When sidebar collapse state changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // When location changes, only close mobile sidebar
  useEffect(() => {
    if (window.innerWidth < 1024) { // lg breakpoint in Tailwind
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Add event listener for sidebar toggle from Dashboard
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(true);
    };
    
    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  const menuItems = [
    { icon: FiGrid, label: "Dashboard", path: "/hospital/dashboard" },
    { icon: FiSearch, label: "Find Patient", path: "/hospital/find-patient" },
    { icon: FiUser, label: "Profile", path: "/hospital/profile" },
    { icon: FiSettings, label: "Settings", path: "/hospital/settings" },
    { icon: FiHelpCircle, label: "Help", path: "/hospital/help" },
    { icon: FiActivity, label: "Anilit", path: "/hospital/analytics" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setIsProfileOpen(false);
      }
      if (!event.target.closest(".notifications-menu")) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click handler for sidebar menu items that doesn't change collapse state
  const handleMenuClick = () => {
    // Only close the mobile sidebar if it's open
    if (isSidebarOpen && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    // Do NOT change isSidebarCollapsed state here
  };
  
  // Profile picture with error handling for permanent URLs
  const ProfilePicture = ({ className }) => {
    const [imgError, setImgError] = useState(false);
    const [imgSrc, setImgSrc] = useState(usericon);
    
    useEffect(() => {
      // Reset error state and update image source when user data changes
      if (user?.photoURL) {
        setImgError(false);
        
        // For non-permanent URLs, add a cache-busting parameter if not already present
        // For permanent URLs (from S3), use the URL as-is
        if (!user.photoIsPermanent && !user.photoURL.includes('?')) {
          setImgSrc(`${user.photoURL}?t=${new Date().getTime()}`);
        } else {
          setImgSrc(user.photoURL);
        }
      } else {
        setImgSrc(null);
      }
    }, [user?.photoURL]);
    
    if (imgError || !imgSrc) {
      return (
        <div className={`${className || "w-full h-full"} rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg`}>
          {user?.name?.charAt(0) || 'U'}
        </div>
      );
    }
    
    return (
      <img
        src={imgSrc}
        alt="Profile"
        className={className || "w-full h-full object-cover"}
        onError={() => setImgError(true)}
      />
    );
  };

  // Adjust the sidebar layout for mobile devices
  const Sidebar = () => {
    return (
      <div className="w-full md:w-64 h-auto md:h-full bg-primary text-white flex flex-col">
        {/* Ensure the sidebar fits within the viewport for mobile devices */}
        <div className="flex flex-col items-center justify-center py-4">
          <img src="/logo.png" alt="Medicare Logo" className="w-16 h-16" />
          <h1 className="text-lg font-bold mt-2">Medicare</h1>
        </div>
        <nav className="flex flex-col space-y-2 px-4">
          {/* Add navigation links */}
          <a href="/dashboard" className="text-sm md:text-base py-2 px-3 rounded hover:bg-[#3b3b98]">Dashboard</a>
          <a href="/profile" className="text-sm md:text-base py-2 px-3 rounded hover:bg-[#3b3b98]">Profile</a>
          <a href="/reports" className="text-sm md:text-base py-2 px-3 rounded hover:bg-[#3b3b98]">Reports</a>
          <a href="/settings" className="text-sm md:text-base py-2 px-3 rounded hover:bg-[#3b3b98]">Settings</a>
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row relative">
      {/* Sidebar - Optimized with rounded corners and better icon arrangement */}
      <aside
        className={`fixed top-0 left-0 h-screen ${
          isSidebarCollapsed 
            ? "w-16 xs:w-18 sm:w-20 lg:w-20" // Increased width for collapsed state
            : "w-[75%] xs:w-[70%] sm:w-[65%] max-w-[280px] lg:w-72"  // Increased width for expanded state
        } bg-[#252A61] text-white z-50 transform transition-all duration-300 ease-in-out 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col rounded-tr-3xl rounded-br-3xl shadow-xl`}
      >
        <div className="flex flex-col h-full max-h-screen">
          {/* Logo Section - Conditionally showing logos based on sidebar state and device size */}
          <div className="relative flex items-center justify-center p-2 xs:p-3 sm:p-4 border-b border-white/10">
            {/* Normal logo when sidebar is expanded */}
            {!isSidebarCollapsed && (
              <Link to="/" className="flex items-center justify-center">
                <img 
                  src={MedicareLogo} 
                  alt="Medicare Logo" 
                  className="w-24 xs:w-28 sm:w-32 h-auto" 
                />
              </Link>
            )}
            
            {/* When sidebar is collapsed */}
            {isSidebarCollapsed && (
              <>
                {/* Hand logo for large devices only */}
                <Link to="/" className="hidden lg:flex items-center justify-center">
                  <img 
                    src={HandLogo} 
                    alt="Medicare Hand Logo" 
                    className="w-10 h-10 object-contain" 
                  />
                </Link>
                
                {/* X icon for small/medium devices when collapsed */}
                <div className="lg:hidden flex items-center justify-center">
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
            
            {/* X icon when sidebar is expanded (only for small/medium devices) */}
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden absolute top-2 right-2 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <FiX className="w-4 h-4 xs:w-5 xs:h-5" />
              </button>
            )}
          </div>

          {/* Navigation Menu - Optimized for very small screens */}
          <nav className="flex-1 px-1 xs:px-2 py-0.5 xs:py-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuClick}
                className={`flex ${isSidebarCollapsed ? "justify-center" : "items-center space-x-1 xs:space-x-2"} 
                px-1.5 xs:px-2 py-1 xs:py-1.5 sm:py-2 rounded-lg transition-all duration-200 mb-1.5 xs:mb-2 sm:mb-3
                ${location.pathname === item.path ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <item.icon className={`${isSidebarCollapsed ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"}`} />
                {!isSidebarCollapsed && <span className="text-xs xs:text-sm sm:text-base md:text-lg font-medium truncate">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer Section - Optimized for small screens */}
          <div className="p-1 xs:p-2 mb-1 xs:mb-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex ${isSidebarCollapsed ? "justify-center" : "items-center"} w-full px-1.5 xs:px-2 py-1 xs:py-1.5 sm:py-2 text-xs xs:text-sm sm:text-base text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors mb-2`}
            >
              <FiMenu className={`${isSidebarCollapsed ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"}`} />
              {!isSidebarCollapsed && <span className="ml-1 xs:ml-2 truncate">Collapse</span>}
            </button>

            {/* Logout Option - Optimized for small screens */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`flex ${isSidebarCollapsed ? "justify-center" : "items-center"} w-full px-1.5 xs:px-2 py-1 xs:py-1.5 sm:py-2 text-xs xs:text-sm sm:text-base text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors`}
            >
              <FiLogOut className={`${isSidebarCollapsed ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"}`} />
              {!isSidebarCollapsed && <span className="ml-1 xs:ml-2 truncate">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed 
          ? "lg:ml-20 xl:ml-20" 
          : "lg:ml-[280px] xl:ml-72"
      }`}>
        {/* Mobile Menu Button - Floating in the corner */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-full bg-[#252A61] text-white shadow-lg hover:bg-[#3b3b98] transition-all duration-300"
          aria-label="Open menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Scrollable Page Content */}
        <main className="p-4 sm:p-6 max-w-[2000px] mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
};

export default HospitalDashboardLayout;