import React, { useEffect, useMemo, useState, createContext, useContext } from "react";
import { PowerSyncContext } from "@powersync/react";
import { getPowerSync, clearPowerSync } from "./db";
import { MedicareBackendConnector } from "./connector";
import { isPowerSyncEnabled } from "./config";

/**
 * Mounts + connects the PowerSync client, but ONLY inside the authenticated
 * dashboard (this provider is rendered by the dashboard layout, never around
 * the Aadhaar auth flow). On mount it connects the DB via the backend
 * connector; on unmount/logout it disconnects.
 *
 * When PowerSync is disabled (no VITE_POWERSYNC_URL), this renders children
 * as-is with `enabled:false` in context, so every consumer falls back to the
 * online axios path. Nothing about the app changes until an instance is set up.
 */

// Our own lightweight context exposing whether PowerSync is active + ready,
// separate from the raw @powersync/react PowerSyncContext (which needs a db).
const MedicarePowerSyncContext = createContext({ enabled: false, ready: false, db: null });

export function useMedicarePowerSync() {
  return useContext(MedicarePowerSyncContext);
}

export function PowerSyncProvider({ children }) {
  const enabled = isPowerSyncEnabled();
  const db = useMemo(() => (enabled ? getPowerSync() : null), [enabled]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!db) return undefined;
    let cancelled = false;
    const connector = new MedicareBackendConnector();

    (async () => {
      try {
        await db.init();
        await db.connect(connector);
        if (!cancelled) setReady(true);
      } catch (e) {
        // Connection failure must NOT break the dashboard — we simply stay in
        // fallback mode (hooks read online).
        console.warn("[powersync] connect failed; using online fallback:", e.message);
        if (!cancelled) setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      // Disconnect (but don't wipe) on unmount; wipe happens on explicit logout.
      db.disconnect?.().catch(() => {});
    };
  }, [db]);

  const ctxValue = useMemo(() => ({ enabled: Boolean(db), ready, db }), [db, ready]);

  // When enabled, also provide the raw PowerSyncContext so @powersync/react
  // hooks (useQuery/useStatus) work for consumers that want them.
  if (db) {
    return (
      <MedicarePowerSyncContext.Provider value={ctxValue}>
        <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
      </MedicarePowerSyncContext.Provider>
    );
  }

  return (
    <MedicarePowerSyncContext.Provider value={ctxValue}>
      {children}
    </MedicarePowerSyncContext.Provider>
  );
}

/** Call on logout to wipe the local encrypted DB (no PHI left on the device). */
export async function teardownPowerSync() {
  await clearPowerSync();
}

export default PowerSyncProvider;
