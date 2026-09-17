import axios from "axios";
import { create } from "zustand";
// API URL for backend communication
// Fallback prevents requests like ".../undefined/api/..." when env is missing or mis-set.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-sih.onrender.com";

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

const usePatientStore = create((set, get) => ({
  // State
  reports: [],
  prescriptions: [],
  notifications: [],
  unreadNotificationsCount: 0,
  isLoading: false,
  error: null,
  prescriptionCount: 0,
  userProfile: null,
  searchResults: [],
  isSearching: false,

  // Connected devices state
  connectedDevices: [],
  connectedDevicesLoading: false,
  connectedDevicesError: null,

  // Report sharing state
  sharedReports: [],
  sharedReportsLoading: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Search function for reports and prescriptions
  searchMedicalData: async (
    query,
    categories = { reports: true, prescriptions: true }
  ) => {
    try {
      set({ isSearching: true });

      const results = [];
      const lowerQuery = query.toLowerCase();
      const { reports, prescriptions } = get();

      // Search reports
      if (categories.reports && reports) {
        const reportResults = reports
          .filter(
            (report) =>
              report.originalFilename?.toLowerCase().includes(lowerQuery) ||
              report.description?.toLowerCase().includes(lowerQuery) ||
              report.category?.toLowerCase().includes(lowerQuery) ||
              report.doctor?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5)
          .map((report) => ({
            id: report._id,
            type: "report",
            title: report.originalFilename || "Medical Report",
            description: report.description || `${report.category} report`,
            date: report.createdAt,
            icon: "FiFileText",
            path: `/dashboard/reports/${report._id}`,
            category: report.category,
            metadata: `${report.category} • ${new Date(
              report.createdAt
            ).toLocaleDateString()}`,
            reportData: report, // Store the full report data for navigation
          }));
        results.push(...reportResults);
      }

      // Search prescriptions
      if (categories.prescriptions && prescriptions) {
        const prescriptionResults = prescriptions
          .filter(
            (prescription) =>
              prescription.doctor?.toLowerCase().includes(lowerQuery) ||
              prescription.diagnosis?.toLowerCase().includes(lowerQuery) ||
              prescription.medications?.some((med) =>
                med.name?.toLowerCase().includes(lowerQuery)
              ) ||
              prescription.hospitalName?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5)
          .map((prescription) => ({
            id: prescription._id,
            type: "prescription",
            title: `Prescription by Dr. ${prescription.doctor || "Unknown"}`,
            description: prescription.diagnosis || "Digital Prescription",
            date: prescription.createdAt,
            icon: "FiClipboard",
            path: `/dashboard/digital-prescriptions/${prescription._id}`,
            category: "prescription",
            metadata: `${
              prescription.medications?.length || 0
            } medications • ${new Date(
              prescription.createdAt
            ).toLocaleDateString()}`,
          }));
        results.push(...prescriptionResults);
      }

      // Sort results by date (newest first)
      results.sort((a, b) => new Date(b.date) - new Date(a.date));

      set({ searchResults: results, isSearching: false });
      return results;
    } catch (error) {
      console.error("Search error:", error);
      set({ searchResults: [], isSearching: false });
      return [];
    }
  },

  // Fetch all medical data
  fetchAllMedicalData: async (token) => {
    try {
      set({ isLoading: true, error: null });

      // Set auth token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch all data in parallel
      const [
        reportsRes,
        prescriptionsRes,
        notificationsRes,
        prescriptionCountRes,
      ] = await Promise.all([
        axios.get("/api/reports"),
        axios.get("/api/user/digital-prescriptions"),
        axios.get("/api/notifications"),
        axios.get("/api/user/digital-prescriptions/count"),
      ]);

      // Update state with fetched data
      set({
        reports: reportsRes.data.reports || [],
        prescriptions: prescriptionsRes.data.prescriptions || [],
        notifications: notificationsRes.data.notifications || [],
        unreadNotificationsCount: notificationsRes.data.unreadCount || 0,
        prescriptionCount: prescriptionCountRes.data.count || 0,
        isLoading: false,
      });

      return {
        reports: reportsRes.data.reports,
        prescriptions: prescriptionsRes.data.prescriptions,
        notifications: notificationsRes.data.notifications,
        prescriptionCount: prescriptionCountRes.data.count,
      };
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch medical data",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch medical reports
  fetchReports: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/reports");
      set({ reports: response.data.reports || [], isLoading: false });
      return response.data.reports;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch reports",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get specific report by ID
  getReportById: async (token, reportId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(`/api/reports/${reportId}`);
      set({ isLoading: false });
      return response.data.report;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch report",
        isLoading: false,
      });
      throw error;
    }
  },

  // Refresh report URL
  refreshReportUrl: async (token, reportId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(`/api/reports/${reportId}/refresh-url`);
      set({ isLoading: false });
      // Backend returns `fileUrl`, but some older client code expected `url`
      return response.data.fileUrl || response.data.url;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to refresh report URL",
        isLoading: false,
      });
      throw error;
    }
  },

  // Move report to different category
  moveReport: async (token, reportId, newCategory) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.patch(`/api/reports/${reportId}/move`, {
        category: newCategory,
      });

      // Update report in state
      set((state) => ({
        reports: state.reports.map((report) =>
          report._id === reportId
            ? { ...report, category: newCategory }
            : report
        ),
        isLoading: false,
      }));

      return response.data.report;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to move report",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update report details
  updateReport: async (token, reportId, updates) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.patch(`/api/reports/${reportId}`, updates);

      // Update report in state
      set((state) => ({
        reports: state.reports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                originalFilename: updates.title || report.originalFilename,
                description:
                  updates.description !== undefined
                    ? updates.description
                    : report.description,
              }
            : report
        ),
        isLoading: false,
      }));

      return response.data.report;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update report",
        isLoading: false,
      });
      throw error;
    }
  },

  setReportEmergencyFolder: async (token, reportId, inEmergencyFolder) => {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.patch(
        `/api/reports/${reportId}/emergency-folder`,
        { inEmergencyFolder }
      );

      const updated = response.data.report;
      set((state) => ({
        reports: state.reports.map((report) =>
          String(report._id) === String(reportId)
            ? { ...report, ...updated, inEmergencyFolder }
            : report
        ),
      }));

      return updated;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to update Emergency Folder",
      });
      throw error;
    }
  },

  // Fetch prescriptions
  fetchPrescriptions: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/user/digital-prescriptions");
      set({
        prescriptions: response.data.prescriptions || [],
        isLoading: false,
      });
      return response.data.prescriptions;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch prescriptions",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get prescription count
  getPrescriptionCount: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/user/digital-prescriptions/count");
      set({ prescriptionCount: response.data.count || 0, isLoading: false });
      return response.data.count;
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch prescription count",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get specific prescription by ID
  getPrescriptionById: async (token, prescriptionId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(
        `/api/user/digital-prescriptions/${prescriptionId}`
      );
      set({ isLoading: false });
      return response.data.prescription;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch prescription",
        isLoading: false,
      });
      throw error;
    }
  },

  // Create a new prescription (for doctors/hospitals)
  createPrescription: async (prescriptionData, token) => {
    try {
      set({ isLoading: true, error: null });

      // Create a dedicated axios instance for prescription creation to avoid cancellation
      const prescriptionAxios = axios.create({
        baseURL: API_URL,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const response = await prescriptionAxios.post(
        "/api/hospital/digital-prescriptions",
        prescriptionData
      );

      if (response.data.success) {
        // Update prescriptions list with new prescription
        set((state) => ({
          prescriptions: [response.data.prescription, ...state.prescriptions],
          prescriptionCount: state.prescriptionCount + 1,
          isLoading: false,
        }));

        return response.data.prescription;
      } else {
        throw new Error(
          response.data.message || "Failed to create prescription"
        );
      }
    } catch (error) {
      // Check if this is a cancellation error
      if (axios.isCancel(error)) {
        console.log("Prescription creation was cancelled:", error.message);
        set({
          error: "Request was cancelled",
          isLoading: false,
        });
        throw new Error("Request was cancelled");
      }

      console.error("Error creating prescription:", error);
      set({
        error: error.response?.data?.message || "Failed to create prescription",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch notifications
  fetchNotifications: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/notifications");
      set({
        notifications: response.data.notifications || [],
        unreadNotificationsCount: response.data.unreadCount || 0,
        isLoading: false,
      });
      return response.data.notifications;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch notifications",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get unread notifications count
  getUnreadNotificationsCount: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/notifications/unread-count");
      set({
        unreadNotificationsCount: response.data.count || 0,
        isLoading: false,
      });
      return response.data.count;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch unread count",
        isLoading: false,
      });
      throw error;
    }
  },

  // Upload medical report
  uploadReport: async (token, formData) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.post("/api/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update reports list with new report
      set((state) => ({
        reports: [response.data.report, ...state.reports],
        isLoading: false,
      }));

      return response.data.report;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to upload report",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete medical report
  deleteReport: async (token, reportId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.delete(`/api/reports/${reportId}`);

      // Remove deleted report from state
      set((state) => ({
        reports: state.reports.filter((report) => report._id !== reportId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete report",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (token, notificationId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.delete(`/api/notifications/${notificationId}`);

      // Remove deleted notification from state
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== notificationId
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete notification",
        isLoading: false,
      });
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (token, notificationId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.patch(`/api/notifications/${notificationId}/read`);

      // Update notification status in state
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
        unreadNotificationsCount: Math.max(
          0,
          state.unreadNotificationsCount - 1
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to mark notification as read",
        isLoading: false,
      });
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.patch("/api/notifications/mark-all-read");

      // Update all notifications status in state
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadNotificationsCount: 0,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to mark all notifications as read",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get user profile by UMID
  getUserProfileByUmid: async (umid) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`/api/user/profile/${umid}`);
      set({ userProfile: response.data.profile, isLoading: false });
      return response.data.profile;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch user profile",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get user's storage information
  getStorageInfo: async (token) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/storage/storage-info");
      set({ isLoading: false });
      return response.data.storageInfo;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to fetch storage information",
        isLoading: false,
      });
      throw error;
    }
  },

  // ===== CONNECTED DEVICES FUNCTIONALITY =====

  // Set connected devices loading state
  setConnectedDevicesLoading: (loading) => set({ connectedDevicesLoading: loading }),

  // Set connected devices error
  setConnectedDevicesError: (error) => set({ connectedDevicesError: error }),

  // Get all connected devices
  getConnectedDevices: async () => {
    try {
      set({ connectedDevicesLoading: true, connectedDevicesError: null });
      
      const response = await axios.get('/api/connected-devices');
      
      if (response.data.success) {
        set({ 
          connectedDevices: response.data.devices || [],
          connectedDevicesLoading: false 
        });
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch devices');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch connected devices';
      set({ 
        connectedDevicesError: errorMsg,
        connectedDevicesLoading: false 
      });
      throw new Error(errorMsg);
    }
  },

  // Register current device
  registerDevice: async () => {
    try {
      const response = await axios.post('/api/connected-devices/register');
      
      if (response.data.success) {
        // Refresh devices list
        const { connectedDevices } = get();
        if (connectedDevices.length > 0) {
          get().getConnectedDevices();
        }
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to register device');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to register device';
      console.error('Device registration failed:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  // Remove a device
  removeDevice: async (deviceId) => {
    try {
      set({ connectedDevicesLoading: true, connectedDevicesError: null });
      
      const response = await axios.delete(`/api/connected-devices/${deviceId}`);
      
      if (response.data.success) {
        // Remove device from local state
        set(state => ({
          connectedDevices: state.connectedDevices.filter(device => device.id !== deviceId),
          connectedDevicesLoading: false
        }));
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to remove device');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to remove device';
      set({ 
        connectedDevicesError: errorMsg,
        connectedDevicesLoading: false 
      });
      throw new Error(errorMsg);
    }
  },

  // Update device name
  updateDeviceName: async (deviceId, deviceName) => {
    try {
      set({ connectedDevicesLoading: true, connectedDevicesError: null });
      
      const response = await axios.put(`/api/connected-devices/${deviceId}/name`, {
        deviceName
      });
      
      if (response.data.success) {
        // Update device in local state
        set(state => ({
          connectedDevices: state.connectedDevices.map(device => 
            device.id === deviceId 
              ? { ...device, deviceName: deviceName }
              : device
          ),
          connectedDevicesLoading: false
        }));
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update device name');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update device name';
      set({ 
        connectedDevicesError: errorMsg,
        connectedDevicesLoading: false 
      });
      throw new Error(errorMsg);
    }
  },

  // Remove all inactive devices
  removeInactiveDevices: async () => {
    try {
      set({ connectedDevicesLoading: true, connectedDevicesError: null });
      
      const response = await axios.delete('/api/connected-devices/inactive/cleanup');
      
      if (response.data.success) {
        // Refresh devices list after cleanup
        await get().getConnectedDevices();
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to remove inactive devices');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to remove inactive devices';
      set({ 
        connectedDevicesError: errorMsg,
        connectedDevicesLoading: false 
      });
      throw new Error(errorMsg);
    }
  },

  // Analyze medical report with OCR and AI
  analyzeReport: async (token, reportId) => {
    try {
      set({ isLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.post(`/api/reports/${reportId}/analyze`);

      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to analyze report",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear store data
  clearStore: () => {
    set({
      reports: [],
      prescriptions: [],
      notifications: [],
      unreadNotificationsCount: 0,
      prescriptionCount: 0,
      userProfile: null,
      error: null,
      connectedDevices: [],
      connectedDevicesLoading: false,
      connectedDevicesError: null,
      sharedReports: [],
      sharedReportsLoading: false,
    });
  },

  // ===== REPORT SHARING FUNCTIONALITY =====

  // Share reports with a doctor
  shareReportsWithDoctor: async (token, { doctorId, reportIds, accessDuration, customExpiry }) => {
    try {
      set({ sharedReportsLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.post("/api/report-sharing", {
        doctorId,
        reportIds,
        accessDuration,
        customExpiry,
      });

      if (response.data.success) {
        set((state) => ({
          sharedReports: [response.data.share, ...state.sharedReports],
          sharedReportsLoading: false,
        }));
        return response.data;
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to share reports",
        sharedReportsLoading: false,
      });
      throw error;
    }
  },

  // Fetch all shares for the patient
  fetchMyShares: async (token) => {
    try {
      set({ sharedReportsLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/api/report-sharing");
      set({
        sharedReports: response.data.shares || [],
        sharedReportsLoading: false,
      });
      return response.data.shares;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch shares",
        sharedReportsLoading: false,
      });
      throw error;
    }
  },

  // Revoke a share
  revokeShare: async (token, shareId) => {
    try {
      set({ sharedReportsLoading: true, error: null });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.patch(`/api/report-sharing/${shareId}/revoke`);

      set((state) => ({
        sharedReports: state.sharedReports.map((share) =>
          share._id === shareId ? { ...share, status: "revoked" } : share
        ),
        sharedReportsLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to revoke share",
        sharedReportsLoading: false,
      });
      throw error;
    }
  },

  // Validate a doctor ID
  validateDoctorId: async (token, doctorId) => {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`/api/report-sharing/validate-doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Doctor not found" };
    }
  },

  // Fetch access log for a share
  fetchShareAccessLog: async (token, shareId) => {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`/api/report-sharing/${shareId}/access-log`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch access log" };
    }
  },
}));

export default usePatientStore;
