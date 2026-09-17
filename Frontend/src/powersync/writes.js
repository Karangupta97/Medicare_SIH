import { getPowerSync } from "./db";
import { isPowerSyncEnabled } from "./config";
import usePatientStore from "../store/Patient/patientstore";
import { safeStorageAccess } from "../utils/errorHandling";

/**
 * Optimistic write helpers for the sidebar features.
 *
 * When PowerSync is active, writes go to the LOCAL SQLite first (instant,
 * optimistic UI) and PowerSync automatically records them in its upload queue,
 * flushing to POST /api/powersync/write when connectivity returns.
 *
 * When PowerSync is NOT active, we fall back to the existing online store
 * actions so behavior is unchanged.
 *
 * File BLOB uploads are intentionally NOT here — a report's file still goes
 * through the existing multipart S3 upload endpoint while online; only the
 * report METADATA participates in offline sync.
 */

function active() {
  return isPowerSyncEnabled() && !!getPowerSync();
}

/* --------------------------------------------------- mark notification read */
export async function markNotificationRead(notificationId, read = true) {
  if (active()) {
    const db = getPowerSync();
    // Local optimistic update; PowerSync queues the PATCH to the backend.
    await db.execute("UPDATE notifications SET read = ? WHERE id = ?", [read ? 1 : 0, notificationId]);
    return { source: "local" };
  }
  // Online fallback (existing store action).
  const token = safeStorageAccess.getItem("token");
  const store = usePatientStore.getState();
  if (store.markNotificationAsRead) {
    await store.markNotificationAsRead(token, notificationId);
  }
  return { source: "online" };
}

export async function markAllNotificationsRead() {
  if (active()) {
    const db = getPowerSync();
    const uid = safeStorageAccess.getItem("userId");
    await db.execute("UPDATE notifications SET read = 1 WHERE userId = ? AND read = 0", [uid]);
    return { source: "local" };
  }
  const token = safeStorageAccess.getItem("token");
  const store = usePatientStore.getState();
  if (store.markAllNotificationsAsRead) {
    await store.markAllNotificationsAsRead(token);
  }
  return { source: "online" };
}

export async function deleteNotification(notificationId) {
  if (active()) {
    const db = getPowerSync();
    await db.execute("DELETE FROM notifications WHERE id = ?", [notificationId]);
    return { source: "local" };
  }
  const token = safeStorageAccess.getItem("token");
  const store = usePatientStore.getState();
  if (store.deleteNotification) {
    await store.deleteNotification(token, notificationId);
  }
  return { source: "online" };
}

/* ----------------------------------------------- report metadata mutations */
/**
 * Toggle a report's Emergency Folder membership. Metadata-only → safe to sync.
 */
export async function setReportEmergencyFolder(reportId, inEmergencyFolder) {
  if (active()) {
    const db = getPowerSync();
    await db.execute("UPDATE reports SET inEmergencyFolder = ? WHERE id = ?", [
      inEmergencyFolder ? 1 : 0,
      reportId,
    ]);
    return { source: "local" };
  }
  const token = safeStorageAccess.getItem("token");
  const store = usePatientStore.getState();
  if (store.setReportEmergencyFolder) {
    await store.setReportEmergencyFolder(token, reportId, inEmergencyFolder);
  }
  return { source: "online" };
}

/** Change a report's category (metadata-only). */
export async function setReportCategory(reportId, category) {
  if (active()) {
    const db = getPowerSync();
    await db.execute("UPDATE reports SET category = ? WHERE id = ?", [category, reportId]);
    return { source: "local" };
  }
  const token = safeStorageAccess.getItem("token");
  const store = usePatientStore.getState();
  if (store.moveReport) {
    await store.moveReport(token, reportId, category);
  }
  return { source: "online" };
}
