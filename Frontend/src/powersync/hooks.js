import { useEffect, useMemo } from "react";
import { useQuery } from "@powersync/react";
import { useMedicarePowerSync } from "./PowerSyncProvider";
import usePatientStore from "../store/Patient/patientstore";
import { safeStorageAccess } from "../utils/errorHandling";

/**
 * Local-first read hooks for the dashboard sidebar features.
 *
 * CONTRACT: each hook returns the SAME shape regardless of source, so the
 * screens don't care whether data came from the local encrypted SQLite store
 * (offline-capable) or the existing online axios store (fallback):
 *
 *     { data: [...], isLoading: boolean, source: 'local'|'online' }
 *
 * When PowerSync is enabled AND ready, we read from local SQLite via useQuery
 * (instant + offline). Otherwise we call the existing Zustand store action once
 * and read its array — preserving the current online behavior exactly.
 *
 * JSON columns (tags, medications, members, reportIds, allergies) are stored as
 * text by PowerSync and parsed here so components get real arrays/objects.
 */

const userId = () => safeStorageAccess.getItem("userId");

function parseJsonFields(rows, fields) {
  return rows.map((r) => {
    const out = { ...r, _id: r.id }; // components expect Mongo-style _id
    for (const f of fields) {
      if (typeof out[f] === "string") {
        try {
          out[f] = JSON.parse(out[f]);
        } catch {
          /* leave as-is */
        }
      }
    }
    return out;
  });
}

/* ------------------------------------------------------------------ reports */
export function useReports() {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;

  // Local path (PowerSync). useQuery is reactive — updates as sync/writes land.
  const local = useQuery(
    useLocal
      ? "SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC"
      : "SELECT 1 WHERE 0", // inert query when not using local
    useLocal ? [userId()] : []
  );

  // Online fallback path (existing store).
  const { reports, fetchReports, isLoading } = usePatientStore();
  useEffect(() => {
    if (useLocal) return;
    const token = safeStorageAccess.getItem("token");
    if (token) fetchReports(token).catch(() => {});
  }, [useLocal, fetchReports]);

  if (useLocal) {
    return {
      data: parseJsonFields(local.data || [], ["tags"]),
      isLoading: local.isLoading,
      source: "local",
    };
  }
  return { data: reports || [], isLoading, source: "online" };
}

/* ------------------------------------------------------------ prescriptions */
export function usePrescriptions() {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;

  const local = useQuery(
    useLocal
      ? "SELECT * FROM prescriptions WHERE patientId = ? ORDER BY createdAt DESC"
      : "SELECT 1 WHERE 0",
    useLocal ? [userId()] : []
  );

  const { prescriptions, fetchPrescriptions, isLoading } = usePatientStore();
  useEffect(() => {
    if (useLocal) return;
    const token = safeStorageAccess.getItem("token");
    if (token) fetchPrescriptions(token).catch(() => {});
  }, [useLocal, fetchPrescriptions]);

  if (useLocal) {
    return {
      data: parseJsonFields(local.data || [], ["medications"]),
      isLoading: local.isLoading,
      source: "local",
    };
  }
  return { data: prescriptions || [], isLoading, source: "online" };
}

/* ------------------------------------------------------------ notifications */
export function useNotifications() {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;

  const local = useQuery(
    useLocal
      ? "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC"
      : "SELECT 1 WHERE 0",
    useLocal ? [userId()] : []
  );

  const { notifications, fetchNotifications, unreadNotificationsCount, isLoading } =
    usePatientStore();
  useEffect(() => {
    if (useLocal) return;
    const token = safeStorageAccess.getItem("token");
    if (token) fetchNotifications(token).catch(() => {});
  }, [useLocal, fetchNotifications]);

  if (useLocal) {
    const rows = (local.data || []).map((r) => ({ ...r, _id: r.id, read: !!r.read }));
    return {
      data: rows,
      unreadCount: rows.filter((n) => !n.read).length,
      isLoading: local.isLoading,
      source: "local",
    };
  }
  return {
    data: notifications || [],
    unreadCount: unreadNotificationsCount || 0,
    isLoading,
    source: "online",
  };
}

/* ---------------------------------------------------------- shared reports */
export function useSharedReports() {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;

  const local = useQuery(
    useLocal
      ? "SELECT * FROM reportshares WHERE patientId = ? ORDER BY createdAt DESC"
      : "SELECT 1 WHERE 0",
    useLocal ? [userId()] : []
  );

  const { sharedReports, fetchMyShares, sharedReportsLoading } = usePatientStore();
  useEffect(() => {
    if (useLocal) return;
    const token = safeStorageAccess.getItem("token");
    if (token && fetchMyShares) fetchMyShares(token).catch(() => {});
  }, [useLocal, fetchMyShares]);

  if (useLocal) {
    return {
      data: parseJsonFields(local.data || [], ["reportIds"]),
      isLoading: local.isLoading,
      source: "local",
    };
  }
  return { data: sharedReports || [], isLoading: sharedReportsLoading, source: "online" };
}

/* --------------------------------------------------------- emergency folder */
/**
 * Emergency Folder is DERIVED: user profile + medical info + reports flagged
 * inEmergencyFolder. Offline, we reconstruct it from the local tables.
 */
export function useEmergencyFolder() {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;

  const reportsQ = useQuery(
    useLocal
      ? "SELECT * FROM reports WHERE userId = ? AND inEmergencyFolder = 1 ORDER BY createdAt DESC"
      : "SELECT 1 WHERE 0",
    useLocal ? [userId()] : []
  );
  const medicalQ = useQuery(
    useLocal ? "SELECT * FROM medicalinfos WHERE userId = ? LIMIT 1" : "SELECT 1 WHERE 0",
    useLocal ? [userId()] : []
  );
  const userQ = useQuery(
    useLocal ? "SELECT * FROM users WHERE id = ? LIMIT 1" : "SELECT 1 WHERE 0",
    useLocal ? [userId()] : []
  );

  const { reports, fetchReports } = usePatientStore();
  useEffect(() => {
    if (useLocal) return;
    const token = safeStorageAccess.getItem("token");
    if (token) fetchReports(token).catch(() => {});
  }, [useLocal, fetchReports]);

  if (useLocal) {
    const med = parseJsonFields(medicalQ.data || [], ["allergies"])[0] || null;
    const usr = (userQ.data || [])[0] || null;
    return {
      reports: parseJsonFields(reportsQ.data || [], ["tags"]),
      medical: med,
      user: usr,
      isLoading: reportsQ.isLoading || medicalQ.isLoading,
      source: "local",
    };
  }
  return {
    reports: (reports || []).filter((r) => r.inEmergencyFolder),
    medical: null,
    user: null,
    isLoading: false,
    source: "online",
  };
}

/* ----------------------------------------------------------- family vault */
export function useFamilyVault() {
  const { enabled, ready } = useMedicarePowerSync();
  const useLocal = enabled && ready;
  const uid = userId();

  const local = useQuery(
    useLocal
      ? "SELECT * FROM familyvaults WHERE headMember = ? OR members LIKE ? ORDER BY createdAt DESC"
      : "SELECT 1 WHERE 0",
    // members is JSON text; a LIKE on the id is a cheap offline membership check.
    useLocal ? [uid, `%${uid}%`] : []
  );

  if (useLocal) {
    const vaults = parseJsonFields(local.data || [], ["members"]);
    const vault = vaults[0] || null;
    return {
      vault,
      isHead: vault ? String(vault.headMember) === String(uid) : false,
      isLoading: local.isLoading,
      source: "local",
    };
  }
  // Online fallback is handled by the existing useFamilyVaultStore in the page.
  return { vault: null, isHead: false, isLoading: false, source: "online" };
}

/* --------------------------------------------------------- dashboard combo */
/** Convenience aggregate for the Dashboard landing (counts + recent items). */
export function useDashboardData() {
  const reports = useReports();
  const prescriptions = usePrescriptions();
  const notifications = useNotifications();

  return useMemo(
    () => ({
      reports: reports.data,
      prescriptions: prescriptions.data,
      notifications: notifications.data,
      unreadCount: notifications.unreadCount ?? 0,
      isLoading: reports.isLoading || prescriptions.isLoading || notifications.isLoading,
      source: reports.source,
    }),
    [reports, prescriptions, notifications]
  );
}
