import axios from "axios";
import { create } from "zustand";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-backend-vl01.onrender.com";

const useFamilyVaultStore = create((set, get) => ({
  vault: null,
  isHead: false,
  pendingInvites: [],
  myInvites: [],
  dashboard: null,
  memberReports: [],
  memberMedicalInfo: null,
  familyEmergency: null,
  memberEmergency: null,
  isLoading: false,
  error: null,

  // ─── Vault CRUD ──────────────────────────────────────────────

  fetchVault: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/api/family-vault`);
      set({
        vault: res.data.data.vault,
        isHead: res.data.data.isHead,
        pendingInvites: res.data.data.pendingInvites || [],
        isLoading: false,
      });
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch vault";
      set({ error: msg, isLoading: false, vault: null });
      throw error;
    }
  },

  createVault: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/api/family-vault`, { name });
      set({ vault: res.data.data, isHead: true, isLoading: false });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create vault";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  updateVault: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.put(`${API_URL}/api/family-vault`, { name });
      set((state) => ({
        vault: { ...state.vault, name: res.data.data.name },
        isLoading: false,
      }));
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update vault";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  deleteVault: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/api/family-vault`);
      set({
        vault: null,
        isHead: false,
        pendingInvites: [],
        dashboard: null,
        isLoading: false,
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete vault";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // ─── Invite Flow ─────────────────────────────────────────────

  inviteMember: async (umid, relationship) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/api/family-vault/invite`, {
        umid,
        relationship,
      });
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send invitation";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  fetchMyInvites: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/family-vault/invite/mine`);
      set({ myInvites: res.data.data || [] });
      return res.data.data;
    } catch (error) {
      set({ myInvites: [] });
      return [];
    }
  },

  verifyInviteOtp: async (inviteId, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/api/family-vault/invite/verify`, {
        inviteId,
        otp,
      });
      set({ isLoading: false });
      // Refresh vault data after joining
      get().fetchVault();
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to verify OTP";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // ─── Member Management ───────────────────────────────────────

  removeMember: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/api/family-vault/members/${memberId}`);
      set((state) => ({
        vault: state.vault
          ? {
              ...state.vault,
              members: state.vault.members.filter(
                (m) => m.userId?._id !== memberId && m.userId !== memberId
              ),
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to remove member";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  updateMemberPermissions: async (memberId, permissions) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.put(
        `${API_URL}/api/family-vault/members/${memberId}/permissions`,
        { permissions }
      );
      // Refresh vault to get updated permissions
      get().fetchVault();
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update permissions";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // ─── Member Data Access ──────────────────────────────────────

  fetchMemberReports: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${API_URL}/api/family-vault/members/${memberId}/reports`
      );
      set({ memberReports: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch reports";
      set({ error: msg, isLoading: false, memberReports: [] });
      throw error;
    }
  },

  fetchMemberMedicalInfo: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${API_URL}/api/family-vault/members/${memberId}/medical-info`
      );
      set({ memberMedicalInfo: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch medical info";
      set({ error: msg, isLoading: false, memberMedicalInfo: null });
      throw error;
    }
  },

  // ─── Dashboard & Emergency ───────────────────────────────────

  fetchFamilyDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/api/family-vault/dashboard`);
      set({ dashboard: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch dashboard";
      set({ error: msg, isLoading: false, dashboard: null });
      throw error;
    }
  },

  fetchFamilyEmergency: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/api/family-vault/emergency`);
      set({ familyEmergency: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch emergency data";
      set({ error: msg, isLoading: false, familyEmergency: null });
      throw error;
    }
  },

  fetchMemberEmergency: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${API_URL}/api/family-vault/emergency/${memberId}`
      );
      set({ memberEmergency: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch member emergency data";
      set({ error: msg, isLoading: false, memberEmergency: null });
      throw error;
    }
  },

  // ─── Utility ─────────────────────────────────────────────────

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      vault: null,
      isHead: false,
      pendingInvites: [],
      myInvites: [],
      dashboard: null,
      memberReports: [],
      memberMedicalInfo: null,
      familyEmergency: null,
      memberEmergency: null,
      isLoading: false,
      error: null,
    }),
}));

export { useFamilyVaultStore };
export default useFamilyVaultStore;
