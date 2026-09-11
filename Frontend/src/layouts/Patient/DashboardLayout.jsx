import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import usericon from "../../assets/user.png";
import MedicareLogo from "../../assets/Logo/Medicare logo 1.png";
import HandLogo from "../../assets/Logo/hand logo.png";
import {
  LayoutDashboard,
  Home,
  FileText,
  Upload,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  X,
  Calendar,
  Clipboard,
  Info,
  ChevronRight,
  MessageCircle,
  Activity,
  Clock,
  Search,
  FolderOpen,
  Shield,
  Users,
} from "lucide-react";
import useAuthStore from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";
import LogoutModal from "../../components/User/LogoutModal";

// eslint workaround: some eslint configs don't treat `motion.div` as a usage of `motion`
const _motion = motion;

const DashboardProfilePicture = React.memo(({ user, className, showBorder = false }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(usericon);

  useEffect(() => {
    if (user?.photoURL) {
      setImgError(false);
      if (!user.photoIsPermanent && !user.photoURL.includes('?')) {
        setImgSrc(`${user.photoURL}?t=${Date.now()}`);
      } else {
        setImgSrc(user.photoURL);
      }
    } else {
      setImgSrc(null);
    }
  }, [user?.photoURL, user?.photoIsPermanent]);

  if (imgError || !imgSrc) {
    return (
      <div className={`${className || "w-full h-full"} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold ${className?.includes('w-12') ? 'text-lg' : 'text-sm'} ${showBorder ? 'ring-2 ring-blue-200' : ''} shadow-md`}>
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${user?.name || 'User'}'s profile`}
      className={`${className || "w-full h-full object-cover"} rounded-full ${showBorder ? 'ring-2 ring-blue-200' : ''} shadow-md`}
      onError={() => setImgError(true)}
    />
  );
});

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });
  const [refreshError, setRefreshError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchBarVisible, setIsMobileSearchBarVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchCategories, setSearchCategories] = useState({
    reports: true,
    prescriptions: true
  });
  const [tooltipData, setTooltipData] = useState({ show: false, text: '', x: 0, y: 0 });
  const searchInputRef = useRef(null);
  const mobileInlineSearchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUserData, isAuthenticated } = useAuthStore();
  const {
    unreadNotificationsCount,
    sharedReports,
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchMedicalData,
    isLoading: patientStoreLoading
  } = usePatientStore();

  const sharedReportsActiveCount = (sharedReports || []).filter((s) => s.status === "active").length;
  // Handle keyboard navigation in search results
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  // Keep layout lightweight: page components fetch their own data on demand.

  // Refresh user data on component mount with error handling
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await refreshUserData();
        setRefreshError(false);
      } catch (error) {
        console.error("Error refreshing user data:", error);
        setRefreshError(true);

        if (error?.response?.status === 404 && isAuthenticated) {
          const timer = setTimeout(() => {
            logout();
          }, 3000);

          return () => clearTimeout(timer);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [refreshUserData, isAuthenticated, logout]);

  // When sidebar collapse state changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // When location changes, only close mobile sidebar
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle clicks outside of dropdowns and keyboard navigation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setIsProfileOpen(false);
      }
      if (!event.target.closest(".notifications-menu")) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      // Close dropdowns on Escape key
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }

      // Quick search focus on Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (window.innerWidth >= 1024) {
          // Desktop: Focus existing search bar
          searchInputRef.current?.focus();
        } else {
          // Mobile and Tablet: Show inline search bar
          setIsMobileSearchBarVisible(true);
          setTimeout(() => {
            mobileInlineSearchInputRef.current?.focus();
          }, 100);
        }
      }

      // Close mobile search on Escape
      if (event.key === 'Escape' && isMobileSearchBarVisible) {
        setIsMobileSearchBarVisible(false);
        setSearchQuery(''); // Clear search query when escaping
        setShowSearchResults(false);
      }
    };
    // Add event listeners for click and keydown

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileSearchBarVisible]);

  // Enhanced scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus mobile search when opened
  useEffect(() => {
    if (isMobileSearchBarVisible && mobileInlineSearchInputRef.current) {
      setTimeout(() => {
        mobileInlineSearchInputRef.current?.focus();
      }, 100);
    }
  }, [isMobileSearchBarVisible]);

  // Create a stable debounced search function with useCallback
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Use the searchMedicalData function from the patient store
      const results = await searchMedicalData(query, searchCategories);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchCategories, searchMedicalData]);

  // Create a memoized debounced search function
  const debouncedSearch = useRef(
    debounce(query => {
      performSearch(query);
    }, 300)
  ).current;

  // Handle search input change with debounce
  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      // Show results container immediately but debounce the actual search
      setShowSearchResults(true);
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      // Don't hide results immediately on empty input
      // This prevents flickering when user is deleting text
    }
  }, [debouncedSearch]);

  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle clicks outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target) &&
        !mobileInlineSearchInputRef.current?.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search result click
  const handleSearchResultClick = useCallback((result) => {
    setShowSearchResults(false);
    setSearchQuery('');

    // Handle different result types with specific navigation
    if (result.type === 'report') {
      // Navigate to reports page and trigger specific report viewing
      navigate(result.path, {
        state: {
          selectedReportId: result.id,
          reportData: result.reportData,
          fromSearch: true
        }
      });
    } else if (result.type === 'prescription') {
      // Navigate directly to specific prescription
      navigate(result.path);
    } else {
      // Default navigation for other types
      navigate(result.path);
    }
  }, [navigate]);

  // Handle keyboard navigation for search results
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSearchResults || searchResults.length === 0) return;

      // Arrow down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveResultIndex(prev => {
          const newIndex = prev < searchResults.length - 1 ? prev + 1 : prev;

          // Scroll the active item into view
          setTimeout(() => {
            const activeItem = document.querySelector(`[data-result-index="${newIndex}"]`);
            if (activeItem) {
              activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 10);

          return newIndex;
        });
      }

      // Arrow up
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveResultIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : 0;

          // Scroll the active item into view
          setTimeout(() => {
            const activeItem = document.querySelector(`[data-result-index="${newIndex}"]`);
            if (activeItem) {
              activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 10);

          return newIndex;
        });
      }

      // Enter key to select
      else if (e.key === 'Enter' && activeResultIndex >= 0) {
        e.preventDefault();
        handleSearchResultClick(searchResults[activeResultIndex]);
      }

      // Escape key to close
      else if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchResults, searchResults, activeResultIndex, handleSearchResultClick]);

  // Reset active index when search results change
  useEffect(() => {
    setActiveResultIndex(-1);
  }, [searchResults]);

  // Search Results Component - Optimized to prevent re-renders
  const SearchResults = useCallback(({ isMobile = false }) => {
    if (!showSearchResults) return null;

    return (
      <motion.div
        ref={searchResultsRef}
        initial={false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`absolute ${isMobile ? 'top-full left-0 right-0 mt-2' : 'top-full left-0 right-0 mt-3'} 
                   bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-2xl z-50 
                   max-h-96 overflow-hidden`}
        style={{ display: showSearchResults ? 'block' : 'none' }}
      >
        {/* Search Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">
                {isSearching ? 'Searching...' : `${searchResults.length} results found`}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {/* Category Filters */}
              <button
                onClick={() => setSearchCategories(prev => ({ ...prev, reports: !prev.reports }))}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${searchCategories.reports
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                Reports
              </button>
              <button
                onClick={() => setSearchCategories(prev => ({ ...prev, prescriptions: !prev.prescriptions }))}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${searchCategories.prescriptions
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                Prescriptions
              </button>
            </div>
          </div>
        </div>
        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Searching your health records...</span>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 text-center">No results found for "{searchQuery}"</p>
              <p className="text-xs text-gray-500 text-center mt-1">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchResultClick(result)}
                  onMouseEnter={() => setActiveResultIndex(index)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${activeResultIndex === index ? 'bg-blue-50' : ''
                    }`}
                  aria-selected={activeResultIndex === index}
                  role="option"
                  data-result-index={index}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.type === 'report' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                      {result.type === 'report' && <FileText className="w-4 h-4 text-blue-600" />}
                      {result.type === 'prescription' && <Clipboard className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                      <p className="text-xs text-gray-600 truncate">{result.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.metadata}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Search Footer */}
        {searchResults.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {searchResults.length} of {searchResults.length} results
              </span>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <kbd className="px-2 py-1 bg-white rounded border">↑↓</kbd>
                <span>navigate</span>
                <kbd className="px-2 py-1 bg-white rounded border">↵</kbd>
                <span>select</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }, [showSearchResults, isSearching, searchResults, searchCategories, searchQuery, handleSearchResultClick, activeResultIndex]);
  const menuCategories = [
    {
      title: "Main",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard",
          description: "View your health overview",
          badge: null
        },
        {
          icon: Calendar,
          label: "Appointments",
          path: "/dashboard/appointments",
          description: "Manage your appointments",
          badge: { text: "SOON", color: "bg-purple-500" }
        },
        {
          icon: Activity,
          label: "Health Stats",
          path: "/dashboard/health-stats",
          description: "Check your vital statistics",
          badge: { text: "SOON", color: "bg-purple-500" }
        }
      ]
    },
    {
      title: "Health Records",
      items: [
        {
          icon: Upload,
          label: "Upload",
          path: "/dashboard/upload",
          description: "Upload medical documents",
          badge: null
        },
        {
          icon: FileText,
          label: "Reports",
          path: "/dashboard/reports",
          description: "View your medical reports",
          badge: null
        },
        {
          icon: FolderOpen,
          label: "Emergency Folder",
          path: "/dashboard/emergency-folder",
          description: "Critical info for emergency access (QR / UMID)",
          badge: null
        },
        {
          icon: Shield,
          label: "Shared Reports",
          path: "/dashboard/shared-reports",
          description: "Manage reports shared with doctors",
          badge: { count: sharedReportsActiveCount, color: "bg-purple-500", hideWhenZero: true }
        },
        {
          icon: Users,
          label: "Family Vault",
          path: "/dashboard/family-vault",
          description: "Manage family health records",
          badge: null
        },
        {
          icon: Clipboard,
          label: "Digital Prescriptions",
          path: "/dashboard/digital-prescriptions",
          description: "View digital prescriptions",
          badge: null
        },
        {
          icon: Clock,
          label: "Prescription Reminders",
          path: "/dashboard/digital-prescriptions/reminders",
          description: "Manage medication reminders",
          badge: null
        },
        {
          icon: MessageCircle,
          label: "Consultations",
          path: "/dashboard/consultations",
          description: "Online doctor consultations",
          badge: { text: "SOON", color: "bg-purple-500" }
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          path: "/dashboard/profile",
          description: "Manage your profile",
          badge: null
        },
        {
          icon: Bell,
          label: "Notifications",
          path: "/dashboard/notifications",
          description: "Check your notifications",
          badge: { count: unreadNotificationsCount, color: "bg-yellow-500", hideWhenZero: false }
        },
        {
          icon: Settings,
          label: "Settings",
          path: "/dashboard/settings",
          description: "Customize settings",
          badge: null
        },
        {
          icon: HelpCircle,
          label: "Help",
          path: "/dashboard/help",
          description: "Get assistance",
          badge: null
        }
      ]
    }
  ];

  // Badge component for menu items
  const MenuBadge = ({ badge }) => {
    if (!badge || (badge.hideWhenZero && badge.count === 0)) return null;

    return (
      <span className={`${badge.color} text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] flex items-center justify-center`}>
        {badge.count !== undefined ? badge.count : badge.text}
      </span>
    );
  };

  // Ultra Modern Search Input
  const renderSearchInput = () => (
    <div className="relative group">
      {/* Enhanced Search Icon with Gradient */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:scale-110" />
          <div className="absolute inset-0 h-5 w-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Ultra Modern Search Input */}
      <input
        ref={searchInputRef}
        type="text"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
        placeholder="Search records, prescriptions, reports..."
        className="block w-full pl-12 pr-20 py-3.5 
                 border border-gray-200/80 rounded-3xl 
                 bg-gradient-to-r from-gray-50/90 via-white/95 to-blue-50/30
                 hover:from-white hover:via-white hover:to-blue-50/50
                 focus:from-white focus:via-white focus:to-blue-50/80
                 placeholder-gray-400 focus:placeholder-blue-300/80
                 text-sm font-medium
                 focus:outline-none focus:ring-3 focus:ring-blue-300/30 focus:border-blue-400/50
                 transition-all duration-400 ease-out transform
                 shadow-lg hover:shadow-xl focus:shadow-2xl hover:scale-[1.02] focus:scale-[1.02]
                 group-hover:border-blue-300/60 backdrop-blur-sm"
      />

      {/* Enhanced Floating Keyboard Shortcut */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-y-0 right-0 pr-4 items-center pointer-events-none flex"
        >
          <div className="flex items-center space-x-1">
            <kbd className="inline-flex items-center rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 px-2.5 py-1.5 text-xs font-mono text-blue-600 shadow-lg backdrop-blur-sm">
              <span className="text-blue-500">⌘</span>K
            </kbd>
          </div>
        </motion.div>
      )}

      {/* Enhanced Clear Search Button */}
      <AnimatePresence>
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              // Keep dropdown visible for a moment to show "no results" state
              setTimeout(() => setShowSearchResults(false), 300);
            }}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-7 h-7 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 rounded-xl transition-all duration-200 border border-red-200/50 flex items-center justify-center z-30"
          >
            <X className="h-4 w-4 text-red-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Search Results - Desktop Only */}
      <SearchResults />
    </div>
  );

  // Mobile search input
  const renderMobileSearchInput = () => (
    <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/50 p-1">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 transition-all duration-300" />
          <div className="absolute inset-0 h-5 w-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Enhanced Search Input */}
      <input
        ref={mobileInlineSearchInputRef}
        type="text"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
        placeholder="Search records, prescriptions, reports..."
        className="block w-full pl-12 pr-16 py-4 text-base
                 border-0 rounded-3xl 
                 bg-transparent
                 placeholder-gray-400 focus:placeholder-blue-300/80
                 font-medium
                 focus:outline-none
                 transition-all duration-400 ease-out"
        autoFocus
      />

      {/* Close Button */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <motion.button
          initial={{ opacity: 0, scale: 0.6, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsMobileSearchBarVisible(false);
            setSearchQuery('');
            setShowSearchResults(false);
          }}
          className="w-8 h-8 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 rounded-2xl transition-all duration-200 border border-red-200/50 flex items-center justify-center z-30 group"
          aria-label="Close search"
        >
          <X className="h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
        </motion.button>
      </div>
    </div>
  );

  // Tooltip component for collapsed sidebar
  const SidebarTooltip = () => {
    if (!tooltipData.show || !isSidebarCollapsed) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed z-[60] pointer-events-none"
        style={{
          left: tooltipData.x + 10,
          top: tooltipData.y - 10,
        }}
      >
        <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-xl shadow-2xl border border-gray-700/50 whitespace-nowrap">
          {tooltipData.text}
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-gray-900/95"></div>
        </div>
      </motion.div>
    );
  };

  // Handle tooltip show/hide
  const handleTooltipShow = (event, text) => {
    if (!isSidebarCollapsed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      show: true,
      text,
      x: rect.right,
      y: rect.top + rect.height / 2,
    });
  };

  const handleTooltipHide = () => {
    setTooltipData(prev => ({ ...prev, show: false }));
  };

  // Show authentication error message if needed
  if (refreshError && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">
            <X className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-6">
            We couldn't retrieve your user data. You'll be redirected to the login page shortly.
          </p>
          <button
            onClick={logout}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="mobile-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>


      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed
            ? "w-20"
            : "w-72"
          } bg-[#252A61] text-white z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 flex flex-col rounded-tr-3xl rounded-br-3xl shadow-xl transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center p-4 border-b border-white/10">
            {!isSidebarCollapsed ? (
              <Link to="/" className="flex items-center justify-center">
                <img
                  src={MedicareLogo}
                  alt="Medicare Logo"
                  className="w-32 h-auto"
                />
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center justify-center"
                onMouseEnter={(e) => handleTooltipShow(e, "Medicare Home")}
                onMouseLeave={handleTooltipHide}
              >
                <img
                  src={HandLogo}
                  alt="Medicare Hand Logo"
                  className="w-10 h-10 object-contain"
                />
              </Link>
            )}

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-2 right-2 p-1.5 bg-white/10 rounded-full hover:bg-white/20"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-2 overflow-y-auto">
            {menuCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-4">
                {!isSidebarCollapsed && (
                  <h3 className="text-xs uppercase text-white/50 px-2 mb-1 font-semibold tracking-wider flex items-center">
                    <span>{category.title}</span>
                    <div className="ml-2 h-px bg-white/20 grow"></div>
                  </h3>
                )}

                {category.items.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  const menuId = `${category.title}-${idx}`;

                  return (
                    <div key={menuId} className="relative">
                      <Link
                        to={item.path}
                        onClick={() => {
                          if (isSidebarOpen && window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        onMouseEnter={(e) => isSidebarCollapsed && handleTooltipShow(e, item.label)}
                        onMouseLeave={isSidebarCollapsed ? handleTooltipHide : undefined}
                        className={`flex ${isSidebarCollapsed ? "justify-center" : "items-center justify-between"} 
                          px-2 py-2 rounded-lg mb-1
                          ${isActive
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                      >
                        <div className={`flex ${!isSidebarCollapsed && "items-center space-x-2"}`}>
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                          {!isSidebarCollapsed && (
                            <span className="text-sm font-medium truncate flex-1">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!isSidebarCollapsed && (
                          <div className="flex items-center space-x-1">
                            {item.badge && <MenuBadge badge={item.badge} />}
                            {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                          </div>
                        )}

                        {isSidebarCollapsed && item.badge && (
                          <div className="absolute -top-1 -right-1">
                            <MenuBadge badge={item.badge} />
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer Section */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onMouseEnter={(e) => isSidebarCollapsed && handleTooltipShow(e, "Expand Sidebar")}
              onMouseLeave={isSidebarCollapsed ? handleTooltipHide : undefined}
              className={`flex ${isSidebarCollapsed ? "justify-center" : "items-center space-x-2"} w-full px-2 py-2 text-sm text-white/80 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 mb-2`}
            >
              <Menu className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="truncate">Collapse</span>}
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              onMouseEnter={(e) => isSidebarCollapsed && handleTooltipShow(e, "Logout")}
              onMouseLeave={isSidebarCollapsed ? handleTooltipHide : undefined}
              className={`flex ${isSidebarCollapsed ? "justify-center" : "items-center space-x-2"} w-full px-2 py-2 text-sm text-red-100 bg-red-500/20 rounded-lg hover:bg-red-500/30`}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="truncate">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Tooltip */}
      <SidebarTooltip />

      <div className={`flex-1 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"} transition-all duration-300 ease-in-out`}>
        {/* Ultra Modern Professional Navbar */}
        <nav className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-blue-200/50'
            : 'bg-white/98 backdrop-blur-lg shadow-xl border-b border-blue-200/30'
          }`}>
          <div className="max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-11 sm:h-12 lg:h-14' : 'h-12 sm:h-14 lg:h-16'
              }`}>
              {/* Left Section - Enhanced Mobile Menu + Dynamic Breadcrumb */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                {/* Ultra Modern Mobile Menu Button */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 text-blue-600 hover:text-blue-800 hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:ring-offset-1 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>

                {/* Enhanced Dynamic Breadcrumb Navigation - Desktop Only */}
                <div className="hidden lg:flex items-center space-x-2 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-1.5 text-xs sm:text-sm bg-gradient-to-r from-gray-50 to-blue-50/30 px-2.5 py-1 rounded-lg border border-gray-200/50"
                  >
                    <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-gray-600 font-medium">Dashboard</span>
                    {location.pathname !== '/dashboard' && (
                      <>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-blue-700 font-semibold capitalize truncate max-w-40"
                        >
                          {location.pathname.split('/').pop()?.replace('-', ' ') || 'Page'}
                        </motion.span>
                      </>
                    )}
                  </motion.div>
                </div>

                {/* Enhanced Page Title for Mobile & Tablet - Full Width */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:hidden min-w-0 flex-1"
                >
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                  </h1>
                </motion.div>
              </div>

              {/* Center Section - Desktop Only Modern Search Bar */}
              <div className="hidden lg:block flex-1 max-w-xl mx-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  {renderSearchInput()}
                </motion.div>
              </div>

              {/* Right Section - Ultra Modern Action Items */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2">
                {/* Mobile & Tablet Search Button */}
                <div className="lg:hidden relative">
                  <AnimatePresence mode="wait">
                    {!isMobileSearchBarVisible ? (
                      <motion.button
                        key="mobile-search-icon"
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setIsMobileSearchBarVisible(true)}
                        className="relative p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 text-blue-600 hover:text-blue-800 hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-3 focus:ring-blue-300/40 transition-all duration-300 shadow-lg hover:shadow-xl transform"
                        aria-label="Search your health records"
                      >
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Enhanced hover preview for mobile and tablet */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          whileHover={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-xl text-xs font-medium text-white bg-gray-800/90 backdrop-blur-sm whitespace-nowrap pointer-events-none z-50 hidden md:block"
                        >
                          Search health records
                        </motion.div>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="mobile-search-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => {
                          setIsMobileSearchBarVisible(false);
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                      />
                    )}
                  </AnimatePresence>
                  {/* Mobile Search Bar Overlay */}
                  <AnimatePresence>
                    {isMobileSearchBarVisible && (
                      <motion.div
                        key="mobile-search-bar"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="fixed top-4 left-4 right-4 z-50"
                      >
                        {renderMobileSearchInput()}
                        {/* Mobile Search Results */}
                        <SearchResults isMobile={true} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Ultra Modern Notifications with Gradient */}
                <div className="relative notifications-menu">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      if (!isNotificationsOpen && isAuthenticated) {
                        fetchNotifications(localStorage.getItem('token'));
                      }
                    }}
                    onMouseEnter={() => {
                      if (!isNotificationsOpen && isAuthenticated && (!notifications || notifications.length === 0)) {
                        fetchNotifications(localStorage.getItem('token'));
                      }
                    }}
                    className="relative p-2 sm:p-2.5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 text-purple-600 hover:text-purple-800 hover:from-purple-100 hover:to-pink-100 focus:outline-none focus:ring-3 focus:ring-purple-300/40 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform"
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadNotificationsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse ring-2 ring-white"
                      >
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </motion.span>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                  {/* Ultra Modern Enhanced Notifications Dropdown */}
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-purple-200/50 z-50 max-h-[32rem] overflow-hidden border border-gradient-to-br from-purple-100 to-pink-100"
                      >
                        {/* Enhanced Header */}
                        <div className="px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/80 via-white to-pink-50/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                <Bell className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              {unreadNotificationsCount > 0 && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                                >
                                  {unreadNotificationsCount} new
                                </motion.span>
                              )}
                              <Link
                                to="/dashboard/notifications"
                                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150 px-3 py-1 rounded-xl hover:bg-blue-50"
                                onClick={() => setIsNotificationsOpen(false)}
                              >
                                View All
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {patientStoreLoading ? (
                            <div className="py-12 text-center">
                              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">Loading notifications...</p>
                            </div>
                          ) : notifications && notifications.length > 0 ? (
                            <div className="py-2 space-y-1">
                              {notifications.slice(0, 5).map((notification, index) => (
                                <motion.button
                                  key={notification._id || notification.id || index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  onClick={() => {
                                    if (!notification.read) {
                                      markNotificationAsRead(localStorage.getItem('token'), notification._id || notification.id);
                                    }
                                    if (notification.type === 'prescription') {
                                      navigate('/dashboard/digital-prescriptions');
                                    } else if (notification.type === 'appointment') {
                                      navigate('/dashboard/appointments');
                                    } else if (notification.type === 'report') {
                                      navigate('/dashboard/reports');
                                    } else {
                                      navigate('/dashboard/notifications');
                                    }
                                    setIsNotificationsOpen(false);
                                  }}
                                  className="block w-full px-4 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-left border-b border-gray-50/50 last:border-b-0 group rounded-xl mx-2"
                                >
                                  <div className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 shadow-sm ${!notification.read
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse'
                                        : 'bg-gray-300'
                                      }`}></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'
                                            } group-hover:text-blue-900`}>
                                            {notification.title || notification.message || 'New notification'}
                                          </p>
                                          <p className="text-sm text-gray-500 truncate mt-1 group-hover:text-blue-700">
                                            {notification.description || notification.content || 'Click to view details'}
                                          </p>
                                          <p className="text-xs text-gray-400 mt-2 font-medium">
                                            {notification.createdAt
                                              ? new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })
                                              : 'Just now'
                                            }
                                          </p>
                                        </div>
                                        <div className="flex-shrink-0 ml-3">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${notification.type === 'prescription' ? 'bg-green-100 text-green-600' :
                                              notification.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                                                notification.type === 'report' ? 'bg-purple-100 text-purple-600' :
                                                  'bg-gray-100 text-gray-600'
                                            }`}>
                                            {notification.type === 'prescription' && <Clipboard className="h-4 w-4" />}
                                            {notification.type === 'appointment' && <Calendar className="h-4 w-4" />}
                                            {notification.type === 'report' && <FileText className="h-4 w-4" />}
                                            {(!notification.type || notification.type === 'general') && <Info className="h-4 w-4" />}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                              {notifications.length > 5 && (
                                <div className="px-4 py-3 text-center border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 mx-2 rounded-xl">
                                  <Link
                                    to="/dashboard/notifications"
                                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 transition-all duration-200"
                                    onClick={() => setIsNotificationsOpen(false)}
                                  >
                                    View {notifications.length - 5} more notifications →
                                  </Link>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-12 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center">
                                <Bell className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">No notifications</h3>
                              <p className="text-sm text-gray-500">You're all caught up! 🎉</p>
                            </div>
                          )}
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <div className="px-6 py-3 border-t border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                markAllNotificationsAsRead(localStorage.getItem('token'));
                                setIsNotificationsOpen(false);
                              }}
                              className="block w-full text-center py-3 text-sm text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              ✓ Mark all as read
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Ultra Modern Enhanced Profile Dropdown */}
                <div className="relative profile-menu">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/50 hover:from-indigo-100 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 transition-all duration-300 shadow-md hover:shadow-lg"
                    aria-label="Open profile menu"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden ring-2 ring-indigo-200 hover:ring-indigo-300 transition-all duration-200 shadow-md">
                        <DashboardProfilePicture user={user} className="w-8 h-8 sm:w-9 sm:h-9 object-cover" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-white rounded-full shadow-lg"
                      ></motion.div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs sm:text-sm font-bold truncate max-w-20 sm:max-w-24 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-20 sm:max-w-24 font-medium">
                        {user?.email || ''}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: isProfileOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="hidden sm:block h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
                    </motion.div>
                  </motion.button>
                  {/* Compact Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-indigo-200/50 z-50 border border-gradient-to-br from-indigo-100 to-blue-100 p-0.5"
                      >
                        {/* Compact Profile Header */}
                        <div className="flex items-center space-x-3 px-4 py-3 border-b border-indigo-100">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md">
                              <DashboardProfilePicture user={user} className="w-11 h-11 object-cover" />
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-white rounded-full shadow-lg"
                            ></motion.div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold truncate bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                              {user?.name || 'User Name'}
                            </p>
                            <p className="text-xs text-gray-500 truncate font-medium">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                        {/* Compact Menu Items */}
                        <div className="py-1">
                          {[
                            { icon: User, label: "Profile", path: "/dashboard/profile", color: "blue" },
                            { icon: Settings, label: "Settings", path: "/dashboard/settings", color: "purple" },
                            { icon: Bell, label: "Notifications", path: "/dashboard/notifications", color: "yellow", badge: unreadNotificationsCount },
                            { icon: HelpCircle, label: "Help", path: "/dashboard/help", color: "green" }
                          ].map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r ${item.color === 'blue' ? 'hover:from-blue-50 hover:to-blue-100' :
                                  item.color === 'purple' ? 'hover:from-purple-50 hover:to-purple-100' :
                                    item.color === 'yellow' ? 'hover:from-yellow-50 hover:to-yellow-100' :
                                      'hover:from-green-50 hover:to-green-100'
                                } transition-all duration-200 rounded-xl group`}
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${item.color === 'blue' ? 'bg-gradient-to-r from-blue-100 to-blue-200' :
                                  item.color === 'purple' ? 'bg-gradient-to-r from-purple-100 to-purple-200' :
                                    item.color === 'yellow' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200' :
                                      'bg-gradient-to-r from-green-100 to-green-200'
                                }`}>
                                <item.icon className={`w-5 h-5 ${item.color === 'blue' ? 'text-blue-600' :
                                    item.color === 'purple' ? 'text-purple-600' :
                                      item.color === 'yellow' ? 'text-yellow-600' :
                                        'text-green-600'
                                  }`} />
                              </div>
                              <span className="font-medium flex-1">{item.label}</span>
                              {item.badge > 0 && (
                                <span className={`text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-md ${item.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                    item.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                                      item.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                        'bg-gradient-to-r from-green-500 to-green-600'
                                  }`}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        {/* Divider */}
                        <div className="border-t border-red-100 my-1"></div>
                        {/* Compact Logout Section */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 rounded-xl group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                            <LogOut className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="font-semibold">Sign Out</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {/* Page Content */}
        <main className="">
          <Outlet />
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

export default DashboardLayout;