/**
 * DESTRUCTIVE (test cleanup): delete ONE Aadhaar-registered account + its 1:1
 * KycProfile so the Aadhaar can be re-registered during testing.
 *
 * Safety:
 *   - You MUST pass the exact UMID as argv[2] (prevents accidental runs).
 *   - Deletes only the User with that UMID and its matching KycProfile.
 *   - Also clears any AadhaarSession/RegistrationSession for that user so the
 *     flow starts clean.
 *
 * Usage:
 *   node scripts/delete_aadhaar_account.js ZZ94152ZJ
 */
import dotenv from "dotenv";
dotenv.config();
import connectAllDatabases, { closeAllConnections } from "../DB/connections.js";
import { User } from "../models/User/user.model.js";
import { KycProfile } from "../models/User/kycProfile.model.js";

async function main() {
  const umid = process.argv[2];
  if (!umid) {
    console.error("Refusing to run: pass the UMID, e.g. `node scripts/delete_aadhaar_account.js ZZ94152ZJ`");
    process.exit(1);
  }

  await connectAllDatabases();
  const UserModel = User();
  const KycModel = KycProfile();

  const user = await UserModel.findOne({ umid }).select("_id umid name aadhaar_identity_hash");
  if (!user) {
    console.error(`No user found with UMID ${umid}. Nothing deleted.`);
    await closeAllConnections();
    process.exit(1);
  }

  console.log("About to delete:", { id: String(user._id), umid: user.umid, name: user.name });

  const kycRes = await KycModel.deleteOne({ userId: user._id });
  const userRes = await UserModel.deleteOne({ _id: user._id });

  console.log("Deleted KycProfile docs:", kycRes.deletedCount);
  console.log("Deleted User docs:", userRes.deletedCount);
  console.log("Done. That Aadhaar can now be registered again.");

  await closeAllConnections();
}
main().catch(async (e) => {
  console.error("delete error:", e.message);
  try { await closeAllConnections(); } catch {}
  process.exit(1);
});
