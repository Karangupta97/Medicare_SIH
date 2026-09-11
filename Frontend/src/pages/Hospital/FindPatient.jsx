import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiClipboard, FiFileText, FiFile, FiEye, FiUser, FiAlertCircle, FiCalendar, FiPhone, FiMail, FiMapPin, FiFilter, FiPlus, FiX, FiInfo, FiTrash2, FiChevronRight, FiChevronUp, FiChevronDown, FiClock, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";
import handlogo from "../../assets/Logo/logo.png";
import axios from "axios";
import HospitalDashboardLayout from "../../components/Hospital/HospitalDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import DigitalPrescription from "../../components/Hospital/DigitalPrescription";
import { useAuthStore } from "../../store/Patient/authStore";
/*==========================================
 * PATIENT INFO COMPONENT
 * ============================================
 * Displays patient's personal information, status,
 * and provides actions like writing prescriptions
 */
const PatientInfo = ({ patient, setPrescriptions, reports, setReports }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [showAllergies, setShowAllergies] = useState(false);

  // Set up profile picture with error handling and cache busting
  useEffect(() => {
    if (patient?.photoURL) {
      setImgError(false);
      
      // Add a timestamp parameter to the URL to prevent caching if it's not already there
      if (!patient.photoURL.includes('?')) {
        setImgSrc(`${patient.photoURL}?t=${new Date().getTime()}`);
      } else {
        setImgSrc(patient.photoURL);
      }
    } else {
      // Default user icon if no photo available
      setImgSrc(null);
    }
  }, [patient?.photoURL]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6"
    >
      {/* Patient header with photo and basic info */}
      <div className="relative">
        {/* Enhanced background pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-indigo-50/30"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 rounded-bl-full opacity-20 transform -rotate-12"></div>
        
        <div className="relative pt-8 px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-1 shadow-xl">
                <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                  {imgSrc && !imgError ? (
                    <img 
                      src={imgSrc} 
                      alt={`${patient.name} ${patient.lastname}`}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <FiUser className="w-12 h-12 text-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {patient.name} {patient.lastname}
                  {patient.verified && (
                    <span className="inline-block" title="Verified Patient">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    UMID: {patient.umid}
                  </span>
                  {patient.bloodType && (
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Blood: {patient.bloodType}
                    </span>
                  )}
                  <span className={`${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 ${patient.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></span>
                    {patient.status === 'active' ? 'Active Patient' : 'Under Review'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enhanced patient action buttons */}
            <div className="flex flex-wrap gap-2">
              <a 
                href={`/hospital/patient-history/${patient._id}`} 
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100 shadow-sm hover:shadow-md"
              >
                <FiFileText className="w-4 h-4" />
                <span>View History</span>
              </a>
              
              <div className="group relative">
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-100 shadow-sm hover:shadow-md">
                  <FiClipboard className="w-4 h-4" />
                  <span>Add Note</span>
                </button>
                <div className="absolute z-10 w-48 p-2 mt-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 -translate-x-1/4">
                  <div className="text-xs text-gray-500">Coming soon</div>
                </div>
              </div>
              
              {/* Enhanced refresh button */}
              <button
                onClick={() => refreshPatientData('header-refresh-icon')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100 shadow-sm hover:shadow-md"
              >
                <svg id="header-refresh-icon" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Refresh</span>
              </button>
              
              {/* Digital Prescription component with enhanced styling */}
              <DigitalPrescription 
                patient={patient} 
                onPrescriptionSaved={(prescription) => {
                  // Update reports to include the new prescription
                  const newPrescriptionReport = {
                    _id: prescription._id,
                    category: 'prescription',
                    originalFilename: `Prescription - ${new Date().toLocaleDateString()}`,
                    description: prescription.diagnosis || 'Digital Prescription',
                    doctor: prescription.doctor || 'Current Doctor', 
                    createdAt: prescription.createdAt,
                    fileUrl: `/apidigital-prescriptions/${prescription._id}`
                  };
                  setReports([newPrescriptionReport, ...reports]);
                  
                  // Also update prescriptions state
                  setPrescriptions(prevPrescriptions => [prescription, ...prevPrescriptions]);
                  
                  // Update localStorage
                  const updatedPrescriptions = [prescription, ...JSON.parse(localStorage.getItem('currentPatientPrescriptions') || '[]')];
                  localStorage.setItem('currentPatientPrescriptions', JSON.stringify(updatedPrescriptions));
                  
                  // Show success toast
                  toast.success("Prescription saved successfully");
                }}
                customTrigger={
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    <FiPlus className="w-4 h-4" />
                    <span>Write Prescription</span>
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced patient details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6">
        {/* DOB Info */}
        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-start gap-3 transition-all duration-200 hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-top-right"></div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiCalendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
            <p className="font-medium text-gray-900">{patient.dob || 'Not provided'}</p>
            {patient.dob && (
              <p className="text-xs text-gray-500 mt-1">
                {calculateAge(patient.dob)} years old
              </p>
            )}
          </div>
        </div>
        
        {/* Phone Info */}
        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-start gap-3 transition-all duration-200 hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-top-right"></div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiPhone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Phone Number</p>
            <p className="font-medium text-gray-900">{patient.phone || 'Not provided'}</p>
            {patient.phone && (
              <a href={`tel:${patient.phone}`} className="text-xs text-blue-600 mt-1 inline-flex items-center hover:text-blue-800 transition-colors">
                Call patient <FiChevronRight className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>
        
        {/* Email Info */}
        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-start gap-3 transition-all duration-200 hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-top-right"></div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiMail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="font-medium text-gray-900 break-all">{patient.email || 'Not provided'}</p>
            {patient.email && (
              <a href={`mailto:${patient.email}`} className="text-xs text-blue-600 mt-1 inline-flex items-center hover:text-blue-800 transition-colors">
                Send email <FiChevronRight className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>
        
        {/* Address Info */}
        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-start gap-3 transition-all duration-200 hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-20 transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-top-right"></div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiMapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Address</p>
            <p className="font-medium text-gray-900">
              {patient.address || 'Not provided'}
              {patient.city && `, ${patient.city}`}
            </p>
            {patient.address && (
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${patient.address}${patient.city ? `, ${patient.city}` : ''}`
                )}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 mt-1 inline-flex items-center hover:text-blue-800 transition-colors"
              >
                View on map <FiChevronRight className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced allergies warning section */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="px-6 pb-6">
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-linear-to-r from-red-50 to-rose-50 rounded-lg border border-red-100"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-red-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <FiAlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  Allergies
                </h3>
                <button 
                  onClick={() => setShowAllergies(!showAllergies)}
                  className="text-red-700 hover:text-red-900 transition-colors"
                >
                  {showAllergies ? 
                    <FiChevronUp className="w-5 h-5" /> : 
                    <FiChevronDown className="w-5 h-5" />
                  }
                </button>
              </div>

              <AnimatePresence>
                {(showAllergies || patient.allergies.length < 5) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="flex flex-wrap gap-2 mt-3">
                      {patient.allergies.map((allergy, index) => (
                        <span 
                          key={index} 
                          className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                        >
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {allergy}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-red-700 mt-3">
                      Please verify allergies with the patient before prescribing medications.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAllergies && patient.allergies.length >= 5 && (
                <div className="mt-2 text-sm text-red-700 flex items-center">
                  <span>Patient has {patient.allergies.length} allergies.</span>
                  <button 
                    className="ml-2 text-xs underline hover:text-red-900 transition-colors"
                    onClick={() => setShowAllergies(true)}
                  >
                    Show all
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */
// Calculate age from date of birth
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * ============================================
 * REPORT CARD COMPONENT
 * ============================================
 * Displays medical reports in card format with actions
 */
const ReportCard = ({ report, onView, onRefreshUrl }) => {
  const [isUrlExpired, setIsUrlExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if URL is expired on component mount
  useEffect(() => {
    checkUrlExpiration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.fileUrl]);
  
  // Auto-refresh URL when detected as expired
  useEffect(() => {
    let mounted = true;
    
    if (isUrlExpired && !isRefreshing && mounted) {
      handleRefreshUrl(true);
    }
    
    return () => {
      mounted = false;
    };
  }, [isUrlExpired, isRefreshing]);
  
  // Function to check URL expiration
  const checkUrlExpiration = () => {
    if (!report.fileUrl) {
      setIsUrlExpired(true);
      return;
    }
    
    // Check for URL expiration or error indicators
    const urlHasError = 
      report.fileUrl.includes('<e>') || 
      report.fileUrl.includes('AccessDenied') || 
      report.fileUrl.includes('Request has expired');
      
    if (urlHasError) {
      console.log("Report URL has expired or contains an error:", report.originalFilename);
      setIsUrlExpired(true);
      return;
    }
    
    // Check S3 URL expiration parameters
    if (report.fileUrl.includes('X-Amz-Date')) {
      try {
        const urlObj = new URL(report.fileUrl);
        const expiresParam = urlObj.searchParams.get('X-Amz-Expires');
        const dateParam = urlObj.searchParams.get('X-Amz-Date');
        
        if (expiresParam && dateParam) {
          // Parse the date param (e.g., "20250421T110444Z")
          const year = dateParam.substring(0, 4);
          const month = dateParam.substring(4, 6);
          const day = dateParam.substring(6, 8);
          const hour = dateParam.substring(9, 11);
          const minute = dateParam.substring(11, 13);
          const second = dateParam.substring(13, 15);
          
          const awsDate = new Date(Date.UTC(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          ));
          
          // Add expiration seconds
          const expirySeconds = parseInt(expiresParam);
          const expiryDate = new Date(awsDate.getTime() + (expirySeconds * 1000));
          
          // Check if current time is past expiry
          const now = new Date();
          if (now > expiryDate) {
            console.log("URL expired based on date calculation:", report.originalFilename);
            setIsUrlExpired(true);
          }
        }
      } catch (parseError) {
        console.error("Error parsing S3 URL date:", parseError);
      }
    }
  };
  
  // Map category to icon and color
  const getCategoryInfo = (category) => {
    switch(category) {
      case 'medical':
        return { 
          icon: <FiFileText className="w-6 h-6 text-green-600" />, 
          bg: 'bg-green-50 border-green-100', 
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800',
          hover: 'group-hover:bg-green-100/50',
          gradientFrom: 'from-green-500/10',
          gradientTo: 'to-green-600/5'
        };
      case 'lab':
        return { 
          icon: <FiClipboard className="w-6 h-6 text-purple-600" />, 
          bg: 'bg-purple-50 border-purple-100', 
          text: 'text-purple-800',
          badge: 'bg-purple-100 text-purple-800',
          hover: 'group-hover:bg-purple-100/50',
          gradientFrom: 'from-purple-500/10',
          gradientTo: 'to-purple-600/5'
        };
      case 'prescription':
        return { 
          icon: <FiFile className="w-6 h-6 text-blue-600" />, 
          bg: 'bg-blue-50 border-blue-100', 
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800',
          hover: 'group-hover:bg-blue-100/50',
          gradientFrom: 'from-blue-500/10',
          gradientTo: 'to-blue-600/5'
        };
      default:
        return { 
          icon: <FiFile className="w-6 h-6 text-gray-600" />, 
          bg: 'bg-gray-50 border-gray-100', 
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
          hover: 'group-hover:bg-gray-100/80',
          gradientFrom: 'from-gray-500/10',
          gradientTo: 'to-gray-600/5'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const categoryInfo = getCategoryInfo(report.category);
  
  // Handle viewing a report, checking for expired URL errors
  const handleViewReport = async () => {
    try {
      // Check URL validity first
      checkUrlExpiration();
      
      // If URL is marked as expired, don't try to open it
      if (isUrlExpired) {
        onView(report);
        return;
      }
      
      // Open the report in a new tab
      onView(report);
      window.open(report.fileUrl, '_blank');
    } catch (error) {
      console.error("Error viewing report:", error);
      toast.error("Failed to open the report. Please try again.");
    }
  };

  // Handle refreshing an expired URL
  const handleRefreshUrl = async (silent = false) => {
    setIsRefreshing(true);
    try {
      const refreshedUrl = await onRefreshUrl(report._id, silent);
      
      if (refreshedUrl) {
        // Update the report URL locally too
        report.fileUrl = refreshedUrl;
        setIsUrlExpired(false);
        
        // Show success message only if not in silent mode
        if (!silent) {
          toast.success("URL refreshed successfully");
          
          // Wait a brief moment before opening the new URL
          setTimeout(() => {
            try {
              // Open the refreshed URL in a new tab
              window.open(refreshedUrl, '_blank');
            } catch (openError) {
              console.error("Error opening refreshed URL:", openError);
              toast.error("Unable to open the document automatically. Please try the view button again.");
            }
          }, 500);
        }
      } else {
        throw new Error("Failed to refresh URL");
      }
    } catch (error) {
      console.error("Error refreshing URL:", error);
      if (!silent) {
        toast.error("Failed to refresh URL. Please try again.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`relative overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ${isHovered ? 'transform scale-[1.02] shadow-md' : ''}`}
      onClick={() => handleViewReport()}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsUrlExpired(!report.fileUrl);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header with gradient background */}
      <div className={`relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-linear-to-r ${categoryInfo.gradientFrom} ${categoryInfo.gradientTo} transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="flex items-center p-4 border-b border-gray-100 relative z-10">
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3 transition-transform ${isHovered ? 'scale-110' : ''} duration-300`}>
            {categoryInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.badge}`}>
              {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
            </span>
            {report.createdAt && (
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(report.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className={`p-4 transition-colors duration-300 ${categoryInfo.hover}`}>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {report.originalFilename || 'Unnamed File'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {report.description || 'No description provided'}
        </p>

        {report.doctor && (
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <FiUser className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">Dr. {report.doctor}</span>
          </div>
        )}
        
        {/* Expired URL Warning */}
        <AnimatePresence>
          {isUrlExpired && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-sm flex items-center gap-2 overflow-hidden"
            >
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>The access link has expired. Please refresh it.</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleViewReport}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors transform ${isHovered ? 'translate-y-0' : ''}`}
          >
            <FiEye className="w-4 h-4" /> 
            View
          </button>
          
          {isUrlExpired ? (
            <button
              onClick={() => handleRefreshUrl(false)}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium ${
                isRefreshing ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              } transition-colors`}
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh URL
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.open(report.fileUrl, '_blank')}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium ${categoryInfo.text} hover:bg-white transition-all ${isHovered ? 'translate-y-0' : ''} transform duration-300`}
            >
              <FiDownload className="w-4 h-4" /> 
              Download
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * ============================================
 * DIGITAL PRESCRIPTION CARD COMPONENT
 * ============================================
 * Displays prescription information in card format
 */
const PrescriptionCard = ({ prescription }) => {
  const [showAllMeds, setShowAllMeds] = useState(false);
  const prescriptionCardRef = useRef(null);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg group bg-blue-50 border-blue-100"
      ref={prescriptionCardRef}
    >
      {/* Card Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center p-4 border-b border-blue-100 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3 transform group-hover:scale-110 transition-transform">
            <FiFileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Digital Prescription
            </span>
            {prescription.createdAt && (
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(prescription.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 group-hover:bg-blue-100/50 transition-colors">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {prescription.diagnosis || 'Medical Prescription'}
        </h3>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <FiFileText className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Medications: {prescription.medications?.length || 0}
              </span>
            </div>
          </div>
          
          {prescription.medications && prescription.medications.length > 0 && (
            <>
              <ul className="text-sm text-gray-600 pl-7 list-disc mb-3">
                {prescription.medications.slice(0, showAllMeds ? prescription.medications.length : 3).map((med, idx) => (
                  <li key={idx} className="line-clamp-1 mb-1">
                    <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency}
                  </li>
                ))}
              </ul>
              
              {prescription.medications.length > 3 && (
                <button 
                  onClick={() => setShowAllMeds(!showAllMeds)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center ml-7"
                >
                  {showAllMeds ? (
                    <>Show less <FiChevronUp className="ml-0.5 w-3 h-3" /></>
                  ) : (
                    <>Show all {prescription.medications.length} medications <FiChevronDown className="ml-0.5 w-3 h-3" /></>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {prescription.doctor && (
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <FiUser className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">Dr. {prescription.doctor}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100">
          <button
            onClick={() => window.location.href = `/digital-prescriptions/${prescription._id}`}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FiEye className="w-4 h-4" /> 
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * ============================================
 * MAIN FIND PATIENT COMPONENT
 * ============================================
 * Main component for searching patients and displaying their information
 */
const FindPatient = () => {
  // Get auth token from store
  const { token } = useAuthStore();
  
  // State management
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('lastPatientSearch') || "";
  });
  const [isSearching, setIsSearching] = useState(false);
  const [patient, setPatient] = useState(() => {
    const savedPatient = localStorage.getItem('currentPatient');
    return savedPatient ? JSON.parse(savedPatient) : null;
  });
  const [reports, setReports] = useState(() => {
    const savedReports = localStorage.getItem('currentPatientReports');
    return savedReports ? JSON.parse(savedReports) : [];
  });
  const [prescriptions, setPrescriptions] = useState(() => {
    const savedPrescriptions = localStorage.getItem('currentPatientPrescriptions');
    return savedPrescriptions ? JSON.parse(savedPrescriptions) : [];
  });
  const [viewingReport, setViewingReport] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('reports'); // Toggle between reports and prescriptions
  const [recentSearches, setRecentSearches] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('recentPatientSearches');
    return saved ? JSON.parse(saved) : [];
  });
  
  // For optimized data fetching and display
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for tracking refreshes
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(9);
  const [reportFilter, setReportFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  
  // For API request optimization
  const abortControllerRef = useRef(null);
  const patientCache = useRef(new Map());
  const reportCache = useRef(new Map());
  const prescriptionCache = useRef(new Map());
  const refreshedUrlsRef = useRef(new Set()); // Track URLs that have already been refreshed

  /**
   * ============================================
   * EFFECTS & DATA PERSISTENCE
   * ============================================
   */
  
  // Helper function to refresh patient data
  const refreshPatientData = async (iconId = null) => {
    if (!patient || !patient._id) return;
    
    // Show loading toast
    const toastId = toast.loading("Refreshing patient data...");
    
    // Add spinning animation to the refresh icon if provided  
    // Get auth token from store
    if (iconId) {
      const refreshIcon = document.getElementById(iconId);
      if (refreshIcon) refreshIcon.classList.add('animate-spin');
    }
    
    try {
      // Refresh patient data
      await fetchReportsAndPrescriptions(patient._id, true);
      // Update the toast on success
      toast.success("Patient data refreshed successfully", { id: toastId });
    } catch (error) {
      // Update the toast on error
      toast.error("Failed to refresh patient data", { id: toastId });
      console.error("Error refreshing patient data:", error);
    } finally {
      // Remove the animation class when done
      if (iconId) {
        const refreshIcon = document.getElementById(iconId);
        if (refreshIcon) refreshIcon.classList.remove('animate-spin');
      }
    }
  };
  
  // Auto-refresh reports data when the component mounts
  useEffect(() => {
    const refreshDataIfPatientExists = async () => {
      if (patient && patient._id) {
        console.log("Refreshing patient data on component mount...");
        await fetchReportsAndPrescriptions(patient._id, true); // force refresh
      }
    };
    
    refreshDataIfPatientExists();
    
    // Add event listener for page visibility change to refresh data when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && patient && patient._id) {
        console.log("Tab became visible, refreshing patient data...");
        fetchReportsAndPrescriptions(patient._id, true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [patient?._id]);
  
  // Add keyboard shortcut for refreshing (Ctrl+R)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl+R is pressed and we have a patient loaded
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && patient && patient._id) {
        e.preventDefault(); // Prevent browser refresh
        
        // Show a toast notification about the shortcut being used
        toast.success("Refreshing with keyboard shortcut (Ctrl+R)");
        
        // Refresh patient data
        refreshPatientData();
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [patient]);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentPatientSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Save patient data to localStorage
  useEffect(() => {
    if (patient) {
      localStorage.setItem('currentPatient', JSON.stringify(patient));
      localStorage.setItem('lastPatientSearch', searchQuery);
    }
  }, [patient, searchQuery]);


  // Auto-search on initial render if we have a saved search
  useEffect(() => {
    // If we have a saved search query but no patient data, auto-search on page load
    const savedSearch = localStorage.getItem('lastPatientSearch');
    if (savedSearch && !patient && savedSearch.trim()) {
      setSearchQuery(savedSearch);
      // Auto-search with the saved query
      const autoSearch = async () => {
        setIsSearching(true);
        try {
          // Check cache first for patient data
          if (patientCache.current.has(savedSearch)) {
            const cachedPatient = patientCache.current.get(savedSearch);
            setPatient(cachedPatient);
            
            // Also get reports and prescriptions from cache if available
            await fetchReportsAndPrescriptions(cachedPatient._id);
            
          } else {
            // First, search for patient by UMID
            const patientResponse = await axios.get(`/api/hospital/patient/${savedSearch}`);
            
            if (patientResponse.data.success) {
              const patientData = patientResponse.data.patient;
              setPatient(patientData);
              
              // Store in cache for future use
              patientCache.current.set(savedSearch, patientData);
              
              await fetchReportsAndPrescriptions(patientData._id);
            }
          }
        } catch (error) {
          console.error("Error auto-searching patient:", error);
          // Clear localStorage if the auto-search fails
          localStorage.removeItem('currentPatient');
          localStorage.removeItem('currentPatientReports');
          localStorage.removeItem('currentPatientPrescriptions');
          localStorage.removeItem('lastPatientSearch');
        } finally {
          setIsSearching(false);
        }
      };
      
      autoSearch();
    }
  }, []); // Run only once on component mount

  /**
   * ============================================
   * DATA FETCHING & OPTIMIZATION
   * ============================================
   */
  
  // Optimized function to fetch reports and prescriptions simultaneously
  const fetchReportsAndPrescriptions = async (patientId, forceRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // Set overall refreshing state if this is a forced refresh
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      setIsLoadingReports(true);
      setIsLoadingPrescriptions(true);
      
      // Skip cache if forceRefresh is true
      if (!forceRefresh && reportCache.current.has(patientId)) {
        setReports(reportCache.current.get(patientId));
        setIsLoadingReports(false);
      } else {
        // Fetch reports with abort controller
        console.log(`Fetching reports for patient: ${patientId}${forceRefresh ? ' (forced refresh)' : ''}`);
        const reportsResponse = await axios.get(`/api/hospital/patient/${patientId}/reports`, { 
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (reportsResponse.data.success) {
          const reportsData = reportsResponse.data.reports || [];
          console.log(`Fetched ${reportsData.length} reports for patient`);
          
          // Save the reports to state and localStorage
          setReports(reportsData);
          localStorage.setItem('currentPatientReports', JSON.stringify(reportsData));
          
          // Also save to cache
          reportCache.current.set(patientId, reportsData);
        } else {
          console.error("Failed to load reports:", reportsResponse.data);
          toast.error("Failed to load patient reports");
          setReports([]);
        }
        setIsLoadingReports(false);
      }
      
      // Skip cache if forceRefresh is true
      if (!forceRefresh && prescriptionCache.current.has(patientId)) {
        setPrescriptions(prescriptionCache.current.get(patientId));
        setIsLoadingPrescriptions(false);
      } else {
        // Fetch prescriptions with abort controller
        console.log(`Fetching prescriptions for patient: ${patientId}${forceRefresh ? ' (forced refresh)' : ''}`);
        const prescriptionsResponse = await axios.get(`/api/hospital/digital-prescriptions/patient/${patientId}`, { 
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (prescriptionsResponse.data.success) {
          const prescriptionsData = prescriptionsResponse.data.prescriptions || [];
          console.log(`Fetched ${prescriptionsData.length} prescriptions for patient`);
          
          // Save the prescriptions to state and localStorage
          setPrescriptions(prescriptionsData);
          localStorage.setItem('currentPatientPrescriptions', JSON.stringify(prescriptionsData));
          
          // Also save to cache
          prescriptionCache.current.set(patientId, prescriptionsData);
        } else {
          console.error("Failed to load prescriptions:", prescriptionsResponse.data);
          toast.error("Failed to load patient prescriptions");
          setPrescriptions([]);
        }
        setIsLoadingPrescriptions(false);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request was canceled:', error.message);
        return; // Don't show error toast for canceled requests
      }
      console.error("Error fetching patient data:", error);
      toast.error("Failed to load patient data");
      setReports([]);
      setPrescriptions([]);
  } finally {
    setIsLoadingReports(false);
    setIsLoadingPrescriptions(false);
    setIsRefreshing(false);
  }
};

// Get filtered reports based on criteria
const getFilteredReports = () => {
  if (!reports) return [];
  
  let filteredReports = [...reports];
  
  // Apply category filter
  if (reportFilter) {
    filteredReports = filteredReports.filter(report => 
      report.category === reportFilter
    );
  }
  
  // Apply date filter
  if (dateFilter !== 'all') {
    const now = new Date();
    const filterDate = new Date();
    
    switch(dateFilter) {
      case 'last-month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'last-year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    filteredReports = filteredReports.filter(report => 
      new Date(report.createdAt) >= filterDate
    );
  }
  
  // Apply sort order
  filteredReports.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  return filteredReports;
  };
  
  // Get paginated reports
  const getCurrentReports = () => {
    const filteredReports = getFilteredReports();
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    
    return filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  };
  
  // Get filter info for UI
  const getFilterInfo = () => {
    const filteredReports = getFilteredReports();
    const totalFilteredReports = filteredReports.length;
    const totalPages = Math.ceil(totalFilteredReports / reportsPerPage);
    
    return {
      totalFilteredReports,
      totalPages
    };
  };

  /**
   * ============================================
   * UTILITY FUNCTIONS
   * ============================================
   */
    // UMID format validation function
  const isValidUMID = (umid) => {
    // Format should be "AB12345XY" where A,B,X,Y are letters and 1,2,3,4,5 are digits
    // Exactly 2 letters + 5 digits + 2 letters = 9 characters total
    const umidRegex = /^[A-Z]{2}\d{5}[A-Z]{2}$/;
    return umidRegex.test(umid);
  };

  /**
   * ============================================
   * EVENT HANDLERS
   * ============================================
   */
  
  // Handle searching for a patient
  const handleSearch = async (e) => {
    e.preventDefault();
    
    const trimmedUMID = searchQuery.trim();
    
    if (!trimmedUMID) {
      toast.error("Please enter a valid UMID");
      return;
    }
      // Validate UMID format
    if (!isValidUMID(trimmedUMID)) {
      toast.error("Invalid UMID format. Format should be AB12345XY (2 letters + 5 digits + 2 letters)");
      setError("Invalid UMID format. Please enter UMID in the format: AB12345XY (2 letters + 5 digits + 2 letters)");
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setPatient(null);
    setReports([]);
    setPrescriptions([]);
    
    try {
      // Check cache first
      if (patientCache.current.has(trimmedUMID)) {
        const cachedPatient = patientCache.current.get(trimmedUMID);
        setPatient(cachedPatient);
        
        // Add to recent searches if not already there
        addToRecentSearches(trimmedUMID, `${cachedPatient.name} ${cachedPatient.lastname}`);
        
        // Fetch reports and prescriptions
        await fetchReportsAndPrescriptions(cachedPatient._id);
        
        toast.success(`Found patient: ${cachedPatient.name} ${cachedPatient.lastname}`);
      } else {
        // First, search for patient by UMID
        const patientResponse = await axios.get(`/api/hospital/patient/${trimmedUMID}`);
        
        if (patientResponse.data.success) {
          const patientData = patientResponse.data.patient;
          setPatient(patientData);
          
          // Add to cache
          patientCache.current.set(trimmedUMID, patientData);
          
          // Add to recent searches
          addToRecentSearches(trimmedUMID, `${patientData.name} ${patientData.lastname}`);
          
          // Fetch reports and prescriptions
          await fetchReportsAndPrescriptions(patientData._id);
          
          // Success notification
          toast.success(`Found patient: ${patientData.name} ${patientData.lastname}`);
        }
      }
    } catch (error) {
      console.error("Error searching patient:", error);
      setError(error.response?.data?.message || "Failed to find patient information");
      toast.error(error.response?.data?.message || "Failed to find patient information");
    } finally {
      setIsSearching(false);
      // Reset pagination and filters on new search
      setCurrentPage(1);
      setReportFilter('');
      setSortOrder('newest');
      setDateFilter('all');
    }
  };
  
  // Add to recent searches helper
  const addToRecentSearches = (umid, name) => {
    if (!recentSearches.some(search => search.umid === umid)) {
      const newRecentSearch = {
        umid: umid,
        name: name,
        timestamp: new Date().toISOString()
      };
      
      // Keep only the most recent 5 searches
      const updatedSearches = [newRecentSearch, ...recentSearches].slice(0, 5);
      setRecentSearches(updatedSearches);
    }
  };

  // Handle viewing a report
  const handleViewReport = (report) => {
    setViewingReport(report);
    // Note: Opening the URL is now handled by the ReportCard component
  };

  // Handle refreshing an expired S3 URL
  const handleRefreshReportUrl = async (reportId, silent = false) => {
    try {
      // Show a loading toast only if not silent
      const toastId = silent ? null : toast.loading("Refreshing report access...");
      
      const response = await axios.get(`/api/hospital/reports/${reportId}/refresh-url`);
      
      if (response.data.success) {
        const newUrl = response.data.fileUrl;
        
        // Update the report in the state with the new URL
        const updatedReports = reports.map(report => {
          if (report._id === reportId) {
            // Track that we've refreshed this old URL
            if (report.fileUrl) {
              refreshedUrlsRef.current.add(report.fileUrl);
            }
            
            // Also track the new URL as refreshed
            if (newUrl) {
              refreshedUrlsRef.current.add(newUrl);
            }
            
            return {
              ...report,
              fileUrl: newUrl
            };
          }
          return report;
        });
        
        // Update reports in state and localStorage
        setReports(updatedReports);
        localStorage.setItem('currentPatientReports', JSON.stringify(updatedReports));
        
        // Also update cache
        if (patient && reportCache.current.has(patient._id)) {
          reportCache.current.set(patient._id, updatedReports);
        }
        
        // Show success toast only if not silent
        if (!silent && toastId) {
          toast.success("Successfully refreshed report access", { id: toastId });
        }
        
        return newUrl;
      } else {
        throw new Error(response.data.message || "Failed to refresh URL");
      }
    } catch (error) {
      console.error("Error refreshing report URL:", error);
      if (!silent) {
        toast.error(error.response?.data?.message || "Failed to refresh URL");
      }
      return null;
    }
  };

  // Function to check if a URL is likely expired
  const isUrlLikelyExpired = (url) => {
    if (!url) return false;
    
    // If we've already refreshed this URL, don't flag it as expired again
    if (refreshedUrlsRef.current.has(url)) {
      return false;
    }
    
    try {
      // Only check for explicit error indicators, not potential ones
      if (url.includes('AccessDenied')) return true;
      if (url.includes('Request has expired')) return true;
      if (url.includes('<Error>')) return true;
      
      // Don't automatically assume S3 presigned URLs are expired
      // Only if they contain clear error indicators
      
      // Try to parse the URL to check for expiration parameters
      try {
        const urlObj = new URL(url);
        
        // Only check explicit expiration times
        const expParam = urlObj.searchParams.get('exp') || 
                          urlObj.searchParams.get('expires') || 
                          urlObj.searchParams.get('expiry');
        
        if (expParam) {
          const expTime = parseInt(expParam, 10);
          if (!isNaN(expTime)) {
            return Date.now() > expTime;
          }
        }
      } catch (parseError) {
        // Just because we can't parse the URL doesn't mean it's expired
        return false;
      }
      
      return false;
    } catch (error) {
      console.warn("Error checking URL expiration:", error);
      return false;
    }
  };

  // Auto-refresh potentially expired URLs when viewing reports
  useEffect(() => {
    // Prevent refreshes during loading states
    if (isLoadingReports || isRefreshing) return;
    
    // Only proceed if in reports section with data
    if (activeSection === 'reports' && reports.length > 0) {
      // Use a flag to track if we've already triggered a refresh in this cycle
      let hasTriggeredRefresh = false;
      
      // Check each report URL for potential expiration
      const potentiallyExpiredReports = reports.filter(report => {
        // Skip reports that don't have a URL
        if (!report.fileUrl) return false;
        
        // Check if URL is likely expired (and not already refreshed)
        return isUrlLikelyExpired(report.fileUrl);
      });
      
      if (potentiallyExpiredReports.length > 0 && !hasTriggeredRefresh) {
        console.log(`Found ${potentiallyExpiredReports.length} potentially expired report URLs`);
        
        // Only refresh one URL at a time
        const reportToRefresh = potentiallyExpiredReports[0];
        
        // Mark this URL as already being handled to prevent infinite loops
        refreshedUrlsRef.current.add(reportToRefresh.fileUrl);
        
        // Set flag to prevent multiple refreshes
        hasTriggeredRefresh = true;
        
        // Auto-refresh the first expired URL to avoid overwhelming the server
        handleRefreshReportUrl(reportToRefresh._id, true)
          .then(newUrl => {
            console.log("Auto-refreshed a report URL");
            // Add the new URL to the refreshed set
            if (newUrl) {
              refreshedUrlsRef.current.add(newUrl);
            }
          })
          .catch(err => console.error("Failed to auto-refresh URL:", err));
      }
    }
  }, [activeSection, reports, isLoadingReports, isRefreshing]);
  // Format the UMID input as the user types
  const handleUMIDInput = (e) => {
    // Get the raw input value
    let input = e.target.value.toUpperCase();
    
    // Remove all non-alphanumeric characters
    let sanitized = input.replace(/[^0-9A-Z]/g, '');
    
    // Limit to 9 characters (2 letters + 5 digits + 2 letters)
    if (sanitized.length > 9) {
      sanitized = sanitized.substring(0, 9);
    }
    
    // Update the input value
    setSearchQuery(sanitized);
  };

  // Handle selecting a recent search
  const handleSelectRecentSearch = (umid) => {
    setSearchQuery(umid);
    // Auto-submit the search
    handleSearch({ preventDefault: () => {} });
  };
  
  // Handle filter and pagination changes
  const handleFilterChange = (e) => {
    setReportFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when date filter changes
  };
  
  const handleNextPage = () => {
    const { totalPages } = getFilterInfo();
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    const { totalPages } = getFilterInfo();
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const { totalFilteredReports, totalPages } = getFilterInfo();
  const currentReports = getCurrentReports();

  return (
    <HospitalDashboardLayout>
      <div className="max-w-380 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating refresh indicator */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-5 right-5 z-50 bg-white rounded-lg shadow-lg border border-blue-100 p-3 flex items-center gap-3"
            >
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Refreshing patient data...</span>
              <span className="text-xs text-gray-500 ml-2 hidden sm:inline-block">(Tip: Use Ctrl+R to refresh)</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/**
         * ============================================
         * HEADER SECTION / NAVBAR
         * ============================================
         */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Patient Lookup</h1>
            <p className="text-gray-500">Find and access patient medical records using their UMID</p>
          </div>
          
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button 
              type="button" 
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
              <FiFileText className="w-4 h-4 mr-2 inline" />
              Bulk Lookup
            </button>
            <button 
              type="button" 
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
              <FiClipboard className="w-4 h-4 mr-2 inline" />
              Recent Activity
            </button>
          </div>
        </motion.div>

        {/**
         * ============================================
         * SEARCH SECTION
         * ============================================
         */}
        <motion.div 
             className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden"
        >
          <div className="p-6 pb-4 relative">
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-indigo-50/30"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 rounded-bl-full opacity-20 transform -rotate-12"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-tr-full opacity-20 transform rotate-12"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FiSearch className="w-5 h-5 text-white" />
                </div>
                Find Patient by UMID
              </h2>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 shadow-sm transition-all duration-200"                    placeholder="Enter patient UMID (e.g., AB12345XY)"
                    value={searchQuery}
                    onChange={handleUMIDInput}
                    maxLength={9}
                    aria-label="Patient UMID"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className={`px-6 py-3.5 rounded-xl font-medium text-white shadow-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSearching 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md'
                  }`}
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <FiSearch className="w-4 h-4" />
                      <span>Search Patient</span>
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-3 flex items-center">
                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <FiInfo className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500">Format: AB12345XY (2 letters + 5 digits + 2 letters)</p>
              </div>
            </div>
          </div>
          
          {/* Recent Searches with enhanced design */}
          {recentSearches.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FiClock className="w-4 h-4 text-gray-500" />
                  Recent Searches
                </h3>
                <button 
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentPatientSearches');
                    toast.success("Search history cleared");
                  }}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <FiTrash2 className="w-3 h-3" />
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectRecentSearch(search.umid)}
                    className="group relative inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-5 h-5 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-1.5">
                      <FiUser className="w-3 h-3 text-white" />
                    </div>
                    <span className="truncate max-w-[150px] font-medium">{search.name}</span>
                    <span className="text-xs text-gray-500 ml-1.5 hidden sm:inline-block">({search.umid})</span>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiSearch className="w-4 h-4 mr-1" /> Search
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Patient not found</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/**
         * ============================================
         * PATIENT INFORMATION SECTION
         * ============================================
         */}
        {patient && <PatientInfo 
          patient={patient} 
          setPrescriptions={setPrescriptions} 
          prescriptions={prescriptions}
          reports={reports} 
          setReports={setReports} 
        />}

        {/**
         * ============================================
         * REPORTS & PRESCRIPTIONS SECTION
         * ============================================
         */}
        {patient && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            {/* Navigation tabs for switching between reports and prescriptions */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveSection('reports')}
                className={`px-6 py-3 font-medium text-sm transition-all duration-200 relative ${
                  activeSection === 'reports'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiFileText className="w-4 h-4" />
                  Medical Reports
                  {reports.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {totalFilteredReports}
                    </span>
                  )}
                </span>
                {activeSection === 'reports' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveSection('prescriptions')}
                className={`px-6 py-3 font-medium text-sm transition-all duration-200 relative ${
                  activeSection === 'prescriptions'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiClipboard className="w-4 h-4" />
                  Digital Prescriptions
                  {prescriptions.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {prescriptions.length}
                    </span>
                  )}
                </span>
                {activeSection === 'prescriptions' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              
              {/* Add refresh button */}
              <div className="ml-auto flex items-center">
                <button
                  onClick={() => refreshPatientData('refresh-icon')}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh data (Ctrl+R)"
                >
                  <svg id="refresh-icon" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Section header with filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {activeSection === 'reports' ? 'Medical Reports' : 'Digital Prescriptions'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeSection === 'reports' 
                    ? `${totalFilteredReports} reports found` 
                    : `${prescriptions.length} prescriptions found`}
                </p>
              </div>
              
              {activeSection === 'reports' && reports.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiFilter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select 
                      value={reportFilter} 
                      onChange={handleFilterChange}
                      className="text-sm rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500 py-2 pl-9 pr-8 bg-white shadow-sm"
                    >
                      <option value="">All Categories</option>
                      <option value="medical">Medical</option>
                      <option value="lab">Lab Results</option>
                      <option value="prescription">Prescriptions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <select 
                      value={dateFilter} 
                      onChange={handleDateFilterChange}
                      className="text-sm rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500 py-2 pl-9 pr-8 bg-white shadow-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-year">Last Year</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiFilter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select 
                      value={sortOrder} 
                      onChange={handleSortChange}
                      className="text-sm rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500 py-2 pl-9 pr-8 bg-white shadow-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              )}
              
              {activeSection === 'prescriptions' && prescriptions.length > 0 && (
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <select className="text-sm rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500 py-2 pl-9 pr-8 bg-white shadow-sm">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-year">Last Year</option>
                    </select>
                  </div>
                  
                  <DigitalPrescription 
                    patient={patient} 
                    onPrescriptionSaved={(prescription) => {
                      // Update reports to include the new prescription
                      const newPrescriptionReport = {
                        _id: prescription._id,
                        category: 'prescription',
                        originalFilename: `Prescription - ${new Date().toLocaleDateString()}`,
                        description: prescription.diagnosis || 'Digital Prescription',
                        doctor: prescription.doctor || 'Current Doctor', 
                        createdAt: prescription.createdAt,
                        fileUrl: `/apidigital-prescriptions/${prescription._id}`
                      };
                      setReports([newPrescriptionReport, ...reports]);
                      
                      // Also update prescriptions state
                      setPrescriptions(prevPrescriptions => [prescription, ...prevPrescriptions]);
                      
                      // Update localStorage
                      const updatedPrescriptions = [prescription, ...JSON.parse(localStorage.getItem('currentPatientPrescriptions') || '[]')];
                      localStorage.setItem('currentPatientPrescriptions', JSON.stringify(updatedPrescriptions));
                      
                      // Show success toast
                      toast.success("Prescription saved successfully");
                      
                      // Switch to the prescriptions tab to show the new prescription
                      setActiveSection('prescriptions');
                    }}
                    customTrigger={
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors">
                        <FiPlus className="w-4 h-4" />
                        Write Prescription
                      </button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Loading indicators */}
            {(isLoadingReports && activeSection === 'reports') && (
              <div className="flex justify-center my-12">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-600">Loading medical reports...</p>
                </div>
              </div>
            )}
            
            {(isLoadingPrescriptions && activeSection === 'prescriptions') && (
              <div className="flex justify-center my-12">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-600">Loading digital prescriptions...</p>
                </div>
              </div>
            )}

            {/* Empty state when no reports or prescriptions are found */}
            {!isLoadingReports && !isLoadingPrescriptions && (
              (activeSection === 'reports' && totalFilteredReports === 0) || 
              (activeSection === 'prescriptions' && prescriptions.length === 0)
            ) ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                <FiClipboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeSection === 'reports' ? 'No Reports Found' : 'No Digital Prescriptions Found'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {activeSection === 'reports' 
                    ? reportFilter 
                      ? `No reports found matching the selected filters.` 
                      : "This patient doesn't have any medical reports available in the system."
                    : "This patient doesn't have any digital prescriptions available in the system."}
                </p>
                {activeSection === 'prescriptions' && (
                  <DigitalPrescription 
                    patient={patient} 
                    onPrescriptionSaved={(prescription) => {
                      // Update reports to include the new prescription
                      const newPrescriptionReport = {
                        _id: prescription._id,
                        category: 'prescription',
                        originalFilename: `Prescription - ${new Date().toLocaleDateString()}`,
                        description: prescription.diagnosis || 'Digital Prescription',
                        doctor: prescription.doctor || 'Current Doctor', 
                        createdAt: prescription.createdAt,
                        fileUrl: `/apidigital-prescriptions/${prescription._id}`
                      };
                      setReports([newPrescriptionReport, ...reports]);
                      
                      // Also update prescriptions state
                      setPrescriptions(prevPrescriptions => [prescription, ...prevPrescriptions]);
                      
                      // Update localStorage
                      const updatedPrescriptions = [prescription, ...JSON.parse(localStorage.getItem('currentPatientPrescriptions') || '[]')];
                      localStorage.setItem('currentPatientPrescriptions', JSON.stringify(updatedPrescriptions));
                      
                      // Show success toast
                      toast.success("Prescription saved successfully");
                    }}
                    customTrigger={
                      <button className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <FiFile className="w-4 h-4" />
                        <span>Write Prescription</span>
                      </button>
                    }
                  />
                )}
                {activeSection === 'reports' && reportFilter && (
                  <button 
                    onClick={() => setReportFilter('')}
                    className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiFilter className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Display medical reports with optimized rendering */}
                {activeSection === 'reports' && !isLoadingReports && 
                  currentReports.map((report) => (
                    <ReportCard 
                      key={report._id} 
                      report={report} 
                      onView={() => handleViewReport(report)} 
                      onRefreshUrl={handleRefreshReportUrl}
                    />
                  ))}
                  
                {/* Display digital prescriptions */}
                {activeSection === 'prescriptions' && !isLoadingPrescriptions && 
                  prescriptions.map((prescription) => (
                    <PrescriptionCard 
                      key={prescription._id} 
                      prescription={prescription} 
                    />
                  ))}
              </div>
            )}
            
            {/* Pagination controls */}
            {activeSection === 'reports' && totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * reportsPerPage) + 1}-{Math.min(currentPage * reportsPerPage, totalFilteredReports)} of {totalFilteredReports} reports
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-gray-50 rounded text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/**
         * ============================================
         * EMPTY STATE
         * ============================================
         * Displayed when no search has been performed yet
         */}
        {!patient && !error && !isSearching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 rounded-xl p-10 text-center border border-gray-100 mt-10"
          >
            <img 
              src={handlogo} 
              alt="Medicare Logo" 
              className="w-20 h-20 mx-auto mb-6 opacity-80" 
            />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Search for a Patient</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Enter a patient's UMID in the search box above to access their medical records and reports.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 w-full">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Patient Records</h4>
                  <p className="text-sm text-gray-500">Access medical history</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 w-full">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Medical Reports</h4>
                  <p className="text-sm text-gray-500">View test results & notes</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </HospitalDashboardLayout>
  );
};

export default FindPatient;


