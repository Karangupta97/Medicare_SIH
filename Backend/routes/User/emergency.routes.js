import express from "express";
import { getEmergencyFolderByUmid } from "../../controllers/User/emergency.controller.js";

const router = express.Router();

// Public route – no authentication. For QR code scanning in emergencies.
router.get("/:umid", getEmergencyFolderByUmid);

export default router;
