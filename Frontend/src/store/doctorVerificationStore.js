import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { safeStorageAccess } from "../utils/errorHandling";

// Fallback prevents requests like ".../undefined/api/..." when env is missing or mis-set.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-backend-vl01.onrender.com";

// Utility function to get the staff token for doctor verification
const getAuthToken = () => {
  return safeStorageAccess.getItem("staff_token");
};

// Create debounce function to prevent multiple calls
const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// Define a cache expiration time (5 minutes)
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

// Request states - kept outside the store to prevent any state-related resets
const requestState = {
  pendingRequest: false,
  verifiedRequest: false,
  lastFetchAttempt: {
    pending: 0,
    verified: 0
  },
  clearPendingTimeout: null,
  clearVerifiedTimeout: null
};

// Create the store with persistence
export const useDoctorVerificationStore = create(
  persist(
    (set, get) => {
      // Define throttled request methods
      const throttledGetPendingDoctors = debounce(async () => {
        // Only proceed if enough time has passed since last attempt (1 second)
        const now = Date.now();
        if (now - requestState.lastFetchAttempt.pending < 1000) {
          console.log('Rate limiting pending doctors request');
          return get().pendingDoctors;
        }
        
        requestState.lastFetchAttempt.pending = now;
        
        if (requestState.pendingRequest) {
          console.log('Pending doctors request already in progress, skipping');
          return get().pendingDoctors;
        }
        
        requestState.pendingRequest = true;
        
        // Reset request state after 10 seconds to prevent permanent locks
        clearTimeout(requestState.clearPendingTimeout);
        requestState.clearPendingTimeout = setTimeout(() => {
          requestState.pendingRequest = false;
        }, 10000);
        
        set({ isLoading: true, error: null });
        
        try {
          const token = getAuthToken();
          if (!token) {
            requestState.pendingRequest = false;
            throw new Error("Staff authentication token missing. Please log in as a staff member.");
          }
          
          console.log('Fetching pending doctors from API');
          const response = await axios.get(`${API_URL}/api/doctor-verification/pending`, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Pending doctors API response:', response.data);
          
          if (response.data.success) {
            const doctors = response.data.doctors || response.data.data || [];
            set((state) => ({
              pendingDoctors: doctors,
              isLoading: false,
              lastFetchTime: {
                ...state.lastFetchTime,
                pending: Date.now()
              }
            }));
            console.log('Set pending doctors in store:', doctors.length, 'doctors');
          } else {
            throw new Error(response.data.message || 'Failed to get pending doctors');
          }
        } catch (error) {
          console.error('Error fetching pending doctors:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Network error fetching pending doctors';
          set((state) => ({
            isLoading: false,
            error: errorMsg,
            pendingDoctors: state.pendingDoctors.length > 0 ? state.pendingDoctors : []
          }));
          toast.error(errorMsg);
        } finally {
          requestState.pendingRequest = false;
          clearTimeout(requestState.clearPendingTimeout);
        }
        
        return get().pendingDoctors;
      }, 500);
      
      const throttledGetVerifiedDoctors = debounce(async () => {
        // Only proceed if enough time has passed since last attempt (1 second)
        const now = Date.now();
        if (now - requestState.lastFetchAttempt.verified < 1000) {
          console.log('Rate limiting verified doctors request');
          return get().verifiedDoctors;
        }
        
        requestState.lastFetchAttempt.verified = now;
        
        if (requestState.verifiedRequest) {
          console.log('Verified doctors request already in progress, skipping');
          return get().verifiedDoctors;
        }
        
        requestState.verifiedRequest = true;
        
        // Reset request state after 10 seconds to prevent permanent locks
        clearTimeout(requestState.clearVerifiedTimeout);
        requestState.clearVerifiedTimeout = setTimeout(() => {
          requestState.verifiedRequest = false;
        }, 10000);
        
        set({ isLoading: true, error: null });
        
        try {
          const token = getAuthToken();
          if (!token) {
            requestState.verifiedRequest = false;
            throw new Error("Staff authentication token missing. Please log in as a staff member.");
          }
          
          console.log('Fetching verified doctors from API');
          const response = await axios.get(`${API_URL}/api/doctor-verification/verified`, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Verified doctors API response:', response.data);
          
          if (response.data.success) {
            const doctors = response.data.doctors || response.data.data || [];
            set((state) => ({
              verifiedDoctors: doctors,
              isLoading: false,
              lastFetchTime: {
                ...state.lastFetchTime,
                verified: Date.now()
              }
            }));
            console.log('Set verified doctors in store:', doctors.length, 'doctors');
          } else {
            throw new Error(response.data.message || 'Failed to get verified doctors');
          }
        } catch (error) {
          console.error('Error fetching verified doctors:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Network error fetching verified doctors';
          set((state) => ({
            isLoading: false,
            error: errorMsg,
            verifiedDoctors: state.verifiedDoctors.length > 0 ? state.verifiedDoctors : []
          }));
          toast.error(errorMsg);
        } finally {
          requestState.verifiedRequest = false;
          clearTimeout(requestState.clearVerifiedTimeout);
        }
        
        return get().verifiedDoctors;
      }, 500);

      return {
        pendingDoctors: [],
        verifiedDoctors: [],
        selectedDoctor: null,
        isLoading: false,
        error: null,
        lastFetchTime: {
          pending: null,
          verified: null
        },

        // Get all pending doctors - with better error handling and state management
        getPendingDoctors: async (forceRefresh = false) => {
          // Check if data is in cache and not expired
          const { pendingDoctors, lastFetchTime } = get();
          const now = Date.now();
          
          if (
            !forceRefresh && 
            pendingDoctors && 
            pendingDoctors.length > 0 && 
            lastFetchTime?.pending && 
            now - lastFetchTime.pending < CACHE_EXPIRATION_TIME
          ) {
            console.log('Using cached pending doctors data');
            return pendingDoctors;
          }
          
          return throttledGetPendingDoctors();
        },

        // Get all verified doctors - with better error handling
        getVerifiedDoctors: async (forceRefresh = false) => {
          // Check if data is in cache and not expired
          const { verifiedDoctors, lastFetchTime } = get();
          const now = Date.now();
          
          if (
            !forceRefresh && 
            verifiedDoctors && 
            verifiedDoctors.length > 0 && 
            lastFetchTime?.verified && 
            now - lastFetchTime.verified < CACHE_EXPIRATION_TIME
          ) {
            console.log('Using cached verified doctors data');
            return verifiedDoctors;
          }
          
          return throttledGetVerifiedDoctors();
        },

        // Force refresh all data
        refreshAllData: async () => {
          // Wait 100ms between requests to prevent race conditions
          await throttledGetPendingDoctors();
          await new Promise(resolve => setTimeout(resolve, 100));
          await throttledGetVerifiedDoctors();
          return true;
        },

        // Get doctor details by ID - with better error handling
        getDoctorDetails: async (doctorId) => {
          // Check if we already have this doctor in our state
          const existingPendingDoctor = get().pendingDoctors.find(d => d._id === doctorId);
          const existingVerifiedDoctor = get().verifiedDoctors.find(d => d._id === doctorId);
          
          if (existingPendingDoctor || existingVerifiedDoctor) {
            const doctor = existingPendingDoctor || existingVerifiedDoctor;
            // If the doctor data is complete enough, use it without an API call
            if (doctor.fullName && doctor.email && doctor.medicalRegistrationNumber) {
              console.log('Using cached doctor data for details view');
              set({ selectedDoctor: doctor });
              return doctor;
            }
          }
          
          set({ isLoading: true, error: null });
          try {
            const token = getAuthToken();
            if (!token) {
              throw new Error("Staff authentication token missing. Please log in as a staff member.");
            }
            
            console.log(`Fetching details for doctor ID: ${doctorId}`);
            const response = await axios.get(`${API_URL}/api/doctor-verification/${doctorId}`, {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            console.log('Doctor details API response:', response.data);
            
            if (response.data.success) {
              const doctor = response.data.doctor || response.data.data;
              set({
                selectedDoctor: doctor,
                isLoading: false
              });
              
              // Update the doctor in our cached lists to have complete data
              if (existingPendingDoctor) {
                set(state => ({
                  pendingDoctors: state.pendingDoctors.map(d => 
                    d._id === doctorId ? { ...d, ...doctor } : d
                  )
                }));
              } else if (existingVerifiedDoctor) {
                set(state => ({
                  verifiedDoctors: state.verifiedDoctors.map(d => 
                    d._id === doctorId ? { ...d, ...doctor } : d
                  )
                }));
              }
              
              return doctor;
            } else {
              throw new Error(response.data.message || 'Failed to get doctor details');
            }
          } catch (error) {
            console.error('Error fetching doctor details:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Network error fetching doctor details';
            set({
              isLoading: false,
              error: errorMsg
            });
            toast.error(errorMsg);
            
            // If we have partial data, return that rather than null
            return existingPendingDoctor || existingVerifiedDoctor || null;
          }
        },

        // Approve doctor registration - with better error handling and toast notifications
        approveDoctor: async (doctorId) => {
          set({ isLoading: true, error: null });
          try {
            const token = getAuthToken();
            if (!token) {
              throw new Error("Staff authentication token missing. Please log in as a staff member.");
            }
            
            console.log(`Approving doctor ID: ${doctorId}`);
            const response = await axios.put(`${API_URL}/api/doctor-verification/${doctorId}/approve`, {}, {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            console.log('Doctor approval API response:', response.data);
            
            if (response.data.success) {
              // Optimistically update the local data
              set((state) => ({
                pendingDoctors: state.pendingDoctors.filter(doctor => doctor._id !== doctorId),
                verifiedDoctors: [response.data.doctor || response.data.data, ...state.verifiedDoctors],
                isLoading: false
              }));
              toast.success('Doctor approved successfully');
              return true;
            } else {
              throw new Error(response.data.message || 'Failed to approve doctor');
            }
          } catch (error) {
            console.error('Error approving doctor:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Network error approving doctor';
            set({
              isLoading: false,
              error: errorMsg
            });
            toast.error(errorMsg);
            return false;
          }
        },

        // Reject doctor registration - with better error handling and toast notifications
        rejectDoctor: async (doctorId, rejectionReason) => {
          set({ isLoading: true, error: null });
          try {
            const token = getAuthToken();
            if (!token) {
              throw new Error("Staff authentication token missing. Please log in as a staff member.");
            }
            
            console.log(`Rejecting doctor ID: ${doctorId} with reason: ${rejectionReason}`);
            const response = await axios.put(`${API_URL}/api/doctor-verification/${doctorId}/reject`, 
              { rejectionReason }, 
              { 
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            console.log('Doctor rejection API response:', response.data);
            
            if (response.data.success) {
              // Optimistically update the local data
              set((state) => ({
                pendingDoctors: state.pendingDoctors.filter(doctor => doctor._id !== doctorId),
                verifiedDoctors: [response.data.doctor || response.data.data, ...state.verifiedDoctors],
                isLoading: false
              }));
              toast.success('Doctor rejected successfully');
              return true;
            } else {
              throw new Error(response.data.message || 'Failed to reject doctor');
            }
          } catch (error) {
            console.error('Error rejecting doctor:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Network error rejecting doctor';
            set({
              isLoading: false,
              error: errorMsg
            });
            toast.error(errorMsg);
            return false;
          }
        },

        // Clear selected doctor
        clearSelectedDoctor: () => set({ selectedDoctor: null })
      };
    },
    {
      name: 'doctor-verification-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        pendingDoctors: state.pendingDoctors,
        verifiedDoctors: state.verifiedDoctors,
        lastFetchTime: state.lastFetchTime
      })
    }
  )
); 