import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStaffStore } from "../../../../store/staffStore";
import {
  FaHome,
  FaUserMd,
  FaCalendarCheck,
  FaClipboardList,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaSearch,
  FaChartLine,
  FaTasks,
  FaUsers,
  FaUserInjured,
  FaClock,
  FaHospital,
  FaFileMedical,
  FaDatabase,
  FaUserNurse,
  FaLaptopMedical,
  FaStethoscope,
  FaListAlt,
  FaFileAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationCircle
} from "react-icons/fa";
import { BiMessageDetail } from "react-icons/bi";
import { TbReportAnalytics } from "react-icons/tb";
import { motion } from "framer-motion";
import logo from "../../../../assets/Logo/textlogo.png";
import toast from "react-hot-toast";

// Dashboard layout component with sidebar
export const DashboardLayout = ({ children, activePage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { staffData, logout } = useStaffStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(3); // Mock notifications count

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/staff/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigation items with sections
  const navSections = [
    {
      title: "Main",
      items: [
        { icon: FaHome, label: "Dashboard", path: "/staff/dashboard", active: activePage === "dashboard" },
        { icon: FaUserInjured, label: "Patients", path: "/staff/patients", active: activePage === "patients" },
        { icon: FaCalendarCheck, label: "Appointments", path: "/staff/appointments", active: activePage === "appointments" },
      ]
    },
    {
      title: "Management",
      items: [
        { icon: FaClipboardList, label: "Reports", path: "/staff/reports", active: activePage === "reports" },
        { icon: FaUserMd, label: "Staff Directory", path: "/staff/team", active: activePage === "team" },
        { icon: FaFileMedical, label: "Medical Records", path: "/staff/records", active: activePage === "records" },
        { icon: FaStethoscope, label: "Doctor Verifications", path: "/staff/doctor-verification", active: activePage === "doctor-verification" },
      ]
    },
    {
      title: "Resources",
      items: [
        { icon: TbReportAnalytics, label: "Analytics", path: "/staff/analytics", active: activePage === "analytics" },
        { icon: FaDatabase, label: "Resources", path: "/staff/resources", active: activePage === "resources" },
        { icon: BiMessageDetail, label: "Messages", path: "/staff/messages", active: activePage === "messages", badge: 5 },
      ]
    },
    {
      title: "System",
      items: [
        { icon: FaBell, label: "Notifications", path: "/staff/notifications", active: activePage === "notifications", badge: notifications },
        { icon: FaCog, label: "Settings", path: "/staff/settings", active: activePage === "settings" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className={`bg-white shadow-lg fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center py-5 border-b border-gray-100">
            <img src={logo} alt="Medicare Logo" className="h-10" />
            <div className="ml-2">
              <span className="text-xl font-bold text-blue-600 block">Medicare</span>
              <span className="text-xs text-gray-500">Staff Portal</span>
            </div>
          </div>
          
          {/* User Info */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                {staffData?.photoURL ? (
                  <img 
                    src={staffData.photoURL} 
                    alt={staffData.name} 
                    className="h-12 w-12 rounded-full border-2 border-blue-100"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUserCircle className="h-8 w-8 text-blue-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {staffData?.name || "Staff Member"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {staffData?.role || "Staff"} • ID: {staffData?.staffId || "---"}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navSections.map((section, sIndex) => (
              <div key={sIndex} className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="mt-2 space-y-1">
                  {section.items.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg ${
                          item.active
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className={`mr-3 h-5 w-5 ${
                            item.active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                          }`} />
                          {item.label}
                        </div>
                        {item.badge && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 ml-auto text-xs font-medium rounded-full bg-red-100 text-red-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-20 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start max-w-lg">
              <div className="max-w-lg w-full">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search patients, records, appointments..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Date & Time */}
              <div className="hidden md:flex items-center text-gray-600 mr-3">
                <FaClock className="h-4 w-4 mr-1" />
                <span className="text-xs">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:bg-gray-100">
                  <span className="sr-only">View notifications</span>
                  <FaBell className="h-6 w-6" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
              </div>
              
              {/* Messages */}
              <div className="relative">
                <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:bg-gray-100">
                  <span className="sr-only">View messages</span>
                  <BiMessageDetail className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                </button>
              </div>
              
              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex text-sm rounded-full focus:outline-none">
                  {staffData?.photoURL ? (
                    <img 
                      src={staffData.photoURL} 
                      alt={staffData.name} 
                      className="h-8 w-8 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaUserCircle className="h-6 w-6 text-blue-500" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600/0.5 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

// Stats Card Component - Updated with more modern design
const StatCard = ({ icon: Icon, title, value, bgColor, percentage, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {percentage && (
            <p className={`text-xs font-medium mt-2 flex items-center ${
              trend === "up" 
                ? "text-green-600" 
                : trend === "down" 
                  ? "text-red-600" 
                  : "text-gray-500"
            }`}>
              {trend === "up" ? (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              ) : trend === "down" ? (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              ) : ""} 
              {percentage} since last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Activity Item Component - Redesigned for better readability
const ActivityItem = ({ user, action, time, avatarUrl, category }) => {
  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'patient': return 'bg-blue-100 text-blue-700';
      case 'appointment': return 'bg-green-100 text-green-700';
      case 'report': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 hover:bg-gray-50 px-2 rounded-lg -mx-2 transition-colors">
      <div className="shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} className="h-9 w-9 rounded-full border border-gray-200" alt={user} />
        ) : (
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUserCircle className="h-6 w-6 text-blue-500" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center mb-1">
          <p className="text-sm font-medium text-gray-900 mr-2">
            {user}
          </p>
          {category && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(category)}`}>
              {category}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700">
          {action}
        </p>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <FaClock className="h-3 w-3 mr-1" />
          {time}
        </p>
      </div>
    </div>
  );
};

// Task Item Component - Improved with status indicators
const TaskItem = ({ task, status, dueDate, priority }) => {
  const getStatusClasses = (stat) => {
    switch(stat) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityClasses = (pri) => {
    switch(pri) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-orange-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="py-3 px-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center mb-1">
            {priority && (
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                priority === 'High' ? 'bg-red-500' : 
                priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
              }`}></span>
            )}
            <p className="text-sm font-medium text-gray-900 truncate">{task}</p>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <FaClock className="mr-1 h-3 w-3" />
            <span className={priority ? getPriorityClasses(priority) : ''}>
              Due {dueDate}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(status)}`}>
            {status === 'Completed' && <FaCheckCircle className="mr-1 h-3 w-3" />}
            {status === 'Overdue' && <FaExclamationTriangle className="mr-1 h-3 w-3" />}
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component - Updated with hover effects
const QuickActionButton = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200"
    >
      <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 transition-colors group-hover:bg-blue-100">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
};

// Alert Component - New component for alerts/notifications
const Alert = ({ type, message }) => {
  const getAlertClasses = () => {
    switch(type) {
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success': return 'bg-green-50 border-green-200 text-green-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'info': return <FaInfoCircle className="h-5 w-5" />;
      case 'success': return <FaCheckCircle className="h-5 w-5" />;
      case 'warning': return <FaExclamationTriangle className="h-5 w-5" />;
      case 'error': return <FaExclamationCircle className="h-5 w-5" />;
      default: return <FaInfoCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className={`flex items-center p-4 mb-6 rounded-lg border ${getAlertClasses()}`}>
      <div className="shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

// UpcomingAppointment Component - New component for displaying appointments
const UpcomingAppointment = ({ patient, time, type, status }) => {
  const getStatusColor = (stat) => {
    switch(stat) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="shrink-0">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUserInjured className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{patient}</p>
          <div className="flex items-center text-xs text-gray-500">
            <FaClock className="mr-1 h-3 w-3" />
            <span>{time}</span>
            {type && (
              <>
                <span className="mx-1.5">•</span>
                <span>{type}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

// Main Dashboard Component
const StaffDashboard = () => {
  const { staffData } = useStaffStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAlert, setShowAlert] = useState(true);
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  
  // Enhanced mock data for demo purposes
  const stats = [
    { icon: FaUserInjured, title: "Total Patients", value: "1,284", bgColor: "bg-blue-600", percentage: "12%", trend: "up" },
    { icon: FaCalendarCheck, title: "Today's Appointments", value: "42", bgColor: "bg-green-600", percentage: "8%", trend: "up" },
    { icon: FaClipboardList, title: "Pending Reports", value: "7", bgColor: "bg-amber-500", percentage: "3%", trend: "down" },
    { icon: FaTasks, title: "Completed Tasks", value: "89%", bgColor: "bg-purple-600", percentage: "5%", trend: "up" },
  ];
  
  const recentActivities = [
    { user: "Dr. Smith", action: "updated the medical record for Patient #2845", time: "2 minutes ago", category: "patient" },
    { user: "Nurse Johnson", action: "completed a health assessment for Patient #3492", time: "15 minutes ago", category: "patient" },
    { user: "Dr. Williams", action: "prescribed medication for Patient #12453", time: "32 minutes ago", category: "patient" },
    { user: "Receptionist Lee", action: "scheduled a new appointment for Patient #5623", time: "1 hour ago", category: "appointment" },
    { user: "Lab Tech Thomas", action: "uploaded new test results for Patient #8902", time: "2 hours ago", category: "report" },
  ];
  
  const upcomingTasks = [
    { task: "Review patient lab results for Patient #34521", status: "Pending", dueDate: "Today, 2:00 PM", priority: "High" },
    { task: "Team meeting - Oncology Department", status: "In Progress", dueDate: "Today, 3:30 PM", priority: "Medium" },
    { task: "Update medical records for Patient #34521", status: "Pending", dueDate: "Today, 5:00 PM", priority: "Medium" },
    { task: "Order medical supplies", status: "Completed", dueDate: "Yesterday, 4:00 PM", priority: "Low" },
    { task: "Submit monthly department report", status: "Overdue", dueDate: "Yesterday, 9:00 AM", priority: "High" },
  ];

  const upcomingAppointments = [
    { patient: "James Wilson", time: "Today, 11:30 AM", type: "Check-up", status: "Confirmed" },
    { patient: "Maria Garcia", time: "Today, 1:15 PM", type: "Consultation", status: "Confirmed" },
    { patient: "Robert Johnson", time: "Today, 2:45 PM", type: "Follow-up", status: "Pending" },
    { patient: "Sarah Thompson", time: "Today, 4:00 PM", type: "Blood Test", status: "Confirmed" },
  ];
  
  const quickActions = [
    { icon: FaUserInjured, label: "Add Patient", onClick: () => toast.success("Add Patient feature coming soon!") },
    { icon: FaCalendarCheck, label: "Schedule", onClick: () => toast.success("Schedule feature coming soon!") },
    { icon: FaFileAlt, label: "New Report", onClick: () => toast.success("New Report feature coming soon!") },
    { icon: FaStethoscope, label: "Add Diagnosis", onClick: () => toast.success("Add Diagnosis feature coming soon!") },
  ];

  // New data for widgets
  const noticeboardItems = [
    { title: "Staff Meeting", date: "December 15, 2023", content: "All department heads are required to attend the quarterly staff meeting." },
    { title: "Electronic Record System Update", date: "December 10, 2023", content: "The EHR system will be updated this weekend. Please save all work by Friday 5PM." },
    { title: "Holiday Schedule", date: "December 5, 2023", content: "Please submit your holiday availability to HR by end of this week." },
  ];

  const performanceMetrics = [
    { label: "Patient Satisfaction", value: "94%", change: "+2%", changeType: "positive" },
    { label: "Treatment Efficacy", value: "88%", change: "+5%", changeType: "positive" },
    { label: "Average Wait Time", value: "12 min", change: "-3 min", changeType: "positive" },
    { label: "Documentation Accuracy", value: "96%", change: "+1%", changeType: "positive" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <DashboardLayout activePage="dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header with Enhanced Design */}
        <div className="pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                {getGreeting()}, {staffData?.name?.split(' ')[0] || "Staff Member"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <FaHospital className="mr-2 text-blue-600" />
                <span className="text-sm font-medium">
                  Medicare Medical Center
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Section */}
        {showAlert && (
          <Alert 
            type="info" 
            message="Welcome to the new staff dashboard! We've updated the interface to improve your workflow. Take a moment to explore the new features." 
          />
        )}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Quick Actions with improved grid */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  onClick={action.onClick}
                />
              ))}
            </div>
          </motion.div>

          {/* Stats Cards with animations */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 3-Column Layout for Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments - New Section */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{upcomingAppointments.length} Total</span>
                </div>
                <div className="px-6 py-3 divide-y divide-gray-100">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment, index) => (
                      <UpcomingAppointment key={index} {...appointment} />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center">No appointments scheduled for today</p>
                  )}
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <Link to="/staff/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                    View full schedule
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Performance Metrics - New Section */}
              <div className="mt-6 bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                      <p className={`text-xs font-medium mt-1 ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tasks and Activities - Middle Column */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              {/* Upcoming Tasks */}
              <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">5 Tasks</span>
                </div>
                <div className="px-6 py-3 divide-y divide-gray-100">
                  {upcomingTasks.map((task, index) => (
                    <TaskItem key={index} {...task} />
                  ))}
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <Link to="/staff/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                    View all tasks
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Noticeboard - New Section */}
              <div className="mt-6 bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">Staff Noticeboard</h3>
                </div>
                <div className="px-6 py-3 divide-y divide-gray-100">
                  {noticeboardItems.map((item, index) => (
                    <div key={index} className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity - Right Column */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="px-6 py-3 divide-y divide-gray-100">
                  {recentActivities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <Link to="/staff/activity" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                    View all activity
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Resources Quick Links - New Section */}
              <div className="mt-6 bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">Quick Resources</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {[
                    { icon: FaFileMedical, label: "Medical Forms", color: "bg-blue-50 text-blue-600" },
                    { icon: FaUserNurse, label: "Staff Directory", color: "bg-purple-50 text-purple-600" },
                    { icon: FaFileAlt, label: "Treatment Protocols", color: "bg-green-50 text-green-600" },
                    { icon: FaLaptopMedical, label: "Training Resources", color: "bg-amber-50 text-amber-600" }
                  ].map((resource, index) => (
                    <div key={index} className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                      <div className={`w-10 h-10 mx-auto rounded-full ${resource.color} flex items-center justify-center mb-2`}>
                        <resource.icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">{resource.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard; 