import crypto from "crypto";
import { AuditLog } from "../../models/User/auditLog.model.js";

/**
 * Tamper-evident audit logging.
 *
 * Every Aadhaar API call, every auth decision, and every PII access MUST write
 * a row here. Rows are chained: row_hash = SHA-256(prev_hash + canonical(row)).
 * A serialization mutex guarantees the sequence number / prev_hash are read and
 * written atomically within this process so concurrent writers can't fork the
 * chain. (Cross-process ordering in a clustered deploy would use a unique index
 * on `seq` — writes that lose the race retry with the next seq.)
 *
 * PII DISCIPLINE: callers pass only the identity hash and non-PII context. This
 * module never receives or stores the raw Aadhaar number or raw KYC payload.
 */

// In-process serialization so the read-tail-then-append is atomic.
let _chain = Promise.resolve();

/**
 * Build a stable, canonical string for hashing (key order fixed).
 */
function canonical(row) {
  return JSON.stringify({
    event_type: row.event_type,
    user_id: row.user_id ? String(row.user_id) : null,
    aadhaar_identity_hash: row.aadhaar_identity_hash || null,
    ip_address: row.ip_address || null,
    device_fingerprint: row.device_fingerprint || null,
    consent_flag: row.consent_flag === undefined ? null : row.consent_flag,
    reason_field: row.reason_field || null,
    meta: row.meta || {},
    seq: row.seq,
    prev_hash: row.prev_hash || null,
    timestamp: row.timestamp,
  });
}

/**
 * Append one audit row. Never throws into the caller's critical path — audit
 * failures are logged to stderr but must not break auth (we prefer to complete
 * the user action and alert on audit gaps than to deny service on a log error).
 * If your compliance posture requires fail-closed auditing, flip SWALLOW=false.
 */
const SWALLOW_AUDIT_ERRORS = true;

export async function logEvent(eventType, ctx = {}) {
  const task = _chain.then(async () => {
    const Model = AuditLog();
    // Read current tail for prev_hash + next seq.
    const tail = await Model.findOne({}).sort({ seq: -1 }).select("seq row_hash").lean();
    const seq = tail ? tail.seq + 1 : 1;
    const prev_hash = tail ? tail.row_hash : null;
    const timestamp = new Date();

    const row = {
      event_type: eventType,
      user_id: ctx.userId || null,
      aadhaar_identity_hash: ctx.aadhaarIdentityHash || null,
      ip_address: ctx.ip || null,
      device_fingerprint: ctx.deviceFingerprint || null,
      consent_flag: ctx.consentFlag === undefined ? null : ctx.consentFlag,
      reason_field: ctx.reason || null,
      meta: ctx.meta || {},
      seq,
      prev_hash,
      timestamp,
    };
    row.row_hash = crypto.createHash("sha256").update(canonical(row)).digest("hex");

    await Model.create(row);
    return row.row_hash;
  });

  // Keep the chain moving even if this write fails.
  _chain = task.catch(() => {});

  try {
    return await task;
  } catch (err) {
    // Never leak PII in the error path.
    console.error(`[audit] failed to write ${eventType} event:`, err.message);
    if (SWALLOW_AUDIT_ERRORS) return null;
    throw err;
  }
}

/**
 * Verify the integrity of the audit chain (for periodic compliance checks).
 * Recomputes each row_hash and confirms prev_hash linkage.
 * @returns {Promise<{ ok: boolean, brokenAtSeq?: number }>}
 */
export async function verifyAuditChain() {
  const Model = AuditLog();
  const rows = await Model.find({}).sort({ seq: 1 }).lean();
  let prev = null;
  for (const r of rows) {
    if ((r.prev_hash || null) !== (prev || null)) {
      return { ok: false, brokenAtSeq: r.seq };
    }
    const recomputed = crypto
      .createHash("sha256")
      .update(
        canonical({
          event_type: r.event_type,
          user_id: r.user_id,
          aadhaar_identity_hash: r.aadhaar_identity_hash,
          ip_address: r.ip_address,
          device_fingerprint: r.device_fingerprint,
          consent_flag: r.consent_flag,
          reason_field: r.reason_field,
          meta: r.meta,
          seq: r.seq,
          prev_hash: r.prev_hash,
          timestamp: r.timestamp,
        })
      )
      .digest("hex");
    if (recomputed !== r.row_hash) {
      return { ok: false, brokenAtSeq: r.seq };
    }
    prev = r.row_hash;
  }
  return { ok: true };
}
