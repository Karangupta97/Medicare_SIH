/**
 * Short-TTL in-memory cache for token-blacklist lookups.
 *
 * WHY: verifyToken checks the DeviceSession blacklist on EVERY authenticated
 * request. When MongoDB Atlas has a transient connectivity blip, that single DB
 * call throws and cascades into failing every request at once. Caching the
 * blacklist result for a short window (default 45s) means brief Atlas drops
 * don't take down all authenticated traffic.
 *
 * SECURITY NOTE: at a 45s TTL this does not meaningfully weaken the blacklist —
 * a revoked token could remain accepted for at most one TTL window, which is an
 * acceptable trade for resilience. (Access tokens are already short-lived.)
 *
 * This is a per-process Map (no Redis dependency). In a multi-process/clustered
 * deployment each worker keeps its own cache; swap this module for a Redis-backed
 * store if you need cross-process consistency — the interface (get/set) is small.
 */

const TTL_MS = parseInt(process.env.BLACKLIST_CACHE_TTL_MS || "45000", 10);
const MAX_ENTRIES = 5000; // simple bound to avoid unbounded growth

// token -> { blacklisted: boolean, expiresAt: number }
const cache = new Map();

/** Return the cached blacklist status for a token, or undefined if not cached/expired. */
export function getCachedBlacklist(token) {
  const entry = cache.get(token);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(token);
    return undefined;
  }
  return entry.blacklisted;
}

/** Cache a token's blacklist status for the TTL window. */
export function setCachedBlacklist(token, blacklisted) {
  // Crude size cap: clear the oldest ~10% when full.
  if (cache.size >= MAX_ENTRIES) {
    const drop = Math.ceil(MAX_ENTRIES * 0.1);
    let i = 0;
    for (const key of cache.keys()) {
      cache.delete(key);
      if (++i >= drop) break;
    }
  }
  cache.set(token, { blacklisted, expiresAt: Date.now() + TTL_MS });
}

/** Test/utility: clear the whole cache. */
export function clearBlacklistCache() {
  cache.clear();
}
