import express from "express";
import {
  addStaff,
  listStaff,
  getStaffById,
  updateStaff,
  resetStaffPassword,
  deleteStaff
} from "../../../controllers/Admin/Staff/staffManagement.controller.js";
import { verifyFounder } from "../../../middleware/Founder/verifyFounder.js";

const router = express.Router();

// All routes require founder or manager authentication
router.use(verifyFounder);

// Staff management routes
router.post("/", addStaff);
router.get("/", listStaff);
router.get("/:staffId", getStaffById);
router.put("/:staffId", updateStaff);
router.post("/:staffId/reset-password", resetStaffPassword);
router.delete("/:staffId", deleteStaff);

export default router; 
