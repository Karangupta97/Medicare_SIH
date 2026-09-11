import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiCheckCircle, FiClock, FiBell, 
  FiCalendar, FiArrowLeft, FiEdit, FiEye, FiFilter, 
  FiAlertTriangle, FiRefreshCw, FiSearch, FiMessageSquare,
  FiPlusCircle, FiShield, FiHeart, FiActivity, FiTrendingUp,
  FiDollarSign, FiUser, FiClipboard, FiThumbsUp, FiStar,
  FiTrash2, FiMoreVertical, FiSettings, FiX
} from 'react-icons/fi';
import { FaPills, FaHeartbeat, FaHospital, FaStethoscope, FaNotesMedical } from 'react-icons/fa';
import { useAuthStore } from '../../store/Patient/authStore';
import usePatientStore from '../../store/Patient/patientstore';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { user, token } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0
  });

  // Get state and actions from patient store
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  } = usePatientStore();

  // Memoize the fetch function
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      await fetchNotifications(token);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    }
  }, [token, fetchNotifications]);

  // Fetch notifications only when component mounts or token changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    // Debounce the fetch call
    timeoutId = setTimeout(loadData, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchData]);

  // Memoize handlers
  const handleMarkAsRead = useCallback(async (id) => {
    if (!token) return;
    try {
      await markNotificationAsRead(token, id);
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Could not mark as read');
    }
  }, [token, markNotificationAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Could not mark all as read');
    }
  }, [token, markAllNotificationsAsRead]);

  const handleDeleteNotification = useCallback(async (id) => {
    if (!token) return;
    try {
      await deleteNotification(token, id);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Could not delete notification');
    }
  }, [token, deleteNotification]);

  // Memoize filter handlers
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);
  // Enhanced function to get appropriate icon based on notification type and content
  const getNotificationIcon = (notification) => {
    // First check for specific health-related keywords
    if (notification.message.toLowerCase().includes('prescription') || notification.message.toLowerCase().includes('medication')) {
      return <FaPills size={20} className="text-purple-600" />;
    } else if (notification.message.toLowerCase().includes('heart') || notification.message.toLowerCase().includes('cardiac')) {
      return <FaHeartbeat size={20} className="text-red-600" />;
    } else if (notification.message.toLowerCase().includes('hospital') || notification.message.toLowerCase().includes('admitted')) {
      return <FaHospital size={20} className="text-blue-700" />;
    } else if (notification.message.toLowerCase().includes('doctor') || notification.message.toLowerCase().includes('physician')) {
      return <FaStethoscope size={20} className="text-teal-600" />;
    } else if (notification.message.toLowerCase().includes('lab') || notification.message.toLowerCase().includes('test results')) {
      return <FaNotesMedical size={20} className="text-green-700" />;
    }
    
    // Then check notification type
    switch (notification.type) {
      case 'report':
        return <FiFileText size={20} className="text-blue-600" />;
      case 'appointment':
        return <FiCalendar size={20} className="text-green-600" />;
      case 'reminder':
        return <FiClock size={20} className="text-amber-600" />;
      case 'payment':
        return <FiDollarSign size={20} className="text-emerald-600" />;
      case 'message':
        return <FiMessageSquare size={20} className="text-indigo-600" />;
      case 'success':
        return <FiCheckCircle size={20} className="text-green-600" />;
      case 'warning':
        return <FiAlertTriangle size={20} className="text-orange-600" />;
      case 'error':
        return <FiAlertTriangle size={20} className="text-red-600" />;
      default:
        break;
    }
    
    // Fallback to context-based icons by analyzing message content
    if (notification.message.includes('viewed') || notification.message.includes('opened')) {
      return <FiEye size={20} className="text-indigo-600" />;
    } else if (notification.message.includes('updated') || notification.message.includes('changed') || notification.message.includes('edited')) {
      return <FiEdit size={20} className="text-amber-600" />;
    } else if (notification.message.includes('completed') || notification.message.includes('finished')) {
      return <FiCheckCircle size={20} className="text-green-600" />;
    } else if (notification.message.includes('new') || notification.message.includes('added') || notification.message.includes('created')) {
      return <FiPlusCircle size={20} className="text-blue-600" />;
    } else if (notification.message.includes('profile') || notification.message.includes('account')) {
      return <FiUser size={20} className="text-gray-600" />;
    } else if (notification.message.includes('security') || notification.message.includes('password')) {
      return <FiShield size={20} className="text-purple-600" />;
    } else if (notification.message.includes('health') || notification.message.includes('wellness')) {
      return <FiHeart size={20} className="text-red-600" />;
    } else if (notification.message.includes('progress') || notification.message.includes('improvement')) {
      return <FiTrendingUp size={20} className="text-green-600" />;
    } else if (notification.message.includes('feedback') || notification.message.includes('rating')) {
      return <FiThumbsUp size={20} className="text-blue-600" />;
    } else if (notification.message.includes('review') || notification.message.includes('assessment')) {
      return <FiClipboard size={20} className="text-teal-600" />;
    } else if (notification.message.includes('congratulations') || notification.message.includes('achievement')) {
      return <FiStar size={20} className="text-amber-500" />;
    }

    // Default icon
    return <FiBell size={20} className="text-violet-600" />;
  };
  // Enhanced function to get background and text colors based on notification type
  const getNotificationStyles = (notification) => {
    let bgColor = 'bg-white';
    let iconBgColor = 'bg-violet-50';
    let hoverBgColor = 'hover:bg-gray-50';
    let borderColor = '';
    let iconAnimation = '';
    let shadowClass = 'shadow-sm';

    // First determine style by notification type
    switch (notification.type) {
      case 'report':
        bgColor = 'bg-white';
        iconBgColor = 'bg-blue-50';
        hoverBgColor = 'hover:bg-blue-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      case 'appointment':
        bgColor = 'bg-white';
        iconBgColor = 'bg-green-50';
        hoverBgColor = 'hover:bg-green-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      case 'reminder':
        bgColor = 'bg-white';
        iconBgColor = 'bg-amber-50';
        hoverBgColor = 'hover:bg-amber-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        // Add pulsing effect for reminders
        iconAnimation = 'animate-pulse';
        break;
      case 'payment':
        bgColor = 'bg-white';
        iconBgColor = 'bg-emerald-50';
        hoverBgColor = 'hover:bg-emerald-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      case 'message':
        bgColor = 'bg-white';
        iconBgColor = 'bg-indigo-50';
        hoverBgColor = 'hover:bg-indigo-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      case 'success':
        bgColor = 'bg-white';
        iconBgColor = 'bg-green-50';
        hoverBgColor = 'hover:bg-green-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      case 'warning':
        bgColor = 'bg-white';
        iconBgColor = 'bg-orange-50';
        hoverBgColor = 'hover:bg-orange-50/50';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      case 'error':
        bgColor = 'bg-white';
        iconBgColor = 'bg-red-50';
        hoverBgColor = 'hover:bg-red-50/50';
        borderColor = 'border-l-4 border-red-400';
        shadowClass = 'shadow-sm hover:shadow-md';
        break;
      default:
        // Check message content for fallback styling
        if (notification.message.toLowerCase().includes('prescription') || notification.message.toLowerCase().includes('medication')) {
          bgColor = 'bg-white';
          iconBgColor = 'bg-purple-50';
          hoverBgColor = 'hover:bg-purple-50/50';
        } else if (notification.message.toLowerCase().includes('lab') || notification.message.toLowerCase().includes('test results')) {
          bgColor = 'bg-white';
          iconBgColor = 'bg-teal-50';
          hoverBgColor = 'hover:bg-teal-50/50';
        }
        break;
    }

    // Add special styling for unread notifications
    if (!notification.read) {
      bgColor = 'bg-gradient-to-r from-violet-50/50 to-white';
      shadowClass = 'shadow-md hover:shadow-lg';
    }

    return {
      bgColor,
      iconBgColor,
      hoverBgColor,
      borderColor,
      iconAnimation,
      shadowClass
    };
  };

  // Function to format the notification time in a user-friendly way
  const formatNotificationTime = (timestamp) => {
    const notificationDate = new Date(timestamp);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // If it's today, show the time
    if (notificationDate >= today) {
      return `Today at ${notificationDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } 
    // If it's yesterday, show "Yesterday"
    else if (notificationDate >= yesterday) {
      return `Yesterday at ${notificationDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } 
    // If it's within the last week, show the day name
    else if (notificationDate >= lastWeek) {
      return notificationDate.toLocaleDateString('en-US', { weekday: 'long' });
    } 
    // Otherwise show the date
    else {
      return notificationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
  };

  // For grouping notifications by date
  const groupNotificationsByDate = () => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: []
    };
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      
      if (notificationDate >= today) {
        groups.today.push(notification);
      } else if (notificationDate >= yesterday) {
        groups.yesterday.push(notification);
      } else if (notificationDate >= lastWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });
    
    return groups;
  };
  
  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  // Loading state
  if (isLoading) {
    return (
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-gray-500">Loading your notifications...</p>
          </div>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700"
            >
              <FiRefreshCw className="mr-2 -ml-1 h-5 w-5" /> Retry
            </button>
          </div>
        </div>
    );
  }
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
        <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header with Stats */}
          <div className="mb-8 pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <motion.a 
                  href="/dashboard" 
                  className="p-3 rounded-xl bg-white hover:bg-gray-50 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiArrowLeft size={20} className="text-gray-600" />
                </motion.a>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-violet-600 bg-clip-text text-transparent mb-2">
                    Notifications
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>Stay updated with your health journey</span>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                        {notifications.filter(n => !n.read).length} unread
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-lg font-bold text-gray-800">{notifications.length}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-lg font-bold text-violet-600">{notifications.filter(n => !n.read).length}</div>
                    <div className="text-xs text-gray-500">Unread</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.button
                      onClick={handleMarkAllAsRead}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiSettings size={18} className="text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>        
        {/* Enhanced Filters and Search */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === 'all' 
                      ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  All Notifications
                </motion.button>
                <motion.button
                  onClick={() => handleFilterChange('report')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                    filter === 'report' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiFileText size={14} /> Reports
                </motion.button>
                <motion.button
                  onClick={() => handleFilterChange('appointment')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                    filter === 'appointment' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiCalendar size={14} /> Appointments
                </motion.button>
                <motion.button
                  onClick={() => handleFilterChange('reminder')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                    filter === 'reminder' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiClock size={14} /> Reminders
                </motion.button>
              </div>
              
              <div className="w-full lg:w-80 relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                  />
                  <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <motion.button
                    type="submit"
                    className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-violet-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiFilter size={16} />
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>        
        {/* Enhanced Notification List */}
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
          >
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {/* Today's Notifications */}
                {groupedNotifications.today.length > 0 && (
                  <div className="py-4">
                    <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Today
                      </h3>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {groupedNotifications.today.length} notifications
                      </span>
                    </div>
                    {groupedNotifications.today.map((notification) => {
                      const styles = getNotificationStyles(notification);
                      return (
                        <motion.div
                          key={`today-${notification._id}`}
                          variants={itemVariants}
                          className={`px-6 py-4 ${styles.hoverBgColor} ${styles.bgColor} ${styles.shadowClass} transition-all duration-300 cursor-pointer group ${styles.borderColor}`}
                          onClick={() => {
                            if (notification.link) window.location.href = notification.link;
                            if (!notification.read) handleMarkAsRead(notification._id);
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className={`p-3 rounded-xl ${styles.iconBgColor} ${styles.iconAnimation} transition-all duration-200 group-hover:scale-110 shadow-sm`} 
                              title={notification.type}
                              whileHover={{ rotate: 5 }}
                            >
                              {getNotificationIcon(notification)}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={`${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-800 font-medium'} leading-relaxed`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-500 text-sm">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                                {notification.type && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                    {notification.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <motion.div 
                                  className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <motion.button
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification._id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiTrash2 size={16} className="text-gray-400 hover:text-red-500" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                
                {/* Yesterday's Notifications */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div className="py-4">
                    <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        Yesterday
                      </h3>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {groupedNotifications.yesterday.length} notifications
                      </span>
                    </div>
                    {groupedNotifications.yesterday.map((notification) => {
                      const styles = getNotificationStyles(notification);
                      return (
                        <motion.div
                          key={`yesterday-${notification._id}`}
                          variants={itemVariants}
                          className={`px-6 py-4 ${styles.hoverBgColor} ${styles.bgColor} ${styles.shadowClass} transition-all duration-300 cursor-pointer group ${styles.borderColor}`}
                          onClick={() => {
                            if (notification.link) window.location.href = notification.link;
                            if (!notification.read) handleMarkAsRead(notification._id);
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className={`p-3 rounded-xl ${styles.iconBgColor} ${styles.iconAnimation} transition-all duration-200 group-hover:scale-110 shadow-sm`} 
                              title={notification.type}
                              whileHover={{ rotate: 5 }}
                            >
                              {getNotificationIcon(notification)}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={`${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-800 font-medium'} leading-relaxed`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-500 text-sm">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                                {notification.type && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                    {notification.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <motion.div 
                                  className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <motion.button
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification._id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiTrash2 size={16} className="text-gray-400 hover:text-red-500" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                
                {/* This Week's Notifications */}
                {groupedNotifications.thisWeek.length > 0 && (
                  <div className="py-4">
                    <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        This Week
                      </h3>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {groupedNotifications.thisWeek.length} notifications
                      </span>
                    </div>
                    {groupedNotifications.thisWeek.map((notification) => {
                      const styles = getNotificationStyles(notification);
                      return (
                        <motion.div
                          key={`week-${notification._id}`}
                          variants={itemVariants}
                          className={`px-6 py-4 ${styles.hoverBgColor} ${styles.bgColor} ${styles.shadowClass} transition-all duration-300 cursor-pointer group ${styles.borderColor}`}
                          onClick={() => {
                            if (notification.link) window.location.href = notification.link;
                            if (!notification.read) handleMarkAsRead(notification._id);
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className={`p-3 rounded-xl ${styles.iconBgColor} ${styles.iconAnimation} transition-all duration-200 group-hover:scale-110 shadow-sm`} 
                              title={notification.type}
                              whileHover={{ rotate: 5 }}
                            >
                              {getNotificationIcon(notification)}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={`${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-800 font-medium'} leading-relaxed`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-500 text-sm">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                                {notification.type && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                    {notification.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <motion.div 
                                  className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <motion.button
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification._id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiTrash2 size={16} className="text-gray-400 hover:text-red-500" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                
                {/* Earlier Notifications */}
                {groupedNotifications.earlier.length > 0 && (
                  <div className="py-4">
                    <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Earlier
                      </h3>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {groupedNotifications.earlier.length} notifications
                      </span>
                    </div>
                    {groupedNotifications.earlier.map((notification) => {
                      const styles = getNotificationStyles(notification);
                      return (
                        <motion.div
                          key={`earlier-${notification._id}`}
                          variants={itemVariants}
                          className={`px-6 py-4 ${styles.hoverBgColor} ${styles.bgColor} ${styles.shadowClass} transition-all duration-300 cursor-pointer group ${styles.borderColor}`}
                          onClick={() => {
                            if (notification.link) window.location.href = notification.link;
                            if (!notification.read) handleMarkAsRead(notification._id);
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              className={`p-3 rounded-xl ${styles.iconBgColor} ${styles.iconAnimation} transition-all duration-200 group-hover:scale-110 shadow-sm`} 
                              title={notification.type}
                              whileHover={{ rotate: 5 }}
                            >
                              {getNotificationIcon(notification)}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={`${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-800 font-medium'} leading-relaxed`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-500 text-sm">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                                {notification.type && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                    {notification.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <motion.div 
                                  className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <motion.button
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification._id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiTrash2 size={16} className="text-gray-400 hover:text-red-500" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mb-6 shadow-lg">
                  <FiBell className="text-violet-500 text-2xl" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">No notifications found</h4>
                <p className="text-gray-500 text-sm mb-8 max-w-md leading-relaxed">
                  {searchTerm || filter !== 'all' ? 
                    "Try adjusting your filters or search criteria to find what you're looking for." : 
                    "You're all caught up! System notifications and updates about your health records will appear here when available."}
                </p>
                {(searchTerm || filter !== 'all') && (
                  <motion.button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear all filters
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>        
        {/* Enhanced Pagination */}
        {notifications.length > 0 && pagination.totalPages > 1 && (
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <motion.button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 ${
                    pagination.page === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 shadow-lg hover:shadow-xl'
                  }`}
                  whileHover={{ scale: pagination.page === 1 ? 1 : 1.02 }}
                  whileTap={{ scale: pagination.page === 1 ? 1 : 0.98 }}
                >
                  Previous
                </motion.button>
                <motion.button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 ${
                    pagination.page === pagination.totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 shadow-lg hover:shadow-xl'
                  }`}
                  whileHover={{ scale: pagination.page === pagination.totalPages ? 1 : 1.02 }}
                  whileTap={{ scale: pagination.page === pagination.totalPages ? 1 : 0.98 }}
                >
                  Next
                </motion.button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="bg-gray-50 rounded-xl px-4 py-2">
                  <p className="text-sm text-gray-700 font-medium">
                    Showing <span className="font-bold text-violet-600">{notifications.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}</span>{" "}
                    to{" "}
                    <span className="font-bold text-violet-600">
                      {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
                    </span>{" "}
                    of <span className="font-bold text-violet-600">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex gap-2" aria-label="Pagination">
                    <motion.button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        pagination.page === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                      }`}
                      whileHover={{ scale: pagination.page === 1 ? 1 : 1.05 }}
                      whileTap={{ scale: pagination.page === 1 ? 1 : 0.95 }}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <motion.button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                            pagination.page === pageNum
                              ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                    
                    <motion.button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        pagination.page === pagination.totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                      }`}
                      whileHover={{ scale: pagination.page === pagination.totalPages ? 1 : 1.05 }}
                      whileTap={{ scale: pagination.page === pagination.totalPages ? 1 : 0.95 }}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </nav>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>    </div>
  );
};

export default React.memo(Notifications);