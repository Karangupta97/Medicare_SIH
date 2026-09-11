import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import QRCodeModal from "../../components/User/QRCodeModal";
import ProfilePhotoModal from "../../components/User/ProfilePhotoModal";
import PrescriptionCard from "../../components/User/DigitalPrescriptionCard";
import StorageUsageWidget from "../../components/StorageUsageWidget";
import { io } from "socket.io-client";
import MedicareLogo from "@assets/Logo/logo.png";
import {
  LayoutGrid,
  Target,
  Heart,
  Clock,
  FileText,
  HelpCircle,
  AlertTriangle,
  Upload,
  Image,
  File,
  Calendar,
  Eye,
  Download,
  ChevronRight,
  HardDrive,
  Folder,
  Clipboard,
  Search,
  Shield,
  CreditCard,
  Copy,
  Layers,
  CheckCircle,
  Bell,
  Info,
} from "lucide-react";
import { useAuthStore } from "../../store/Patient/authStore";
import { toast } from "react-hot-toast";
import usePatientStore from "../../store/Patient/patientstore";
import { getStorageLimitForPlan, getStorageLimitLabel } from "../../config/planConfig";

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const {
    reports,
    prescriptions,
    notifications,
    isLoading,  
    error,
    fetchReports,
    fetchPrescriptions,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    handleViewReport
  } = usePatientStore();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isProfilePhotoModalOpen, setIsProfilePhotoModalOpen] = useState(false);

  // Initial data fetch with token check
  useEffect(() => {
    if (token) {
      const loadInitialData = async () => {
        try {
          if (!token) {
            console.log("No token available, waiting for authentication...");
            return;
          }

          setIsInitialLoad(true);
          // Load only data required on this screen to avoid unnecessary API calls.
          await Promise.all([
            fetchReports(token),
            fetchPrescriptions(token),
            fetchNotifications(token),
          ]);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          toast.error("Unable to load dashboard data. Please try again later.");
        } finally {
          setIsInitialLoad(false);
        }
      };

      loadInitialData();
    }
  }, [token, fetchReports, fetchPrescriptions, fetchNotifications]);

  // Handler for opening profile photo modal
  const handleProfilePhotoClick = () => { 
    setIsProfilePhotoModalOpen(true);
  };

  // WebSocket connection
  useEffect(() => {
    if (!token || !user?._id) return;

    let socket;

    const connectSocket = () => {
      console.log("Setting up WebSocket connection for notifications");

      const rawApiUrl = import.meta.env.VITE_API_URL;
      const apiBaseUrl =
        rawApiUrl && rawApiUrl !== "undefined"
          ? rawApiUrl
          : "https://medicare-backend-vl01.onrender.com";

      if (window.socket) {
        console.log("Socket already exists, not creating a new one");
        return;
      }

      socket = io(apiBaseUrl, {
        path: "/socket.io",
        // Start with polling so Socket.IO can safely upgrade to websocket when available.
        transports: ["polling", "websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
        timeout: 30000,
        autoConnect: true,
        forceNew: false,
        auth: {
          token,
          userId: user._id,
        },
      });

      window.socket = socket;

      socket.on("connect", () => {
        console.log("WebSocket connection established with ID:", socket.id);
        window.hasShownSocketError = false;

        if (user?._id) {
          socket.emit("authenticate", user._id);
          console.log("Sent authentication for user:", user._id);
        }
      });

      socket.on("connect_error", (error) => {
        console.error(
          "WebSocket connection error:",
          error.message || "server error"
        );

        if (!window.hasShownSocketError) {
          console.warn(
            "Unable to establish real-time connection. Notifications will update manually."
          );
          window.hasShownSocketError = true;
        }
      });

      socket.on("notification", (notification) => {
        console.log("Received real-time notification:", notification);

        if (notification.title === "Connection Established") {
          return;
        }

        fetchNotifications(token);
        showNotificationToast(notification);
      });

      socket.on("disconnect", (reason) => {
        console.warn("WebSocket disconnected:", reason);
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    };

    connectSocket();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (socket) {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("notification");
        socket.off("disconnect");
        socket.off("error");
        socket.disconnect();
        if (window.socket === socket) {
          window.socket = null;
        }
      }
    };
  }, [token, user?._id]);

  // Show toast notification
  const showNotificationToast = (notification) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div
                className={`shrink-0 pt-0.5 rounded-full p-1 ${
                  notification.type === "warning" ||
                  notification.type === "error"
                    ? "bg-amber-100"
                    : notification.type === "success"
                    ? "bg-green-100"
                    : "bg-blue-100"
                }`}
              >
                {notification.type === "warning" ||
                notification.type === "error" ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Bell className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title || "New Notification"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };
  // Handler for notification click
  const handleNotificationClick = (id) => {
    markNotificationAsRead(token, id);
  };

  const recentReports = reports
    .filter((r) => r.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Calculate storage statistics
  const totalStorageUsed = reports.reduce(
    (acc, report) => acc + (report.fileSize || 0),
    0
  );
  const storageLimit = getStorageLimitForPlan(user?.planType);
  const storageLimitLabel = getStorageLimitLabel(user?.planType);
  const usedStorageInMB = (totalStorageUsed / (1024 * 1024)).toFixed(2);
  const storagePercentage = ((totalStorageUsed / storageLimit) * 100).toFixed(
    1
  );

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Components
  // const WelcomeHeader = () => (
  //   <motion.div
  //     initial={{ opacity: 0, y: -20 }}
  //     animate={{ opacity: 1, y: 0 }}
  //     transition={{ duration: 0.5 }}
  //     className="mb-4 sm:mb-6 md:mb-8"
  //   >
  //     <div className="bg-linear-to-r from-blue-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-blue-100">
  //       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 md:gap-4">
  //         <div className="flex items-center gap-2 sm:gap-3">
  //           <div className="hidden md:flex h-10 sm:h-12 md:h-16 w-10 sm:w-12 md:w-16 rounded-full bg-blue-600 shadow-md items-center justify-center overflow-hidden">
  //             {user?.photoURL ? (
  //               <img
  //                 src={user.photoURL}
  //                 alt={user.name}
  //                 className="h-10 sm:h-12 md:h-16 w-10 sm:w-12 md:w-16 rounded-full object-cover border-2 sm:border-3 md:border-4 border-white"
  //               />
  //             ) : (
  //               <div className="h-10 sm:h-12 md:h-16 w-10 sm:w-12 md:w-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg sm:text-xl md:text-2xl flex items-center justify-center">
  //                 {user?.name?.charAt(0) || "U"}
  //               </div>
  //             )}
  //           </div>
  //           <div>
  //             <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
  //               {user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Welcome"}
  //             </h1>
  //             <div className="flex items-center text-gray-600 text-xs sm:text-sm md:text-base">
  //               <Calendar className="mr-1 sm:mr-2 text-blue-600" size={14} />
  //               <p className="font-medium">
  //                 {new Date().toLocaleDateString("en-US", {
  //                   weekday: "long",
  //                   month: "long",
  //                   day: "numeric",
  //                 })}
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-0">
  //           <Link
  //             to="/dashboard/notifications"
  //             className="relative p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white hover:bg-gray-100 transition-colors cursor-pointer shadow-sm border border-gray-100"
  //           >
  //             <FiBell size={18} className="text-gray-600" />
  //             {unreadNotificationsCount > 0 && (
  //               <span className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
  //                 {unreadNotificationsCount > 9
  //                   ? "9+"
  //                   : unreadNotificationsCount}
  //               </span>
  //             )}
  //           </Link>

  //           <a
  //             href="/settings"
  //             className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
  //           >
  //             <FiSettings size={18} className="text-gray-600" />
  //           </a>

  //           <div className="md:hidden flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
  //             <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-blue-500 shadow-md">
  //               {user?.photoURL ? (
  //                 <img
  //                   src={user.photoURL}
  //                   alt={user.name}
  //                   className="w-full h-full object-cover"
  //                 />
  //               ) : (
  //                 <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
  //                   {user?.name?.charAt(0) || "U"}
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           <motion.button
  //             whileHover={{ scale: 1.03 }}
  //             whileTap={{ scale: 0.97 }}
  //             onClick={() => setIsQRCodeModalOpen(true)}
  //             className="hidden md:flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm shadow-md"
  //           >
  //             <FiGrid size={12} />
  //             My Medicare ID
  //           </motion.button>
  //         </div>
  //       </div>
  //     </div>
  //   </motion.div>
  // );

//Your Medicare Dashboard
  const HealthOverviewPanel = () => (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6"
    >
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
        {/* Header Section - Responsive height */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-white">
            <Shield className="text-white drop-shadow-md w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold drop-shadow-md text-center">
              Your Medicare Dashboard
            </h2>
          </div>
        </div>
        
        {/* Content Section - Mobile-first responsive layout */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Mobile Layout - Profile photo left, info right */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* Top Section: Profile + User Info */}
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Profile Picture */}
              <div 
                onClick={handleProfilePhotoClick}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-white shadow-xl bg-white transform hover:scale-105 transition-transform duration-300 flex-shrink-0 cursor-pointer"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              {/* User Info - Right side */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight truncate">
                  {user?.name
                    ? `Welcome, ${user.name.split(" ")[0]}`
                    : "Welcome"}
                </h1>
                <p className="text-sm text-gray-600 font-medium mt-0.5">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Bottom Section: Badges */}
            <div className="flex flex-col gap-2">
              {user?.umid && (
                <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-blue-100 group">
                  <Shield className="mr-2 flex-shrink-0" size={14} />
                  <div className="flex-1 truncate relative group/umid">
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                      navigator.clipboard.writeText(user.umid);
                      toast.success("Medicare ID copied to clipboard");
                      }}
                    >
                      UMID: {user.umid}
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/umid:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Unique Medicare Identification
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigator.clipboard.writeText(user.umid);
                      toast.success("Medicare ID copied to clipboard");
                    }}
                    className="ml-2 p-1 bg-white/50 hover:bg-white group-hover:bg-white rounded-full text-blue-600 transition-colors flex-shrink-0"
                    title="Copy Medicare ID"
                  >
                    <Copy size={12} />
                  </motion.button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {user?.verified && (
                  <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-green-100 flex-1 min-w-0">
                    <CheckCircle className="mr-2 flex-shrink-0" size={14} />
                    <span>Verified</span>
                  </div>
                )}
                
                {user?.planType && (
                  <div className="flex items-center text-purple-700 bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-purple-100 flex-1 min-w-0">
                    <CreditCard className="mr-2 flex-shrink-0" size={14} />
                    <span className="truncate">Plan: {user.planType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Side by side */}
          <div className="hidden md:flex items-center gap-6">
            {/* Profile Picture - Desktop */}
            <div 
              onClick={handleProfilePhotoClick}
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white transform hover:scale-105 transition-transform duration-300 flex-shrink-0 cursor-pointer"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl lg:text-3xl">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* Welcome Section - Desktop */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
                  {user?.name
                    ? `Welcome, ${user.name.split(" ")[0]}`
                    : "Welcome"}
                </h1>
                <p className="text-base text-gray-600 font-medium mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              
              {/* Badges - Desktop */}
              <div className="flex flex-wrap gap-2">
                {user?.umid && (
                  <div className="inline-flex items-center text-blue-700 bg-blue-50 px-3 py-2 rounded-full text-sm font-medium shadow-sm border border-blue-100 group">
                    <Shield className="mr-2" size={14} />
                    <div className="relative group/umid">
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                        navigator.clipboard.writeText(user.umid);
                        toast.success("Medicare ID copied to clipboard");
                        }}
                      >
                        UMID: {user.umid}
                      </span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/umid:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        Unique Medicare Identification
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        navigator.clipboard.writeText(user.umid);
                        toast.success("Medicare ID copied to clipboard");
                      }}
                      className="ml-2 p-1 bg-white/50 hover:bg-white group-hover:bg-white rounded-full text-blue-600 transition-colors"
                      title="Copy Medicare ID"
                    >
                      <Copy size={12} />
                    </motion.button>
                  </div>
                )}
                {user?.verified && (
                  <div className="inline-flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-full text-sm font-medium shadow-sm border border-green-100">
                    <CheckCircle className="mr-2" size={14} />
                    Verified
                  </div>
                )}
                {user?.planType && (
                  <div className="inline-flex items-center text-purple-700 bg-purple-50 px-3 py-2 rounded-full text-sm font-medium shadow-sm border border-purple-100">
                    <CreditCard className="mr-2" size={14} />
                    Plan: {user.planType}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const HealthStatsPanel = () => (
    <motion.div variants={itemVariants}>
      {/* Mobile/Small Layout: [Reports | Prescriptions] above [Storage] */}
      <div className="block lg:hidden">
        {/* Top Row: Reports and Prescriptions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm mr-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Total Reports
                    </h3>
                    <p className="text-xs text-gray-500">Health records</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  {reports.length}
                </p>
                <Link
                  to="/dashboard/reports"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center group"
                >
                  View
                  <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm mr-3">
                    <Clipboard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Total Prescriptions
                    </h3>
                    <p className="text-xs text-gray-500">Active meds</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                  {prescriptions ? prescriptions.length : 0}
                </p>
                <Link
                  to="/dashboard/digital-prescriptions"
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center group"
                >
                  Manage
                  <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Storage Used - Full width */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-sm mr-4">
                  <HardDrive className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base">
                    Storage Used
                  </h3>
                  <p className="text-sm text-gray-500">
                    {storagePercentage}% of {storageLimitLabel} limit
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                  {usedStorageInMB} MB
                </p>
                <p
                  className={`text-sm font-medium ${
                    storagePercentage > 90
                      ? "text-red-500"
                      : storagePercentage > 70
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {storagePercentage > 90
                    ? "Consider upgrading"
                    : storagePercentage > 70
                    ? "Great progress!"
                    : `${storagePercentage}% used`}
                </p>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="flex-1 bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ease-out relative ${
                    storagePercentage > 90
                      ? "bg-gradient-to-r from-red-400 to-red-600"
                      : storagePercentage > 70
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : "bg-gradient-to-r from-green-400 to-green-600"
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
                </div>
              </div>

              {/* Grateful Warning Message */}
              {storagePercentage > 70 && (
                <div
                  className={`mt-3 p-3 rounded-lg border-l-4 ${
                    storagePercentage > 90
                      ? "bg-red-50 border-red-400"
                      : "bg-yellow-50 border-yellow-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        storagePercentage > 90
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {storagePercentage > 90 ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Info className="w-3 h-3" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          storagePercentage > 90
                            ? "text-red-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {storagePercentage > 90
                          ? "Thank you for using Medicare! 🎉"
                          : "Wonderful progress with your health records! 🌟"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          storagePercentage > 90
                            ? "text-red-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {storagePercentage > 90
                          ? "You've made excellent use of your storage. Consider upgrading your plan for more space to continue your health journey."
                          : "You're making great use of your storage space. Keep up the excellent work managing your health documents!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop/Large Layout: [Reports | Prescriptions | Storage] */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between flex-1">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <FileText className="text-blue-600 mr-3 w-6 h-6" />
                  <h3 className="font-semibold text-gray-800 text-base">
                    Total Reports
                  </h3>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                    {reports.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Health records</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm ml-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
                              <Link
                  to="/dashboard/reports"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center group"
                >
                  View all reports
                <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between flex-1">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Clipboard className="text-indigo-600 mr-3 w-6 h-6" />
                  <h3 className="font-semibold text-gray-800 text-base">
                    Total Prescriptions
                  </h3>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                    {prescriptions ? prescriptions.length : 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Active prescriptions
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm ml-4">
                <Clipboard className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
                              <Link
                  to="/dashboard/digital-prescriptions"
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center group"
                >
                  Manage prescriptions
                <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between flex-1">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <HardDrive className="text-teal-600 mr-3 w-6 h-6" />
                  <h3 className="font-semibold text-gray-800 text-base">
                    Storage Used
                  </h3>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                    {usedStorageInMB} MB / {storageLimitLabel}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {storagePercentage}% of limit
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-sm ml-4">
                <HardDrive className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      storagePercentage > 90
                        ? "bg-gradient-to-r from-red-400 to-red-600"
                        : storagePercentage > 70
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        : "bg-gradient-to-r from-green-400 to-green-600"
                    }`}
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  />
                </div>
                <p
                  className={`text-sm font-medium ${
                    storagePercentage > 90
                      ? "text-red-500"
                      : storagePercentage > 70
                      ? "text-yellow-500"
                      : "text-green-500"
                  } whitespace-nowrap`}
                >
                  {storagePercentage > 90
                    ? "Consider upgrading"
                    : storagePercentage > 70
                    ? "Great progress!"
                    : `${storagePercentage}% used`}
                </p>
              </div>

              {/* Grateful Warning Message for Desktop */}
              {storagePercentage > 70 && (
                <div
                  className={`mt-3 p-3 rounded-lg border-l-4 ${
                    storagePercentage > 90
                      ? "bg-red-50 border-red-400"
                      : "bg-yellow-50 border-yellow-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        storagePercentage > 90
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {storagePercentage > 90 ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Info className="w-3 h-3" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          storagePercentage > 90
                            ? "text-red-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {storagePercentage > 90
                          ? "Thank you for using Medicare! 🎉"
                          : "Wonderful progress with your health records! 🌟"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          storagePercentage > 90
                            ? "text-red-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {storagePercentage > 90
                          ? "You've made excellent use of your storage. Consider upgrading your plan for more space to continue your health journey."
                          : "You're making great use of your storage space. Keep up the excellent work managing your health documents!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Dedicated function for Notifications component
  const NotificationsPanel = () => {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
      >
        <div className="border-b border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-violet-100 to-violet-200">
          <h3 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
            <Bell className="mr-1.5 sm:mr-2 text-violet-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
            Notifications
          </h3>
        </div>
        <div className="p-3 sm:p-4">
          {notifications.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <motion.div
                  key={`notification-${
                    notification._id || notification.id || Math.random()
                  }`}
                  onClick={() =>
                    handleNotificationClick(notification._id || notification.id)
                  }
                  whileHover={{ x: 3 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all ${
                    notification.read
                      ? "bg-white hover:bg-gray-50 border border-gray-100"
                      : "bg-violet-50 hover:bg-violet-100 border border-violet-200"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`p-1.5 sm:p-2 rounded-full ${
                        notification.type === "reminder"
                          ? "bg-amber-100 text-amber-600"
                          : notification.type === "appointment"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {notification.type === "reminder" && (
                        <Clock
                          size={12}
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        />
                      )}
                      {notification.type === "appointment" && (
                        <Calendar
                          size={12}
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        />
                      )}
                      {notification.type === "report" && (
                        <FileText
                          size={12}
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        />
                      )}
                      {notification.type !== "reminder" &&
                        notification.type !== "appointment" &&
                        notification.type !== "report" && (
                          <Bell
                            size={12}
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                          />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs sm:text-sm font-medium truncate">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-600 rounded-full mt-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-violet-50 flex items-center justify-center mb-2 sm:mb-3">
                <Bell className="text-violet-400 text-base sm:text-lg" />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                No notifications
              </p>
            </div>
          )}

          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 flex justify-between">
                          <motion.a
              href="/dashboard/notifications"
              whileHover={{ x: 3 }}
              className="text-xs sm:text-sm text-violet-600 hover:text-violet-800 flex items-center gap-1 font-medium"
            >
              View all notifications{" "}
              <ChevronRight
                size={12}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform"
              />
            </motion.a>

            {notifications.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => markAllNotificationsAsRead(token)}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors"
              >
                Mark all as read
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const ContentSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
      {/* Main content area (3/5 width) */}
      <div className="lg:col-span-3 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Recent Uploaded Reports - Enhanced Responsive Design */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
        >
          {/* Header Section - Responsive */}
          <div className="border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl shadow-sm">
                  <FileText className="text-indigo-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                    Recent Uploaded Reports
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    Your latest medical documents
                  </p>
                </div>
              </div>
              <motion.a
                href="/dashboard/upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 bg-white/80 hover:bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm transition-all duration-300 font-medium border border-indigo-100 hover:border-indigo-200"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Upload new</span>
              </motion.a>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {recentReports.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Mobile/Small Layout: Stacked Cards */}
                <div className="block lg:hidden space-y-3">
                  {recentReports.map((report, idx) => (
                    <motion.div
                      key={report._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 sm:p-4 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        {/* File Icon */}
                        <div className="p-2.5 bg-indigo-100 rounded-lg flex-shrink-0">
                          {report.contentType?.startsWith("image/") ? (
                            <div className="w-5 h-5 bg-purple-100 rounded-sm flex items-center justify-center">
                              <Image className="text-purple-600 w-3 h-3" />
                            </div>
                          ) : report.contentType === "application/pdf" ? (
                            <div className="w-5 h-5 bg-red-100 rounded-sm flex items-center justify-center">
                              <File className="text-red-600 w-3 h-3" />
                            </div>
                          ) : (
                            <FileText className="text-indigo-600 w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate mb-1">
                                {report.originalFilename || `Report ${idx + 1}`}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(
                                    report.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                {report.fileSize && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {(report.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Category Badge */}
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ml-2 ${
                                report.category === "medical"
                                  ? "bg-green-100 text-green-800"
                                  : report.category === "lab"
                                  ? "bg-purple-100 text-purple-800"
                                  : report.category === "prescription"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.category?.charAt(0).toUpperCase() +
                                report.category?.slice(1)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewReport(report)}
                              className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toast.info("Download feature is currently unavailable")}
                              className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Large Layout: Compact List */}
                <div className="hidden lg:block space-y-2">
                  {recentReports.map((report, idx) => (
                    <motion.div
                      key={report._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{
                        y: -1,
                        backgroundColor: "rgb(249 250 251)",
                      }}
                      className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group"
                    >
                      {/* File Icon */}
                      <div className="p-2 bg-indigo-100 rounded-lg mr-3 flex-shrink-0">
                        {report.contentType?.startsWith("image/") ? (
                          <Image className="text-purple-600 w-4 h-4" />
                        ) : report.contentType === "application/pdf" ? (
                          <File className="text-red-600 w-4 h-4" />
                        ) : (
                          <FileText className="text-indigo-600 w-4 h-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-800 text-sm truncate">
                            {report.originalFilename || `Report ${idx + 1}`}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              report.category === "medical"
                                ? "bg-green-100 text-green-800"
                                : report.category === "lab"
                                ? "bg-purple-100 text-purple-800"
                                : report.category === "prescription"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.category?.charAt(0).toUpperCase() +
                              report.category?.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="mr-1 w-3 h-3" />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString(
                              "en-US",
                              {
                              month: "short",
                              day: "numeric",
                              }
                            )}
                          </span>
                          {report.fileSize && (
                            <>
                              <span className="mx-1">•</span>
                              <span>
                                {(report.fileSize / 1024).toFixed(1)} KB
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewReport(report)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toast.info("Download feature is currently unavailable")}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer - View All Link */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                      <motion.a
                    href="/dashboard/reports"
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm group transition-colors"
                  >
                    View all health records
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {reports.length} total reports
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {(
                          reports.reduce(
                            (acc, r) => acc + (r.fileSize || 0),
                            0
                          ) /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB used
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm"
                >
                  <FileText className="text-indigo-400 text-2xl sm:text-3xl" />
                </motion.div>
                <h4 className="text-gray-800 font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  No health records yet
                </h4>
                <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8 max-w-sm leading-relaxed">
                  Upload your medical documents to securely store and access
                  them anytime, anywhere.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <motion.a
                    href="/dashboard/upload"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    Upload your first document
                  </motion.a>
                  <motion.a
                    href="/dashboard/reports"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Folder className="w-4 h-4" />
                    Browse reports
                  </motion.a>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Digital Prescriptions Section */}
        <motion.section
          variants={itemVariants}
          className="mb-4 sm:mb-5 md:mb-6"
        >
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-linear-to-r from-blue-50 to-cyan-50 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 sm:mr-3">
                  <Clipboard className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                  Digital Prescriptions
                </h3>
              </div>
              <motion.a
                href="/dashboard/digital-prescriptions"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 bg-white/80 hover:bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm transition-all duration-300 font-medium border border-indigo-100 hover:border-indigo-200"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>View all</span>
              </motion.a>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {prescriptions && prescriptions.length > 0 ? (
                <div>
                  {/* Horizontal scrolling container for all device sizes */}
                  <div className="flex overflow-x-auto pb-2 gap-3 sm:gap-4 snap-x">
                    {prescriptions.slice(0, 3).map((prescription, index) => (
                      <motion.div
                        key={prescription._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="transform transition-all duration-300 min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start"
                      >
                        <PrescriptionCard
                          prescription={prescription}
                          onView={(prescription) => {
                            window.open(
                              `/dashboard/digital-prescriptions/${prescription._id}`,
                              "_blank"
                            );
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="mb-2 sm:mb-0">
                        <span className="text-xs sm:text-sm text-gray-500">
                          Recent medications
                        </span>
                        <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                          {prescriptions ? prescriptions.length : 0} active
                          prescriptions
                        </h4>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <motion.a
                          href="/dashboard/digital-prescriptions"
                          className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Clipboard size={12} className="sm:w-4 sm:h-4" />{" "}
                          Manage medications
                        </motion.a>

                        <motion.a
                          href="/dashboard/digital-prescriptions/reminders"
                          className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Clock size={12} className="sm:w-4 sm:h-4" /> Set
                          reminders
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Clipboard className="text-blue-400 text-base sm:text-xl" />
                  </div>
                  <h4 className="text-gray-800 font-medium text-sm sm:text-base mb-1 sm:mb-2">
                    No digital prescriptions
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm max-w-md mb-3 sm:mb-4">
                    Your digital prescriptions from doctors' visits will appear
                    here for easy access and reference.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <motion.a
                      href="/dashboard/find-doctor"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 transition-colors"
                    >
                      <Search size={12} className="sm:w-4 sm:h-4" /> Find a
                      doctor
                    </motion.a>
                    <motion.a
                      href="/dashboard/digital-prescriptions/request"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 transition-colors"
                    >
                      <Clipboard size={12} className="sm:w-4 sm:h-4" /> Request
                      prescription
                    </motion.a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Health Plan Summary */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <h3 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center">
              <Shield className="mr-1.5 sm:mr-2 text-teal-600 w-4 h-4 sm:w-5 sm:h-5" />{" "}
              Your Medicare Coverage
            </h3>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Medicare ID Section - Now with improved responsive layout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2 sm:p-3 bg-teal-100 rounded-lg">
                  <CreditCard className="text-teal-600 text-base sm:text-xl" />
                </div>
                <div className="flex-1 sm:flex-none">
                  <span className="text-xs sm:text-sm text-gray-500 block sm:inline-block sm:mr-2">
                    Medicare ID:
                  </span>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                      {user?.umid || "Not available"}
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (!user?.umid) {
                          toast.error("Medicare ID not available");
                          return;
                        }
                        navigator.clipboard.writeText(user.umid);
                        toast.success("Medicare ID copied to clipboard");
                      }}
                      className="p-1 sm:p-1.5 bg-teal-50 hover:bg-teal-100 rounded-full text-teal-600 transition-colors"
                      title="Copy Medicare ID"
                    >
                      <Copy size={12} className="sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
              {user?.verified && (
                <span className="ml-auto bg-teal-100 text-teal-800 text-xs py-1 px-2 rounded-full font-medium">
                  Verified
                </span>
              )}
            </div>

            {/* Plan Details - Now in a responsive grid */}
            <div className="flex flex-row gap-3 sm:gap-5 mb-4 sm:mb-6 overflow-x-auto">
              <div className="bg-gray-50 p-3 rounded-lg min-w-[140px] flex-1">
                <span className="text-xs sm:text-sm text-gray-500 block mb-1">
                  Plan type
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                  {user?.planType || "Not provided"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg min-w-[140px] flex-1">
                <span className="text-xs sm:text-sm text-gray-500 block mb-1">
                  Renewal date
                </span>
                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                  {user?.renewalDate
                    ? new Date(user.renewalDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 sm:pt-4">
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.medicares.in/plan-compare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                >
                  Compare Plans
                </a>
                                  <a
                    href="/dashboard/User/plan"
                    className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    Update Plan
                  </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sidebar (2/5 width) - increased from previous ratio */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Notifications Card */}
        <NotificationsPanel />

        <motion.div variants={itemVariants}>
          <StorageUsageWidget compact />
        </motion.div>

        {/* Health Resources Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-purple-500 to-indigo-600 text-white">
            <h3 className="font-semibold flex items-center text-sm sm:text-base">
              <Heart className="mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
              Healthcare Resources
            </h3>
          </div>

          <div className="bg-linear-to-b from-purple-50 to-white p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              <a
                href="https://www.medicare.gov/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 sm:p-2.5 rounded-lg bg-white hover:bg-purple-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-1 sm:p-1.5 bg-purple-100 rounded-md mr-2 sm:mr-3">
                    <Layers className="text-purple-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                      Medicare Blog
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      Latest news and updates
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://www.medicare.gov/care-compare"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 sm:p-2.5 rounded-lg bg-white hover:bg-purple-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-1 sm:p-1.5 bg-purple-100 rounded-md mr-2 sm:mr-3">
                    <Search className="text-purple-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                      Find Care Providers
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      Search for doctors and facilities
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://www.medicare.gov/coverage"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 sm:p-2.5 rounded-lg bg-white hover:bg-purple-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-1 sm:p-1.5 bg-purple-100 rounded-md mr-2 sm:mr-3">
                    <Shield className="text-purple-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                      Coverage Information
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      Learn what's covered
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://www.medicare.gov/forms-help-resources"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 sm:p-2.5 rounded-lg bg-white hover:bg-purple-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-1 sm:p-1.5 bg-purple-100 rounded-md mr-2 sm:mr-3">
                    <HelpCircle className="text-purple-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                      Help & Resources
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      Get assistance with Medicare
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Wellness Tips Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-amber-50 to-amber-100">
            <h3 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
              <Target className="mr-1.5 sm:mr-2 text-amber-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
              Wellness Tips
            </h3>
          </div>

          <div className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="bg-amber-100 p-1 sm:p-1.5 rounded-md mr-2 sm:mr-3 mt-0.5">
                  <Heart className="text-amber-600 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                    Stay Active Daily
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                    Aim for at least 30 minutes of moderate physical
                    notifications daily to improve heart health and circulation.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 p-1 sm:p-1.5 rounded-md mr-2 sm:mr-3 mt-0.5">
                  <Clock className="text-amber-600 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                    Medication Reminder
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                    Take your medications at the same time each day to maintain
                    consistent levels in your system.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 p-1 sm:p-1.5 rounded-md mr-2 sm:mr-3 mt-0.5">
                  <FileText className="text-amber-600 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                    Track Your Health
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                    Keep a journal of any symptoms or changes to discuss at your
                    next appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Help & Support Card */}
        <motion.div
          variants={itemVariants}
          className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-lg sm:rounded-xl shadow-sm border border-blue-200 overflow-hidden"
        >
          <div className="p-3 sm:p-4 md:p-5 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
              <HelpCircle className="text-blue-600 text-base sm:text-lg md:text-xl" />
            </div>

            <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">
              Need Assistance?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Our support team is here to help with any questions about your
              Medicare coverage.
            </p>

            <div className="space-y-2">
              <a
                href="tel:1-800-MEDICARE"
                className="block w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
              >
                Call Support
              </a>
                              <a
                  href="/dashboard/support"
                  className="block w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-white/50 hover:bg-white/80 text-blue-800 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  Chat Online
                </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Enhanced loading state
  if (isLoading || isInitialLoad) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">
            {isInitialLoad
              ? "Initializing your dashboard..."
              : "Loading your dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Please check your internet connection and try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      {/* <WelcomeHeader /> */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 md:space-y-8"
      >
        <HealthOverviewPanel />
        <HealthStatsPanel />
        <ContentSection />
      </motion.div>

      {/* QR Code Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsQRCodeModalOpen(true)}
          className="flex flex-col items-center group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="p-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg transition-colors mb-2 group-hover:shadow-xl">
            <LayoutGrid size={24} />
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="text-xs font-medium text-white px-3 py-1.5 bg-gray-800 rounded-lg whitespace-nowrap shadow-lg"
          >
            Medicare QR ID
          </motion.span>
        </motion.button>
      </div>

      {/* QR Code Modal Component */}
      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        userUmid={user?.umid || ""}
        logo={MedicareLogo}
      />

      {/* Profile Photo Modal Component */}
      <ProfilePhotoModal
        isOpen={isProfilePhotoModalOpen}
        onClose={() => setIsProfilePhotoModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
