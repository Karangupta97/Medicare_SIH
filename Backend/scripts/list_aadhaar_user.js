/** READ-ONLY: show the Aadhaar-registered account(s). Modifies nothing. */
import dotenv from "dotenv";
dotenv.config();
import connectAllDatabases, { closeAllConnections } from "../DB/connections.js";
import { User } from "../models/User/user.model.js";

async function main() {
  await connectAllDatabases();
  const UserModel = User();
  const users = await UserModel.find({ aadhaar_identity_hash: { $nin: [null, ""] } })
    .select("_id umid status role name lastname createdAt aadhaar_hash_version pin_set_at")
    .lean();
  console.log("=== Aadhaar-registered accounts ===");
  users.forEach((u) => {
    console.log({
      id: String(u._id),
      umid: u.umid,
      name: `${u.name || ""} ${u.lastname || ""}`.trim(),
      status: u.status,
      role: u.role,
      pin_set_at: u.pin_set_at,
      createdAt: u.createdAt,
      // hash intentionally NOT printed (PII-adjacent identifier)
    });
  });
  await closeAllConnections();
}
main().catch(async (e) => {
  console.error("error:", e.message);
  try { await closeAllConnections(); } catch {}
  process.exit(1);
});
