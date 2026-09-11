import React, { useState, useEffect } from 'react';
import { useDoctorVerificationStore } from '../../../../store/doctorVerificationStore';
import { FaStethoscope, FaFilePdf, FaImage, FaEye, FaCheck, FaTimes, FaSearch, FaExclamationTriangle, FaBriefcaseMedical, FaCertificate, FaClipboardCheck, FaFilter, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { DashboardLayout } from '../../../../pages/Admin/Staff/Dashboard/StaffDashboard';
import { motion } from 'framer-motion';

const DoctorVerification = () => {
  const {
    pendingDoctors,
    verifiedDoctors,
    selectedDoctor,
    error,
    getPendingDoctors,
    getVerifiedDoctors,
    getDoctorDetails,
    approveDoctor,
    rejectDoctor,
    clearSelectedDoctor
  } = useDoctorVerificationStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Load initial data
  useEffect(() => {
    if (activeTab === 'pending') {
      getPendingDoctors();
    } else if (activeTab === 'approved' || activeTab === 'rejected') {
      getVerifiedDoctors();
    }
  }, [activeTab, getPendingDoctors, getVerifiedDoctors]);

  // Store counts in local state to prevent them from resetting
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Update counts whenever doctor data changes
  useEffect(() => {
    const pendingCount = Array.isArray(pendingDoctors) ? pendingDoctors.length : 0;
    const approvedCount = Array.isArray(verifiedDoctors) 
      ? verifiedDoctors.filter(d => d.isVerified === 'approved').length 
      : 0;
    const rejectedCount = Array.isArray(verifiedDoctors) 
      ? verifiedDoctors.filter(d => d.isVerified === 'rejected').length 
      : 0;
    
    // Only update if we have valid data (non-zero or existing data)
    if (pendingCount > 0 || approvedCount > 0 || rejectedCount > 0 || 
        (pendingDoctors && verifiedDoctors)) {
      setCounts({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      });
    }
  }, [pendingDoctors, verifiedDoctors]);

  // Handle tab change with improved data validation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return; // Don't reload if we're already on this tab
    setActiveTab(tab);
  };

  const handleViewDetails = async (doctorId) => {
    try {
      await getDoctorDetails(doctorId);
      setShowDetails(true);
    } catch (err) {
      console.error('Error viewing doctor details:', err);
      toast.error('Could not load doctor details. Please try again.');
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    clearSelectedDoctor();
  };

  const handleApproveDoctor = async () => {
    if (selectedDoctor) {
      try {
        const success = await approveDoctor(selectedDoctor._id);
        if (success) {
          handleCloseDetails();
          // Update data
          getPendingDoctors();
          getVerifiedDoctors();
          toast.success(`${selectedDoctor.fullName} has been approved successfully`);
        }
      } catch (err) {
        console.error('Error approving doctor:', err);
        toast.error('Failed to approve doctor. Please try again.');
      }
    }
  };

  const handleShowRejectModal = () => {
    setShowRejectModal(true);
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleRejectDoctor = async () => {
    if (selectedDoctor && rejectionReason) {
      try {
        const success = await rejectDoctor(selectedDoctor._id, rejectionReason);
        if (success) {
          setShowRejectModal(false);
          setRejectionReason('');
          handleCloseDetails();
          // Update data
          getPendingDoctors();
          getVerifiedDoctors();
          toast.success(`${selectedDoctor.fullName} has been rejected`);
        }
      } catch (err) {
        console.error('Error rejecting doctor:', err);
        toast.error('Failed to reject doctor. Please try again.');
      }
    } else if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort and filter functions
  const sortData = (data) => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle nested properties or dates
      if (sortField === 'createdAt' || sortField === 'verifiedAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Safely filter and prepare doctors arrays
  const filteredPendingDoctors = Array.isArray(pendingDoctors)
    ? sortData(pendingDoctors.filter(doctor => 
        doctor && doctor.fullName && doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor && doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor && doctor.medicalRegistrationNumber && doctor.medicalRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    : [];
  
  const allVerifiedDoctors = Array.isArray(verifiedDoctors)
    ? sortData(verifiedDoctors.filter(doctor => 
        doctor && doctor.fullName && doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor && doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor && doctor.medicalRegistrationNumber && doctor.medicalRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    : [];
  
  // Separate approved and rejected doctors
  const approvedDoctors = allVerifiedDoctors.filter(doctor => doctor.isVerified === 'approved');
  const rejectedDoctors = allVerifiedDoctors.filter(doctor => doctor.isVerified === 'rejected');

  // Use the local counts state instead of calculating them each time
  const pendingCount = counts.pending;
  const approvedCount = counts.approved;
  const rejectedCount = counts.rejected;

  // Check for error state
  const hasError = error;

  return (
    <DashboardLayout activePage="doctor-verification">
      <Helmet>
        <title>Doctor Verification | Medicare Staff Dashboard</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Verifications</h1>
              <p className="mt-1 text-sm text-gray-500">Review and approve doctor registration applications</p>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3">
              <div 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors border ${
                  activeTab === 'pending' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('pending')}
              >
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <span>Pending</span>
                <span className="px-1.5 py-0.5 bg-white rounded text-xs font-semibold text-gray-700 ml-1">{pendingCount}</span>
              </div>
              
              <div 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors border ${
                  activeTab === 'approved' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('approved')}
              >
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Approved</span>
                <span className="px-1.5 py-0.5 bg-white rounded text-xs font-semibold text-gray-700 ml-1">{approvedCount}</span>
              </div>
              
              <div 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors border ${
                  activeTab === 'rejected' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleTabChange('rejected')}
              >
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span>Rejected</span>
                <span className="px-1.5 py-0.5 bg-white rounded text-xs font-semibold text-gray-700 ml-1">{rejectedCount}</span>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-gray-100 pt-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
                placeholder="Search by name, email, or ID..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                <span>Sort by:</span>
                <button 
                  className="ml-2 flex items-center gap-1 bg-white px-3 py-1.5 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  onClick={() => handleSort('fullName')}
                >
                  Name
                  {sortField === 'fullName' && (
                    sortDirection === 'asc' ? 
                    <FaArrowUp className="h-3 w-3 text-blue-500" /> : 
                    <FaArrowDown className="h-3 w-3 text-blue-500" />
                  )}
                </button>
              </div>
              
            <button
                className="flex items-center gap-1 bg-white px-3 py-1.5 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                Date
                {sortField === 'createdAt' && (
                  sortDirection === 'asc' ? 
                  <FaArrowUp className="h-3 w-3 text-blue-500" /> : 
                  <FaArrowDown className="h-3 w-3 text-blue-500" />
                )}
            </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {hasError && (
          <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-6">
            <div className="p-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
                <FaExclamationTriangle className="h-6 w-6 text-red-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <button 
                  onClick={() => {
                    setLoadAttempts(prev => prev + 1);
                  }}
                  className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <>
              {filteredPendingDoctors.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center"
                >
                  <div className="p-6 bg-blue-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                    <FaStethoscope className="h-12 w-12 text-blue-500" />
                </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending verifications</h3>
                  <p className="mt-1 text-gray-500">All doctor registrations have been processed.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-x-auto"
                >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Council & State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingDoctors.map((doctor, index) => (
                        <motion.tr 
                          key={doctor._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaStethoscope className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                              <div className="text-sm text-gray-500">{doctor.email}</div>
                              <div className="text-sm text-gray-500">{doctor.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{doctor.medicalRegistrationNumber}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              <FaCertificate className="inline mr-1 text-blue-500" /> License ID
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.councilName}</div>
                          <div className="text-sm text-gray-500">{doctor.state}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.createdAt && new Date(doctor.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => handleViewDetails(doctor._id)}
                          >
                              <FaEye className="mr-1.5 h-4 w-4" /> View Details
                          </button>
                        </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </>
          )}

          {/* Approved Tab */}
          {activeTab === 'approved' && (
            <>
              {approvedDoctors.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center"
                >
                  <div className="p-6 bg-green-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                    <FaClipboardCheck className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No approved doctors</h3>
                  <p className="mt-1 text-gray-500">No doctor verifications have been approved yet.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-x-auto"
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified On
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedDoctors.map((doctor, index) => (
                        <motion.tr 
                          key={doctor._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FaStethoscope className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                                <div className="text-sm text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{doctor.medicalRegistrationNumber}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              <FaCertificate className="inline mr-1 text-green-500" /> License ID
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FaCheck className="mr-1 inline h-3 w-3" /> Approved
                            </span>
                            <div className="text-sm text-gray-500 mt-1">
                              {doctor.specialization || "General Practice"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.verifiedAt && new Date(doctor.verifiedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              onClick={() => handleViewDetails(doctor._id)}
                            >
                              <FaEye className="mr-1.5 h-4 w-4" /> View Details
                            </button>
                          </td>
                        </motion.tr>
                    ))}
                  </tbody>
                </table>
                </motion.div>
              )}
            </>
          )}

          {/* Rejected Tab */}
          {activeTab === 'rejected' && (
            <>
              {rejectedDoctors.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center"
                >
                  <div className="p-6 bg-red-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                    <FaTimes className="h-12 w-12 text-red-500" />
                </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No rejected doctors</h3>
                  <p className="mt-1 text-gray-500">No doctor verifications have been rejected yet.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-x-auto"
                >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rejected On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {rejectedDoctors.map((doctor, index) => (
                        <motion.tr 
                          key={doctor._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                <FaStethoscope className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                              <div className="text-sm text-gray-500">{doctor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{doctor.medicalRegistrationNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <FaTimes className="mr-1 inline h-3 w-3" /> Rejected
                          </span>
                            <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                              {doctor.rejectionReason}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.verifiedAt && new Date(doctor.verifiedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => handleViewDetails(doctor._id)}
                          >
                              <FaEye className="mr-1.5 h-4 w-4" /> View Details
                          </button>
                        </td>
                        </motion.tr>
                    ))}
                  </tbody>
                </table>
                </motion.div>
              )}
            </>
          )}
        </div>

      {/* Doctor Details Modal - only render when showDetails is true and selectedDoctor exists */}
      {showDetails && selectedDoctor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={handleCloseDetails} // Add click handler to close when clicking overlay
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6 relative" // Added relative for proper button positioning
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
              {/* Close button - enhanced positioning and styling */}
              <button
                type="button"
                onClick={handleCloseDetails}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="sm:flex sm:items-start">
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:h-10 sm:w-10">
                  <FaStethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Doctor Verification</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Review the doctor's credentials and verify their account status.
                    </p>
                  </div>
                </div>
                {selectedDoctor.isVerified && (
                  <div className="ml-auto">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDoctor.isVerified === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDoctor.isVerified === 'approved' && <FaCheck className="mr-1.5 h-4 w-4" />}
                      {selectedDoctor.isVerified === 'rejected' && <FaTimes className="mr-1.5 h-4 w-4" />}
                      {selectedDoctor.isVerified === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {/* Personal Information Section */}
                  <div className="sm:col-span-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                        <h5 className="text-xs font-medium text-gray-500">Full Name</h5>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedDoctor.fullName}</p>
                </div>
                <div>
                        <h5 className="text-xs font-medium text-gray-500">Email</h5>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.email}</p>
                </div>
                <div>
                        <h5 className="text-xs font-medium text-gray-500">Phone</h5>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.phone}</p>
                </div>
                      {selectedDoctor.specialization && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-500">Specialization</h5>
                          <p className="mt-1 text-sm text-gray-900">{selectedDoctor.specialization}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* License Information Section */}
                  <div className="sm:col-span-2 pt-3 mt-3 border-t border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">License Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                        <h5 className="text-xs font-medium text-gray-500">Registration Number</h5>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedDoctor.medicalRegistrationNumber}</p>
                </div>
                <div>
                        <h5 className="text-xs font-medium text-gray-500">Medical Council</h5>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.councilName}</p>
                </div>
                <div>
                        <h5 className="text-xs font-medium text-gray-500">State</h5>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.state}</p>
                </div>
                {selectedDoctor.experience && (
                  <div>
                          <h5 className="text-xs font-medium text-gray-500">Years of Experience</h5>
                    <p className="mt-1 text-sm text-gray-900">{selectedDoctor.experience}</p>
                  </div>
                )}
                    </div>
                  </div>
                </div>
              </div>

              {/* License Document Section */}
              <div className="py-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">License Document</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    {selectedDoctor.licenseDocument?.fileUrl ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {selectedDoctor.licenseDocument.originalFilename?.endsWith('.pdf') ? (
                          <div className="p-3 bg-red-100 rounded-md">
                            <FaFilePdf className="h-6 w-6 text-red-600" />
                          </div>
                        ) : (
                          <div className="p-3 bg-blue-100 rounded-md">
                            <FaImage className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedDoctor.licenseDocument.originalFilename || "License Document"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedDoctor.licenseDocument.fileSize ? 
                              `${Math.round(selectedDoctor.licenseDocument.fileSize / 1024)} KB` : 
                              "Document"}
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedDoctor.licenseDocument.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEye className="mr-2 h-5 w-5 text-gray-500" />
                        View Document
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No license document available</p>
                  )}
                </div>
              </div>

              {/* Rejection Reason Section */}
              {selectedDoctor.isVerified === 'rejected' && selectedDoctor.rejectionReason && (
                <div className="py-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rejection Reason</h4>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{selectedDoctor.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Timeline Section for Verified Doctors */}
              {selectedDoctor.isVerified && (
                <div className="py-4 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verification Timeline</h4>
                  <div className="relative">
                    <div className="absolute h-full w-0.5 bg-gray-200 left-5"></div>
                    <ul className="space-y-4">
                      <li className="relative pl-12">
                        <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                          <FaBriefcaseMedical className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Registration Submitted</p>
                          <p className="text-xs text-gray-500">
                            {selectedDoctor.createdAt && new Date(selectedDoctor.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </li>
                      <li className="relative pl-12">
                        <div className={`absolute left-0 flex items-center justify-center w-10 h-10 rounded-full ${
                          selectedDoctor.isVerified === 'approved' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {selectedDoctor.isVerified === 'approved' ? (
                            <FaCheck className={`h-5 w-5 text-green-600`} />
                          ) : (
                            <FaTimes className={`h-5 w-5 text-red-600`} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedDoctor.isVerified === 'approved' ? 'Approved' : 'Rejected'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedDoctor.verifiedAt && new Date(selectedDoctor.verifiedAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  </div>
                )}

              <div className="mt-5 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseDetails}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                  {selectedDoctor.isVerified === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={handleShowRejectModal}
                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTimes className="mr-1.5 -ml-1 h-5 w-5" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={handleApproveDoctor}
                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FaCheck className="mr-1.5 -ml-1 h-5 w-5" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={handleCancelReject}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button - enhanced positioning and styling */}
              <button
                type="button"
                onClick={handleCancelReject}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FaTimes className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Reject Verification</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please provide a reason for rejecting {selectedDoctor?.fullName}'s verification. This will be sent to the doctor via email.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <label htmlFor="rejection-reason" className="block text-xs font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  id="rejection-reason"
                  rows="4"
                  className="shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Please explain why this doctor's verification is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
                {!rejectionReason.trim() && (
                  <p className="mt-1 text-xs text-red-500">A rejection reason is required</p>
                )}
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2 sm:text-sm"
                  onClick={handleRejectDoctor}
                  disabled={!rejectionReason.trim()}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={handleCancelReject}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
);
};

export default DoctorVerification; 