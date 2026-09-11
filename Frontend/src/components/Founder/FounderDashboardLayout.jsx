import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Menu, 
  X,
  LogOut, 
  Grid, 
  Users, 
  Settings, 
  Shield,
  Database,
  AlertCircle,
  FileText,
  Server,
  Activity,
  Bell,
  CreditCard,
  User,
  ChevronRight,
  ChevronLeft,
  Search,
  Moon,
  Sun,
  BarChart2,
  Briefcase,
  TrendingUp,
  Key,
  Eye,
  Lock
} from "lucide-react";
import Logo from "../../assets/Logo/textlogo.png";
import { useFounderStore } from "../../store/founderStore";
import { motion, AnimatePresence } from "framer-motion";
import { safeStorageAccess } from "../../utils/errorHandling";

const FounderDashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return safeStorageAccess.getItem('founderDarkMode') === 'true' || 
           document.documentElement.classList.contains('dark');
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [authVerified, setAuthVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use founder store hooks
  const { 
    founder, 
    isAuthenticated, 
    isLoading, 
    logout, 
    checkAuth 
  } = useFounderStore();
  
  // Check authentication on component mount - only once
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !authVerified) {
        try {
          await checkAuth();
          setAuthVerified(true);
        } catch (err) {
          console.error("Authentication check failed:", err);
          // Prevent infinite redirects by only navigating away if we have a valid error
          // and not just a missing endpoint
          if (err.response && err.response.status === 401) {
            navigate("/founder/login");
          } else {
            // For other errors like 404 Not Found, we'll still set authVerified
            // to prevent further checks, but we won't redirect
            setAuthVerified(true);
          }
        }
      } else if (isAuthenticated) {
        setAuthVerified(true);
      }
    };
    
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Redirect to login only if explicitly not authenticated (we got a 401)
  // and not loading and auth check is complete
  useEffect(() => {
    if (!isAuthenticated && !isLoading && authVerified && safeStorageAccess.getItem('founder_token') === null) {
      navigate("/founder/login");
    }
  }, [isAuthenticated, isLoading, navigate, authVerified]);
  
  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    safeStorageAccess.setItem('founderDarkMode', isDarkMode);
  }, [isDarkMode]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/founder/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  
  // Navigation items with grouped sections
  const navItems = [
    {
      section: "Overview",
      items: [
        { 
          name: "Executive Dashboard", 
          path: "/founder/dashboard", 
          icon: <Grid size={20} /> 
        },
        { 
          name: "Analytics", 
          path: "/founder/analytics", 
          icon: <BarChart2 size={20} /> 
        },
        { 
          name: "Business Metrics", 
          path: "/founder/metrics", 
          icon: <TrendingUp size={20} /> 
        },
      ]
    },
    {
      section: "Administration",
      items: [
        { 
          name: "User Management", 
          path: "/founder/users", 
          icon: <Users size={20} /> 
        },
        { 
          name: "Admin Management", 
          path: "/founder/admins", 
          icon: <Shield size={20} /> 
        },
        { 
          name: "Staff Directory", 
          path: "/founder/staff", 
          icon: <Users size={20} /> 
        },
        { 
          name: "Team Management", 
          path: "/founder/team-management", 
          icon: <Users size={20} /> 
        },
      ]
    },
    {
      section: "Platform",
      items: [
        { 
          name: "System Health", 
          path: "/founder/system-health", 
          icon: <Activity size={20} /> 
        },
        { 
          name: "Security Center", 
          path: "/founder/security", 
          icon: <Lock size={20} /> 
        },
        { 
          name: "Database Management", 
          path: "/founder/database", 
          icon: <Database size={20} /> 
        },
        { 
          name: "API Configuration", 
          path: "/founder/api-config", 
          icon: <Server size={20} /> 
        },
        { 
          name: "Logs & Reports", 
          path: "/founder/logs", 
          icon: <FileText size={20} /> 
        },
      ]
    },
    {
      section: "Finance & Settings",
      items: [
        { 
          name: "Billing & Subscription", 
          path: "/founder/billing", 
          icon: <CreditCard size={20} /> 
        },
        { 
          name: "Access Control", 
          path: "/founder/access-control", 
          icon: <Key size={20} /> 
        },
        { 
          name: "Privacy Settings", 
          path: "/founder/privacy", 
          icon: <Eye size={20} /> 
        },
        { 
          name: "Settings", 
          path: "/founder/settings", 
          icon: <Settings size={20} /> 
        },
      ]
    }
  ];
  
  // Check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Sidebar toggle
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Show loading spinner if checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        <motion.div 
          initial={{ x: -20, opacity: 0.8 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            width: collapsed ? "5rem" : "16rem"
          }}
          transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
          className={`fixed inset-y-0 left-0 z-30 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-xl lg:shadow transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar header with logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-linear-to-r from-blue-700 to-indigo-800 dark:from-blue-900 dark:to-indigo-950">
            <motion.div 
              initial={false}
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
              className="flex items-center overflow-hidden"
            >
              <img src={Logo} alt="Medicare Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-semibold text-white whitespace-nowrap">Medicare</span>
            </motion.div>
            {!collapsed && (
              <button
                className="lg:hidden text-white focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            )}
            <button
              className="hidden lg:block text-white focus:outline-none"
              onClick={toggleCollapsed}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          {/* Founder profile summary */}
          {founder && (
            <div className={`flex items-center px-4 py-3 bg-blue-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 ${collapsed ? "justify-center" : ""}`}>
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white overflow-hidden ring-2 ring-white dark:ring-gray-700">
                {founder.photoURL ? (
                  <img 
                    src={founder.photoURL}
                    alt={founder.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              
              {!collapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{founder.name}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">CEO & Founder</p>
                </div>
              )}
            </div>
          )}
          
          {/* Search bar - only in expanded mode */}
          {!collapsed && (
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-600 placeholder-gray-500"
                />
              </div>
            </div>
          )}
          
          {/* Navigation links */}
          <div className={`${collapsed ? "py-2" : "py-4"} px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700`}>
            {navItems.map((section, idx) => (
              <div key={idx} className="mb-4">
                {!collapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {section.section}
                  </h3>
                )}
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center ${collapsed ? "justify-center px-2" : "px-3"} py-2 my-1 text-sm font-medium rounded-lg transition-all duration-150
                      ${isActive(item.path) 
                        ? "bg-linear-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-500" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60"}
                    `}
                    title={collapsed ? item.name : ""}
                  >
                    <span className={collapsed ? "mx-auto" : "mr-3"}>{item.icon}</span>
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          
          {/* Footer actions */}
          <div className={`absolute bottom-0 w-full p-2 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${collapsed ? "flex flex-col items-center" : ""}`}>
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center ${collapsed ? "justify-center w-10 h-10" : "w-full px-3 py-2"} text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150 mb-1`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun size={20} className={`${collapsed ? "" : "mr-3"} text-amber-500`} />
              ) : (
                <Moon size={20} className={`${collapsed ? "" : "mr-3"} text-indigo-600`} />
              )}
              {!collapsed && (
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              )}
            </button>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className={`flex items-center ${collapsed ? "justify-center w-10 h-10" : "w-full px-3 py-2"} text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150`}
              title="Logout"
            >
              <LogOut size={20} className={`${collapsed ? "" : "mr-3"} text-red-500`} />
              {!collapsed && (
                <span>Logout</span>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm z-10 sticky top-0">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white tracking-tight">
                {navItems.flatMap(section => section.items).find(item => isActive(item.path))?.name || "Executive Dashboard"}
              </h1>
            </div>
            
            {/* Right side header controls */}
            <div className="flex items-center space-x-3">
              <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
              
              <div className="flex items-center ml-2">
                <div className="hidden sm:block mr-3 text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{founder?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CEO & Founder</p>
                </div>
                
                <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 overflow-hidden ring-2 ring-white dark:ring-gray-700">
                  {founder?.photoURL ? (
                    <img 
                      src={founder.photoURL}
                      alt={founder.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white">
                      <User size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content scrollable area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FounderDashboardLayout; 