import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { Report } from "../../models/User/report.model.js";
import Notification from "../../models/User/notification.model.js";

dotenv.config();

/**
 * PowerSync backend integration.
 *
 * TWO responsibilities (the PowerSync SERVICE connects to MongoDB itself via
 * change streams — that's configured in the PowerSync dashboard, not here):
 *
 *   1. GET  /api/powersync/token  — mint a short-lived per-user PowerSync JWT.
 *      The `sub` claim is the user's Mongo _id; PowerSync passes it into the
 *      sync rules as a token parameter so each user only receives their own
 *      buckets (no cross-user data in local storage).
 *
 *   2. POST /api/powersync/write  — apply the client's offline upload queue.
 *      PowerSync batches local mutations and POSTs them here when back online.
 *      We translate each op into a Mongo write against the EXISTING models,
 *      strictly enforcing that the row belongs to the authenticated user.
 *
 * SCOPE: only the sidebar-feature collections. The Aadhaar/KYC flow is never
 * touched. Prescriptions + emergency data are READ-ONLY from the patient side
 * (server-wins) — we reject client writes to them and log a warning.
 */

const JWT_TTL = parseInt(process.env.POWERSYNC_JWT_TTL_SECONDS || "300", 10);

/**
 * Mint a PowerSync JWT for the authenticated user.
 * Uses HS256 with POWERSYNC_JWT_SECRET (a dedicated secret, NOT the app
 * JWT_SECRET). If not configured, returns 501 so the client cleanly falls back
 * to online-only mode.
 */
export const getPowerSyncToken = async (req, res) => {
  try {
    const secret = process.env.POWERSYNC_JWT_SECRET;
    const audience = process.env.POWERSYNC_URL;
    if (!secret || !audience) {
      // Not configured yet → tell the client to stay in online-only fallback.
      return res.status(501).json({
        success: false,
        message: "PowerSync is not configured on this server.",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        // PowerSync uses `sub` as the user identity → passed to sync rules as
        // token_parameters.user_id. This is what scopes buckets per user.
        sub: String(userId),
        iat: now,
        exp: now + JWT_TTL,
        aud: audience,
      },
      secret,
      {
        algorithm: "HS256",
        keyid: process.env.POWERSYNC_JWT_KID || "medicare-powersync-hs256",
      }
    );

    return res.status(200).json({
      // Shape expected by the client connector's fetchCredentials().
      token,
      // The PowerSync endpoint the client should connect to.
      powersync_url: audience,
      expires_at: new Date((now + JWT_TTL) * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[powersync] token error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to mint PowerSync token." });
  }
};

/**
 * Apply the client upload queue. Body shape (from the client connector):
 *   { batch: [ { op: 'PUT'|'PATCH'|'DELETE', table, id, data } ] }
 *
 * We only allow a small, safe allowlist of mutations:
 *   - notifications: mark read/unread (PATCH read), delete
 *   - reports: metadata edits (category, inEmergencyFolder, description, tags,
 *     available_offline) — NEVER create/replace file content here (blobs go
 *     through the existing S3 upload path).
 * Everything else (prescriptions, familyvaults, emergency-derived data) is
 * rejected as read-only from the patient side → server version wins.
 */
export const applyPowerSyncWrite = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const batch = Array.isArray(req.body?.batch) ? req.body.batch : [];
  const results = [];

  for (const op of batch) {
    try {
      const result = await applyOne(op, userId);
      results.push({ id: op.id, ok: true, ...result });
    } catch (err) {
      // A failed op should not abort the whole batch; PowerSync can retry.
      console.warn(`[powersync] write op rejected (${op?.table}/${op?.id}): ${err.message}`);
      results.push({ id: op?.id, ok: false, reason: err.message });
    }
  }

  return res.status(200).json({ success: true, results });
};

async function applyOne(op, userId) {
  const { table, op: kind, id, data } = op || {};
  if (!table || !id) throw new Error("malformed op");

  switch (table) {
    case "notifications":
      return applyNotification(kind, id, data, userId);
    case "reports":
      return applyReportMetadata(kind, id, data, userId);

    // READ-ONLY collections (server-wins). Reject client writes + log.
    case "prescriptions":
    case "familyvaults":
    case "familyvaultinvites":
    case "reportshares":
    case "medicalinfos":
      throw new Error(`${table} is read-only from the client (server version kept)`);

    default:
      throw new Error(`unknown table ${table}`);
  }
}

/** Notifications: only allow toggling `read` and deleting one's own rows. */
async function applyNotification(kind, id, data, userId) {
  const Model = Notification();
  // Ownership guard: the update only matches if the doc belongs to this user.
  if (kind === "DELETE") {
    const r = await Model.deleteOne({ _id: id, userId });
    return { modified: r.deletedCount };
  }
  if (kind === "PATCH" || kind === "PUT") {
    const read = typeof data?.read === "boolean" ? data.read : data?.read === 1;
    const r = await Model.updateOne({ _id: id, userId }, { $set: { read } });
    return { modified: r.modifiedCount };
  }
  throw new Error(`unsupported notification op ${kind}`);
}

/**
 * Reports: only metadata edits on the user's own reports. We explicitly do NOT
 * accept fileUrl/s3Key/fileSize changes from the client (those are set by the
 * server-side S3 upload path) to keep the storage-quota accounting authoritative.
 */
const REPORT_EDITABLE = new Set(["category", "inEmergencyFolder", "description", "tags", "available_offline"]);

async function applyReportMetadata(kind, id, data, userId) {
  const Model = Report();
  if (kind === "DELETE") {
    // Deletion of the metadata is allowed; the S3 object cleanup is handled by
    // the existing DELETE /api/reports/:id controller when online. Here we only
    // remove the row the user owns.
    const r = await Model.deleteOne({ _id: id, userId });
    return { modified: r.deletedCount };
  }
  if (kind === "PATCH" || kind === "PUT") {
    const $set = {};
    for (const [k, v] of Object.entries(data || {})) {
      if (REPORT_EDITABLE.has(k)) $set[k] = v;
    }
    if (Object.keys($set).length === 0) return { modified: 0 };
    const r = await Model.updateOne({ _id: id, userId }, { $set });
    return { modified: r.modifiedCount };
  }
  throw new Error(`unsupported report op ${kind}`);
}

/**
 * Optional JWKS endpoint placeholder for RS256 mode. With HS256 (shared secret)
 * this isn't used; documented so the RS256 upgrade path is obvious.
 */
export const getPowerSyncJwks = async (_req, res) => {
  // For HS256 there is no public JWKS. Return empty keys so a misconfigured
  // PowerSync instance gets a clear (empty) response rather than a 404.
  return res.status(200).json({ keys: [] });
};

// Exposed for tests.
export const __test = { applyOne };
void crypto; // reserved for future RS256 signing
