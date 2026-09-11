/**
 * Error handling utilities to prevent browser extension conflicts
 * Fixes issues like "Cannot read properties of undefined (reading 'getWithTTL')"
 */

// Safely access browser storage with error handling
export const safeStorageAccess = {
  // Get item with error handling
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return defaultValue;
    }
  },
  
  // Set item with error handling
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Error setting localStorage item:', error);
      return false;
    }
  },
  
  // Remove item with error handling
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing localStorage item:', error);
      return false;
    }
  }
};

// Safely execute functions that may be affected by browser extensions
export const safeExecute = (fn, defaultReturn = null) => {
  try {
    return fn();
  } catch (error) {
    console.warn('Error executing function:', error);
    return defaultReturn;
  }
};

// Patch browser APIs that may be affected by extensions
export const patchBrowserAPIs = () => {
  // Create a fallback for undefined browser storage methods
  if (typeof window !== 'undefined') {
    // Define a safe empty object with getWithTTL method
    const safeFallback = {
      getWithTTL: () => null,
      get: () => null,
      set: () => {},
      remove: () => {}
    };
    
    // Patch common storage locations that might be accessed by extensions
    window.chrome = window.chrome || {};
    window.chrome.storage = window.chrome.storage || {};
    window.chrome.storage.local = window.chrome.storage.local || safeFallback;
    window.chrome.storage.sync = window.chrome.storage.sync || safeFallback;
    
    // Handle other potential extension API access points
    window.browser = window.browser || {};
    window.browser.storage = window.browser.storage || {};
    window.browser.storage.local = window.browser.storage.local || safeFallback;
    window.browser.storage.sync = window.browser.storage.sync || safeFallback;
  }
};

// Export default setup function
export const setupErrorHandling = () => {
  patchBrowserAPIs();
  
  // Add global error handler for uncaught errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      // Prevent errors from extensions from breaking the app
      if (event.message && (
          event.message.includes('getWithTTL') || 
          event.message.includes('chrome.storage') ||
          event.message.includes('browser.storage')
      )) {
        console.warn('Caught extension error:', event.message);
        event.preventDefault();
        return true;
      }
    });
  }
};

export default setupErrorHandling;