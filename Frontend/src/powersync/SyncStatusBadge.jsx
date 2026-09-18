import React, { useEffect, useState } from "react";
import { useStatus } from "@powersync/react";
import { Wifi, WifiOff, RefreshCw, Check } from "lucide-react";
import { useMedicarePowerSync } from "./PowerSyncProvider";

/**
 * Global connectivity + sync status badge for the dashboard header.
 *
 * IMPORTANT distinction (this was the source of a "shows Offline while online"
 * bug): there are TWO different signals, and the USER only cares about the first:
 *
 *   1. NETWORK connectivity  → navigator.onLine + online/offline events.
 *      This is what a person means by "am I online?".
 *   2. PowerSync SYNC stream → status.connected. This can briefly be false
 *      (reconnect cycles, initial handshake) even with a perfectly good internet
 *      connection. Using it as the "Offline" signal is misleading.
 *
 * So we drive the label off NETWORK state, and only use PowerSync's state to
 * show the finer "Syncing…" / "Synced" detail WHILE online.
 *
 * Renders nothing when PowerSync is disabled (online-only mode).
 */
function BadgeInner() {
  const status = useStatus();

  // Track real network connectivity.
  const [networkOnline, setNetworkOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  useEffect(() => {
    const on = () => setNetworkOnline(true);
    const off = () => setNetworkOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const syncing = !!(status?.dataFlowStatus?.uploading || status?.dataFlowStatus?.downloading);
  const psConnected = !!status?.connected;

  let label, Icon, classes, title, spin = false;

  if (!networkOnline) {
    // Genuinely offline (no internet). Local data still works.
    label = "Offline";
    Icon = WifiOff;
    classes = "bg-gray-100 text-gray-600 border-gray-200";
    title = "You're offline — showing your last synced data. Changes will sync when you reconnect.";
  } else if (syncing) {
    label = "Syncing…";
    Icon = RefreshCw;
    classes = "bg-amber-50 text-amber-700 border-amber-200";
    title = "Syncing your data…";
    spin = true;
  } else if (psConnected) {
    // Online AND the sync stream is connected + idle → fully up to date.
    label = "Synced";
    Icon = Check;
    classes = "bg-green-50 text-green-700 border-green-200";
    title = "Online — your data is up to date.";
  } else {
    // Online, but the sync stream is (re)connecting. Still "online" to the user.
    label = "Online";
    Icon = Wifi;
    classes = "bg-green-50 text-green-700 border-green-200";
    title = "Online — connecting to sync…";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
      title={title}
      aria-live="polite"
    >
      <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function SyncStatusBadge() {
  const { enabled } = useMedicarePowerSync();
  if (!enabled) return null; // online-only mode → no badge
  return <BadgeInner />;
}
