import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/Patient/authStore';
import usePatientStore from '../../store/Patient/patientstore';
import Navbar from '../../components/Navbar';
import { 
  FiFileText, FiSearch, FiFilter, FiCalendar, FiDownload, 
  FiPrinter, FiGrid, FiList, FiPlus, FiArrowLeft, FiAlertTriangle,
  FiChevronDown, FiCheck, FiX, FiRefreshCw, FiFile, FiImage,
  FiClipboard, FiHardDrive, FiUpload, FiEye, FiTrash2, FiEdit,
  FiFolderPlus, FiMaximize2, FiMinimize2, FiZoomIn, FiZoomOut,
  FiBarChart2
} from 'react-icons/fi';

const HealthRecords = () => {
  const { user, token } = useAuthStore();
  const { 
    reports,
    prescriptions,
    isLoading,
    error,
    fetchReports,
    fetchPrescriptions
  } = usePatientStore();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'prescriptions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        if (token) {
          await Promise.all([
            fetchReports(token),
            fetchPrescriptions(token)
          ]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load health records');
      }
    };

    loadData();
  }, [token, fetchReports, fetchPrescriptions]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and sort data based on active tab
  const getFilteredData = () => {
    const data = activeTab === 'reports' ? reports : prescriptions;
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (activeTab === 'reports') {
          return (
            item.originalFilename?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          );
        } else {
          return (
            item.doctor?.toLowerCase().includes(query) ||
            item.hospitalName?.toLowerCase().includes(query) ||
            item.diagnosis?.toLowerCase().includes(query)
          );
        }
      });
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      if (activeTab === 'reports') {
        if (selectedFilter === 'images') {
          filtered = filtered.filter(item => item.contentType?.startsWith('image/'));
        } else if (selectedFilter === 'pdf') {
          filtered = filtered.filter(item => item.contentType === 'application/pdf');
        } else if (selectedFilter === 'medical') {
          filtered = filtered.filter(item => item.category === 'medical');
        }
      } else {
        if (selectedFilter === 'active') {
          filtered = filtered.filter(item => item.status === 'Active');
        } else if (selectedFilter === 'completed') {
          filtered = filtered.filter(item => item.status === 'Completed');
        } else if (selectedFilter === 'recent') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filtered = filtered.filter(item => new Date(item.createdAt) >= thirtyDaysAgo);
        }
      }
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = activeTab === 'reports' ? a.originalFilename : a.doctor;
        const nameB = activeTab === 'reports' ? b.originalFilename : b.doctor;
        return (nameA || '').localeCompare(nameB || '');
      });
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full pt-0 pb-8 max-w-full mx-auto">
          <div className="flex justify-center w-full bg-white dark:bg-gray-900 pb-3">
            <Navbar />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full pt-0 pb-8 max-w-full mx-auto">
          <div className="flex justify-center w-full bg-white dark:bg-gray-900 pb-3">
            <Navbar />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="rounded-full bg-red-100 h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-red-500 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Health Records</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiRefreshCw className="inline mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full pt-0 pb-8 max-w-full mx-auto">
        <div className="flex justify-center w-full bg-white dark:bg-gray-900 pb-3">
          <Navbar />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Health Records</h1>
              <p className="text-gray-600 mt-1">Access and manage your medical reports and prescriptions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiUpload className="mr-2" />
                Upload New
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors relative
                  ${activeTab === 'reports' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                Medical Reports
                {activeTab === 'reports' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors relative
                  ${activeTab === 'prescriptions' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                Digital Prescriptions
                {activeTab === 'prescriptions' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Enhanced Search */}
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab === 'reports' ? 'reports' : 'prescriptions'}...`}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Enhanced Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative min-w-[180px]">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="all">All Categories</option>
                      {activeTab === 'reports' ? (
                        <>
                          <option value="images">Images</option>
                          <option value="pdf">PDF Documents</option>
                          <option value="medical">Medical Reports</option>
                        </>
                      ) : (
                        <>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="recent">Recent</option>
                        </>
                      )}
                    </select>
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative min-w-[180px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name</option>
                    </select>
                    <FiBarChart2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {viewMode === 'grid' ? <FiList /> : <FiGrid />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="rounded-full bg-gray-100 h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <FiFileText className="text-gray-400 text-2xl" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">No {activeTab} found</h2>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedFilter !== 'all'
                  ? "No items match your current filters. Try adjusting your search or filters."
                  : `You don't have any ${activeTab} yet.`}
              </p>
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiUpload className="mr-2" />
                Upload New
              </Link>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredData.map(item => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow
                    ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
                >
                  {/* Preview Section */}
                  <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'h-48'} bg-gray-50 flex items-center justify-center`}>
                    {activeTab === 'reports' ? (
                      item.contentType?.startsWith('image/') ? (
                        <img 
                          src={item.fileUrl} 
                          alt={item.originalFilename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="p-4 text-center">
                          <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">
                            {item.contentType?.split('/')[1]?.toUpperCase() || 'Document'}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="p-4 text-center">
                        <FiFileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Prescription</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {activeTab === 'reports' ? item.originalFilename : `Prescription #${item._id.substring(0, 8)}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0
                        ${activeTab === 'reports' 
                          ? item.category === 'medical' ? 'bg-green-100 text-green-800' :
                            item.category === 'lab' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          : item.status === 'Active' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {activeTab === 'reports' ? item.category : item.status}
                      </span>
                    </div>

                    {activeTab === 'reports' ? (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {item.description || 'No description provided'}
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600 truncate">
                          <span className="font-medium">Doctor:</span> Dr. {item.doctor || 'Not specified'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          <span className="font-medium">Hospital:</span> {item.hospitalName || 'Not specified'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (activeTab === "reports") {
                            navigate("/dashboard/reports", {
                              state: { fromSearch: true, reportData: item },
                            });
                            return;
                          }

                          navigate(`/dashboard/digital-prescriptions/${item._id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => window.open(item.fileUrl, '_blank')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthRecords; 