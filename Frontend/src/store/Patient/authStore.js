import axios from "axios";
import { create } from "zustand";
import { safeStorageAccess } from "../../utils/errorHandling";

// Fallback prevents requests like ".../undefined/api/..." when env is missing or mis-set.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-backend-vl01.onrender.com";
const DEBUG_API_LOGS = import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === "true";

// Global request timestamps to prevent duplicate requests
const requestTimestamps = {
  profile: 0
};

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
axios.interceptors.request.use(
  (config) => {
    const token = safeStorageAccess.getItem('token');
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
      
      // Don't redirect to general login if on specialized routes
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/doctor') && 
          !currentPath.startsWith('/founder') && 
          !currentPath.startsWith('/staff')) {
        console.log('Clearing auth state and redirecting to main login');
        safeStorageAccess.removeItem('token');
        safeStorageAccess.removeItem('userId');
        window.location.href = '/login';
      } else {
        console.log(`On ${currentPath.split('/')[1]} path, not redirecting to main login`);
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize token and user from localStorage
const initialToken = safeStorageAccess.getItem('token');
const initialUserId = safeStorageAccess.getItem('userId');

// Only store essential user data, not profile pictures
const _getUserEssentialData = (userData) => {
  if (!userData) return null;
  
  // Extract only the essential user data - exclude large binary data like images
  const { 
    _id, 
    name, 
    lastname, 
    email, 
    verified, 
    photoURL, // Store only the URL/path, not the actual image data
    planType,
    createdAt
  } = userData;
  
  return { 
    _id, 
    name, 
    lastname, 
    email, 
    verified, 
    photoURL,
    planType,
    createdAt
  };
};

// Global cache for user profile
let profileCache = null;
let profileCacheTimestamp = 0;
const PROFILE_CACHE_TTL = 30000; // 30 seconds

const useAuthStore = create((set, get) => ({
  user: null,
  token: initialToken,
  userId: initialUserId,
  isAuthenticated: !!initialToken,
  error: null,
  isLoading: false,
  isCheckingAuth: false,
  refreshInterval: null,

  setToken: (token) => {
    if (token) {
      safeStorageAccess.setItem('token', token);
    } else {
      safeStorageAccess.removeItem('token');
    }
    set({ token });
  },

  /**
   * Bridge from the Aadhaar auth flow into this (existing) patient auth store so
   * the SAME dashboard flow (ProtectedRoute → DashboardLayout → /api/auth/user)
   * works unchanged after an Aadhaar login/registration.
   *
   * WHY: ProtectedRoute gates on this store's `isAuthenticated` (derived from
   * localStorage `token`) and `user.isverified`. The Aadhaar flow issues its own
   * access token; we write it here so the existing guards pass and the periodic
   * profile refresh (which calls /api/auth/user with the Bearer token) hydrates
   * the full user document. The Aadhaar access token carries { id, umid } which
   * the backend verifyToken accepts, so /api/auth/* works with it.
   *
   * @param {{ accessToken: string, user: { id?: string, _id?: string, umid?: string, name?: string, lastname?: string, status?: string } }} payload
   */
  hydrateFromAadhaar: ({ accessToken, user }) => {
    const userId = user?.id || user?._id;
    if (accessToken) safeStorageAccess.setItem('token', accessToken);
    if (userId) safeStorageAccess.setItem('userId', userId);

    // Aadhaar accounts are inherently verified (isverified:true on the backend),
    // so mark verified here to satisfy ProtectedRoute's verification gate.
    const bridgedUser = {
      _id: userId,
      umid: user?.umid,
      name: user?.name || 'Patient',
      lastname: user?.lastname || '',
      isverified: true,
      status: user?.status || 'active',
    };

    // Start the periodic profile refresh (same as email login) so the full user
    // document (photo, plan, address, etc.) is fetched from /api/auth/user.
    if (!get().refreshInterval) {
      const interval = setInterval(() => {
        get().refreshUserData();
      }, 60000);
      set({ refreshInterval: interval });
    }

    set({
      token: accessToken,
      userId,
      user: bridgedUser,
      isAuthenticated: true,
      isCheckingAuth: false,
      error: null,
    });

    // Kick off an immediate profile fetch so the dashboard shows real data.
    get().refreshUserData?.().catch(() => {});
  },

  setUser: (userData) => {
    if (userData) {
      // Store only the user ID in localStorage for persistence
      safeStorageAccess.setItem('userId', userData._id);
      
      // Keep user data in memory (state) only, not in localStorage
      set({ user: userData, userId: userData._id });

      // Start the refresh interval when setting user
      if (!get().refreshInterval) {
        const interval = setInterval(() => {
          get().refreshUserData();
        }, 60000); // Refresh every minute
        set({ refreshInterval: interval });
      }
    } else {
      safeStorageAccess.removeItem('userId');
      
      // Clear the refresh interval when removing user
      if (get().refreshInterval) {
        clearInterval(get().refreshInterval);
      }
      
      set({ user: null, userId: null, refreshInterval: null });
    }
  },
  
  // Fetch fresh user data from the server
  refreshUserData: async () => {
    try {
      const token = safeStorageAccess.getItem('token');
      const userId = safeStorageAccess.getItem('userId');
      
      if (!token || !userId) {
        console.log('Cannot refresh user data: missing token or userId');
        return null;
      }

      // Check if we have a recent enough cache
      const now = Date.now();
      if (profileCache && (now - profileCacheTimestamp < PROFILE_CACHE_TTL)) {
        console.log('Using cached user profile data');
        set({ user: profileCache });
        return profileCache;
      }
      
      // Prevent duplicate requests in quick succession
      if (shouldThrottleRequest('profile')) {
        console.log('Throttled profile request - using existing data');
        return get().user;
      }
      
      const response = await axios.get(`${API_URL}/api/auth/user`);
      
      if (response.data && response.data.user) {
        // Cache timestamp to track when user data was last refreshed
        const userData = {
          ...response.data.user,
          _lastRefreshed: now
        };

        // Append a timestamp to the photoURL to prevent caching issues
        if (userData.photoURL && !userData.photoURL.includes('?')) {
          userData.photoURL = `${userData.photoURL}?t=${now}`;
        }

        // Update the global cache
        profileCache = userData;
        profileCacheTimestamp = now;

        set({ user: userData });
        return userData;
      } else {
        console.warn('User data missing in response', response.data);
        return null;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      
      // If we get a 404 Not Found, the user might have been deleted
      if (error.response && error.response.status === 404) {
        console.warn('User not found on server (404). User may have been deleted.');
        // Don't automatically logout here, let the DashboardLayout handle this
      }
      
      // If there's a 401 Unauthorized error, clear the auth state
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized (401) during user refresh. Logging out.');
        get().logout();
      }
      
      throw error; // Re-throw so calling code can handle the error
    }
  },

  signup: async (name, lastname, email, password, photoURL) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        lastname,
        email,
        password,
        photoURL,
      });
      const userData = response.data.user;
      const token = response.data.token;
      
      // Save token and userId to localStorage
      safeStorageAccess.setItem('token', token);
      safeStorageAccess.setItem('userId', userData._id);
      
      // Start the periodic user data refresh
      const interval = setInterval(() => {
        get().refreshUserData();
      }, 60000); // Refresh every minute
      
      set({
        user: userData,
        token: token,
        userId: userData._id,
        isAuthenticated: true,
        isLoading: false,
        refreshInterval: interval
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, {
        code,
      });
      const userData = response.data.user;
      
      // Save userId to localStorage, but DO NOT update the token from this response
      safeStorageAccess.setItem('userId', userData._id);
      
      set({
        user: userData,
        userId: userData._id,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  // ADD RESEND OTP METHOD HERE:
  resendOtp: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error resending OTP",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    console.log('Starting checkAuth...');
    
    // Get current URL path to check context
    const currentPath = window.location.pathname;
    const specializedRoute = currentPath.startsWith('/doctor') || 
                            currentPath.startsWith('/founder') || 
                            currentPath.startsWith('/staff');
    
    console.log(`authStore: Current path: ${currentPath}, specialized route: ${specializedRoute}`);
    
    // If we're already checking auth, don't start another check
    if (get().isCheckingAuth) {
      console.log('Already checking auth, returning early');
      return;
    }
    
    // Set checking flag to true
    set({ isCheckingAuth: true });
    
    try {
      // Get token from localStorage
      const token = safeStorageAccess.getItem('token');
      const userId = safeStorageAccess.getItem('userId');
      
      console.log('Auth state:', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUserId: !!userId
      });
      
      // If no token exists, we're not authenticated
      if (!token || !userId) {
        console.log('No token or userId found in localStorage');
        set({ 
          user: null,
          token: null,
          userId: null,
          isAuthenticated: false,
          isCheckingAuth: false
        });
        return;
      }
      
      console.log('Making check-auth request with token');
      // Make the API call to verify token validity
      const response = await axios.get(`${API_URL}/api/auth/check-auth`);
      
      console.log('Check-auth response:', response.data);
      
      // Update the state with the user data and token
      const userData = response.data.user;
      
      console.log('Setting authenticated state with user data');
      set({
        user: userData,
        token: token,
        userId: userData && userData._id,
        isAuthenticated: !!userData,
        isCheckingAuth: false,
      });

      // Register the current device if user is authenticated (don't wait for it to complete)
      if (userData) {
        try {
          await axios.post('/api/connected-devices/register');
        } catch (deviceError) {
          console.log('Device registration failed during auth check:', deviceError);
          // Don't fail auth check if device registration fails
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Auth check failed:", error);
      console.error("Error details:", {
        status: error.response?.status,
        message: error.message,
        response: error.response?.data
      });
      
      // If token is invalid or expired, clear auth state
      if (error.response?.status === 401) {
        console.log('Token invalid or expired, checking path context');
        
        // Skip clearing auth state for specialized routes to avoid breaking their auth
        if (specializedRoute) {
          console.log(`On ${currentPath.split('/')[1]} path, not clearing main auth state`);
          set({ 
            isCheckingAuth: false,
            isAuthenticated: false,
          });
        } else {
          console.log('Clearing auth state for regular user route');
          safeStorageAccess.removeItem('token');
          safeStorageAccess.removeItem('userId');
          set({ 
            user: null,
            token: null,
            userId: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            error: "Session expired. Please login again."
          });
        }
      } else {
        set({ 
          isCheckingAuth: false,
          error: error.response?.data?.message || "Authentication check failed"
        });
      }
      return;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      const userData = response.data.user;
      const token = response.data.token;
      
      // Save token and userId to localStorage (not the user object with photo)
      safeStorageAccess.setItem('token', token);
      safeStorageAccess.setItem('userId', userData._id);
      
      // Start the periodic user data refresh
      const interval = setInterval(() => {
        get().refreshUserData();
      }, 60000); // Refresh every minute
      
      set({
        isAuthenticated: true,
        user: userData,
        token: token,
        userId: userData._id,
        error: null,
        isLoading: false,
        refreshInterval: interval
      });

      // Register the current device (don't wait for it to complete)
      try {
        await axios.post('/api/connected-devices/register');
      } catch (deviceError) {
        console.log('Device registration failed:', deviceError);
        // Don't fail login if device registration fails
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      
      // Clear localStorage
      safeStorageAccess.removeItem('userId');
      safeStorageAccess.removeItem('token');
      
      // Wipe the encrypted PowerSync local DB so no PHI is left cached for the
      // next user of this device. Dynamic import avoids a static dependency /
      // circular import and is a no-op when PowerSync isn't enabled.
      try {
        const { teardownPowerSync } = await import("../../powersync/PowerSyncProvider");
        await teardownPowerSync();
      } catch {
        /* PowerSync not active — nothing to clear */
      }
      
      // Clear the refresh interval
      if (get().refreshInterval) {
        clearInterval(get().refreshInterval);
      }
      
      set({
        user: null,
        token: null,
        userId: null,
        isAuthenticated: false,
        isLoading: false,
        refreshInterval: null
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging out",
        isLoading: false,
      });
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response.data.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        { password }
      );
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || "Error resetting password",
      });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword,
      });
      set({ 
        message: response.data.message, 
        isLoading: false,
        error: null 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error changing password";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
  
  // Add method to update profile picture
  updateProfilePhoto: async (photoFile) => {
    set({ isLoading: true, error: null });
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      // Set proper headers for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(`${API_URL}/api/auth/update-photo`, formData, config);
      
      // Update user in state with new photo URL
      const userData = response.data.user;
      
      // No need to add timestamp parameter for permanent URLs
      // We'll keep track of whether it's a permanent URL from the backend
      // Only add cache busting if it's not marked as permanent
      if (userData.photoURL && !userData.photoIsPermanent && !userData.photoURL.includes('?')) {
        userData.photoURL = `${userData.photoURL}?t=${new Date().getTime()}`;
      }
      
      set({
        user: userData,
        isLoading: false
      });
      
      return userData;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating profile photo",
        isLoading: false,
      });
      throw error;
    }
  }
}));

export { useAuthStore };
export default useAuthStore;