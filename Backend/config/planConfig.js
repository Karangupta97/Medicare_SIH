/**
 * Single source of truth for plan-based limits.
 * Import this wherever storage, Family Vault, or other plan limits are needed.
 */

export const PLAN_CONFIG = {
  free: {
    storageLimitBytes: 50 * 1024 * 1024,        // 50 MB
    maxFamilyMembers: 0,                         // No Family Vault access
  },
  pro: {
    storageLimitBytes: 500 * 1024 * 1024,        // 500 MB
    maxFamilyMembers: 2,                         // Head + 2 members
  },
  premium: {
    storageLimitBytes: 2 * 1024 * 1024 * 1024,   // 2 GB
    maxFamilyMembers: 6,                         // Head + 6 members
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
 * Get max family members for a given plan type.
 * Falls back to 0 for unknown / free plans.
 */
export const getMaxFamilyMembersForPlan = (planType) => {
  const key = (planType || 'free').toLowerCase();
  const config = PLAN_CONFIG[key] || PLAN_CONFIG.free;
  return config.maxFamilyMembers;
};
