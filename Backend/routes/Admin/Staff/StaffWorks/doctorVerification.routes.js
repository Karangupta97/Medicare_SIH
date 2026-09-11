import express from "express";
import {
  getPendingDoctors,
  getVerifiedDoctors,
  getDoctorDetails,
  approveDoctor,
  rejectDoctor
} from "../../../../controllers/Admin/Staff/StaffWorks/doctorVerification.controller.js";
import { verifyStaff, verifyDoctorVerificationAccess } from "../../../../middleware/Admin/Staff/verifyStaff.js";

const router = express.Router();

// Apply staff verification middleware to all routes
router.use(verifyStaff);
router.use(verifyDoctorVerificationAccess);

// Doctor verification routes - accessible to all staff
router.get("/pending", getPendingDoctors);
router.get("/verified", getVerifiedDoctors);
router.get("/:doctorId", getDoctorDetails);
router.put("/:doctorId/approve", approveDoctor);
router.put("/:doctorId/reject", rejectDoctor);

export default router; 