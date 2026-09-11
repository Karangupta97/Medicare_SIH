import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";
import PrescriptionCard from "../../components/User/DigitalPrescriptionCard";
import { 
  FiFileText, FiSearch, FiFilter, FiCalendar, 
  FiGrid, FiList, FiAlertTriangle,
  FiChevronDown, FiCheck, FiX, FiRefreshCw, FiActivity, FiClock,
  FiTrendingUp, FiUser, FiMapPin, FiPackage, FiBookOpen, FiStar,
  FiSliders, FiHeart
} from "react-icons/fi";

const AllDigitalPrescriptions = () => {
  const { user, token } = useAuthStore();
  const { 
    prescriptions,
    isLoading,
    error,
    fetchPrescriptions
  } = usePatientStore();  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "doctor", "hospital"
  const [showFilters, setShowFilters] = useState(false);

  // Fetch prescriptions from store
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        await fetchPrescriptions(token);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        toast.error("An error occurred while fetching prescriptions");
      }
    };

    if (token) {
      loadPrescriptions();
    }
  }, [token, fetchPrescriptions]);  // Filter prescriptions when search term or filter changes
  useEffect(() => {
    if (!prescriptions.length) {
      setFilteredPrescriptions([]);
      return;
    }
    
    let results = [...prescriptions];
    
    // Calculate date for recent filter
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(prescription => 
        (prescription.doctor && prescription.doctor.toLowerCase().includes(lowercasedSearch)) ||
        (prescription.hospitalName && prescription.hospitalName.toLowerCase().includes(lowercasedSearch)) ||
        (prescription.diagnosis && prescription.diagnosis.toLowerCase().includes(lowercasedSearch)) ||
        (prescription.medications && prescription.medications.some(med => 
          med.name.toLowerCase().includes(lowercasedSearch)
        ))
      );
    }
    
    // Apply category filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "active") {
        results = results.filter(prescription => prescription.status === "Active" || !prescription.status);
      } else if (selectedFilter === "completed") {
        results = results.filter(prescription => prescription.status === "Completed");
      } else if (selectedFilter === "recent") {
        results = results.filter(prescription => 
          new Date(prescription.createdAt) >= thirtyDaysAgo
        );
      }
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "doctor") {
      results.sort((a, b) => (a.doctor || "").localeCompare(b.doctor || ""));
    } else if (sortBy === "hospital") {
      results.sort((a, b) => (a.hospitalName || "").localeCompare(b.hospitalName || ""));
    }
    
    setFilteredPrescriptions(results);
  }, [prescriptions, searchTerm, selectedFilter, sortBy]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter selection
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Handle sort selection
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle view mode toggle
  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('newest');
  };
  // List view prescription item component
  const PrescriptionListItem = ({ prescription }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group"
      >
        <Link to={`/dashboard/digital-prescriptions/${prescription._id}`} className="block">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shrink-0 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-800/30 dark:group-hover:to-indigo-800/30 transition-all duration-300">
                  <FiFileText className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    Prescription #{prescription._id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {formatDate(prescription.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="sm:text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  ${(prescription.status === "Active" || !prescription.status) ? 
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : 
                    prescription.status === "Completed" ? 
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : 
                    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    (prescription.status === "Active" || !prescription.status) ? "bg-emerald-500" :
                    prescription.status === "Completed" ? "bg-blue-500" : "bg-gray-500"
                  }`}></div>
                  {prescription.status || "Active"}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Doctor</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Dr. {prescription.doctor || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {prescription.hospitalName || "Not specified"}
                  </p>
                </div>
              </div>              <div className="flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Medications</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {prescription.medications ? prescription.medications.length : 0} prescribed
                  </p>
                </div>
              </div>
            </div>
            
            {prescription.diagnosis && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiActivity className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Diagnosis</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {prescription.diagnosis}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  Created {formatDate(prescription.createdAt)}
                </span>
              </div>
              <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-medium">View Details →</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
            </div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center mb-6">
              <FiAlertTriangle className="text-red-500 dark:text-red-400 text-3xl" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Unable to Load Prescriptions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto mb-8">
              {error || "We encountered an error while loading your prescriptions. Please try again later."}
            </p>            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <FiRefreshCw className="mr-2" />
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                Digital Prescriptions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">
                Manage and track all your medical prescriptions in one place
              </p>
            </div>
            

          </div>
        </motion.div>        
        {/* Filters and search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Search field */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 w-5 h-5" />                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm transition-all duration-300"
                  placeholder="Search by doctor, hospital, diagnosis, or medication..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <FiX className="text-gray-400 hover:text-gray-600 w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Filters toggle for mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
              >
                <span className="flex items-center">
                  <FiSliders className="mr-2 w-4 h-4" /> 
                  Filters & Sort
                </span>
                <FiChevronDown className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Filter Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center gap-1">
                <FiFilter className="w-4 h-4" /> 
                Filter:
              </span>
                <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedFilter === 'all' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                
                <button
                  onClick={() => handleFilterChange('active')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedFilter === 'active' 
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Active
                </button>
                
                <button
                  onClick={() => handleFilterChange('completed')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedFilter === 'completed' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Completed
                </button>
                
                <button
                  onClick={() => handleFilterChange('recent')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedFilter === 'recent' 
                      ? 'bg-gradient-to-r from-orange-600 to-yellow-600 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm"
              >
                <div className="p-6 space-y-4">                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedFilter === 'all' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      All
                    </button>
                    
                    <button
                      onClick={() => handleFilterChange('active')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedFilter === 'active' 
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Active
                    </button>
                    
                    <button
                      onClick={() => handleFilterChange('completed')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedFilter === 'completed' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Completed
                    </button>
                    
                    <button
                      onClick={() => handleFilterChange('recent')}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedFilter === 'recent' 
                          ? 'bg-gradient-to-r from-orange-600 to-yellow-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Recent
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label htmlFor="mobileSortBy" className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" /> 
                      Sort by:
                    </label>
                    <select
                      id="mobileSortBy"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm transition-all duration-300"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="doctor">Doctor Name</option>
                      <option value="hospital">Hospital Name</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Advanced Options - Desktop */}
          <div className="hidden lg:flex lg:flex-row items-center justify-between p-6 pt-0 mt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Sort options */}
            <div className="flex items-center gap-3">
              <label htmlFor="sortBy" className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                <FiCalendar className="w-4 h-4" /> 
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                className="py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="doctor">Doctor Name</option>
                <option value="hospital">Hospital Name</option>
              </select>
            </div>
            
            {/* View mode and result count */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'} found
              </div>
              
              {/* Reset filters */}
              {(searchTerm || selectedFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-300"
                >
                  <FiX className="mr-1 w-4 h-4" /> 
                  Reset filters
                </button>
              )}
              
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="Grid view"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="List view"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile result count and view toggle */}
          <div className="lg:hidden flex items-center justify-between p-6 pt-0 mt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Reset filters button */}
              {(searchTerm || selectedFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  <FiX className="mr-1 w-3 h-3" /> 
                  Reset
                </button>
              )}
              
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  title="Grid view"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  title="List view"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* No results state */}
        {filteredPrescriptions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-6">
                <FiFileText className="text-gray-400 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                {searchTerm || selectedFilter !== 'all' ? 'No matches found' : 'No prescriptions yet'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 text-lg">
                {searchTerm || selectedFilter !== 'all' 
                  ? "No prescriptions match your current search and filters. Try adjusting your criteria."
                  : "You don't have any prescriptions yet. They will appear here once a healthcare provider issues them."}
              </p>
              
              {(searchTerm || selectedFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Prescription list/grid */}
        {filteredPrescriptions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
              : "space-y-4 sm:space-y-6"
            }
          >
            {filteredPrescriptions.map((prescription, index) => (
              <motion.div
                key={prescription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                {viewMode === 'grid' ? (
                  <PrescriptionCard 
                    prescription={prescription} 
                  />
                ) : (
                  <PrescriptionListItem 
                    prescription={prescription} 
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllDigitalPrescriptions;