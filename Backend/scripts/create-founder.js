/**
 * Founder Creation Script
 * -----------------------
 * Creates a founder account in the Management database.
 *
 * Usage:
 *   node scripts/create-founder.js <email> <password> <name>
 *
 * Example:
 *   node scripts/create-founder.js founder@medicares.in "SecurePass@123" "Karan Gupta"
 */

import "dotenv/config";
import connectAllDatabases, { closeAllConnections } from "../DB/connections.js";
import { Founder } from "../models/Founder/founder.model.js";

// ── CLI argument parsing ───────────────────────────────────────────────────────
const [, , email, password, name] = process.argv;

if (!email || !password || !name) {
  console.error(`
❌  Missing required arguments.

Usage:
  node scripts/create-founder.js <email> <password> <name>

Example:
  node scripts/create-founder.js founder@medicares.in "SecurePass@123" "Karan Gupta"
`);
  process.exit(1);
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔗 Connecting to databases…");
  await connectAllDatabases();

  const FounderModel = Founder(); // returns the mongoose Model bound to managementDB

  // Check for an existing founder with the same email
  const existing = await FounderModel.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.error(`\n❌  A founder with email "${email}" already exists.`);
    console.error("    Use a different email or remove the existing record first.\n");
    await closeAllConnections();
    process.exit(1);
  }

  // Create the founder (password is hashed by the pre-save hook)
  const founder = new FounderModel({
    email: email.toLowerCase().trim(),
    password,
    name: name.trim(),
    isActive: true,
  });

  await founder.save();

  console.log(`
✅  Founder created successfully!
    ─────────────────────────────────
    Name  : ${founder.name}
    Email : ${founder.email}
    ID    : ${founder._id}
    Role  : ${founder.role}
    ─────────────────────────────────
`);

  await closeAllConnections();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("\n❌  Unexpected error:", err.message || err);
  await closeAllConnections().catch(() => {});
  process.exit(1);
});
