import test from "node:test";
import assert from "node:assert/strict";
import { startInMemoryMongo } from "./helpers/dbHarness.js";

const harness = await startInMemoryMongo();

test("audit hash-chain: links rows and detects tampering", { skip: !harness.available && "mongodb-memory-server unavailable" }, async (t) => {
  await harness.clear();
  const { logEvent, verifyAuditChain } = await import("../../services/aadhaar/audit.service.js");
  const { AuditLog } = await import("../../models/User/auditLog.model.js");

  await logEvent("register_attempt", { ip: "1.1.1.1", reason: "a" });
  await logEvent("otp_generated", { ip: "1.1.1.1", reason: "b" });
  await logEvent("account_created", { ip: "1.1.1.1", reason: "c" });

  // Chain should be intact.
  const before = await verifyAuditChain();
  assert.equal(before.ok, true, "fresh chain is valid");

  // Rows must be sequential with linked prev_hash.
  const rows = await AuditLog().find({}).sort({ seq: 1 }).lean();
  assert.equal(rows.length, 3);
  assert.equal(rows[0].prev_hash, null);
  assert.equal(rows[1].prev_hash, rows[0].row_hash);
  assert.equal(rows[2].prev_hash, rows[1].row_hash);

  // Tamper: mutate a stored row's reason directly in the collection (bypassing
  // the model's append-only hooks) → chain verification must fail.
  await AuditLog().collection.updateOne({ seq: 2 }, { $set: { reason_field: "tampered" } });
  const after = await verifyAuditChain();
  assert.equal(after.ok, false, "tampering is detected");
  assert.equal(after.brokenAtSeq, 2);

  t.after(async () => {});
});

test("audit log is append-only via the model layer", { skip: !harness.available && "mongodb-memory-server unavailable" }, async () => {
  await harness.clear();
  const { logEvent } = await import("../../services/aadhaar/audit.service.js");
  const { AuditLog } = await import("../../models/User/auditLog.model.js");
  await logEvent("register_attempt", { ip: "2.2.2.2" });
  // updateOne / deleteOne should be blocked by pre-hooks.
  await assert.rejects(() => AuditLog().updateOne({ seq: 1 }, { $set: { reason_field: "x" } }));
  await assert.rejects(() => AuditLog().deleteOne({ seq: 1 }));
});

test.after(async () => {
  if (harness.available) await harness.stop();
});
