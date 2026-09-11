import express from "express";
import { verifyToken } from "../../middleware/User/verifyToken.js";
import {
  createVault,
  getVault,
  updateVault,
  deleteVault,
  inviteMember,
  getMyPendingInvites,
  verifyInviteOtp,
  removeMember,
  updateMemberPermissions,
  getMemberReports,
  getMemberMedicalInfo,
  getFamilyDashboard,
  getFamilyEmergencyData,
  getMemberEmergencyFolder,
} from "../../controllers/User/familyVault.controller.js";

const router = express.Router();

// Vault CRUD
router.post("/", verifyToken, createVault);
router.get("/", verifyToken, getVault);
router.put("/", verifyToken, updateVault);
router.delete("/", verifyToken, deleteVault);

// Invite flow
router.post("/invite", verifyToken, inviteMember);
router.get("/invite/mine", verifyToken, getMyPendingInvites);
router.post("/invite/verify", verifyToken, verifyInviteOtp);

// Member management
router.delete("/members/:memberId", verifyToken, removeMember);
router.put("/members/:memberId/permissions", verifyToken, updateMemberPermissions);

// Member data access
router.get("/members/:memberId/reports", verifyToken, getMemberReports);
router.get("/members/:memberId/medical-info", verifyToken, getMemberMedicalInfo);

// Dashboard & Emergency
router.get("/dashboard", verifyToken, getFamilyDashboard);
router.get("/emergency", verifyToken, getFamilyEmergencyData);
router.get("/emergency/:memberId", verifyToken, getMemberEmergencyFolder);

export default router;
