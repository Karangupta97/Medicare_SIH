import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  FiUpload,
  FiSearch,
  FiFilter,
  FiFile,
  FiDownload,
  FiEye,
  FiTrash2,
  FiFileText,
  FiImage,
  FiClipboard,
  FiHardDrive,
  FiX,
  FiFolderPlus,
  FiEdit,
  FiAlertCircle,
  FiCheck,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiMinimize2,
  FiChevronDown,
  FiGrid,
  FiList,
  FiCalendar,
  FiInfo,
  FiPlus,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";
import { useDropzone } from "react-dropzone";
import StorageLimitModal from "../../components/StorageLimitModal";
import ReportAnalysisModal from "../../components/ReportAnalysisModal";
import ShareWithDoctorModal from "../../components/reports/ShareWithDoctorModal";
import { getStorageLimitForPlan, getStorageLimitLabel } from "../../config/planConfig";

const style = document.createElement("style");
style.textContent = `
  @keyframes fade-in-up {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scale-in {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slide-in-right {
    0% {
      opacity: 0;
      transform: translateX(40px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse-soft {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
    }
    100% {
      transform: translateX(200%) skewX(-15deg);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
    }
  }
  
  @keyframes bounce-gentle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .animate-scale-in {
    animation: scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .animate-pulse-soft {
    animation: pulse-soft 3s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 1s ease-in-out infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .glass-effect-dark {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .gradient-border {
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
    border: 2px solid transparent;
  }
  
  .hover-lift {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  }
  
  /* Enhanced card interactions */
  .card-hover-effect {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .card-hover-effect:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .card-hover-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }
  
  .card-hover-effect:hover::before {
    left: 100%;
  }
  
  /* Improved button hover effects */
  .btn-modern {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .btn-modern::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translate(-50%, -50%);
  }
  
  .btn-modern:hover::before {
    width: 300px;
    height: 300px;
  }
  
  .btn-modern:active {
    transform: scale(0.95);
  }
  
  /* Mobile-first responsive utilities */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* Enhanced mobile responsive breakpoints */
  .text-responsive {
    font-size: 0.75rem; /* 12px */
  }
  
  @media (min-width: 475px) {
    .text-responsive {
      font-size: 0.875rem; /* 14px */
    }
  }
  
  @media (min-width: 640px) {
    .text-responsive {
      font-size: 1rem; /* 16px */
    }
  }
  
  /* Ultra-compact mobile mode */
  @media (max-width: 374px) {
    .ultra-compact {
      font-size: 0.625rem; /* 10px */
      padding: 0.25rem; /* 4px */
    }
    
    .ultra-compact-icon {
      width: 0.75rem; /* 12px */
      height: 0.75rem; /* 12px */
    }
  }
  
  /* Touch-friendly interactions */
  @media (hover: none) and (pointer: coarse) {
    .hover-lift:hover {
      transform: none;
      box-shadow: inherit;
    }
    
    .hover-lift:active {
      transform: scale(0.98);
    }
    
    .card-hover-effect:hover {
      transform: none;
      box-shadow: inherit;
    }
    
    .card-hover-effect:active {
      transform: scale(0.98);
    }
  }
  
  /* Responsive grid improvements */
  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
    }
    
    .reports-grid {
      grid-template-columns: repeat(1, 1fr);
      gap: 1.5rem;
    }
    
    /* List view optimizations for mobile */
    .list-view-item {
      flex-direction: column;
      align-items: stretch;
    }
    
    .list-view-content {
      margin-left: 0;
      margin-top: 1rem;
    }
  }
  
  @media (min-width: 641px) and (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    .reports-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }
  
  @media (min-width: 1280px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }
    
    .reports-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }
  }
  
  /* View mode specific styles */
  .view-switcher {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .view-button-active {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .view-button-inactive {
    color: #6b7280;
    transition: all 0.2s ease;
  }
  
  .view-button-inactive:hover {
    color: #111827;
    background: rgba(243, 244, 246, 0.8);
  }
  
  /* List view specific styles */
  .list-view-container {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  /* Enhanced mobile modal styles */
  @media (max-width: 768px) {
    .modal-content {
      margin: 0.5rem;
      max-height: 95vh;
      border-radius: 1rem;
    }
    
    .modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-body {
      padding: 1rem 1.5rem;
      max-height: calc(95vh - 8rem);
      overflow-y: auto;
    }
  }
  
  /* Enhanced focus states for accessibility */
  .focus-ring {
    transition: all 0.2s ease;
  }
  
  .focus-ring:focus {
    outline: none;
    ring: 2px;
    ring-color: rgba(59, 130, 246, 0.5);
    ring-offset: 2px;
  }
`;
document.head.appendChild(style);

const StatCard = ({
  title,
  count,
  subtitle,
  icon: Icon,
  iconColor,
  borderColor,
  showProgress,
  progressPercentage,
  onClick,
}) => {
  const bgColorClass = borderColor
    .replace("border-", "bg-")
    .replace("-600", "-100");
  const textColorClass = iconColor;
  const hoverBorderClass = borderColor;
  const hoverBgClass = bgColorClass;

  // Enhanced responsive count display for storage
  const getResponsiveCount = () => {
    if (title === "Storage Used" && typeof count === "string") {
      const parts = count.split(" / ");
      if (parts.length === 2) {
        const used = parts[0];
        const total = parts[1];
        return {
          mobile: used, // Show only used storage on mobile
          tablet: count, // Show full on tablet+
          desktop: count,
        };
      }
    }
    return {
      mobile: count,
      tablet: count,
      desktop: count,
    };
  };

  const responsiveCount = getResponsiveCount();

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg bg-white/95 backdrop-blur-xl border-2 border-transparent hover:${hoverBorderClass} cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl group focus:outline-none focus:ring-2 focus:ring-blue-500 hover:-translate-y-1 hover:shadow-blue-500/10`}
    >
      <div className="flex-1 min-w-0 pr-2">
        {/* Responsive title with better spacing */}
        <p
          className={`text-xs sm:text-sm font-medium ${textColorClass} mb-1 sm:mb-1.5 opacity-80 group-hover:opacity-100 transition-all leading-tight`}
          title={title}
        >
          <span className="xs:hidden">
            {title.length > 8 ? title.substring(0, 8) + "..." : title}
          </span>
          <span className="hidden xs:block sm:hidden">
            {title.length > 12 ? title.substring(0, 12) + "..." : title}
          </span>
          <span className="hidden sm:inline truncate">{title}</span>
        </p>

        {/* Enhanced responsive count display with optimized sizing */}
        <div className="mb-1 sm:mb-2">
          {/* Extra Small: Very compact */}
          <h3
            className={`xs:hidden text-sm font-bold ${textColorClass} transition-all group-hover:scale-105 origin-left leading-tight`}
            title={responsiveCount.desktop}
          >
            {title === "Storage Used" ? responsiveCount.mobile : count}
          </h3>
          {/* Small Mobile: Compact display */}
          <h3
            className={`hidden xs:block sm:hidden text-base font-bold ${textColorClass} transition-all group-hover:scale-105 origin-left leading-tight`}
            title={responsiveCount.desktop}
          >
            {responsiveCount.mobile}
          </h3>
          {/* Tablet: Show full version but smaller */}
          <h3
            className={`hidden sm:block md:hidden text-lg font-bold ${textColorClass} transition-all group-hover:scale-105 origin-left leading-tight`}
            title={responsiveCount.desktop}
          >
            {responsiveCount.tablet}
          </h3>
          {/* Desktop: Full version */}
          <h3
            className={`hidden md:block text-xl lg:text-2xl font-bold ${textColorClass} transition-all group-hover:scale-105 origin-left leading-tight`}
            title={responsiveCount.desktop}
          >
            {responsiveCount.desktop}
          </h3>
        </div>

        {showProgress ? (
          <div className="space-y-1 sm:space-y-1.5">
            {/* Enhanced progress bar with compact responsive design */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex-1 bg-gray-100/80 rounded-full h-1.5 sm:h-2 md:h-2.5 shadow-inner overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    progressPercentage > 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : progressPercentage > 70
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              {/* Responsive percentage display with better sizing */}
              <div
                className={`text-xs font-medium ${textColorClass} opacity-80 group-hover:opacity-100 transition-all flex-shrink-0 leading-tight`}
              >
                <span className="xs:hidden">
                  {Math.round(progressPercentage)}%
                </span>
                <span className="hidden xs:block sm:hidden">
                  {progressPercentage > 90
                    ? "Full"
                    : progressPercentage > 70
                    ? "High"
                    : `${Math.round(progressPercentage)}%`}
                </span>
                <span className="hidden sm:inline">
                  {progressPercentage > 90
                    ? "Almost Full"
                    : progressPercentage > 70
                    ? "Getting Full"
                    : `${progressPercentage}% used`}
                </span>
              </div>
            </div>

            {/* Additional storage info for small devices - more compact */}
            {title === "Storage Used" && (
              <div className="sm:hidden">
                <p
                  className={`text-xs ${textColorClass} opacity-60 leading-tight`}
                  title={subtitle}
                >
                  <span className="xs:hidden">/ {subtitle?.split('of ')?.[1] || 'limit'}</span>
                  <span className="hidden xs:inline">{subtitle}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p
            className={`text-xs sm:text-sm font-medium ${textColorClass} opacity-80 group-hover:opacity-100 transition-all leading-tight`}
            title={subtitle}
          >
            {/* Responsive subtitle with better truncation */}
            <span className="xs:hidden">
              {subtitle && subtitle.length > 10
                ? subtitle.substring(0, 10) + "..."
                : subtitle}
            </span>
            <span className="hidden xs:block sm:hidden">
              {subtitle && subtitle.length > 15
                ? subtitle.substring(0, 15) + "..."
                : subtitle}
            </span>
            <span className="hidden sm:inline truncate">{subtitle}</span>
          </p>
        )}
      </div>
      <div
        className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl lg:rounded-2xl ${bgColorClass} group-hover:${hoverBgClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl flex-shrink-0`}
      >
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${textColorClass} group-hover:scale-110 transition-transform duration-300`}
        />
      </div>
    </div>
  );
};

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [deleteModal, setDeleteModal] = useState({ show: false, report: null });
  const [previewModal, setPreviewModal] = useState({
    show: false,
    report: null,
  });
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadData, setUploadData] = useState({
    category: "medical",
    description: "",
    title: "",
  });
  const [sectionModal, setSectionModal] = useState({
    show: false,
    report: null,
  });
  const [editModal, setEditModal] = useState({ show: false, report: null });
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState(null);
  const [initialZoomLevel, setInitialZoomLevel] = useState(1);
  const [storageModal, setStorageModal] = useState({
    show: false,
    details: null,
  });
  const [analysisModal, setAnalysisModal] = useState({
    show: false,
    report: null,
    analysis: null,
    loading: false,
  });
  const [emergencyFolderLoadingId, setEmergencyFolderLoadingId] =
    useState(null);
  const [shareModal, setShareModal] = useState({ show: false, preSelected: [] });
  const imageContainerRef = useRef(null);
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { reportId } = useParams();

  // Local overrides for report image URLs.
  // Signed URLs can expire (or become invalid in prod), so we refresh them on-demand.
  const [imageUrlOverrides, setImageUrlOverrides] = useState({});
  const refreshAttemptsRef = useRef(new Map());

  // Get state and actions from patient store
  const {
    reports,
    isLoading,
    error,
    fetchReports,
    uploadReport,
    deleteReport,
    moveReport,
    updateReport,
    refreshReportUrl,
    analyzeReport,
    setReportEmergencyFolder,
  } = usePatientStore();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your reports");
      navigate("/login");
      return;
    }
    fetchReports(token);
  }, [isAuthenticated, navigate, token, fetchReports]);

  // Handle specific report navigation from search results
  useEffect(() => {
    if (!reports || reports.length === 0) return;

    // Check if navigated from search with specific report ID
    if (reportId && location.state?.fromSearch) {
      const specificReport = reports.find((r) => r._id === reportId);

      if (specificReport) {
        // Auto-open the specific report in preview modal
        setPreviewModal({
          show: true,
          report: specificReport,
        });

        // Reset zoom level and position
        setZoomLevel(1);
        setDragPosition({ x: 0, y: 0 });

        // Optionally clear the navigation state to prevent re-opening on refresh
        navigate(location.pathname, { replace: true });

        toast.success(
          `Opened ${specificReport.originalFilename || "selected report"}`
        );
      } else {
        toast.error("Report not found");
      }
    }

    // Handle reportData from navigation state (fallback)
    if (location.state?.reportData && location.state?.fromSearch) {
      const reportData = location.state.reportData;

      setPreviewModal({
        show: true,
        report: reportData,
      });

      setZoomLevel(1);
      setDragPosition({ x: 0, y: 0 });

      // Clear the navigation state
      navigate(location.pathname, { replace: true });

      toast.success(
        `Opened ${reportData.originalFilename || "selected report"}`
      );
    }
  }, [reports, reportId, location.state, navigate, location.pathname]);

  const handleDelete = async (reportId) => {
    const report = reports.find((r) => r._id === reportId);
    setDeleteModal({ show: true, report });
  };

  const confirmDelete = async () => {
    if (!deleteModal.report) return;

    try {
      await deleteReport(token, deleteModal.report._id);
      toast.success("Report deleted successfully");
      setDeleteModal({ show: false, report: null });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error(error.response?.data?.message || "Failed to delete report");
    }
  };

  const toggleEmergencyFolder = async (report, nextInFolder) => {
    if (!report?._id) return;
    setEmergencyFolderLoadingId(report._id);
    try {
      await setReportEmergencyFolder(token, report._id, nextInFolder);
      setPreviewModal((prev) =>
        prev.show && prev.report?._id === report._id
          ? { ...prev, report: { ...prev.report, inEmergencyFolder: nextInFolder } }
          : prev
      );
      toast.success(
        nextInFolder
          ? "Added to Emergency Folder"
          : "Removed from Emergency Folder"
      );
    } catch (error) {
      console.error("Emergency Folder toggle:", error);
      toast.error(
        error.response?.data?.message || "Could not update Emergency Folder"
      );
    } finally {
      setEmergencyFolderLoadingId(null);
    }
  };

  const handleDownload = async (fileUrl, filename) => {
    // Download functionality has been disabled
    toast.info("Download feature is currently unavailable");
    return;
  };

  // Calculate statistics for the dashboard
  const totalReports = reports.length;
  const medicalReports = reports.filter(
    (report) => report.category === "medical"
  ).length;
  const labReports = reports.filter(
    (report) => report.category === "lab"
  ).length;
  const prescriptionReports = reports.filter(
    (report) => report.category === "prescription"
  ).length;

  // Calculate total storage used (in bytes)
  const totalStorageUsed = reports.reduce(
    (acc, report) => acc + (report.fileSize || 0),
    0
  );
  const storageLimit = getStorageLimitForPlan(useAuthStore.getState().user?.planType);
  const storageLimitLabel = getStorageLimitLabel(useAuthStore.getState().user?.planType);
  const usedStorageInMB = (totalStorageUsed / (1024 * 1024)).toFixed(2);
  const storagePercentage = ((totalStorageUsed / storageLimit) * 100).toFixed(
    1
  );

  // Filter reports based on search and category
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.originalFilename
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      false ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && report.category === selectedFilter;
  });

  const formatDate = (date) => {
    if (!date) return "Date not available";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Update the preview handler to handle all file types
  const handlePreviewClick = (report) => {
    setPreviewModal({
      show: true,
      report,
    });
    // Reset zoom level and position when opening a new preview
    setZoomLevel(1);
    setDragPosition({ x: 0, y: 0 });
  };

  const getLatestFileUrl = (report) => {
    if (!report) return "";
    const id = report._id;
    return (id && imageUrlOverrides[id]) || report.fileUrl || "";
  };

  const handleImageError = async (report) => {
    if (!report?._id || !token) return;

    const attempts = refreshAttemptsRef.current.get(report._id) || 0;
    if (attempts >= 1) return; // try refresh at most once per report

    refreshAttemptsRef.current.set(report._id, attempts + 1);

    try {
      const latestFileUrl = await refreshReportUrl(token, report._id);
      if (latestFileUrl) {
        setImageUrlOverrides((prev) => ({
          ...prev,
          [report._id]: latestFileUrl,
        }));
        toast.success("Image refreshed");
      }
    } catch (e) {
      // Let the broken image placeholder remain if refresh also fails.
      console.error("Failed to refresh image URL:", e);
    }
  };

  // Close preview modal and reset zoom
  const handleClosePreview = () => {
    setPreviewModal({ show: false, report: null });
    setZoomLevel(1);
    setDragPosition({ x: 0, y: 0 });
  };

  // Add drag and drop functionality
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          if (errors[0]?.code === "file-too-large") {
            toast.error(`${file.name} is too large. Maximum size is 3MB.`);
          } else if (errors[0]?.code === "file-invalid-type") {
            toast.error(`${file.name} is not a supported file type.`);
          } else {
            toast.error(`Error with ${file.name}: ${errors[0]?.message}`);
          }
        });
        return;
      }

      // Only use the first file if multiple are dropped
      const file = acceptedFiles[0];
      if (file) {
        setUploadFile(file);
        // Automatically set the title if it's empty
        if (!uploadData.title) {
          setUploadData((prevData) => ({
            ...prevData,
            title: file.name,
          }));
        }
      }
    },
    [uploadData.title]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpeg"],
      "image/png": [".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 3 * 1024 * 1024, // 3MB
    multiple: false,
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("category", uploadData.category);
    formData.append("description", uploadData.description);
    formData.append("title", uploadData.title || uploadFile.name);

    try {
      const uploadedReport = await uploadReport(token, formData);
      toast.success("Report uploaded successfully");
      setUploadModal(false);
      setSectionModal({
        show: true,
        report: uploadedReport,
      });
      setUploadFile(null);
      setUploadData({ category: "medical", description: "", title: "" });
    } catch (error) {
      console.error("Upload error:", error);

      // Check if it's a storage limit error
      if (
        error.response?.status === 413 &&
        error.response?.data?.error === "STORAGE_LIMIT_EXCEEDED"
      ) {
        setUploadModal(false);
        setStorageModal({
          show: true,
          details: error.response.data.details,
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to upload report");
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();

    if (!editModal.report) {
      toast.error("No report selected for editing");
      return;
    }

    if (!editData.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setEditLoading(true);

    try {
      const loadingToast = toast.loading("Updating report...");

      console.log("Updating report:", {
        reportId: editModal.report._id,
        originalCategory: editModal.report.category,
        newCategory: editData.category,
        title: editData.title,
        description: editData.description,
      });

      // If category has changed, use moveReport first
      if (editData.category !== editModal.report.category) {
        console.log("Category changed, moving report to:", editData.category);
        await moveReport(token, editModal.report._id, editData.category);
        setSelectedFilter(editData.category);
      }

      // Always update title and description (even if only category changed)
      console.log("Updating report details");
      await updateReport(token, editModal.report._id, {
        title: editData.title,
        description: editData.description,
      });

      toast.dismiss(loadingToast);
      toast.success("Report updated successfully");
      setEditModal({ show: false, report: null });

      // Reset edit data
      setEditData({
        title: "",
        description: "",
        category: "",
      });
    } catch (error) {
      console.error("Error updating report:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update report";
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle report analysis with OCR and AI
  const handleAnalyzeReport = async (report) => {
    if (!report) {
      toast.error("No report selected for analysis");
      return;
    }

    // Check if file type is supported for analysis
    const supportedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/tiff'];
    if (!supportedTypes.includes(report.contentType)) {
      toast.error(
        `Analysis not supported for ${report.contentType}. Supported types: PNG, JPEG, PDF, TIFF.`
      );
      return;
    }

    setAnalysisModal({
      show: true,
      report,
      analysis: null,
      loading: true,
    });

    try {
      console.log("Starting report analysis for:", report._id);
      const result = await analyzeReport(token, report._id);

      toast.success("Report analyzed successfully!");

      setAnalysisModal((prev) => ({
        ...prev,
        analysis: result,
        loading: false,
      }));

      console.log("Analysis completed:", result);
    } catch (error) {
      console.error("Error analyzing report:", error);
      
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to analyze report. Please try again."
      );

      setAnalysisModal((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // Function to calculate distance between two touch points
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch events for zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Starting pinch zoom
      setInitialPinchDistance(getTouchDistance(e.touches));
      setInitialZoomLevel(zoomLevel);
      e.preventDefault();
    } else if (zoomLevel > 1) {
      // Starting pan
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      // Handle pinch zoom
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.max(1, Math.min(3, initialZoomLevel * scale));
      setZoomLevel(newZoom);
      e.preventDefault();
    } else if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      // Handle pan
      const touch = e.touches[0];
      const container = imageContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        setDragPosition({
          x: (offsetX - container.clientWidth / 2) / zoomLevel,
          y: (offsetY - container.clientHeight / 2) / zoomLevel,
        });
      }
      e.preventDefault(); // Prevent page scroll
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialPinchDistance(null);
  };

  // Handle mouse events for drag when zoomed
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      e.preventDefault(); // Prevent image drag behavior
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setDragPosition({
        x: dragPosition.x + e.movementX / zoomLevel,
        y: dragPosition.y + e.movementY / zoomLevel,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle double click for quick zoom toggle
  const handleDoubleClick = (e) => {
    // Reset or zoom in on double click
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setDragPosition({ x: 0, y: 0 });
    } else {
      setZoomLevel(2.5);
      // Zoom to clicked position
      const container = imageContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        setDragPosition({
          x: (offsetX - container.clientWidth / 2) / 2.5,
          y: (offsetY - container.clientHeight / 2) / 2.5,
        });
      }
    }
  };

  // Render reports based on view mode
  const renderReportsView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 glass-effect rounded-3xl">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-2"></div>
          </div>
          <p className="text-gray-600 font-medium mt-6 text-lg">
            Loading your reports...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your medical documents
          </p>
        </div>
      );
    }

    if (filteredReports.length === 0) {
      return (
        <div className="text-center py-20 glass-effect rounded-3xl">
          <div className="relative inline-block mb-8">
            <div className="p-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <FiFileText className="w-20 h-20 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FiSearch className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No reports found
          </h3>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            {searchQuery || selectedFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Upload your first medical report to get started"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                         rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            >
              Upload First Report
            </button>
            {(searchQuery || selectedFilter !== "all") && (
              <button
                onClick={() => {
                  setSelectedFilter("all");
                  setSearchQuery("");
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                           transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (viewMode) {
      case "grid":
        return renderGridView();
      case "list":
        return renderListView();
      default:
        return renderGridView();
    }
  };

  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {filteredReports.map((report, index) => (
          <div
            key={report._id}
            className={`group relative overflow-hidden bg-white/95 backdrop-blur-xl hover-lift
                       rounded-xl xs:rounded-2xl sm:rounded-3xl lg:rounded-[2rem] 
                       shadow-lg hover:shadow-2xl 
                       border border-gray-100/50 hover:border-blue-200/80
                       transform transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2
                       animate-fade-in-up hover:shadow-blue-500/20
                       before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500
                       ${report.inEmergencyFolder ? "ring-2 ring-red-500/80 border-red-200/80" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Enhanced Gradient Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            ></div>

            {/* Shimmer Effect */}
            <div
              className="absolute -inset-px bg-gradient-to-r from-transparent via-white/60 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-all duration-1000 
                            transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"
            ></div>

            <div className="relative z-10 flex flex-col h-full p-2 xs:p-3 sm:p-4 lg:p-5">
              {/* Enhanced Preview Section - Fully Responsive */}
              <div
                className="mb-2 xs:mb-3 sm:mb-4 h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 
                           bg-gradient-to-br from-gray-50/80 to-gray-100/80 
                           rounded-lg xs:rounded-xl lg:rounded-2xl overflow-hidden 
                           flex items-center justify-center cursor-pointer 
                           hover:opacity-95 transition-all duration-500 group/preview relative 
                           border border-gray-200/50 hover:border-blue-300/80 
                           hover:shadow-inner hover:shadow-blue-500/20
                           before:absolute before:inset-0 before:bg-gradient-to-t 
                           before:from-black/10 before:via-transparent before:to-transparent 
                           before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300"
                onClick={() => handlePreviewClick(report)}
              >
                {report.contentType?.startsWith("image/") ? (
                  <img
                    src={getLatestFileUrl(report)}
                    alt={report.originalFilename}
                    className="w-full h-full object-cover transition-transform duration-700 
                               group-hover/preview:scale-110 group-hover/preview:rotate-1"
                    onError={() => handleImageError(report)}
                  />
                ) : report.contentType === "application/pdf" ? (
                  <div
                    className="flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 
                                  group-hover/preview:scale-110 transition-transform duration-500"
                  >
                    <div
                      className="p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl sm:rounded-2xl 
                                    bg-gradient-to-br from-red-100 to-red-200 text-red-600 mb-1 xs:mb-2 
                                    group-hover/preview:from-red-200 group-hover/preview:to-red-300 
                                    transition-all duration-500 shadow-lg"
                    >
                      <FiFile className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <span
                      className="text-xs sm:text-sm font-semibold text-gray-700 
                                     group-hover/preview:text-red-700 transition-colors duration-300 
                                     text-center leading-tight"
                    >
                      <span className="block xs:hidden">PDF</span>
                      <span className="hidden xs:block">PDF Document</span>
                    </span>
                  </div>
                ) : report.category === "medical" ? (
                  <div
                    className="flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 
                                  group-hover/preview:scale-110 transition-transform duration-500"
                  >
                    <div
                      className="p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl sm:rounded-2xl 
                                    bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 mb-1 xs:mb-2 
                                    group-hover/preview:from-emerald-200 group-hover/preview:to-emerald-300 
                                    transition-all duration-500 shadow-lg"
                    >
                      <FiClipboard className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <span
                      className="text-xs sm:text-sm font-semibold text-gray-700 
                                     group-hover/preview:text-emerald-700 transition-colors duration-300 
                                     text-center leading-tight"
                    >
                      <span className="block xs:hidden">Medical</span>
                      <span className="hidden xs:block">Medical Report</span>
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 
                                  group-hover/preview:scale-110 transition-transform duration-500"
                  >
                    <div
                      className="p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl sm:rounded-2xl 
                                    bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 mb-1 xs:mb-2 
                                    group-hover/preview:from-blue-200 group-hover/preview:to-blue-300 
                                    transition-all duration-500 shadow-lg"
                    >
                      <FiFileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <span
                      className="text-xs sm:text-sm font-semibold text-gray-700 
                                     group-hover/preview:text-blue-700 transition-colors duration-300 
                                     text-center leading-tight"
                    >
                      <span className="block xs:hidden">Document</span>
                      <span className="hidden xs:block">Document</span>
                    </span>
                  </div>
                )}

                {/* Enhanced Preview Overlay */}
                <div
                  className="absolute top-1.5 xs:top-2 sm:top-3 right-1.5 xs:right-2 sm:right-3 
                                opacity-0 group-hover/preview:opacity-100 
                                transition-all duration-500 transform translate-y-2 group-hover/preview:translate-y-0"
                >
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg bg-white/90 backdrop-blur-md shadow-lg border border-white/50">
                    <FiEye className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-gray-700" />
                  </div>
                </div>

                {/* Category Badge - Always visible - Responsive */}
                <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 flex flex-col gap-1 items-start">
                  <span
                    className={`inline-flex items-center px-1.5 xs:px-2 py-0.5 xs:py-1 
                                  rounded-md xs:rounded-lg sm:rounded-full 
                                  text-xs xs:text-xs sm:text-xs font-bold 
                                  shadow-lg backdrop-blur-sm border border-white/50 ${
                                    report.category === "medical"
                                      ? "bg-emerald-100/90 text-emerald-800 border-emerald-200/50"
                                      : report.category === "lab"
                                      ? "bg-purple-100/90 text-purple-800 border-purple-200/50"
                                      : report.category === "prescription"
                                      ? "bg-blue-100/90 text-blue-800 border-blue-200/50"
                                      : "bg-gray-100/90 text-gray-800 border-gray-200/50"
                                  }`}
                  >
                    <span className="xs:hidden">
                      {report.category.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden xs:block">
                      {report.category.charAt(0).toUpperCase() +
                        report.category.slice(1)}
                    </span>
                  </span>
                  {report.inEmergencyFolder && (
                    <span className="inline-flex items-center px-1.5 xs:px-2 py-0.5 rounded-md text-[10px] xs:text-xs font-bold bg-red-600 text-white shadow-md border border-red-700/30">
                      EMERGENCY
                    </span>
                  )}
                </div>
              </div>

              {/* Enhanced File Details Section - Fully Responsive */}
              <div className="flex-1 flex flex-col">
                <div className="mb-2 xs:mb-3">
                  <h3
                    className="font-bold text-sm xs:text-base sm:text-lg text-gray-900 line-clamp-1 
                               group-hover:text-blue-800 transition-colors duration-300 mb-1 xs:mb-2
                               leading-tight"
                  >
                    <span className="xs:hidden">
                      {(report.originalFilename || "Unnamed File").length > 12
                        ? (report.originalFilename || "Unnamed File").substring(
                            0,
                            12
                          ) + "..."
                        : report.originalFilename || "Unnamed File"}
                    </span>
                    <span className="hidden xs:block">
                      {report.originalFilename || "Unnamed File"}
                    </span>
                  </h3>
                  <p className="text-xs xs:text-sm text-gray-600 line-clamp-1 xs:line-clamp-2 leading-relaxed">
                    <span className="xs:hidden">
                      {(report.description || "No description").length > 20
                        ? (report.description || "No description").substring(
                            0,
                            20
                          ) + "..."
                        : report.description || "No description"}
                    </span>
                    <span className="hidden xs:block">
                      {report.description || "No description provided"}
                    </span>
                  </p>
                </div>

                {/* Enhanced File Info with Icons - Responsive */}
                <div className="space-y-1 xs:space-y-1.5 mb-2 xs:mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-xs xs:text-sm">
                    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-gray-500 min-w-0">
                      <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex-shrink-0"></div>
                      <FiCalendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="font-medium text-xs leading-tight truncate">
                        <span className="xs:hidden">Date</span>
                        <span className="hidden xs:block">Uploaded</span>
                      </span>
                    </div>
                    <span className="font-semibold text-gray-700 text-xs leading-tight flex-shrink-0">
                      <span className="xs:hidden">
                        {formatDate(report.createdAt).split(" ")[0]}
                      </span>
                      <span className="hidden xs:block">
                        {formatDate(report.createdAt)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs xs:text-sm">
                    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-gray-500 min-w-0">
                      <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex-shrink-0"></div>
                      <FiHardDrive className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="font-medium text-xs leading-tight">
                        Size
                      </span>
                    </div>
                    <span className="font-semibold text-gray-700 text-xs leading-tight flex-shrink-0">
                      {formatFileSize(report.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Enhanced Action Buttons - Fully Responsive */}
                <div className="mt-auto pt-2 xs:pt-3 border-t border-gray-100/50 flex flex-col gap-1 xs:gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    disabled={emergencyFolderLoadingId === report._id}
                    onClick={() =>
                      toggleEmergencyFolder(report, !report.inEmergencyFolder)
                    }
                    className={`w-full flex items-center justify-center py-2 xs:py-2.5 px-2 xs:px-3 rounded-md xs:rounded-lg sm:rounded-xl transition-all duration-300 font-semibold text-xs xs:text-sm border shadow-sm min-h-[32px] xs:min-h-[36px] disabled:opacity-60 ${
                      report.inEmergencyFolder
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-700"
                        : "bg-red-50 hover:bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {emergencyFolderLoadingId === report._id
                      ? "…"
                      : report.inEmergencyFolder
                      ? "Remove from Emergency Folder"
                      : "Add to Emergency Folder"}
                  </button>
                  <div className="grid grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handlePreviewClick(report)}
                    className="flex items-center justify-center py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3 
                               bg-gradient-to-r from-blue-50 to-indigo-50 
                               hover:from-blue-100 hover:to-indigo-100
                               text-blue-700 hover:text-blue-800 
                               rounded-md xs:rounded-lg sm:rounded-xl 
                               transition-all duration-300 font-medium text-xs xs:text-sm
                               border border-blue-200/50 hover:border-blue-300/80
                               shadow-sm hover:shadow-md group/btn hover:shadow-blue-500/20
                               transform hover:scale-[1.02] active:scale-[0.98]
                               min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                  >
                    <FiEye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">View</span>
                    <span className="xs:hidden">👁</span>
                    <span className="hidden sm:inline">View</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditModal({ show: true, report });
                      setEditData({
                        title: report.originalFilename || "",
                        description: report.description || "",
                        category: report.category || "medical",
                      });
                    }}
                    className="flex items-center justify-center py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3 
                               bg-gradient-to-r from-amber-50 to-orange-50 
                               hover:from-amber-100 hover:to-orange-100
                               text-amber-700 hover:text-amber-800 
                               rounded-md xs:rounded-lg sm:rounded-xl 
                               transition-all duration-300 font-medium text-xs xs:text-sm
                               border border-amber-200/50 hover:border-amber-300/80
                               shadow-sm hover:shadow-md group/btn hover:shadow-amber-500/20
                               transform hover:scale-[1.02] active:scale-[0.98]
                               min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                  >
                    <FiEdit className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Edit</span>
                    <span className="xs:hidden">✏</span>
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => toast.info("Download feature is currently unavailable")}
                    className="flex items-center justify-center py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3 
                               bg-gradient-to-r from-emerald-50 to-green-50 
                               hover:from-emerald-100 hover:to-green-100
                               text-emerald-700 hover:text-emerald-800 
                               rounded-md xs:rounded-lg sm:rounded-xl 
                               transition-all duration-300 font-medium text-xs xs:text-sm
                               border border-emerald-200/50 hover:border-emerald-300/80
                               shadow-sm hover:shadow-md group/btn hover:shadow-emerald-500/20
                               transform hover:scale-[1.02] active:scale-[0.98]
                               min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                    title="Download Report"
                  >
                    <FiDownload className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Save</span>
                    <span className="xs:hidden">⬇</span>
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  <button
                    onClick={() => handleDelete(report._id)}
                    className="flex items-center justify-center py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3 
                               bg-gradient-to-r from-red-50 to-pink-50 
                               hover:from-red-100 hover:to-pink-100
                               text-red-700 hover:text-red-800 
                               rounded-md xs:rounded-lg sm:rounded-xl 
                               transition-all duration-300 font-medium text-xs xs:text-sm
                               border border-red-200/50 hover:border-red-300/80
                               shadow-sm hover:shadow-md group/btn hover:shadow-red-500/20
                               transform hover:scale-[1.02] active:scale-[0.98]
                               min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                    title="Delete Report"
                  >
                    <FiTrash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Del</span>
                    <span className="xs:hidden">🗑</span>
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  <button
                    onClick={() => handleAnalyzeReport(report)}
                    className="flex items-center justify-center py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3 
                               bg-gradient-to-r from-purple-50 to-pink-50 
                               hover:from-purple-100 hover:to-pink-100
                               text-purple-700 hover:text-purple-800 
                               rounded-md xs:rounded-lg sm:rounded-xl 
                               transition-all duration-300 font-medium text-xs xs:text-sm
                               border border-purple-200/50 hover:border-purple-300/80
                               shadow-sm hover:shadow-md group/btn hover:shadow-purple-500/20
                               transform hover:scale-[1.02] active:scale-[0.98]
                               min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                    title="Analyze Report with AI"
                  >
                    <FiTrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">AI</span>
                    <span className="xs:hidden">🔬</span>
                    <span className="hidden sm:inline">Analyze</span>
                  </button>

                  <button
                    onClick={() =>
                      setShareModal({ show: true, preSelected: [report._id] })
                    }
                    className="flex items-center justify-center py-1.5 xs:py-2 sm:py-2.5 px-2 xs:px-3 
                               bg-gradient-to-r from-indigo-50 to-violet-50 
                               hover:from-indigo-100 hover:to-violet-100
                               text-indigo-700 hover:text-indigo-800 
                               rounded-md xs:rounded-lg sm:rounded-xl 
                               transition-all duration-300 font-medium text-xs xs:text-sm
                               border border-indigo-200/50 hover:border-indigo-300/80
                               shadow-sm hover:shadow-md group/btn hover:shadow-indigo-500/20
                               transform hover:scale-[1.02] active:scale-[0.98]
                               min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                    title="Share with Doctor"
                  >
                    <FiShield className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 xs:mr-1.5 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline sm:hidden">Share</span>
                    <span className="xs:hidden">🔗</span>
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
        {filteredReports.map((report, index) => (
          <div
            key={report._id}
            className={`group bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl 
                       p-3 xs:p-4 sm:p-6 shadow-lg hover:shadow-xl 
                       border border-gray-100/50 hover:border-blue-200/80 
                       transform transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1
                       animate-fade-in-up hover:shadow-blue-500/20 relative overflow-hidden
                       before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500
                       ${report.inEmergencyFolder ? "ring-2 ring-red-500/80 border-red-200/80" : ""}`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Shimmer Effect */}
            <div
              className="absolute -inset-px bg-gradient-to-r from-transparent via-white/40 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-all duration-1000 
                            transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"
            ></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-2 xs:gap-3 sm:gap-4">
              {/* Enhanced File Icon/Preview - Responsive sizing */}
              <div
                className="flex-shrink-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                           bg-gradient-to-br from-gray-50/80 to-gray-100/80 
                           rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden 
                           flex items-center justify-center cursor-pointer
                           hover:shadow-lg transition-all duration-500 border border-gray-200/50
                           hover:border-blue-300/80 group-hover:scale-105 relative"
                onClick={() => handlePreviewClick(report)}
              >
                {report.contentType?.startsWith("image/") ? (
                  <img
                    src={getLatestFileUrl(report)}
                    alt={report.originalFilename}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => handleImageError(report)}
                  />
                ) : report.contentType === "application/pdf" ? (
                  <div className="p-1.5 xs:p-2 sm:p-3 rounded-md xs:rounded-lg bg-gradient-to-br from-red-100 to-red-200 text-red-600 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                    <FiFile className="w-4 h-4 xs:w-5 xs:h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </div>
                ) : report.category === "medical" ? (
                  <div className="p-1.5 xs:p-2 sm:p-3 rounded-md xs:rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                    <FiClipboard className="w-4 h-4 xs:w-5 xs:h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </div>
                ) : (
                  <div className="p-1.5 xs:p-2 sm:p-3 rounded-md xs:rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                    <FiFileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </div>
                )}

                {/* File Type Badge - Responsive */}
                <div className="absolute -top-1 -right-1">
                  <span className="inline-flex items-center px-1 xs:px-1.5 py-0.5 rounded-md text-xs font-medium bg-white/95 text-gray-600 border border-gray-200/50 shadow-sm">
                    <span className="hidden xs:inline">
                      {report.contentType?.split("/")[1]?.toUpperCase() ||
                        "FILE"}
                    </span>
                    <span className="xs:hidden">•</span>
                  </span>
                </div>
              </div>

              {/* Enhanced Content - Fully responsive */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1 xs:gap-2 mb-2 xs:mb-3 sm:mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-800 transition-colors duration-300">
                      {report.originalFilename || "Unnamed File"}
                    </h3>
                    <p className="text-xs xs:text-sm text-gray-600 line-clamp-2 mt-1 xs:mt-2 leading-relaxed">
                      {report.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 mt-1 xs:mt-0">
                    {report.inEmergencyFolder && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] xs:text-xs font-bold bg-red-600 text-white border border-red-700/40 shadow-sm">
                        EMERGENCY
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs font-bold 
                                shadow-sm border ${
                                  report.category === "medical"
                                    ? "bg-emerald-100/90 text-emerald-800 border-emerald-200/50"
                                    : report.category === "lab"
                                    ? "bg-purple-100/90 text-purple-800 border-purple-200/50"
                                    : report.category === "prescription"
                                    ? "bg-blue-100/90 text-blue-800 border-blue-200/50"
                                    : "bg-gray-100/90 text-gray-800 border-gray-200/50"
                                }`}
                    >
                      <span className="hidden xs:inline">
                        {report.category.charAt(0).toUpperCase() +
                          report.category.slice(1)}
                      </span>
                      <span className="xs:hidden">
                        {report.category.charAt(0).toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Enhanced File Details - Responsive grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm mb-2 xs:mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 xs:gap-2 text-gray-500">
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex-shrink-0"></div>
                    <FiCalendar className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] xs:text-xs text-gray-400">
                        <span className="hidden xs:inline">Uploaded</span>
                        <span className="xs:hidden">Date</span>
                      </span>
                      <span className="font-medium text-gray-700 text-xs xs:text-sm truncate">
                        <span className="hidden sm:inline">
                          {formatDate(report.createdAt)}
                        </span>
                        <span className="sm:hidden">
                          {new Date(report.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 xs:gap-2 text-gray-500">
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex-shrink-0"></div>
                    <FiHardDrive className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] xs:text-xs text-gray-400">
                        Size
                      </span>
                      <span className="font-medium text-gray-700 text-xs xs:text-sm">
                        {formatFileSize(report.fileSize)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 xs:gap-2 text-gray-500 col-span-1 xs:col-span-2 sm:col-span-1">
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex-shrink-0"></div>
                    <FiInfo className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[10px] xs:text-xs text-gray-400">
                        Type
                      </span>
                      <span className="font-medium text-gray-700 text-xs xs:text-sm truncate">
                        {report.contentType?.split("/")[1]?.toUpperCase() ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Actions - Responsive button layout */}
                <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    disabled={emergencyFolderLoadingId === report._id}
                    onClick={() =>
                      toggleEmergencyFolder(report, !report.inEmergencyFolder)
                    }
                    className={`flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 font-semibold text-xs xs:text-sm border shadow-sm min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] disabled:opacity-60 w-full sm:w-auto ${
                      report.inEmergencyFolder
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-700"
                        : "bg-red-50 hover:bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {emergencyFolderLoadingId === report._id
                      ? "…"
                      : report.inEmergencyFolder
                      ? "Remove from Emergency Folder"
                      : "Add to Emergency Folder"}
                  </button>
                  <button
                    onClick={() => handlePreviewClick(report)}
                    className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 
                               bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 
                               text-blue-700 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 
                               font-medium text-xs xs:text-sm border border-blue-200/50 hover:border-blue-300/80 
                               shadow-sm hover:shadow-md group/btn hover:shadow-blue-500/20
                               transform hover:scale-[1.02] active:scale-[0.98] min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                  >
                    <FiEye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline">Preview</span>
                    <span className="xs:hidden">👁</span>
                  </button>
                  <button
                    onClick={() => toast.info("Download feature is currently unavailable")}
                    className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 
                               bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 
                               text-emerald-700 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 
                               font-medium text-xs xs:text-sm border border-emerald-200/50 hover:border-emerald-300/80 
                               shadow-sm hover:shadow-md group/btn hover:shadow-emerald-500/20
                               transform hover:scale-[1.02] active:scale-[0.98] min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                  >
                    <FiDownload className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline">Download</span>
                    <span className="xs:hidden">⬇</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditModal({ show: true, report });
                      setEditData({
                        title: report.originalFilename || "",
                        description: report.description || "",
                        category: report.category || "medical",
                      });
                    }}
                    className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 
                               bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 
                               text-amber-700 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 
                               font-medium text-xs xs:text-sm border border-amber-200/50 hover:border-amber-300/80 
                               shadow-sm hover:shadow-md group/btn hover:shadow-amber-500/20
                               transform hover:scale-[1.02] active:scale-[0.98] min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                  >
                    <FiEdit className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline">Edit</span>
                    <span className="xs:hidden">✏</span>
                  </button>
                  <button
                    onClick={() => handleDelete(report._id)}
                    className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 
                               bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 
                               text-red-700 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 
                               font-medium text-xs xs:text-sm border border-red-200/50 hover:border-red-300/80 
                               shadow-sm hover:shadow-md group/btn hover:shadow-red-500/20
                               transform hover:scale-[1.02] active:scale-[0.98] min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                  >
                    <FiTrash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline">Delete</span>
                    <span className="xs:hidden">🗑</span>
                  </button>
                  <button
                    onClick={() => handleAnalyzeReport(report)}
                    className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 
                               bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 
                               text-purple-700 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 
                               font-medium text-xs xs:text-sm border border-purple-200/50 hover:border-purple-300/80 
                               shadow-sm hover:shadow-md group/btn hover:shadow-purple-500/20
                               transform hover:scale-[1.02] active:scale-[0.98] min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                    title="Analyze Report with AI"
                  >
                    <FiTrendingUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline">Analyze</span>
                    <span className="xs:hidden">🔬</span>
                  </button>
                  <button
                    onClick={() =>
                      setShareModal({ show: true, preSelected: [report._id] })
                    }
                    className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 
                               bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 
                               text-indigo-700 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 
                               font-medium text-xs xs:text-sm border border-indigo-200/50 hover:border-indigo-300/80 
                               shadow-sm hover:shadow-md group/btn hover:shadow-indigo-500/20
                               transform hover:scale-[1.02] active:scale-[0.98] min-h-[28px] xs:min-h-[32px] sm:min-h-[36px]"
                    title="Share with Doctor"
                  >
                    <FiShield className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform duration-200 flex-shrink-0" />
                    <span className="hidden xs:inline">Share</span>
                    <span className="xs:hidden">🔗</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSectionChange = async (reportId, newCategory) => {
    try {
      const loadingToast = toast.loading("Moving report...");
      await moveReport(token, reportId, newCategory);

      toast.dismiss(loadingToast);
      toast.success("Report moved successfully");
      setSectionModal({ show: false, report: null });

      // Update filter to show the new category
      setSelectedFilter(newCategory);
    } catch (error) {
      console.error("Error moving report:", error);
      toast.error(error.response?.data?.message || "Failed to move report");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <div className="max-w-[1600px] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Enhanced Fully Responsive Header Section */}
        <div className="flex flex-col gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col xs:flex-row xs:items-start sm:items-center justify-between gap-3 xs:gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <div className="p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg flex-shrink-0">
                  <FiClipboard className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                    <span className="block xs:hidden">Reports</span>
                    <span className="hidden xs:block">Medical Reports</span>
                  </h1>
                  <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-600 font-medium mt-0.5 xs:mt-1 leading-relaxed">
                    <span className="block sm:hidden">
                      Manage your documents
                    </span>
                    <span className="hidden sm:block">
                      Manage and organize your medical documents with ease
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Upload Button - Fully Responsive */}
            <button
              className="w-full xs:w-auto group flex items-center justify-center gap-2 xs:gap-3 
                         bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 
                         hover:from-blue-700 hover:via-blue-800 hover:to-purple-700
                         text-white px-3 xs:px-4 sm:px-6 md:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 
                         rounded-lg xs:rounded-xl sm:rounded-2xl hover:rounded-xl xs:hover:rounded-2xl sm:hover:rounded-3xl
                         transition-all duration-500 
                         shadow-lg hover:shadow-2xl hover:shadow-blue-500/25
                         transform hover:scale-105 active:scale-95
                         font-semibold text-xs xs:text-sm sm:text-base
                         min-h-[40px] xs:min-h-[44px] sm:min-h-[48px]"
              onClick={() => setUploadModal(true)}
            >
              <div className="p-0.5 xs:p-1 rounded-md xs:rounded-lg bg-white/20 group-hover:bg-white/30 transition-all duration-300">
                <FiUpload className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="hidden xs:inline">Upload</span>
              <span className="hidden sm:inline">New</span>
              <span className="hidden md:inline">Report</span>
              <span className="xs:hidden">Upload</span>
              <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-white/50 group-hover:bg-white/70 transition-all duration-300"></div>
            </button>
          </div>
          {/* Enhanced Quick Stats Bar - Fully Responsive */}
          <div className="flex flex-wrap items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 mt-2 xs:mt-3 sm:mt-4">
            <div className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 bg-blue-50 rounded-full">
              <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs xs:text-sm font-medium text-blue-700 whitespace-nowrap">
                <span className="xs:hidden">{totalReports} Files</span>
                <span className="hidden xs:inline">
                  {totalReports} Total Files
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 bg-green-50 rounded-full">
              <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-green-500"></div>
              <span className="text-xs xs:text-sm font-medium text-green-700 whitespace-nowrap">
                {usedStorageInMB}MB Used
              </span>
            </div>
            {storagePercentage > 70 && (
              <div className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 bg-orange-50 rounded-full">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs xs:text-sm font-medium text-orange-700 whitespace-nowrap">
                  <span className="xs:hidden">
                    {Math.round(storagePercentage)}%
                  </span>
                  <span className="hidden xs:inline">
                    {storagePercentage}% Used
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Search, Filter, and View Section - Fully Responsive */}
          <div className="w-full flex flex-col gap-2 xs:gap-3">
            {/* Main Control Row */}
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-2.5 xs:pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-8 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 
                             text-xs xs:text-sm sm:text-base 
                             border border-gray-200/50 rounded-lg xs:rounded-xl sm:rounded-2xl 
                             bg-white/90 backdrop-blur-sm shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300/50 
                             hover:border-gray-300/50 transition-all duration-300
                             placeholder:text-gray-400"
                />
              </div>

              {/* Category Filter - Visible on small screens and up */}
              <div className="relative w-full xs:w-auto xs:min-w-[120px] sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-2.5 xs:pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FiFilter className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="block w-full pl-8 xs:pl-10 sm:pl-12 pr-6 xs:pr-8 sm:pr-10 py-2 xs:py-2.5 sm:py-3 
                             text-xs xs:text-sm sm:text-base 
                             border border-gray-200/50 rounded-lg xs:rounded-xl sm:rounded-2xl 
                             bg-white/90 backdrop-blur-sm shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300/50 
                             hover:border-gray-300/50 transition-all duration-300
                             appearance-none cursor-pointer"
                >
                  <option value="all">All Reports</option>
                  <option value="medical">Medical</option>
                  <option value="lab">Lab Results</option>
                  <option value="prescription">Prescriptions</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 xs:pr-3 sm:pr-4 flex items-center pointer-events-none">
                  <FiChevronDown className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg xs:rounded-xl border border-gray-200/50 p-0.5 xs:p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 rounded-md xs:rounded-lg transition-all duration-200 text-xs xs:text-sm font-medium min-w-0 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title="Grid View"
                >
                  <FiGrid className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 rounded-md xs:rounded-lg transition-all duration-200 text-xs xs:text-sm font-medium min-w-0 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title="List View"
                >
                  <FiList className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard - Optimized responsive grid with reduced spacing */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <StatCard
            title="Medical Reports"
            count={medicalReports}
            subtitle="Medical documents"
            icon={FiClipboard}
            iconColor="text-emerald-600"
            borderColor="border-emerald-600"
            onClick={() => setSelectedFilter("medical")}
          />
          <StatCard
            title="Lab Results"
            count={labReports}
            subtitle="Test results"
            icon={FiFileText}
            iconColor="text-purple-600"
            borderColor="border-purple-600"
            onClick={() => setSelectedFilter("lab")}
          />
          <StatCard
            title="Prescriptions"
            count={prescriptionReports}
            subtitle="Medications"
            icon={FiFile}
            iconColor="text-blue-600"
            borderColor="border-blue-600"
            onClick={() => setSelectedFilter("prescription")}
          />
          <StatCard
            title="Storage Used"
            count={`${usedStorageInMB} / ${storageLimitLabel}`}
            subtitle={`${storagePercentage}% of limit`}
            icon={FiHardDrive}
            iconColor="text-teal-600"
            borderColor="border-teal-600"
            showProgress={true}
            progressPercentage={parseFloat(storagePercentage)}
          />
        </div>

        {/* Enhanced Filter Indicator - Single Row Responsive Design */}
        <div
          className="flex items-center justify-between gap-1 sm:gap-2 lg:gap-3 mb-6 lg:mb-8 
                     p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-blue-50 
                     rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 
                     text-xs sm:text-sm lg:text-base overflow-x-auto min-h-[40px] sm:min-h-[48px]"
        >
          {/* Left section: Showing + Filter */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              <span className="text-gray-700 font-medium whitespace-nowrap">
                Showing:
              </span>
            </div>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-full text-gray-900 font-semibold shadow-sm whitespace-nowrap">
              {selectedFilter === "all" && (
                <span className="hidden sm:inline">All Reports</span>
              )}
              {selectedFilter === "all" && (
                <span className="sm:hidden">All</span>
              )}
              {selectedFilter === "medical" && (
                <span className="hidden sm:inline">Medical Reports</span>
              )}
              {selectedFilter === "medical" && (
                <span className="sm:hidden">Medical</span>
              )}
              {selectedFilter === "lab" && (
                <span className="hidden sm:inline">Lab Results</span>
              )}
              {selectedFilter === "lab" && (
                <span className="sm:hidden">Lab</span>
              )}
              {selectedFilter === "prescription" && (
                <span className="hidden sm:inline">Prescriptions</span>
              )}
              {selectedFilter === "prescription" && (
                <span className="sm:hidden">prescription</span>
              )}
            </span>
            {searchQuery && (
              <>
                <span className="text-gray-400 mx-1">•</span>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full font-semibold whitespace-nowrap">
                  "
                  {searchQuery.length > 6
                    ? `${searchQuery.substring(0, 6)}...`
                    : searchQuery}
                  "
                </span>
              </>
            )}
          </div>

          {/* Center section: Separator and Clear Filters */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-gray-400 text-xs sm:text-sm">|</span>
            {(selectedFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFilter("all");
                  setSearchQuery("");
                }}
                className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-white hover:bg-red-50 
                           text-red-600 hover:text-red-700 rounded-lg border border-red-200 
                           hover:border-red-300 transition-all duration-300 font-medium
                           shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Clear Filters</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
          </div>

          {/* Right section: Results count */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
            <span className="text-gray-400 text-xs sm:text-sm">|</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-600 font-medium whitespace-nowrap">
                <span className="hidden sm:inline">
                  {filteredReports.length} result
                  {filteredReports.length !== 1 ? "s" : ""} found
                </span>
                <span className="sm:hidden">{filteredReports.length}</span>
              </span>
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 hidden sm:block"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Reports Grid */}
        {renderReportsView()}
      </div>

      {/* Preview Modal - Enhanced for Mobile */}
      {previewModal.show && previewModal.report && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 
                     p-1 xs:p-2 sm:p-4 animate-fade-in-up"
          onClick={() => handleClosePreview()}
        >
          <div
            className="relative w-full max-w-7xl h-full max-h-[98vh] xs:max-h-[95vh] sm:max-h-[90vh] 
                       flex flex-col bg-white/95 backdrop-blur-xl 
                       rounded-lg xs:rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Responsive */}
            <div
              className="w-full p-2 xs:p-3 sm:p-4 md:p-5 flex items-center justify-between 
                            border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 
                            flex-shrink-0"
            >
              <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-1 min-w-0">
                {previewModal.report.contentType?.startsWith("image/") ? (
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg bg-purple-50 text-purple-600 flex-shrink-0">
                    <FiImage className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                ) : previewModal.report.contentType === "application/pdf" ? (
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg bg-red-50 text-red-600 flex-shrink-0">
                    <FiFile className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                ) : previewModal.report.category === "medical" ? (
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg bg-green-50 text-green-600 flex-shrink-0">
                    <FiClipboard className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                ) : (
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <FiFileText className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-gray-900 line-clamp-1">
                    {previewModal.report.originalFilename}
                  </h3>
                  <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 mt-0.5 xs:mt-1">
                    <span
                      className={`inline-flex items-center px-1.5 xs:px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        previewModal.report.category === "medical"
                          ? "bg-green-100 text-green-800"
                          : previewModal.report.category === "lab"
                          ? "bg-purple-100 text-purple-800"
                          : previewModal.report.category === "prescription"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span className="hidden xs:inline">
                        {previewModal.report.category.charAt(0).toUpperCase() +
                          previewModal.report.category.slice(1)}
                      </span>
                      <span className="xs:hidden">
                        {previewModal.report.category.charAt(0).toUpperCase()}
                      </span>
                    </span>
                    <span className="text-[10px] xs:text-xs text-gray-500 truncate">
                      <span className="hidden sm:inline">
                        Uploaded on {formatDate(previewModal.report.createdAt)}
                      </span>
                      <span className="sm:hidden">
                        {formatDate(previewModal.report.createdAt)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 flex-shrink-0 flex-wrap justify-end">
                <button
                  type="button"
                  disabled={
                    emergencyFolderLoadingId === previewModal.report._id
                  }
                  onClick={() =>
                    toggleEmergencyFolder(
                      previewModal.report,
                      !previewModal.report.inEmergencyFolder
                    )
                  }
                  className={`inline-flex items-center px-2 py-1.5 sm:px-2.5 rounded-lg text-[10px] xs:text-xs sm:text-xs font-bold transition-colors border disabled:opacity-60 max-w-[5.5rem] sm:max-w-none ${
                    previewModal.report.inEmergencyFolder
                      ? "bg-red-600 text-white border-red-700 hover:bg-red-700"
                      : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                  }`}
                  title={
                    previewModal.report.inEmergencyFolder
                      ? "Remove from Emergency Folder"
                      : "Add to Emergency Folder"
                  }
                >
                  <span className="sm:hidden truncate">
                    {previewModal.report.inEmergencyFolder
                      ? "Remove"
                      : "Add EMR"}
                  </span>
                  <span className="hidden sm:inline">
                    {previewModal.report.inEmergencyFolder
                      ? "Remove from Emergency Folder"
                      : "Add to Emergency Folder"}
                  </span>
                </button>
                <button
                  onClick={() => toast.info("Download feature is currently unavailable")}
                  className="flex items-center justify-center p-1.5 xs:p-2 hover:bg-blue-50 rounded-lg xs:rounded-xl transition-colors"
                  title="Download"
                >
                  <FiDownload className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600" />
                </button>
                <button
                  onClick={() =>
                    window.open(getLatestFileUrl(previewModal.report), "_blank")
                  }
                  className="flex items-center justify-center p-1.5 xs:p-2 hover:bg-gray-100 rounded-lg xs:rounded-xl transition-colors"
                  title="Open in New Tab"
                >
                  <FiEye className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleClosePreview()}
                  className="flex items-center justify-center p-1.5 xs:p-2 hover:bg-red-50 rounded-lg xs:rounded-xl transition-colors ml-1 xs:ml-2"
                  title="Close"
                >
                  <FiX className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Main Content Area with Sidebar - Responsive Layout */}
            <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
              {/* Content Area - Takes full width on mobile, switches to right side on desktop */}
              <div className="order-1 lg:order-2 flex-1 overflow-auto bg-gray-900 min-h-[30vh] xs:min-h-[40vh] lg:min-h-0">
                {previewModal.report.contentType?.startsWith("image/") ? (
                  <div
                    className="w-full h-full flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-[#1c1c1c] relative overflow-hidden"
                    ref={imageContainerRef}
                  >
                    <img
                      src={getLatestFileUrl(previewModal.report)}
                      alt={previewModal.report.originalFilename}
                      className="max-w-full max-h-[50vh] xs:max-h-[60vh] lg:max-h-[calc(90vh-8rem)] object-contain rounded-lg shadow-2xl transition-all duration-200 select-none"
                      style={{
                        transform: `scale(${zoomLevel}) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                        cursor: zoomLevel > 1 ? "grab" : "default",
                        touchAction: zoomLevel > 1 ? "none" : "auto",
                      }}
                      onError={() => handleImageError(previewModal.report)}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onDoubleClick={handleDoubleClick}
                    />

                    {/* Zoom control buttons - Responsive */}
                    <div className="absolute top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 flex flex-col gap-1 xs:gap-1.5 sm:gap-2">
                      <button
                        onClick={() => {
                          if (zoomLevel < 3) {
                            setZoomLevel(zoomLevel + 0.5);
                          }
                        }}
                        className="p-1.5 xs:p-2 sm:p-2.5 bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-all"
                        title="Zoom In"
                        disabled={zoomLevel >= 3}
                      >
                        <FiZoomIn className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (zoomLevel > 1) {
                            setZoomLevel(Math.max(1, zoomLevel - 0.5));
                            if (zoomLevel <= 1.5) {
                              setDragPosition({ x: 0, y: 0 });
                            }
                          }
                        }}
                        className="p-1.5 xs:p-2 sm:p-2.5 bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-all"
                        title="Zoom Out"
                        disabled={zoomLevel <= 1}
                      >
                        <FiZoomOut className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (zoomLevel === 1) {
                            setZoomLevel(2.5);
                          } else {
                            setZoomLevel(1);
                            setDragPosition({ x: 0, y: 0 });
                          }
                        }}
                        className="p-1.5 xs:p-2 sm:p-2.5 bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-all"
                        title={zoomLevel === 1 ? "Fit to Screen" : "Reset Zoom"}
                      >
                        {zoomLevel === 1 ? (
                          <FiMaximize2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <FiMinimize2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>

                    {/* Zoom level indicator - Mobile friendly */}
                    {zoomLevel > 1 && (
                      <div className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4">
                        <div className="px-2 xs:px-3 py-1 xs:py-1.5 bg-black/40 backdrop-blur-sm text-white rounded-full text-xs xs:text-sm font-medium">
                          {Math.round(zoomLevel * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                ) : previewModal.report.contentType === "application/pdf" ? (
                  <div className="w-full h-full flex items-center justify-center p-4 xs:p-6 sm:p-8 bg-gray-100">
                    <div className="text-center">
                      <div className="p-6 xs:p-8 sm:p-12 rounded-full bg-red-100 text-red-600 mb-6 xs:mb-8 inline-block">
                        <FiFile className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20" />
                      </div>
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-3 xs:mb-4">
                        PDF Document
                      </h3>
                      <p className="text-sm xs:text-base text-gray-600 mb-6 xs:mb-8 max-w-md mx-auto">
                        Click the button below to open this PDF document in a
                        new tab for viewing.
                      </p>
                      <button
                        onClick={() =>
                          window.open(getLatestFileUrl(previewModal.report), "_blank")
                        }
                        className="inline-flex items-center gap-2 xs:gap-3 px-4 xs:px-6 py-2 xs:py-3 bg-red-600 text-white rounded-lg xs:rounded-xl hover:bg-red-700 transition-all font-medium text-sm xs:text-base"
                      >
                        <FiEye className="w-4 h-4 xs:w-5 xs:h-5" />
                        <span>Open PDF</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 xs:p-6 sm:p-8 bg-gray-100">
                    <div className="text-center">
                      <div className="p-6 xs:p-8 sm:p-12 rounded-full bg-blue-100 text-blue-600 mb-6 xs:mb-8 inline-block">
                        <FiFileText className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20" />
                      </div>
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-3 xs:mb-4">
                        Document File
                      </h3>
                      <p className="text-sm xs:text-base text-gray-600 mb-6 xs:mb-8 max-w-md mx-auto">
                        This file type cannot be previewed directly. Click the
                        button below to download or open it.
                      </p>
                      <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 justify-center">
                        <button
                          onClick={() => toast.info("Download feature is currently unavailable")}
                          className="inline-flex items-center gap-2 px-4 xs:px-6 py-2 xs:py-3 bg-blue-600 text-white rounded-lg xs:rounded-xl hover:bg-blue-700 transition-all font-medium text-sm xs:text-base"
                        >
                          <FiDownload className="w-4 h-4 xs:w-5 xs:h-5" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() =>
                            window.open(getLatestFileUrl(previewModal.report), "_blank")
                          }
                          className="inline-flex items-center gap-2 px-4 xs:px-6 py-2 xs:py-3 bg-gray-600 text-white rounded-lg xs:rounded-xl hover:bg-gray-700 transition-all font-medium text-sm xs:text-base"
                        >
                          <FiEye className="w-4 h-4 xs:w-5 xs:h-5" />
                          <span>Open</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Hidden on mobile, shown on desktop */}
              <div className="order-2 lg:order-1 lg:w-80 bg-white/95 backdrop-blur-md border-r border-gray-200/50 overflow-y-auto hidden lg:block">
                <div className="p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                    File Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        File Name
                      </span>
                      <p className="text-sm sm:text-base text-gray-900 mt-1 break-all">
                        {previewModal.report.originalFilename}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        Description
                      </span>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">
                        {previewModal.report.description ||
                          "No description provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        Category
                      </span>
                      <p className="text-sm sm:text-base text-gray-900 mt-1 capitalize">
                        {previewModal.report.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        File Size
                      </span>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">
                        {formatFileSize(previewModal.report.fileSize)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        Upload Date
                      </span>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">
                        {formatDate(previewModal.report.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        File Type
                      </span>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">
                        {previewModal.report.contentType || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200/50">
                    <h5 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                      Actions
                    </h5>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setEditModal({
                            show: true,
                            report: previewModal.report,
                          });
                          setEditData({
                            title: previewModal.report.originalFilename || "",
                            description: previewModal.report.description || "",
                            category: previewModal.report.category || "medical",
                          });
                          handleClosePreview();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-amber-600" />
                        Edit Report Details
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(previewModal.report._id);
                          handleClosePreview();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Delete
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, report: null })}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-xl mb-6">
              <p className="text-base text-gray-700 mb-2">
                Are you sure you want to delete "
                {deleteModal.report?.originalFilename || "this report"}"?
              </p>
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, report: null })}
                className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
          onClick={() => setUploadModal(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                  Upload New Report
                </h3>
                <p className="text-gray-500 text-sm">
                  Add your medical documents, images, or PDFs
                </p>
              </div>
              <button
                onClick={() => setUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2.5 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload File
                  </label>
                  <span className="text-xs text-gray-500">Max size: 3MB</span>
                </div>
                <div
                  {...getRootProps()}
                  className="flex items-center justify-center w-full"
                >
                  <div
                    className={`w-full flex flex-col items-center px-8 py-10 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
                      ${
                        isDragActive
                          ? "bg-blue-50 border-blue-400 shadow-md"
                          : "bg-gray-50/80 border-gray-300"
                      }
                      ${isDragAccept ? "bg-green-50 border-green-500" : ""}
                      ${isDragReject ? "bg-red-50 border-red-500" : ""}
                      ${
                        !isDragActive
                          ? "hover:border-blue-500 hover:bg-blue-50/50"
                          : ""
                      }
                      group
                    `}
                  >
                    <input {...getInputProps()} />
                    <div
                      className={`p-4 rounded-2xl transition-all duration-200 mb-4 group-hover:scale-110 ${
                        isDragReject
                          ? "bg-red-100 text-red-500"
                          : isDragAccept
                          ? "bg-green-100 text-green-500"
                          : "bg-blue-50 group-hover:bg-blue-100/80 text-blue-500"
                      }`}
                    >
                      {isDragReject ? (
                        <FiAlertCircle className="w-8 h-8" />
                      ) : isDragAccept ? (
                        <FiCheck className="w-8 h-8" />
                      ) : uploadFile ? (
                        <FiFile className="w-8 h-8" />
                      ) : (
                        <FiUpload className="w-8 h-8" />
                      )}
                    </div>
                    <div className="text-center">
                      {isDragActive ? (
                        <span className="text-sm font-medium mb-1 block">
                          {isDragReject
                            ? "This file type is not supported"
                            : "Drop the file here"}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-700 mb-1 block">
                          {uploadFile ? (
                            <span className="text-blue-600">
                              {uploadFile.name}
                            </span>
                          ) : (
                            "Drag and drop your file here"
                          )}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {!uploadFile && !isDragActive && "or click to browse"}
                        {isDragActive &&
                          isDragAccept &&
                          "File will be uploaded when you drop it"}
                      </span>
                    </div>
                    {uploadFile && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 rounded-full bg-gray-100">
                          {formatFileSize(uploadFile.size)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUploadFile(null);
                          }}
                          className="px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/80 appearance-none text-gray-700"
                    placeholder={
                      uploadFile
                        ? uploadFile.name
                        : "Enter a title for your report"
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={uploadData.category}
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/80 appearance-none pr-10 text-gray-700"
                      >
                        <option value="medical">Medical Report</option>
                        <option value="lab">Lab Result</option>
                        <option value="prescription">Prescription</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/80 resize-none text-gray-700"
                      rows="3"
                      placeholder="Enter a brief description..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors hover:bg-gray-50 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadFile}
                  className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl transition-all ${
                    uploadLoading || !uploadFile
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:transform active:scale-95"
                  }`}
                >
                  {uploadLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-5 h-5" />
                      <span className="font-medium">Upload Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Selection Modal */}
      {sectionModal.show && sectionModal.report && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSectionModal({ show: false, report: null })}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-white/20 transform transition-all duration-500 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                  Organize Your Report
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose a section to move your report to
                </p>
              </div>
              <button
                onClick={() => setSectionModal({ show: false, report: null })}
                className="text-gray-500 hover:text-gray-700 p-2.5 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* File Preview Section */}
              <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-6">
                  <div
                    className={`p-4 rounded-xl ${
                      sectionModal.report.contentType?.startsWith("image/")
                        ? "bg-purple-50 text-purple-600"
                        : sectionModal.report.contentType === "application/pdf"
                        ? "bg-red-50 text-red-600"
                        : sectionModal.report.category === "medical"
                        ? "bg-green-50 text-green-600"
                        : "bg-blue-50 text-blue-600"
                    } transform transition-all duration-300 hover:scale-105`}
                  >
                    {sectionModal.report.contentType?.startsWith("image/") ? (
                      <FiImage className="w-10 h-10" />
                    ) : sectionModal.report.contentType ===
                      "application/pdf" ? (
                      <FiFile className="w-10 h-10" />
                    ) : sectionModal.report.category === "medical" ? (
                      <FiClipboard className="w-10 h-10" />
                    ) : (
                      <FiFileText className="w-10 h-10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {sectionModal.report.originalFilename}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {sectionModal.report.description ||
                            "No description provided"}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sectionModal.report.contentType?.startsWith("image/")
                            ? "bg-purple-100 text-purple-700"
                            : sectionModal.report.contentType ===
                              "application/pdf"
                            ? "bg-red-100 text-red-700"
                            : sectionModal.report.category === "medical"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {sectionModal.report.contentType
                          ?.split("/")[1]
                          ?.toUpperCase() || "Unknown"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* File Information */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            File Details
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {formatFileSize(sectionModal.report.fileSize)}
                            </p>
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {sectionModal.report.contentType
                                ?.split("/")[1]
                                ?.toUpperCase() || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Current Section
                          </p>
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            {sectionModal.report.category
                              .charAt(0)
                              .toUpperCase() +
                              sectionModal.report.category.slice(1)}
                          </p>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Upload Information
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              Uploaded:{" "}
                              {formatDate(sectionModal.report.createdAt)}
                            </p>
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              Last Modified:{" "}
                              {formatDate(sectionModal.report.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Status</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Selection */}
              <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Select a Section
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      handleSectionChange(sectionModal.report._id, "medical")
                    }
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      sectionModal.report.category === "medical"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-white border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-50 text-green-600">
                        <FiClipboard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Medical Reports</p>
                        <p className="text-xs text-gray-500">
                          {
                            reports.filter((r) => r.category === "medical")
                              .length
                          }{" "}
                          reports
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSectionChange(sectionModal.report._id, "lab")
                    }
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      sectionModal.report.category === "lab"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <FiFileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Lab Results</p>
                        <p className="text-xs text-gray-500">
                          {reports.filter((r) => r.category === "lab").length}{" "}
                          reports
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSectionChange(
                        sectionModal.report._id,
                        "prescription"
                      )
                    }
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      sectionModal.report.category === "prescription"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <FiFile className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Prescriptions</p>
                        <p className="text-xs text-gray-500">
                          {
                            reports.filter((r) => r.category === "prescription")
                              .length
                          }{" "}
                          reports
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSectionChange(sectionModal.report._id, "other")
                    }
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      sectionModal.report.category === "other"
                        ? "bg-gray-50 border-gray-200 text-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-200 hover:bg-gray-50/50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
                        <FiHardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Other Documents</p>
                        <p className="text-xs text-gray-500">
                          {reports.filter((r) => r.category === "other").length}{" "}
                          reports
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Select a section to move this report
              </div>
              <button
                onClick={() => setSectionModal({ show: false, report: null })}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {editModal.show && editModal.report && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setEditModal({ show: false, report: null })}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 max-w-4xl w-full shadow-2xl border border-white/20 transform transition-all duration-500 animate-fade-in-up max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                  Edit Report Details
                </h3>
                <p className="text-sm text-gray-500">
                  Update your report information and category
                </p>
              </div>
              <button
                onClick={() => setEditModal({ show: false, report: null })}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateReport}
              className="flex-1 overflow-y-auto hide-scrollbar"
            >
              <div className="space-y-4 sm:space-y-6">
                {/* File Preview Section */}
                <div className="p-3 sm:p-4 md:p-6 bg-gray-50/80 rounded-xl sm:rounded-2xl border border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6">
                    <div
                      className={`p-3 sm:p-4 rounded-xl ${
                        editModal.report.contentType?.startsWith("image/")
                          ? "bg-purple-50 text-purple-600"
                          : editModal.report.contentType === "application/pdf"
                          ? "bg-red-50 text-red-600"
                          : editModal.report.category === "medical"
                          ? "bg-green-50 text-green-600"
                          : "bg-blue-50 text-blue-600"
                      } transform transition-all duration-300 hover:scale-105`}
                    >
                      {editModal.report.contentType?.startsWith("image/") ? (
                        <FiImage className="w-8 h-8 sm:w-10 sm:h-10" />
                      ) : editModal.report.contentType === "application/pdf" ? (
                        <FiFile className="w-8 h-8 sm:w-10 sm:h-10" />
                      ) : editModal.report.category === "medical" ? (
                        <FiClipboard className="w-8 h-8 sm:w-10 sm:h-10" />
                      ) : (
                        <FiFileText className="w-8 h-8 sm:w-10 sm:h-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
                              {editModal.report.originalFilename}
                            </h4>
                            <div
                              className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                editModal.report.contentType?.startsWith(
                                  "image/"
                                )
                                  ? "bg-purple-100 text-purple-700"
                                  : editModal.report.contentType ===
                                    "application/pdf"
                                  ? "bg-red-100 text-red-700"
                                  : editModal.report.category === "medical"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {editModal.report.contentType
                                ?.split("/")[1]
                                ?.toUpperCase() || "Unknown"}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">
                            {editModal.report.description ||
                              "No description provided"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {/* File Information */}
                        <div className="space-y-2 sm:space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              File Details
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                              <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                {formatFileSize(editModal.report.fileSize)}
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                {editModal.report.contentType
                                  ?.split("/")[1]
                                  ?.toUpperCase() || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Current Section
                            </p>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              <p className="text-xs sm:text-sm font-medium text-gray-700">
                                {editModal.report.category
                                  .charAt(0)
                                  .toUpperCase() +
                                  editModal.report.category.slice(1)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="space-y-2 sm:space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Upload Information
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                              <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                Uploaded:{" "}
                                {formatDate(editModal.report.createdAt)}
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                Modified:{" "}
                                {formatDate(editModal.report.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/80"
                      placeholder="Enter report title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/80 resize-none"
                      rows="3"
                      placeholder="Enter a brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                      Select Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setEditData({ ...editData, category: "medical" })
                        }
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                          editData.category === "medical"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-white border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-green-50 text-green-600">
                            <FiClipboard className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              Medical
                            </p>
                            <p className="text-xs text-gray-500">
                              {
                                reports.filter((r) => r.category === "medical")
                                  .length
                              }{" "}
                              reports
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditData({ ...editData, category: "lab" })
                        }
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                          editData.category === "lab"
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 text-purple-600">
                            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              Lab
                            </p>
                            <p className="text-xs text-gray-500">
                              {
                                reports.filter((r) => r.category === "lab")
                                  .length
                              }{" "}
                              reports
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditData({ ...editData, category: "prescription" })
                        }
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                          editData.category === "prescription"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600">
                            <FiFile className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              Prescription
                            </p>
                            <p className="text-xs text-gray-500">
                              {
                                reports.filter(
                                  (r) => r.category === "prescription"
                                ).length
                              }{" "}
                              reports
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditData({ ...editData, category: "other" })
                        }
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                          editData.category === "other"
                            ? "bg-gray-50 border-gray-200 text-gray-700"
                            : "bg-white border-gray-200 hover:border-gray-200 hover:bg-gray-50/50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-gray-50 text-gray-600">
                            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              Other
                            </p>
                            <p className="text-xs text-gray-500">
                              {
                                reports.filter((r) => r.category === "other")
                                  .length
                              }{" "}
                              reports
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3 sm:gap-4 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, report: null })}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors hover:bg-gray-50 rounded-lg sm:rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl transition-all ${
                      editLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:transform active:scale-95"
                    }`}
                  >
                    {editLoading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium">Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage Limit Modal */}
      <StorageLimitModal
        isOpen={storageModal.show}
        onClose={() => setStorageModal({ show: false, details: null })}
        storageDetails={storageModal.details}
        planType={storageModal.details?.planType || "free"}
      />

      {/* Report Analysis Modal */}
      <ReportAnalysisModal
        show={analysisModal.show}
        report={analysisModal.report}
        analysis={analysisModal.analysis}
        loading={analysisModal.loading}
        onClose={() => setAnalysisModal({ show: false, report: null, analysis: null, loading: false })}
      />

      {/* Share with Doctor Modal */}
      <ShareWithDoctorModal
        isOpen={shareModal.show}
        onClose={() => setShareModal({ show: false, preSelected: [] })}
        reports={reports}
        preSelectedReportIds={shareModal.preSelected}
      />
    </div>
  );
};
export default Reports;
