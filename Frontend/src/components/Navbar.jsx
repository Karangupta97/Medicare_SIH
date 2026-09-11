import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Logo/Whitebgtextlogo.jpg";
import UserIcon from "../assets/user.png";
import {
  FiUser,
  FiLogOut,
  FiHome,
  FiChevronDown,
  FiUpload,
  FiInfo,
  FiFileText,
  FiPlus,
  FiSettings,
  FiBell,
  FiBook,
} from "react-icons/fi";
import { FiLayout } from "react-icons/fi";
import { useAuthStore } from "../store/Patient/authStore";
import usePatientStore from "../store/Patient/patientstore";
import LogoutModal from "./User/LogoutModal";

const ProfilePicture = React.memo(({ authUser, className }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(UserIcon);

  useEffect(() => {
    if (authUser?.photoURL) {
      setImgError(false);
      if (!authUser.photoIsPermanent && !authUser.photoURL.includes("?")) {
        setImgSrc(`${authUser.photoURL}?t=${Date.now()}`);
      } else {
        setImgSrc(authUser.photoURL);
      }
    } else {
      setImgSrc(null);
    }
  }, [authUser?.photoURL, authUser?.photoIsPermanent]);

  if (imgError || !imgSrc) {
    return (
      <div
        className={`${className || "w-full h-full"} rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg`}
      >
        {authUser?.name?.charAt(0) || "U"}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt="User"
      className={className || "w-full h-full object-cover"}
      onError={() => setImgError(true)}
    />
  );
});

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, refreshUserData, token, isAuthenticated } = useAuthStore();
  const { unreadNotificationsCount, fetchAllMedicalData } = usePatientStore();
  const authUser = useAuthStore((state) => state.user) || user;

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  useEffect(() => {
    if (token) {
      fetchAllMedicalData(token).catch((err) =>
        console.error("Error fetching medical data:", err)
      );
    }
  }, [token, fetchAllMedicalData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-menu")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close user menu when route changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();

      if (onLogout) {
        onLogout();
      }

      setIsUserMenuOpen(false);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    handleLogout();
  };

  // Check if path is active for bottom navigation
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Navbar with Framer Motion for animations */}
      <div className="flex justify-center w-full bg-white dark:bg-gray-900">
        <motion.nav
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-[1700px] flex justify-between items-center py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 relative z-40"
        >
          {/* Logout Modal */}
          <LogoutModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleLogoutConfirm}
          />

          {/* Mobile Controls */}
          <div className="flex justify-between items-center w-full lg:hidden">
            <Link to="/" className="flex items-center">
              <img
                className="w-20 sm:w-24 md:w-32 h-auto"
                src={Logo}
                alt="Logo"
              />
            </Link>

            <div className="flex items-center space-x-3">
              {authUser ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#252A61]"
                  >
                    <ProfilePicture authUser={authUser} className="w-8 h-8 rounded-full object-cover" />
                  </button>

                  {/* Mobile Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-xl 
                        py-2 border border-gray-100 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {authUser?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {authUser?.email || ""}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiUser className="w-4 h-4 text-gray-500" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiHome className="w-4 h-4 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiSettings className="w-4 h-4 text-gray-500" />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="/notifications"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiBell className="w-4 h-4 text-gray-500" />
                          <span>Notifications</span>
                          {unreadNotificationsCount > 0 && (
                            <span className="ml-auto bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2 bg-[#252A61] text-white rounded-full text-sm sm:text-base hover:bg-[#3b3b98] transition-all duration-300 hover:shadow-lg"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between w-full">
            <Link to="/" className="flex items-center">
              <img
                className="w-32 lg:w-36 xl:w-40 h-auto"
                src={Logo}
                alt="Logo"
              />
            </Link>

            <nav className="flex space-x-6 xl:space-x-8 text-base xl:text-lg font-[Montserrat Alternates] font-semibold">
              <Link to="/" className="nav-link">
                Home
              </Link>
              {/* <Link to="/services" className="nav-link">
                Services
              </Link> */}
              <Link to="/health-records" className="nav-link">
                Health Records
              </Link>
              <Link to="/dashboard/upload" className="nav-link">
                Upload Reports
              </Link>
              <Link to="/aboutus" className="nav-link">
                About Us
              </Link>
              <Link to="/pricing" className="nav-link">
                Pricing
              </Link>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </nav>

            {authUser ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <Link
                  to="/dashboard/notifications"
                  className="relative p-2 hover:bg-gray-50 rounded-xl"
                >
                  <FiBell className="w-6 h-6 text-gray-600" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                      {unreadNotificationsCount > 9
                        ? "9+"
                        : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                <div className="relative user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-1.5 hover:bg-gray-50 rounded-xl group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-[#252A61] to-[#4318FF]">
                      <ProfilePicture authUser={authUser} />
                    </div>
                    <FiChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {authUser?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {authUser?.email || ""}
                          </p>
                        </div>
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiUser className="w-4 h-4 text-gray-500" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiHome className="w-4 h-4 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/dashboard/notifications"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiBell className="w-4 h-4 text-gray-500" />
                          <span>Notifications</span>
                          {unreadNotificationsCount > 0 && (
                            <span className="ml-auto bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiSettings className="w-4 h-4 text-gray-500" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-8 py-3 bg-[#252A61] text-white rounded-full text-lg hover:bg-[#3b3b98] transition-all duration-300 hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center p-4 border-b">
                    <img className="w-32 h-auto" src={Logo} alt="Logo" />
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg
                        className="w-6 h-6 text-[#252A61]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <nav className="p-4 space-y-2">
                    <Link to="/" className="mobile-nav-link">
                      Home
                    </Link>
                    <Link to="/services" className="mobile-nav-link">
                      Services
                    </Link>
                    <Link to="/health-records" className="mobile-nav-link">
                      Health Records
                    </Link>
                    <Link to="/dashboard/upload" className="mobile-nav-link">
                      Upload Reports
                    </Link>
                    <Link to="/aboutus" className="mobile-nav-link">
                      About Us
                    </Link>
                    <Link to="/pricing" className="mobile-nav-link">
                      Pricing
                    </Link>
                    <Link to="/profile" className="mobile-nav-link">
                      Profile
                    </Link>
                  </nav>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
      {/* Bottom Navigation for Mobile and Medium Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto px-2 sm:px-4">
          <nav className="flex justify-between items-center h-[60px] sm:h-[65px] relative">
            {/* Home Button */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center w-1/5 h-full relative group transition-all duration-300 ${isActive("/")
                ? "text-[#252A61]"
                : "text-gray-400 hover:text-[#252A61]"
                }`}
            >
              {isActive("/") && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px w-12 h-1 bg-[#252A61] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <FiHome
                  className={`w-6 h-6 mb-1.5 transition-transform duration-300 group-hover:scale-110 ${isActive("/") ? "scale-110" : ""
                    }`}
                />
                {isActive("/") && (
                  <div className="absolute inset-0 bg-[#252A61]/10 rounded-full blur-lg -z-10"></div>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-300 ${isActive("/")
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-70 group-hover:opacity-100"
                  }`}
              >
                Home
              </span>
            </Link>

            {/* Health Records Button */}
            <Link
              to="/health-records"
              className={`flex flex-col items-center justify-center w-1/5 h-full relative group transition-all duration-300 ${isActive("/health-records")
                ? "text-[#252A61]"
                : "text-gray-400 hover:text-[#252A61]"
                }`}
            >
              {isActive("/health-records") && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px w-12 h-1 bg-[#252A61] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <FiFileText
                  className={`w-6 h-6 mb-1.5 transition-transform duration-300 group-hover:scale-110 ${isActive("/health-records") ? "scale-110" : ""
                    }`}
                />
                {isActive("/health-records") && (
                  <div className="absolute inset-0 bg-[#252A61]/10 rounded-full blur-lg -z-10"></div>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-300 ${isActive("/health-records")
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-70 group-hover:opacity-100"
                  }`}
              >
                Records
              </span>
            </Link>

            {/* Upload Button - Enhanced */}
            <Link
              to="/dashboard/upload"
              className="relative flex flex-col items-center -mt-8 group"
            >
              <div
                className={`w-16 h-16 rounded-full ${isActive("/dashboard/upload") ? "bg-[#252A61]" : "bg-[#3b3b98]"
                  } flex items-center justify-center shadow-lg border-4 border-white/80 backdrop-blur-lg transition-all duration-300 hover:shadow-xl group-hover:scale-105 group-hover:border-white`}
              >
                <FiPlus className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-180" />
                <div className="absolute inset-0 bg-[#252A61]/20 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span
                className={`text-xs font-medium mt-1 transition-all duration-300 ${isActive("/dashboard/upload")
                  ? "text-[#252A61] opacity-100"
                  : "text-gray-500 group-hover:text-[#252A61]"
                  }`}
              >
                Upload
              </span>
            </Link>

            {/* About Button */}
            <Link
              to="/aboutus"
              className={`flex flex-col items-center justify-center w-1/5 h-full relative group transition-all duration-300 ${isActive("/aboutus")
                ? "text-[#252A61]"
                : "text-gray-400 hover:text-[#252A61]"
                }`}
            >
              {isActive("/aboutus") && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px w-12 h-1 bg-[#252A61] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <FiInfo
                  className={`w-6 h-6 mb-1.5 transition-transform duration-300 group-hover:scale-110 ${isActive("/aboutus") ? "scale-110" : ""
                    }`}
                />
                {isActive("/aboutus") && (
                  <div className="absolute inset-0 bg-[#252A61]/10 rounded-full blur-lg -z-10"></div>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-300 ${isActive("/aboutus")
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-70 group-hover:opacity-100"
                  }`}
              >
                About
              </span>
            </Link>

            {/* Dashboard Button */}
            <Link
              to="/dashboard"
              className={`flex flex-col items-center justify-center w-1/5 h-full relative group transition-all duration-300 ${isActive("/dashboard")
                ? "text-[#252A61]"
                : "text-gray-400 hover:text-[#252A61]"
                }`}
            >
              {isActive("/dashboard") && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px w-12 h-1 bg-[#252A61] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <FiLayout
                  className={`w-6 h-6 mb-1.5 transition-transform duration-300 group-hover:scale-110 ${isActive("/dashboard") ? "scale-110" : ""
                    }`}
                />
                {isActive("/dashboard") && (
                  <div className="absolute inset-0 bg-[#252A61]/10 rounded-full blur-lg -z-10"></div>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-300 ${isActive("/dashboard")
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-70 group-hover:opacity-100"
                  }`}
              >
                Dashboard
              </span>
            </Link>
          </nav>
        </div>

        {/* Enhanced glass effect */}
        <div className="absolute inset-0 bg-linear-to-b from-white/60 to-white/95 backdrop-blur-xl -z-10"></div>
      </div>
    </>
  );
};

export default Navbar;
