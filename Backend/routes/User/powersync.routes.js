import express from "express";
import {
  getPowerSyncToken,
  applyPowerSyncWrite,
  getPowerSyncJwks,
} from "../../controllers/User/powersync.controller.js";
import { verifyToken } from "../../middleware/User/verifyToken.js";

/**
 * PowerSync routes (offline dashboard). Mounted at /api/powersync.
 * All are auth-protected except the JWKS discovery endpoint (public key set).
 * These are isolated from the Aadhaar auth routes.
 */
const router = express.Router();

// Client connector calls this to obtain a per-user PowerSync JWT.
router.get("/token", verifyToken, getPowerSyncToken);

// Client upload queue posts batched offline mutations here.
router.post("/write", verifyToken, applyPowerSyncWrite);

// Public JWKS (only used in RS256 mode).
router.get("/jwks", getPowerSyncJwks);

export default router;
