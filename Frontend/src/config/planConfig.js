/**
 * Frontend mirror of the backend plan configuration.
 * Single source of truth for plan-based limits on the client side.
 */

export const PLAN_CONFIG = {
  free: {
    storageLimitBytes: 50 * 1024 * 1024,        // 50 MB
    storageLimitMB: 50,
    maxFamilyMembers: 0,
    label: 'Free',
  },
  pro: {
    storageLimitBytes: 500 * 1024 * 1024,        // 500 MB
    storageLimitMB: 500,
    maxFamilyMembers: 2,
    label: 'Pro',
  },
  premium: {
    storageLimitBytes: 2 * 1024 * 1024 * 1024,   // 2 GB
    storageLimitMB: 2048,
    maxFamilyMembers: 6,
    label: 'Premium',
  },
};

/**
 * Get storage limit in bytes for a given plan type.
 * Falls back to 'free' for unknown plans.
 */
export const getStorageLimitForPlan = (planType) => {
  const key = (planType || 'free').toLowerCase();
  const config = PLAN_CONFIG[key] || PLAN_CONFIG.free;
  return config.storageLimitBytes;
};

/**
 * Get a human-readable storage limit string for a given plan type.
 * e.g. "50 MB", "500 MB", "2 GB"
 */
export const getStorageLimitLabel = (planType) => {
  const key = (planType || 'free').toLowerCase();
  const config = PLAN_CONFIG[key] || PLAN_CONFIG.free;
  const mb = config.storageLimitMB;
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
  return `${mb} MB`;
};
