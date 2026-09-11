import axios from "axios";
import { create } from "zustand";
import { safeStorageAccess } from "../utils/errorHandling";

// API URL for backend communication
// Fallback prevents requests like ".../undefined/api/..." when env is missing or mis-set.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-backend-vl01.onrender.com";
const DEBUG_API_LOGS = import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === "true";

// Import or recreate the throttling mechanism
// Global request timestamps to prevent duplicate requests
const requestTimestamps = window.requestTimestamps || {
  profile: 0,
  founderProfile: 0
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

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add axios interceptor to add token to all requests
const addTokenInterceptor = axios.interceptors.request.use(
  (config) => {
    const token = safeStorageAccess.getItem('founder_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure withCredentials is set for all requests
    config.withCredentials = true;
    
    // Log request details in development
    if (DEBUG_API_LOGS) {
      console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`, {
        headers: config.headers,
        data: config.data,
        withCredentials: config.withCredentials
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => {
    // Log response details in development
    if (DEBUG_API_LOGS) {
      console.log(`Response from ${response.config.url}:`, {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    console.error('Axios error:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    if (error.response?.status === 401) {
      console.log('Unauthorized request, checking path before redirecting');
      
      // Don't redirect to founder login if on a doctor or staff path
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/doctor') && !currentPath.startsWith('/staff')) {
        console.log('Clearing founder auth state and redirecting to founder login');
        safeStorageAccess.removeItem('founder_token');
        safeStorageAccess.removeItem('founder_data');
        window.location.href = '/founder/login';
      } else {
        console.log(`On ${currentPath.startsWith('/doctor') ? 'doctor' : 'staff'} path, not redirecting to founder login`);
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize founder data from localStorage
const initialToken = safeStorageAccess.getItem('founder_token');
const initialFounderData = safeStorageAccess.getItem('founder_data');
let parsedFounderData = null;

try {
  if (initialFounderData) {
    parsedFounderData = JSON.parse(initialFounderData);
  }
} catch (error) {
  console.error('Error parsing founder data from localStorage:', error);
  safeStorageAccess.removeItem('founder_data');
}

// Global cache for founder profile
let founderProfileCache = null;
let founderProfileCacheTimestamp = 0;
const PROFILE_CACHE_TTL = 30000; // 30 seconds

export const useFounderStore = create((set, get) => ({
  founder: parsedFounderData,
  token: initialToken,
  isAuthenticated: !!initialToken,
  error: null,
  isLoading: false,
  isCheckingAuth: false,
  tempToken: null,
  refreshInterval: null,
  dashboardData: null,

  setToken: (token) => {
    if (token) {
      safeStorageAccess.setItem('founder_token', token);
    } else {
      safeStorageAccess.removeItem('founder_token');
    }
    // Clear dashboard data cache when token changes
    set({ token, dashboardData: null });
  },

  setFounder: (founderData) => {
    if (founderData) {
      // Store founder data in localStorage for persistence
      safeStorageAccess.setItem('founder_data', JSON.stringify(founderData));
      
      // Start the refresh interval when setting founder
      if (!get().refreshInterval) {
        const interval = setInterval(() => {
          get().refreshFounderData();
        }, 300000); // Refresh every 5 minutes (more secure for founders)
        set({ refreshInterval: interval });
      }
      
      set({ founder: founderData });
    } else {
      safeStorageAccess.removeItem('founder_data');
      
      // Clear the refresh interval when removing founder
      if (get().refreshInterval) {
        clearInterval(get().refreshInterval);
      }
      
      set({ founder: null, refreshInterval: null });
    }
  },
  
  // Fetch fresh founder data from the server
  refreshFounderData: async () => {
    try {
      const token = safeStorageAccess.getItem('founder_token');
      
      if (!token) {
        console.log('Cannot refresh founder data: missing token');
        return null;
      }
      
      // Check if we have a recent enough cache
      const now = Date.now();
      if (founderProfileCache && (now - founderProfileCacheTimestamp < PROFILE_CACHE_TTL)) {
        console.log('Using cached founder profile data');
        set({ founder: founderProfileCache });
        return founderProfileCache;
      }
      
      // Prevent duplicate requests in quick succession
      if (shouldThrottleRequest('founderProfile')) {
        console.log('Throttled founder profile request - using existing data');
        return get().founder;
      }
      
      const response = await axios.get(`${API_URL}/api/founder/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      if (response.data.success && response.data.founder) {
        // Cache timestamp to track when founder data was last refreshed
        const founderData = {
          ...response.data.founder,
          _lastRefreshed: now
        };

        // Update the global cache
        founderProfileCache = founderData;
        founderProfileCacheTimestamp = now;

        safeStorageAccess.setItem('founder_data', JSON.stringify(founderData));
        set({ founder: founderData });
        return founderData;
      } else {
        console.warn('Founder data missing in response', response.data);
        return null;
      }
    } catch (error) {
      console.error("Failed to refresh founder data:", error);
      
      // If we get a 401 Unauthorized error, clear the auth state
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized (401) during founder refresh. Logging out.');
        get().logout();
      }
      
      throw error;
    }
  },

  // First step of founder login - sends email/password and gets temp token
  initiateLogin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/founder/login`, {
        email,
        password,
      });
      
      if (response.data.success) {
        set({
          tempToken: response.data.tempToken,
          isLoading: false
        });
        return response.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Second step of founder login - verify OTP
  verifyOtp: async (otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/founder/verify-otp`, 
        { otp },
        { 
          headers: { Authorization: `Bearer ${get().tempToken}` },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        const founderData = response.data.founder;
        const token = response.data.token;
        
        // Save token and founder data to localStorage
        safeStorageAccess.setItem('founder_token', token);
        safeStorageAccess.setItem('founder_data', JSON.stringify(founderData));
        
        // Start the periodic founder data refresh
        const interval = setInterval(() => {
          get().refreshFounderData();
        }, 300000); // Refresh every 5 minutes
        
        set({
          founder: founderData,
          token: token,
          isAuthenticated: true,
          tempToken: null,
          isLoading: false,
          refreshInterval: interval
        });
        
        return response.data;
      } else {
        throw new Error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "OTP verification failed",
        isLoading: false,
      });
      throw error;
    }
  },
  
  // Resend OTP during login process
  resendOtp: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/founder/resend-otp`,
        {},
        { 
          headers: { Authorization: `Bearer ${get().tempToken}` },
          withCredentials: true
        }
      );
      
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to resend OTP",
        isLoading: false,
      });
      throw error;
    }
  },

  // Check if founder is authenticated
  checkAuth: async () => {
    console.log("founderStore: checkAuth called");
    
    // Get current URL path to check context
    const currentPath = window.location.pathname;
    const isDoctorPath = currentPath.startsWith('/doctor');
    const isStaffPath = currentPath.startsWith('/staff');
    
    console.log("founderStore: Current path:", currentPath, isDoctorPath ? "(doctor path detected)" : isStaffPath ? "(staff path detected)" : "");
    
    if (get().isCheckingAuth) {
      console.log("founderStore: Already checking auth, returning");
      return;
    }
    
    set({ isCheckingAuth: true });
    
    try {
      const token = safeStorageAccess.getItem('founder_token');
      
      console.log("founderStore: token exists:", !!token);
      if (!token) {
        console.log("founderStore: No token found, marking as not authenticated");
        set({ 
          founder: null,
          token: null,
          isAuthenticated: false,
          isCheckingAuth: false
        });
        return;
      }
      
      // Try the primary check-auth endpoint
      try {
        console.log("founderStore: Making API call to check-auth");
        const response = await axios.get(`${API_URL}/api/founder/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        
        console.log("founderStore: check-auth response:", response.data);
        if (response.data.success && response.data.founder) {
          console.log("founderStore: Founder is authenticated");
          safeStorageAccess.setItem('founder_data', JSON.stringify(response.data.founder));
          
          set({
            founder: response.data.founder,
            token: token,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
          
          return response.data;
        }
      } catch (error) {
        // If the endpoint doesn't exist (404), try the dashboard endpoint instead
        if (error.response && error.response.status === 404) {
          console.log("founderStore: check-auth endpoint not found, trying dashboard endpoint as fallback");
          
          // Use the dashboard endpoint to verify auth
          const dashboardResponse = await axios.get(`${API_URL}/api/founder/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          
          console.log("founderStore: dashboard response:", dashboardResponse.data);
          if (dashboardResponse.data.success) {
            // If we can access the dashboard, we're authenticated
            // Get the founder from local storage as a fallback
            const storedFounder = safeStorageAccess.getItem('founder_data');
            let founderData = null;
            
            try {
              if (storedFounder) {
                founderData = JSON.parse(storedFounder);
              }
            } catch (parseError) {
              console.error('Error parsing founder data:', parseError);
            }
            
            console.log("founderStore: Founder is authenticated via dashboard");
            set({
              founder: founderData,
              token: token,
              isAuthenticated: true,
              isCheckingAuth: false,
            });
            
            return { success: true, founder: founderData };
          }
        } else {
          // If it's not a 404 error, rethrow it
          throw error;
        }
      }
      
      // If we get here, authentication failed
      throw new Error("Authentication check failed");
    } catch (error) {
      if (error.response?.status === 401) {
        safeStorageAccess.removeItem('founder_token');
        safeStorageAccess.removeItem('founder_data');
        
        set({ 
          founder: null,
          token: null,
          isAuthenticated: false,
          isCheckingAuth: false,
          error: "Session expired. Please login again."
        });
        
        // CRITICAL FIX: Don't redirect on 401 if we're in a doctor or staff path
        // This prevents founder auth from redirecting when we're actually trying to access doctor or staff routes
        if (!isDoctorPath && !isStaffPath) {
          console.log("founderStore: Redirecting to founder login after 401");
          window.location.href = '/founder/login';
        } else {
          console.log(`founderStore: NOT redirecting to founder login from ${isDoctorPath ? 'doctor' : 'staff'} path`);
        }
      } else {
        set({ 
          isCheckingAuth: false,
          error: error.message || "Authentication check failed"
        });
      }
      return;
    }
  },

  // Logout founder
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/api/founder/logout`, {}, {
        headers: { Authorization: `Bearer ${get().token}` },
        withCredentials: true
      });
      
      // Clear localStorage
      safeStorageAccess.removeItem('founder_token');
      safeStorageAccess.removeItem('founder_data');
      
      // Clear the refresh interval
      if (get().refreshInterval) {
        clearInterval(get().refreshInterval);
      }
      
      set({
        founder: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        refreshInterval: null
      });
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if the API call fails, we should still clean up local state
      safeStorageAccess.removeItem('founder_token');
      safeStorageAccess.removeItem('founder_data');
      
      if (get().refreshInterval) {
        clearInterval(get().refreshInterval);
      }
      
      set({
        founder: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        refreshInterval: null,
        error: error.response?.data?.message || "Error during logout"
      });
    }
  },
  
  // Get dashboard data for founder
  getDashboardData: async () => {
    // Check if we already have dashboard data that's less than 30 seconds old
    const cachedData = get().dashboardData;
    const now = Date.now();
    
    if (cachedData && cachedData.timestamp && (now - cachedData.timestamp < 30000)) {
      console.log("Using cached dashboard data");
      return cachedData;
    }
    
    set({ isLoading: true, error: null });
    try {
      const token = get().token;
      
      if (!token) {
        console.error("Cannot fetch dashboard data: missing token");
        set({
          error: "Authentication token missing. Please log in again.",
          isLoading: false,
        });
        return { success: false, message: "Authentication token missing" };
      }
      
      console.log("Using token for dashboard request:", token ? "Token exists" : "No token");
      
      const response = await axios.get(`${API_URL}/api/founder/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      // Validate the response structure
      if (!response.data) {
        throw new Error("Invalid response from server: missing data");
      }
      
      // If the response doesn't have a success field, add it
      const responseData = response.data.success !== undefined 
        ? response.data 
        : { success: true, data: response.data };
      
      // Cache the data with a timestamp
      const dataWithTimestamp = {
        ...responseData,
        timestamp: Date.now()
      };
      
      set({ 
        isLoading: false,
        dashboardData: dataWithTimestamp
      });
      
      return dataWithTimestamp;
    } catch (error) {
      console.error("Axios error:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        // Handle 401 (Unauthorized) or 403 (Forbidden) errors
        if (error.response.status === 401 || error.response.status === 403) {
          // Clear invalid credentials
          safeStorageAccess.removeItem('founder_token');
          safeStorageAccess.removeItem('founder_data');
          
          set({
            founder: null,
            token: null,
            isAuthenticated: false,
            error: error.response.data.message || "Authentication failed. Please log in again.",
            isLoading: false
          });
        }
      }
      
      set({
        error: error.response?.data?.message || "Failed to fetch dashboard data",
        isLoading: false,
      });
      throw error;
    }
  }
})); 