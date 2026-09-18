import { useQuery } from "@powersync/react";
import { getPowerSync } from "./db";
import { isPowerSyncEnabled } from "./config";
import { useMedicarePowerSync } from "./PowerSyncProvider";
import { safeStorageAccess } from "../utils/errorHandling";
import { getStorageLimitForPlan } from "../config/planConfig";

/**
 * Local storage-quota computation + per-report "available offline" toggle.
 *
 * QUOTA: mirrors Backend/utils/checkStorageLimit.js — sum synced reports'
 * fileSize and compare to the plan limit. Because we sync metadata (fileSize)
 * but NOT blobs, this is accurate and works fully offline.
 *
 * AVAILABLE-OFFLINE: by default no file blobs are cached (metadata only). A user
 * can opt a specific report into full-file caching; we record that intent in the
 * local-only `report_local_flags` table and lazy-fetch the file when online.
 */

/**
 * Reactive local storage usage for the current user.
 * @param {string} planType e.g. 'free' | 'pro' | 'premium'
 */
export function useLocalStorageUsage(planType = "free") {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;
  const uid = safeStorageAccess.getItem("userId");

  const q = useQuery(
    useLocal
      ? "SELECT COALESCE(SUM(fileSize), 0) AS used, COUNT(*) AS count FROM reports WHERE userId = ?"
      : "SELECT 0 AS used, 0 AS count WHERE 0",
    useLocal ? [uid] : []
  );

  const row = q.data && q.data[0];
  const used = row?.used || 0;
  const fileCount = row?.count || 0;
  const limit = getStorageLimitForPlan(planType);
  return {
    currentUsage: used,
    fileCount,
    storageLimit: limit,
    availableSpace: Math.max(0, limit - used),
    usagePercentage: limit ? Math.round((used / limit) * 100) : 0,
    currentUsageMB: Math.round((used / (1024 * 1024)) * 100) / 100,
    storageLimitMB: Math.round((limit / (1024 * 1024)) * 100) / 100,
    source: useLocal ? "local" : "online",
    available: useLocal,
    // True while PowerSync is enabled but the first local query hasn't resolved
    // yet — lets consumers show a lightweight loading state instead of "0".
    hydrating: useLocal && q.isLoading && row === undefined,
  };
}

/** Whether a specific report is marked "available offline" (local-only flag). */
export function useReportOfflineFlag(reportId) {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;
  const q = useQuery(
    useLocal ? "SELECT available_offline FROM report_local_flags WHERE reportId = ? LIMIT 1" : "SELECT 0 WHERE 0",
    useLocal ? [reportId] : []
  );
  return Boolean(q.data && q.data[0]?.available_offline);
}

/**
 * Toggle full-file offline availability for a report. Records intent locally;
 * the actual file bytes are lazy-fetched on demand when online (the UI can call
 * the existing signed-URL endpoint). We do NOT store the blob in SQLite — this
 * flag drives an on-demand fetch + optional platform cache.
 */
export async function setReportAvailableOffline(reportId, available) {
  if (!isPowerSyncEnabled() || !getPowerSync()) return;
  const db = getPowerSync();
  const existing = await db.getAll(
    "SELECT id FROM report_local_flags WHERE reportId = ?",
    [reportId]
  );
  if (existing.length) {
    await db.execute(
      "UPDATE report_local_flags SET available_offline = ?, cached_at = ? WHERE reportId = ?",
      [available ? 1 : 0, new Date().toISOString(), reportId]
    );
  } else {
    // id is a required PowerSync PK; use a client-generated uuid.
    const id = (crypto.randomUUID && crypto.randomUUID()) || `${reportId}-flag`;
    await db.execute(
      "INSERT INTO report_local_flags (id, reportId, available_offline, cached_at) VALUES (?, ?, ?, ?)",
      [id, reportId, available ? 1 : 0, new Date().toISOString()]
    );
  }
}
