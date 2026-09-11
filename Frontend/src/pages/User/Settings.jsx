import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Shield, 
  User as UserIcon,
  EyeOff, 
  Moon, 
  Sun, 
  Globe, 
  ArrowRight, 
  Download, 
  Trash2, 
  Save, 
  X, 
  Check, 
  ChevronRight, 
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Watch,
  Edit3,
  Loader2,
  Lock
} from "lucide-react";
import useAuthStore from "@/store/Patient/authStore";
import { useConnectedDevices } from "@/hooks/useConnectedDevices";
import PhotoEditorModal from "../../components/User/PhotoEditorModal";
import ChangePasswordModal from "../../components/User/ChangePasswordModal";

const Settings = () => {
  const navigate = useNavigate();
  
  // State for different settings
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    appointments: true,
    reminders: true,
    reports: true,
    news: false,
  });
  const [pushNotifications, setPushNotifications] = useState({
    appointments: true,
    reminders: true,
    reports: true,
    news: false,
  });
  const [language, setLanguage] = useState("english");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Get saved tab from localStorage or default to "account"
  const getSavedTab = () => {
    try {
      return localStorage.getItem('settings-active-tab') || 'account';
    } catch (error) {
      return 'account';
    }
  };
  
  const [activeTab, setActiveTab] = useState(getSavedTab);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true); // for mobile responsiveness
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { user, isLoading } = useAuthStore();
  
  // Connected devices hook
  const {
    devices,
    loading: devicesLoading,
    removeDevice,
    updateDeviceName,
    removeInactiveDevices,
    formatLastActive
  } = useConnectedDevices();

  // Effect to save active tab to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('settings-active-tab', activeTab);
      // Update page title to reflect current tab
      const tabLabels = {
        account: "Account Info",
        notifications: "Notifications", 
        appearance: "Appearance",
        privacy: "Privacy & Security",
        language: "Language",
        data: "Data Management",
        devices: "Devices",
        about: "About"
      };
      document.title = `${tabLabels[activeTab]} - Settings | Medicare`;
    } catch (error) {
      console.error('Failed to save active tab to localStorage:', error);
    }
  }, [activeTab]);

  // Effect to validate saved tab on component mount
  useEffect(() => {
    const savedTab = getSavedTab();
    const validTabs = ["account", "notifications", "appearance", "privacy", "language", "data", "devices", "about"];
    
    // If saved tab is not valid, reset to "account"
    if (!validTabs.includes(savedTab)) {
      setActiveTab("account");
      try {
        localStorage.setItem('settings-active-tab', 'account');
      } catch (error) {
        console.error('Failed to reset active tab in localStorage:', error);
      }
    }
  }, []);

  // Cleanup effect to reset page title on unmount
  useEffect(() => {
    return () => {
      document.title = "Medicare";
    };
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  // Toggle handlers
  const handleDarkModeToggle = () => setDarkMode(!darkMode);
  
  const handleEmailNotificationChange = (key) => {
    setEmailNotifications({
      ...emailNotifications,
      [key]: !emailNotifications[key],
    });
  };
  
  const handlePushNotificationChange = (key) => {
    setPushNotifications({
      ...pushNotifications,
      [key]: !pushNotifications[key],
    });
  };

  // Handle tab change with persistence
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) setShowSidebarOnMobile(false);
  };

  // Device helper functions
  const getDeviceIcon = (deviceType, platform) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'laptop':
        return Laptop;
      case 'desktop':
        return Monitor;
      case 'smartwatch':
        return Watch;
      default:
        if (platform === 'mobile') return Smartphone;
        if (platform === 'tablet') return Tablet;
        return Monitor;
    }
  };

  const handleRemoveDevice = async (deviceId, deviceName) => {
    if (window.confirm(`Are you sure you want to remove "${deviceName}"?`)) {
      await removeDevice(deviceId, deviceName);
    }
  };

  const handleEditDeviceName = (device) => {
    setEditingDevice(device.id);
    setNewDeviceName(device.deviceName);
  };

  const handleSaveDeviceName = async (deviceId) => {
    if (newDeviceName.trim()) {
      const success = await updateDeviceName(deviceId, newDeviceName.trim());
      if (success) {
        setEditingDevice(null);
        setNewDeviceName('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
    setNewDeviceName('');
  };

  const handleCleanupInactiveDevices = async () => {
    if (window.confirm('Are you sure you want to remove all inactive devices? This action cannot be undone.')) {
      await removeInactiveDevices();
    }
  };

  // Handle Edit Profile button click
  const handleEditProfile = () => {
    navigate('/dashboard/profile', { state: { openEditMode: true } });
  };

  // Handle Change Photo button click
  const handleChangePhoto = () => {
    setIsPhotoEditorOpen(true);
  };

  // Handle Change Password button click
  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  // Handle photo save from PhotoEditorModal
  const handlePhotoSave = async (editedImage) => {
    try {
      // Here you would typically upload the edited image to your server
      // and update the user's profile photo
      console.log('Photo saved:', editedImage);
      setIsPhotoEditorOpen(false);
      // You might want to update the user store here as well
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  // Tab navigation options
  const tabs = [
    { id: "account", label: "Account Info", icon: UserIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "language", label: "Language", icon: Globe },
    { id: "data", label: "Data Management", icon: Download },
    { id: "devices", label: "Devices", icon: Smartphone },
    { id: "about", label: "About", icon: Check },
  ];

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, size = "default" }) => {
    const sizeClasses = size === "small" ? "w-8 h-4" : "w-11 h-6";
    
    const toggleClasses =
      size === "small" ? "h-3 w-3 translate-x-3" : "h-5 w-5 translate-x-5";

    return (
      <button
        type="button"
        className={`${
          enabled ? "bg-indigo-600" : "bg-gray-200"
        } relative inline-flex ${sizeClasses} flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
      >
        <span
          className={`${
            enabled ? toggleClasses : "translate-x-0"
          } pointer-events-none inline-block ${
            size === "small" ? "h-3 w-3" : "h-5 w-5"
          } transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    );
  };

  // User info for header (from store)
  const userAvatar =
    user?.photoURL || "https://randomuser.me/api/portraits/men/32.jpg";
  const userName = user
    ? `${user.name || ""} ${user.lastname || ""}`.trim()
    : "";
  const userEmail = user?.email || "";

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-lg mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="w-7 h-7 text-indigo-500" /> Account Information
            </h3>
            {isLoading ? (
              <div className="py-8 flex justify-center items-center text-gray-400">Loading...</div>
            ) : user ? (
              <form className="space-y-6">
                <div className="flex items-center gap-5 mb-6">
                  <img
                    src={userAvatar}
                    alt="User avatar"
                    className="w-20 h-20 rounded-full border-2 border-indigo-100 shadow object-cover"
                  />
                  <div>
                    <div className="font-semibold text-xl text-gray-900">{userName}</div>
                    <div className="text-sm text-gray-500">{userEmail}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 px-3 py-2"
                    value={userName}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 px-3 py-2"
                    value={userEmail}
                    disabled
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                  <span className="text-xs text-gray-400">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePhoto}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold shadow transition-all duration-200 flex items-center gap-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    Change Photo
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 flex justify-center items-center text-gray-400">No user data found.</div>
            )}
          </motion.div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-lg mx-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="w-7 h-7 text-indigo-500" /> Email Notifications
              </h3>
              <div className="space-y-5">
                {Object.entries(emailNotifications).map(([key, value]) => (
                  <div key={`email-${key}`} className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100">
                    <div>
                      <p className="text-base font-semibold text-gray-700 capitalize">{key}</p>
                      <p className="text-xs text-gray-500">
                        {key === "appointments" && "Receive notifications about your upcoming appointments"}
                        {key === "reminders" && "Get reminders about your medication schedule"}
                        {key === "reports" && "Be notified when new medical reports are available"}
                        {key === "news" && "Receive news and updates from Medicare"}
                      </p>
                    </div>
                    <ToggleSwitch enabled={value} onChange={() => handleEmailNotificationChange(key)} />
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-lg mx-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Smartphone className="w-7 h-7 text-indigo-500" /> Push Notifications
              </h3>
              <div className="space-y-5">
                {Object.entries(pushNotifications).map(([key, value]) => (
                  <div key={`push-${key}`} className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100">
                    <div>
                      <p className="text-base font-semibold text-gray-700 capitalize">{key}</p>
                      <p className="text-xs text-gray-500">
                        {key === "appointments" && "Receive push notifications about your upcoming appointments"}
                        {key === "reminders" && "Get push reminders about your medication schedule"}
                        {key === "reports" && "Be notified when new medical reports are available"}
                        {key === "news" && "Receive news and updates from Medicare"}
                      </p>
                    </div>
                    <ToggleSwitch enabled={value} onChange={() => handlePushNotificationChange(key)} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
      case "appearance":
        return (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-lg mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Moon className="w-7 h-7 text-indigo-500" /> Appearance
            </h3>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Dark Mode</h4>
                <p className="text-xs text-gray-500 mt-1">Switch between light and dark themes</p>
              </div>
              <div className="flex items-center space-x-4">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <ToggleSwitch enabled={darkMode} onChange={handleDarkModeToggle} />
                  <Moon className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Text Size</h4>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Small</button>
                <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">Medium</button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Large</button>
              </div>
            </div>
            <div className="pt-8 mt-8 border-t border-gray-100">
              <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <EyeOff className="w-6 h-6 text-indigo-500" /> Accessibility
              </h4>
              <p className="text-sm text-gray-500 mb-6">Accessibility settings help make the application easier to use for everyone, including users with visual or other impairments. Adjust these options to improve your experience.</p>
              <div className="space-y-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-700">High Contrast Mode</p>
                    <p className="text-xs text-gray-500">Enhance color contrast for better visibility</p>
                  </div>
                  <ToggleSwitch enabled={false} onChange={() => {}} />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1">Font Size</label>
                  <select className="block w-full border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 px-3 py-2">
                    <option>Small</option>
                    <option selected>Medium</option>
                    <option>Large</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Adjust the size of text for readability</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-700">Screen Reader Support</p>
                    <p className="text-xs text-gray-500">Optimize experience for screen readers</p>
                  </div>
                  <ToggleSwitch enabled={true} onChange={() => {}} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case "privacy":
        return (
          <div className="space-y-6">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-lg mx-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-7 h-7 text-indigo-500" /> Privacy & Security
              </h3>
              <div className="space-y-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-700">Two-Factor Authentication <span className='ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold'>Recommended</span></p>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <ToggleSwitch enabled={false} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-700">Mask Sensitive Information</p>
                    <p className="text-xs text-gray-500">Hide personal health information when sharing reports</p>
                  </div>
                  <ToggleSwitch enabled={true} onChange={() => {}} />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleChangePassword}
                  className="w-full px-4 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 text-indigo-700 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow p-6 border border-gray-100 max-w-lg mx-auto"
            >
              <div className="flex items-start">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <EyeOff className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Privacy Controls</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage how your data is used and shared</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        id="analytics"
                        name="analytics"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="analytics" className="ml-2 block text-sm text-gray-700">
                        Allow anonymized analytics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="research"
                        name="research"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="research" className="ml-2 block text-sm text-gray-700">
                        Participate in medical research
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      case "language":
        return (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 max-w-lg mx-auto"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" /> Language Preferences
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Coming Soon</span>
            </h3>
            <div className="max-w-md">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Select your preferred language
              </label>
              <select
                id="language"
                name="language"
                value={language}
                disabled
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-100 cursor-not-allowed"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="hindi">Hindi</option>
              </select>
              <div className="mt-6 flex items-center">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-300 cursor-not-allowed" disabled>
                  Save Changes
                </button>
                <p className="ml-4 text-xs text-gray-500">Language selection will be available soon.</p>
              </div>
            </div>
          </motion.div>
        );
      case "data":
        return (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 max-w-lg mx-auto"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" /> Data Management
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Coming Soon</span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3 opacity-50">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <div className="opacity-50">
                  <h4 className="text-lg font-bold text-gray-900">Download Your Data</h4>
                  <p className="text-sm text-gray-500 mt-1">Get a copy of your personal data and medical records</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        id="medical-records"
                        name="data-type"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-not-allowed"
                        disabled
                      />
                      <label htmlFor="medical-records" className="block text-sm text-gray-700">
                        Medical Records
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        id="account-info"
                        name="data-type"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-not-allowed"
                        disabled
                      />
                      <label htmlFor="account-info" className="block text-sm text-gray-700">
                        Account Information
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        id="prescription-history"
                        name="data-type"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-not-allowed"
                        disabled
                      />
                      <label htmlFor="prescription-history" className="block text-sm text-gray-700">
                        Prescription History
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-300 cursor-not-allowed" disabled>
                      <Download className="h-4 w-4 mr-1" />
                      Download Data
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center">
                <p className="text-xs text-gray-500">Data export functionality will be available soon.</p>
              </div>
            </div>
          </motion.div>
        );
      case "devices":
        return (
          <div className="space-y-6">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-7 h-7 text-indigo-500" /> Connected Devices
                </h3>
                <button
                  onClick={handleCleanupInactiveDevices}
                  className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cleanup Inactive
                </button>
              </div>
              
              {!user || !isLoading && !user ? (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Please log in to view connected devices</p>
                </div>
              ) : devicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-2" />
                  <span className="text-gray-500">Loading devices...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No devices found</p>
                  <p className="text-xs text-gray-400 mt-2">Your device will appear here once you log in</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {devices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.deviceType, device.platform);
                    const isEditing = editingDevice === device.id;
                    
                    return (
                      <div
                        key={device.id}
                        className={`p-4 border rounded-lg flex items-center justify-between transition-colors ${
                          device.isCurrentDevice 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center flex-1">
                          <div className={`p-2 rounded-lg ${
                            device.isCurrentDevice ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <DeviceIcon className={`h-5 w-5 ${
                              device.isCurrentDevice ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="ml-3 flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newDeviceName}
                                  onChange={(e) => setNewDeviceName(e.target.value)}
                                  className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveDeviceName(device.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveDeviceName(device.id)}
                                  className="text-green-600 hover:text-green-800 p-1"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-gray-600 hover:text-gray-800 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-700">{device.deviceName}</p>
                                {!device.isCurrentDevice && (
                                  <button
                                    onClick={() => handleEditDeviceName(device)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {device.browser} on {device.os}
                                {device.isCurrentDevice && " • Current device"}
                              </p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500">
                                {formatLastActive(device.lastActiveAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {device.isCurrentDevice ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          ) : device.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                          {!device.isCurrentDevice && (
                            <button 
                              onClick={() => handleRemoveDevice(device.id, device.deviceName)}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">Device Security</p>
                <p className="text-xs text-blue-600">
                  Devices are automatically registered when you sign in. Remove any devices you don't recognize.
                  Your current device cannot be removed for security reasons.
                </p>
              </div>
            </motion.div>
          </div>
        );
      case "about":
        return (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-lg mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Check className="w-7 h-7 text-indigo-500" /> About Medicare
            </h3>
            <p className="text-base text-gray-700 mb-2">Version Beta 1.0.0</p>
            <p className="text-sm text-gray-500 mb-4">
              Medicare is a platform for managing your health records, appointments, and more. For support, contact us at <a href="mailto:support@medicare.com" className="text-indigo-600 underline">support@medicare.com</a>.
            </p>
            <p className="text-xs text-gray-400">© 2025 Medicare. All rights reserved.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Responsive rendering
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
      {/* Page Header with User Info */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={userAvatar}
            alt="User avatar"
            className="w-14 h-14 rounded-full border-2 border-indigo-100 shadow-md object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {userName} <span className="mx-1">·</span>{" "}
              <span className="text-gray-400">{userEmail}</span>
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
          <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition-all duration-200 font-semibold">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
      {/* Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Tab Navigation */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`lg:col-span-1 ${
            showSidebarOnMobile ? "block" : "hidden"
          } lg:block`}
        >
          <nav className="space-y-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-between w-full px-5 py-3 text-left text-base font-semibold transition-all duration-150 group focus:outline-none ${
                    isActive
                      ? "bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }`}
                >
                  <div className="flex items-center">
                    <tab.icon
                      className={`mr-3 h-5 w-5 transition-colors duration-150 ${
                        isActive
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-indigo-500"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-5 w-5 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </nav>
          {/* Help & Support Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow border border-gray-100 p-5 mt-6 flex flex-col items-center text-center"
          >
            <h3 className="text-base font-semibold text-gray-900">
              Need help?
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Our support team is just a click away
            </p>
            <button className="mt-3 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-sm text-indigo-700 rounded-lg w-full flex items-center justify-center font-semibold transition-all duration-150">
              Contact Support <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" 
          className={`lg:col-span-3 ${
            showSidebarOnMobile ? "hidden" : "block"
          } lg:block`}
        >
          {/* Back button for mobile */}
          <div className="lg:hidden mb-4 sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100 py-2">
            <button
              onClick={() => setShowSidebarOnMobile(true)}
              className="flex items-center text-indigo-600 hover:underline text-base font-semibold mb-2"
            >
              <ChevronRight className="h-5 w-5 mr-1 rotate-180" /> Back to
              Settings
            </button>
          </div>
          <div className="space-y-8">{renderTabContent()}</div>
        </motion.div>
      </div>
      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 border border-red-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Account
              </h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
              <p className="text-sm text-red-800 font-semibold">
                Warning: This action cannot be undone. All your data will be
                permanently deleted.
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Please type{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                delete my account
              </span>{" "}
              to confirm:
            </p>
            <input 
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
              placeholder="Type 'delete my account'"
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md font-semibold transition-all"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md flex items-center font-semibold transition-all">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Save Changes Floating Button for mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-5 right-5 sm:hidden z-40"
      >
        <button className="flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl font-semibold text-base transition-all">
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </motion.div>

      {/* PhotoEditorModal */}
      <PhotoEditorModal
        isOpen={isPhotoEditorOpen}
        onClose={() => setIsPhotoEditorOpen(false)}
        onSave={handlePhotoSave}
        imageUrl={user?.photoURL || "/user.png"}
      />

      {/* ChangePasswordModal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
