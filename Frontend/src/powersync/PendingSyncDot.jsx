import React, { useEffect, useState } from "react";
import { getPowerSync } from "./db";
import { isPowerSyncEnabled } from "./config";

/**
 * Per-item "pending sync" indicator. Shows a small pulsing dot / "syncing…"
 * badge on a row whose local change hasn't been uploaded to the server yet.
 *
 * HOW IT KNOWS: PowerSync records every un-uploaded local mutation in its CRUD
 * queue (ps_crud). We check whether an op exists for this table+id. When the
 * queue drains (upload succeeds), the dot disappears. Renders nothing when
 * PowerSync is disabled.
 *
 * @param {{ table: string, id: string, variant?: 'dot'|'badge' }} props
 */
export default function PendingSyncDot({ table, id, variant = "dot" }) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isPowerSyncEnabled()) return undefined;
    const db = getPowerSync();
    if (!db) return undefined;

    let cancelled = false;
    const check = async () => {
      try {
        // ps_crud is PowerSync's internal upload-queue table.
        const rows = await db.getAll(
          "SELECT 1 FROM ps_crud WHERE json_extract(data, '$.type') = ? AND json_extract(data, '$.id') = ? LIMIT 1",
          [table, String(id)]
        );
        if (!cancelled) setPending(rows.length > 0);
      } catch {
        // Schema/queue not available → treat as not pending.
        if (!cancelled) setPending(false);
      }
    };

    check();
    // Re-check as the CRUD queue changes.
    const unsub = db.onChange?.(
      { onChange: check },
      { tables: ["ps_crud"], throttleMs: 500 }
    );
    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
    };
  }, [table, id]);

  if (!pending) return null;

  if (variant === "badge") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
        title="This change hasn't synced yet — it will upload when you're back online"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        syncing…
      </span>
    );
  }

  return (
    <span
      className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500"
      title="Pending sync — not yet uploaded"
      aria-label="Pending sync"
    />
  );
}
