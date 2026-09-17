import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Fallback prevents requests like ".../undefined/api/..." when env is missing or mis-set.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-sih.onrender.com";

// Access the global request throttling mechanism or create it
const requestTimestamps = window.requestTimestamps || {
  profile: 0,
  founderProfile: 0,
  doctorProfile: 0
};

// Make it globally available to share between stores
window.requestTimestamps = requestTimestamps;

// Minimum time between identical requests (in milliseconds)
const REQUEST_THROTTLE_MS = 5000; // 5 seconds

// Check if a request should be throttled
const shouldThrottleRequest = (key) => {
  const now = Date.now();
  if (now - requestTimestamps[key] < REQUEST_THROTTLE_MS) {
    console.log(`Throttled request to ${key} - too soon after previous request`);
    return true;
  }
  requestTimestamps[key] = now;
  return false;
};

// Global cache for doctor profile
let doctorProfileCache = null;
let doctorProfileCacheTimestamp = 0;
const PROFILE_CACHE_TTL = 30000; // 30 seconds

export const useDoctorStore = create((set, get) => ({
  isAuthenticated: false,
  doctor: null,
  isLoading: false,
  error: null,
  isCheckingAuth: true,

  // Shared reports state
  sharedReports: [],
  sharedReportsLoading: false,

  // Check if doctor is already authenticated
  checkAuthStatus: async () => {
    try {
      set({ isCheckingAuth: true, error: null });
      
      try {
        const response = await axios.get(`${API_URL}/api/doctor/check-auth`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          set({ 
            isAuthenticated: true, 
            doctor: response.data.doctor,
            isCheckingAuth: false
          });
          return true;
        } else {
          set({ 
            isAuthenticated: false, 
            doctor: null,
            isCheckingAuth: false
          });
          return false;
        }
      } catch (error) {
        set({ 
          isAuthenticated: false, 
          doctor: null, 
          error: error.response?.data?.message || 'Authentication failed',
          isCheckingAuth: false
        });
        return false;
      }
    } catch (error) {
      set({ 
        isAuthenticated: false, 
        doctor: null, 
        error: 'Critical error in authentication flow',
        isCheckingAuth: false
      });
      return false;
    }
  },

  // Doctor signup
  signupDoctor: async (payload) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await axios.post(`${API_URL}/api/doctor/signup`, payload, {
        withCredentials: true
      });
      
      set({ isLoading: false });
      
      if (response.data.success) {
        toast.success('Registration successful! You can now log in.');
        return response.data;
      }
    } catch (error) {
      console.error('Doctor signup error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.'
      });
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    }
  },

  // Doctor login
  loginDoctor: async (credentials) => {
    console.log("doctorStore: loginDoctor called with credentials:", credentials.email);
    try {
      set({ isLoading: true, error: null });
      
      console.log("doctorStore: making API call to login");
      const response = await axios.post(`${API_URL}/api/doctor/login`, credentials, {
        withCredentials: true
      });
      
      console.log("doctorStore: login response:", response.data);
      if (response.data.success) {
        // Update the cache when logging in
        doctorProfileCache = response.data.doctor;
        doctorProfileCacheTimestamp = Date.now();
        
        console.log("doctorStore: login successful, setting authenticated state");
        set({
          isAuthenticated: true,
          doctor: response.data.doctor,
          isLoading: false
        });
        
        toast.success('Login successful!');
        return true;
      }
    } catch (error) {
      console.error('doctorStore: Doctor login error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.'
      });
      
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  },

  // Doctor logout
  logoutDoctor: async () => {
    try {
      set({ isLoading: true });
      
      await axios.post(`${API_URL}/api/doctor/logout`, {}, {
        withCredentials: true
      });
      
      // Clear the cache on logout
      doctorProfileCache = null;
      doctorProfileCacheTimestamp = 0;
      
      set({
        isAuthenticated: false,
        doctor: null,
        isLoading: false
      });
      
      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      console.error('Doctor logout error:', error);
      set({ isLoading: false });
      toast.error('Logout failed');
      return false;
    }
  },

  // Get doctor profile
  getDoctorProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if we have a recent enough cache
      const now = Date.now();
      if (doctorProfileCache && (now - doctorProfileCacheTimestamp < PROFILE_CACHE_TTL)) {
        console.log('Using cached doctor profile data');
        set({
          doctor: doctorProfileCache,
          isLoading: false
        });
        return doctorProfileCache;
      }
      
      // Prevent duplicate requests in quick succession
      if (shouldThrottleRequest('doctorProfile')) {
        console.log('Throttled doctor profile request - using existing data');
        set({ isLoading: false });
        return get().doctor;
      }
      
      const response = await axios.get(`${API_URL}/api/doctor/profile`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Update the cache
        doctorProfileCache = response.data.doctor;
        doctorProfileCacheTimestamp = now;
        
        set({
          doctor: response.data.doctor,
          isLoading: false
        });
        
        return response.data.doctor;
      }
    } catch (error) {
      console.error('Get doctor profile error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch profile'
      });
      
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
      return null;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await axios.post(`${API_URL}/api/doctor/reset-password`, { email });
      
      set({ isLoading: false });
      
      if (response.data.success) {
        toast.success('If your email is registered, a password reset link will be sent');
        return true;
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to request password reset'
      });
      
      toast.error(error.response?.data?.message || 'Failed to request password reset');
      return false;
    }
  },

  // Clear errors
  clearErrors: () => set({ error: null }),

  // ===== SHARED REPORTS FUNCTIONALITY =====

  // Fetch all shared reports for the doctor
  fetchSharedReports: async () => {
    try {
      set({ sharedReportsLoading: true });
      const response = await axios.get(`${API_URL}/api/doctor/shared-reports`, {
        withCredentials: true,
      });
      set({
        sharedReports: response.data.shares || [],
        sharedReportsLoading: false,
      });
      return response.data.shares;
    } catch (error) {
      console.error('Error fetching shared reports:', error);
      set({ sharedReportsLoading: false });
      return [];
    }
  },

  // View a specific shared report (returns report data with signed URL)
  viewSharedReport: async (shareId, reportId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctor/shared-reports/${shareId}/reports/${reportId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error viewing shared report:', error);
      toast.error(error.response?.data?.message || 'Failed to view report');
      return null;
    }
  },

  // Add a note to a shared report
  addNoteToShare: async (shareId, { text, type }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/doctor/shared-reports/${shareId}/notes`,
        { text, type },
        { withCredentials: true }
      );
      if (response.data.success) {
        // Update the notes in the local state
        set((state) => ({
          sharedReports: state.sharedReports.map((share) =>
            share._id === shareId
              ? { ...share, notes: response.data.notes }
              : share
          ),
        }));
        toast.success('Note added successfully');
        return response.data;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error(error.response?.data?.message || 'Failed to add note');
      return null;
    }
  },
}));