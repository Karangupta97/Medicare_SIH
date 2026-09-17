import React from "react";
import { useStatus } from "@powersync/react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useMedicarePowerSync } from "./PowerSyncProvider";

/**
 * Global online/offline + sync status badge for the dashboard header.
 *
 * Renders nothing when PowerSync is disabled (online-only mode) so the header
 * is unchanged until an instance is configured.
 *
 * States:
 *  - connecting/uploading/downloading → "Syncing…" (spinner)
 *  - connected + up to date           → "Online"
 *  - not connected                    → "Offline"  (data still readable locally)
 */
function BadgeInner() {
  const status = useStatus();

  const syncing = status.dataFlowStatus?.uploading || status.dataFlowStatus?.downloading;
  const online = status.connected;

  let label, Icon, classes;
  if (syncing) {
    label = "Syncing…";
    Icon = RefreshCw;
    classes = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (online) {
    label = "Online";
    Icon = Wifi;
    classes = "bg-green-50 text-green-700 border-green-200";
  } else {
    label = "Offline";
    Icon = WifiOff;
    classes = "bg-gray-100 text-gray-600 border-gray-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
      title={
        online
          ? "Connected — your data is syncing"
          : "Offline — showing your last synced data; changes will sync when you're back online"
      }
      aria-live="polite"
    >
      <Icon className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function SyncStatusBadge() {
  const { enabled } = useMedicarePowerSync();
  if (!enabled) return null; // online-only mode → no badge
  return <BadgeInner />;
}
