import axios from "axios";
import { create } from "zustand";
import { safeStorageAccess } from "../utils/errorHandling";

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
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useStaffStore = create((set, get) => ({
  staffList: [],
  selectedStaff: null,
  totalStaff: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,
  
  // Staff authentication state
  staffData: null,
  isAuthenticated: false,
  isFirstLogin: false,
  
  // Staff login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/staff-auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { staff, token } = response.data;
        
        // Store token in localStorage for auth persistence
        safeStorageAccess.setItem("staff_token", token);
        
        // Set staff data in store
        set({
          staffData: staff,
          isAuthenticated: true,
          isFirstLogin: staff.isFirstLogin,
          isLoading: false,
        });
      }
      
      return response.data;
    } catch (error) {
      console.error("Staff login error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to login";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        staffData: null
      });
      
      throw new Error(errorMessage);
    }
  },
  
  // Staff logout
  logout: async () => {
    set({ isLoading: true });
    try {
      const token = safeStorageAccess.getItem("staff_token");
      
      if (token) {
        await axios.post(`${API_URL}/api/staff-auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Clear token from storage
      safeStorageAccess.removeItem("staff_token");
      
      // Reset auth state
      set({
        staffData: null,
        isAuthenticated: false,
        isFirstLogin: false,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error("Staff logout error:", error);
      
      // Even if the API call fails, we still want to clear local data
      safeStorageAccess.removeItem("staff_token");
      
      set({
        staffData: null,
        isAuthenticated: false,
        isFirstLogin: false,
        isLoading: false
      });
      
      return { success: true };
    }
  },
  
  // Check authentication status
  checkAuthStatus: async () => {
    const token = safeStorageAccess.getItem("staff_token");
    
    if (!token) {
      set({
        staffData: null,
        isAuthenticated: false,
        isFirstLogin: false
      });
      return false;
    }
    
    set({ isLoading: true });
    
    try {
      const response = await axios.get(`${API_URL}/api/staff-auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        set({
          staffData: response.data.staff,
          isAuthenticated: true,
          isFirstLogin: response.data.staff.isFirstLogin,
          isLoading: false
        });
        return true;
      } else {
        // If there was an unsuccessful response
        safeStorageAccess.removeItem("staff_token");
        set({
          staffData: null,
          isAuthenticated: false,
          isFirstLogin: false,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error("Check staff auth status error:", error);
      
      // If there was an error, clear the token
      safeStorageAccess.removeItem("staff_token");
      
      set({
        staffData: null,
        isAuthenticated: false,
        isFirstLogin: false,
        isLoading: false,
        error: "Authentication session expired. Please login again."
      });
      
      return false;
    }
  },
  
  // Change password (especially for first login)
  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = safeStorageAccess.getItem("staff_token");
      
      const response = await axios.post(
        `${API_URL}/api/staff-auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update first login status if it was changed
        set({
          isFirstLogin: false,
          isLoading: false
        });
      }
      
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to change password";
      set({
        isLoading: false,
        error: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(
        `${API_URL}/api/staff-auth/forgot-password`,
        { email }
      );
      
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error("Request password reset error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to request password reset";
      set({
        isLoading: false,
        error: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  },

  // Add a new staff member
  addStaff: async (staffData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/staff`, staffData, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      // Add the new staff member to the list if successful
      if (response.data.success) {
        set((state) => ({
          staffList: [response.data.staff, ...state.staffList],
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error adding staff member:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to add staff member";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get all staff members with pagination and optional search
  getStaffList: async (page = 1, limit = 10, search = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/staff`, {
        params: { page, limit, search },
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set({
          staffList: response.data.staff,
          totalStaff: response.data.totalCount,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          isLoading: false,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching staff list:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to fetch staff list";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get a specific staff member by ID
  getStaffById: async (staffId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/staff/${staffId}`, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set({
          selectedStaff: response.data.staff,
          isLoading: false,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching staff member:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to fetch staff member";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Update a staff member
  updateStaff: async (staffId, staffData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/api/staff/${staffId}`, staffData, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        // Update the staff list with the updated staff member
        set((state) => ({
          staffList: state.staffList.map((staff) =>
            staff._id === staffId ? response.data.staff : staff
          ),
          selectedStaff: response.data.staff,
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error updating staff member:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to update staff member";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Reset a staff member's password
  resetStaffPassword: async (staffId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/staff/${staffId}/reset-password`, {}, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error("Error resetting staff password:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to reset staff password";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Delete a staff member
  deleteStaff: async (staffId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/api/staff/${staffId}`, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        // Remove the deleted staff member from the list
        set((state) => ({
          staffList: state.staffList.filter((staff) => staff._id !== staffId),
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting staff member:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to delete staff member";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Clear selected staff
  clearSelectedStaff: () => {
    set({ selectedStaff: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
})); 