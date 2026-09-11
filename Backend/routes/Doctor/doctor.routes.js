import express from "express";
import {
  doctorSignup,
  doctorLogin,
  doctorLogout,
  getDoctorProfile,
  requestPasswordReset,
  checkDoctorAuth
} from "../../controllers/Doctor/doctorAuth.controller.js";
import {
  getDoctorEmergencyAccess,
} from "../../controllers/Doctor/doctorEmergency.controller.js";
import {
  getSharedReports,
  viewSharedReport,
  addNote,
} from "../../controllers/Doctor/sharedReports.controller.js";
import { verifyDoctor } from "../../middleware/Doctor/verifyDoctor.js";


const router = express.Router();

// Doctor Auth Routes
router.post("/signup", doctorSignup);
router.post("/login", doctorLogin);
router.post("/logout", doctorLogout);
router.post("/reset-password", requestPasswordReset);
router.get("/check-auth", verifyDoctor, checkDoctorAuth);

// Doctor Profile Routes
router.get("/profile", verifyDoctor, getDoctorProfile);

// Doctor Emergency Access Routes
router.get("/emergency/:umid", verifyDoctor, getDoctorEmergencyAccess);

// Doctor Shared Reports Routes
router.get("/shared-reports", verifyDoctor, getSharedReports);
router.get("/shared-reports/:shareId/reports/:reportId", verifyDoctor, viewSharedReport);
router.post("/shared-reports/:shareId/notes", verifyDoctor, addNote);

export default router; 