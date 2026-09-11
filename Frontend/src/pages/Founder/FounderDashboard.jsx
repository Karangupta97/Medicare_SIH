import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Users, 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Server,
  TrendingUp,
  BarChart2,
  Database,
  Globe,
  Zap,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import FounderDashboardLayout from "../../components/Founder/FounderDashboardLayout";
import { useFounderStore } from "../../store/founderStore";

const FounderDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  
  // Use founder store hooks
  const { 
    getDashboardData,
    founder,
    isLoading, 
    error: storeError 
  } = useFounderStore();
  
  const [error, setError] = useState(null);
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        
        if (response.success) {
          setDashboardData(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(storeError || err.message || "An error occurred while fetching dashboard data");
        toast.error("Failed to load dashboard data");
      }
    };
    
    fetchDashboardData();
    // Use empty dependency array to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Watch for store error changes to update local error state
  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);
  
  // Render loading state
  if (isLoading) {
    return (
      <FounderDashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400 animate-pulse">Loading dashboard data...</p>
          </div>
        </div>
      </FounderDashboardLayout>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <FounderDashboardLayout>
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-red-100 dark:border-red-900/30">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Failed to load dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </FounderDashboardLayout>
    );
  }
  
  // Initialize safe default data structure
  const defaultData = {
    stats: {
      totalUsers: 0,
      totalReports: 0,
      activeStaff: 0,
      activeAdmins: 0,
      monthlyAPIUsage: {
        used: 0,
        total: 1000000,
        percentage: 0
      },
      systemHealth: {
        healthScore: "N/A",
        uptime: "N/A",
        performance: "N/A"
      },
      businessMetrics: {
        revenue: "$0",
        growth: "+0%",
        userGrowth: "+0%",
        activeSessions: 0
      }
    },
    recentUsers: [],
    systemAlerts: [],
    platformStatus: {
      servers: [],
      services: []
    },
    userGrowth: [],
    apiUsage: []
  };
  
  // Mock data if API isn't implemented yet, with fallbacks for safety
  const mockData = {
    stats: {
      totalUsers: 12482,
      totalReports: 36517,
      activeStaff: 147,
      activeAdmins: 14,
      monthlyAPIUsage: {
        used: 843200,
        total: 1000000,
        percentage: 84.32
      },
      systemHealth: {
        healthScore: "98.7%",
        uptime: "99.99%",
        performance: "96.4%"
      },
      businessMetrics: {
        revenue: "$345,621",
        growth: "+12.5%",
        userGrowth: "+8.7%",
        activeSessions: 12483
      }
    },
    recentUsers: [
      {
        _id: "1",
        name: "Karan Gupta",
        email: "karangupta050705@gmail.com",
        role: "Patient",
        status: "active",
        createdAt: "2023-11-12T00:00:00.000Z"
      },
      {
        _id: "2",
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        role: "Doctor",
        status: "active",
        createdAt: "2023-11-15T00:00:00.000Z"
      },
      {
        _id: "3",
        name: "Amit Patel",
        email: "amit.patel@medical.org",
        role: "Hospital Admin",
        status: "pending",
        createdAt: "2023-11-18T00:00:00.000Z"
      },
      {
        _id: "4",
        name: "Shreya Singh",
        email: "shreya.singh@healthcare.net",
        role: "Patient",
        status: "active",
        createdAt: "2023-11-20T00:00:00.000Z"
      }
    ],
    systemAlerts: [
      {
        type: "security",
        severity: "high",
        message: "Multiple failed login attempts detected from IP 192.168.1.45",
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        type: "update",
        severity: "info",
        message: "New version 2.4.1 available for deployment",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: "performance",
        severity: "medium",
        message: "Database query latency increased by 15% in the last hour",
        timestamp: new Date(Date.now() - 50 * 60 * 1000)
      }
    ],
    platformStatus: {
      servers: [
        { name: "API Server", status: "healthy", load: 42 },
        { name: "Database Server", status: "healthy", load: 58 },
        { name: "Authentication Server", status: "healthy", load: 33 },
        { name: "Storage Server", status: "warning", load: 87 }
      ],
      services: [
        { name: "User Authentication", status: "operational" },
        { name: "Data Processing", status: "operational" },
        { name: "Report Generation", status: "operational" },
        { name: "API Gateway", status: "operational" },
        { name: "Email Notifications", status: "operational" }
      ]
    },
    userGrowth: [
      { month: 'Jan', users: 4000 },
      { month: 'Feb', users: 4400 },
      { month: 'Mar', users: 5200 },
      { month: 'Apr', users: 5800 },
      { month: 'May', users: 6700 },
      { month: 'Jun', users: 7400 },
      { month: 'Jul', users: 8200 },
      { month: 'Aug', users: 9100 },
      { month: 'Sep', users: 10200 },
      { month: 'Oct', users: 11300 },
      { month: 'Nov', users: 12000 },
      { month: 'Dec', users: 12482 }
    ],
    apiUsage: [
      { date: '2023-10-01', calls: 25000 },
      { date: '2023-10-08', calls: 28500 },
      { date: '2023-10-15', calls: 32000 },
      { date: '2023-10-22', calls: 34500 },
      { date: '2023-10-29', calls: 37200 },
      { date: '2023-11-05', calls: 38800 },
      { date: '2023-11-12', calls: 41000 },
      { date: '2023-11-19', calls: 43200 },
      { date: '2023-11-26', calls: 45600 }
    ]
  };
  
  // Safely merge API data or use mock data with fallbacks to default
  const data = dashboardData 
    ? { 
        ...defaultData,
        ...dashboardData
      } 
    : { 
        ...defaultData,
        ...mockData
      };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(date);
  };
  
  // Get alert icon based on type and severity
  const getAlertIcon = (type, severity) => {
    if (type === "security") {
      return <Shield className={`h-5 w-5 ${severity === "high" ? "text-red-500" : "text-orange-500"}`} />;
    } else if (type === "performance") {
      return <Activity className="h-5 w-5 text-orange-500" />;
    } else if (type === "update") {
      return <Info className="h-5 w-5 text-blue-500" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get status indicator color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'active':
        return 'bg-green-500';
      case 'warning':
      case 'pending':
        return 'bg-amber-500';
      case 'error':
      case 'critical':
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, animation }) => {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: animation * 0.1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1"
      >
        <div className={`h-1.5 ${gradient}`}></div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h2>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {subtitle && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Health Indicator Component
  const HealthIndicator = ({ title, value, color }) => {
    return (
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full ${color} mr-2`}></span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
        </div>
      </div>
    );
  };
  
  // Variants for animations
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <FounderDashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {founder?.name || 'Founder'}
              </h1>
              <p className="mt-1 text-blue-100 dark:text-blue-200">
                Here's an overview of your Medicare platform
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                <Clock className="h-4 w-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Executive Overview - Top Stats Cards */}
        <div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
          >
            📊 Executive Overview
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={(data.stats?.totalUsers || 0).toLocaleString()} 
              icon={Users}
              gradient="bg-linear-to-r from-blue-500 to-indigo-500"
              animation={1}
            />
            
            <StatCard 
              title="Total Reports" 
              value={(data.stats?.totalReports || 0).toLocaleString()} 
              icon={FileText}
              gradient="bg-linear-to-r from-purple-500 to-pink-500"
              animation={2}
            />
            
            <StatCard 
              title="Active Staff & Admins" 
              value={(data.stats?.activeStaff || 0).toLocaleString()} 
              subtitle={`+${data.stats?.activeAdmins || 0} admins`}
              icon={Shield}
              gradient="bg-linear-to-r from-green-500 to-emerald-500"
              animation={3}
            />
            
            <StatCard 
              title="Monthly API Usage" 
              value={`${Math.round(data.stats?.monthlyAPIUsage?.percentage || 0)}%`} 
              subtitle={`${((data.stats?.monthlyAPIUsage?.used || 0) / 1000).toLocaleString()}k calls`}
              icon={Server}
              gradient="bg-linear-to-r from-amber-500 to-orange-500"
              animation={4}
            />
          </div>
        </div>
        
        {/* Business Metrics & Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 lg:col-span-2 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                User Growth Trend
              </h3>
              <div className="flex gap-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {data.stats?.businessMetrics?.userGrowth || "+0%"}
                </span>
                <select className="text-xs rounded-lg border-gray-200 dark:border-gray-700 bg-transparent">
                  <option>This Year</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.userGrowth || []}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280' }} 
                    axisLine={{ stroke: '#9CA3AF', strokeWidth: 0.5 }} 
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280' }} 
                    axisLine={{ stroke: '#9CA3AF', strokeWidth: 0.5 }}
                    tickFormatter={(tick) => `${(tick / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '0.75rem'
                    }}
                    formatter={(value) => [`${value.toLocaleString()} users`, 'Total']}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="url(#colorGradient)" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          
          {/* Business KPIs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Business Metrics
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/20">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {data.stats?.businessMetrics?.growth || "+0%"}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 mb-1">{data.stats?.businessMetrics?.revenue || "$0"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Sessions</p>
                  <div className="flex justify-between items-end">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{(data.stats?.businessMetrics?.activeSessions || 0).toLocaleString()}</p>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Global Reach</p>
                  <div className="flex justify-between items-end">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">127</p>
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Countries</p>
                </div>
              </div>
              
              {/* System Health */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">System Health</h4>
                
                <HealthIndicator 
                  title="Health Score" 
                  value={data.stats?.systemHealth?.healthScore || "N/A"} 
                  color="bg-green-500" 
                />
                
                <HealthIndicator 
                  title="Uptime" 
                  value={data.stats?.systemHealth?.uptime || "N/A"} 
                  color="bg-green-500" 
                />
                
                <HealthIndicator 
                  title="Performance" 
                  value={data.stats?.systemHealth?.performance || "N/A"} 
                  color="bg-green-500" 
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* System Alerts & Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Alerts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Alerts
            </h3>
            
            <div className="space-y-4">
              {(data.systemAlerts || []).map((alert, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl ${
                    alert.type === "security" && alert.severity === "high"
                      ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                      : alert.type === "performance"
                      ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
                      : "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                  }`}
                >
                  <div className="flex items-start">
                    {getAlertIcon(alert.type, alert.severity)}
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className={`text-sm font-medium ${
                          alert.type === "security" && alert.severity === "high"
                            ? "text-red-800 dark:text-red-300"
                            : alert.type === "performance"
                            ? "text-amber-800 dark:text-amber-300"
                            : "text-blue-800 dark:text-blue-300"
                        }`}>
                          {alert.type === "security" ? "Security Alert" : 
                           alert.type === "performance" ? "Performance Alert" : 
                           "System Update"}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(alert.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(data.systemAlerts || []).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No system alerts</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Recent User Registrations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent User Registrations
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                View all
              </button>
            </div>
            
            {(data.recentUsers || []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(data.recentUsers || []).map((user, index) => (
                      <tr key={user._id || index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium text-sm">
                              {(user.name || "User").charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || "Unknown User"}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.role || "User"}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.createdAt ? formatDate(user.createdAt) : "Unknown"}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (user.status || "").toLowerCase() === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            <div className="flex items-center">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                (user.status || "").toLowerCase() === 'active' ? 'bg-green-500' : 'bg-amber-500'
                              } mr-1.5`}></span>
                              {(user.status || "").toLowerCase() === 'active' ? 'Active' : user.status || 'Pending'}
                            </div>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent user registrations</p>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* API Usage Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              API Usage Trends
            </h3>
            <div className="flex gap-2">
              <select className="text-xs rounded-lg border-gray-200 dark:border-gray-700 bg-transparent">
                <option>Last 60 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.apiUsage || []}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280' }} 
                  axisLine={{ stroke: '#9CA3AF', strokeWidth: 0.5 }} 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }} 
                  axisLine={{ stroke: '#9CA3AF', strokeWidth: 0.5 }} 
                  tickFormatter={(tick) => `${(tick / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.75rem'
                  }}
                  formatter={(value) => [`${value.toLocaleString()} calls`, 'API Calls']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: '#4F46E5', strokeWidth: 0, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* API Usage Limit */}
          <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly API Limit</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {((data.stats?.monthlyAPIUsage?.used || 0) / 1000).toLocaleString()}k / {((data.stats?.monthlyAPIUsage?.total || 0) / 1000).toLocaleString()}k calls
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  (data.stats?.monthlyAPIUsage?.percentage || 0) > 90 
                    ? 'bg-red-600' 
                    : (data.stats?.monthlyAPIUsage?.percentage || 0) > 75 
                    ? 'bg-amber-500' 
                    : 'bg-green-600'
                }`} 
                style={{ width: `${data.stats?.monthlyAPIUsage?.percentage || 0}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {(data.stats?.monthlyAPIUsage?.percentage || 0) > 90 
                ? 'Critical: Consider increasing your API limit' 
                : (data.stats?.monthlyAPIUsage?.percentage || 0) > 75 
                ? 'Warning: Approaching API usage limit' 
                : 'Healthy: API usage within limits'}
            </div>
          </div>
        </motion.div>
        
        {/* Platform Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platform Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Server Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Server Health</h4>
              <div className="space-y-3">
                {(data.platformStatus?.servers || []).map((server, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(server.status)} mr-3`}></span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{server.name}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${
                            (server.load || 0) > 80 ? 'bg-red-600' : 
                            (server.load || 0) > 60 ? 'bg-amber-500' : 
                            'bg-green-600'
                          }`} 
                          style={{ width: `${server.load || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{server.load || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Service Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Service Status</h4>
              <div className="space-y-3">
                {(data.platformStatus?.services || []).map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(service.status)} mr-2`}></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {service.status === 'operational' ? 'Operational' : service.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </FounderDashboardLayout>
  );
};

export default FounderDashboard; 