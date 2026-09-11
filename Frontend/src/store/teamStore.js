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

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useTeamStore = create((set, get) => ({
  teams: [],
  selectedTeam: null,
  totalTeams: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  // Create a new team
  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/teams`, teamData, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          teams: [response.data.team, ...state.teams],
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error creating team:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to create team";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get all teams with pagination and search
  getTeams: async (page = 1, limit = 10, search = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/teams`, {
        params: { page, limit, search },
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set({
          teams: response.data.teams,
          totalTeams: response.data.totalCount,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          isLoading: false,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching teams:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to fetch teams";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get team by ID
  getTeamById: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set({
          selectedTeam: response.data.team,
          isLoading: false,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching team:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to fetch team";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Update a team
  updateTeam: async (teamId, teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/api/teams/${teamId}`, teamData, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          teams: state.teams.map((team) =>
            team._id === teamId ? response.data.team : team
          ),
          selectedTeam: response.data.team,
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error updating team:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to update team";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Delete a team
  deleteTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/api/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          teams: state.teams.filter((team) => team._id !== teamId),
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting team:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to delete team";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Add a member to a team
  addTeamMember: async (teamId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/teams/${teamId}/members/${memberId}`, {}, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          selectedTeam: response.data.team,
          teams: state.teams.map((team) =>
            team._id === teamId ? response.data.team : team
          ),
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error adding team member:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to add team member";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Remove a member from a team
  removeTeamMember: async (teamId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/api/teams/${teamId}/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          selectedTeam: response.data.team,
          teams: state.teams.map((team) =>
            team._id === teamId ? response.data.team : team
          ),
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error removing team member:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to remove team member";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Add an owner to a team
  addTeamOwner: async (teamId, ownerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/teams/${teamId}/owners/${ownerId}`, {}, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          selectedTeam: response.data.team,
          teams: state.teams.map((team) =>
            team._id === teamId ? response.data.team : team
          ),
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error adding team owner:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to add team owner";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Remove an owner from a team
  removeTeamOwner: async (teamId, ownerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/api/teams/${teamId}/owners/${ownerId}`, {
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      if (response.data.success) {
        set((state) => ({
          selectedTeam: response.data.team,
          teams: state.teams.map((team) =>
            team._id === teamId ? response.data.team : team
          ),
          isLoading: false,
        }));
      }

      return response.data;
    } catch (error) {
      console.error("Error removing team owner:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to remove team owner";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get staff members not in a team
  getEligibleStaff: async (teamId, search = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/teams/${teamId}/eligible-staff`, {
        params: { search },
        headers: {
          Authorization: `Bearer ${safeStorageAccess.getItem("founder_token")}`,
        },
      });

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error("Error fetching eligible staff:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to fetch eligible staff";
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }
  },

  // Reset selected team
  resetSelectedTeam: () => {
    set({ selectedTeam: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
})); 