import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/Patient/authStore';
import usePatientStore from '../store/Patient/patientstore';

export const useConnectedDevices = () => {
  const { isAuthenticated, user } = useAuthStore();
  const {
    connectedDevices,
    connectedDevicesLoading,
    connectedDevicesError,
    getConnectedDevices,
    registerDevice,
    removeDevice,
    updateDeviceName,
    removeInactiveDevices
  } = usePatientStore();

  // Fetch all connected devices
  const fetchDevices = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      await getConnectedDevices();
    } catch (err) {
      toast.error('Failed to load connected devices');
    }
  }, [isAuthenticated, getConnectedDevices]);

  // Register current device
  const registerCurrentDevice = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      const response = await registerDevice();
      if (response.success) {
        // Refresh devices list
        await fetchDevices();
        return response.device;
      }
    } catch (err) {
      console.error('Failed to register device:', err);
      // Don't show error toast for device registration as it's automatic
    }
  }, [fetchDevices, isAuthenticated, registerDevice]);

  // Remove a device
  const removeDeviceHandler = useCallback(async (deviceId, deviceName) => {
    try {
      const response = await removeDevice(deviceId);
      if (response.success) {
        toast.success(`Removed ${deviceName}`);
        return true;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove device';
      toast.error(errorMessage);
      return false;
    }
  }, [removeDevice]);

  // Update device name
  const updateDeviceNameHandler = useCallback(async (deviceId, newName) => {
    try {
      const response = await updateDeviceName(deviceId, newName);
      if (response.success) {
        toast.success('Device name updated');
        return true;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update device name';
      toast.error(errorMessage);
      return false;
    }
  }, [updateDeviceName]);

  // Remove all inactive devices
  const removeInactiveDevicesHandler = useCallback(async () => {
    try {
      const response = await removeInactiveDevices();
      if (response.success) {
        toast.success(`Removed ${response.removedCount} inactive devices`);
        return response.removedCount;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove inactive devices';
      toast.error(errorMessage);
      return 0;
    }
  }, [removeInactiveDevices]);

  // Get device icon based on type
  const getDeviceIcon = useCallback((deviceType, platform) => {
    switch (deviceType) {
      case 'mobile':
        return 'smartphone';
      case 'tablet':
        return 'tablet';
      case 'laptop':
        return 'laptop';
      case 'desktop':
        return 'monitor';
      case 'smartwatch':
        return 'watch';
      default:
        if (platform === 'mobile') return 'smartphone';
        if (platform === 'tablet') return 'tablet';
        return 'monitor';
    }
  }, []);

  // Format last active time
  const formatLastActive = useCallback((lastActiveAt) => {
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffInMs = now - lastActive;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }, []);

  // Initialize on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDevices();
      registerCurrentDevice(); // Register current device automatically
    }
  }, [isAuthenticated, user, fetchDevices, registerCurrentDevice]);

  return {
    devices: connectedDevices,
    loading: connectedDevicesLoading,
    error: connectedDevicesError,
    fetchDevices,
    registerCurrentDevice,
    removeDevice: removeDeviceHandler,
    updateDeviceName: updateDeviceNameHandler,
    removeInactiveDevices: removeInactiveDevicesHandler,
    getDeviceIcon,
    formatLastActive
  };
};
