import express from "express";
import { 
  updateMedicalInfo, 
  getMedicalInfo, 
  deleteMedicalInfo,
  getMedicalInfoByUMID 
} from "../../controllers/User/medicalInfo.controller.js";
import { verifyToken } from "../../middleware/User/verifyToken.js";

const router = express.Router();

// Patient routes (require authentication)
router.put("/update", verifyToken, updateMedicalInfo);
router.get("/", verifyToken, getMedicalInfo);
router.delete("/", verifyToken, deleteMedicalInfo);

// Healthcare provider routes (require authentication)
router.get("/patient/:umid", verifyToken, getMedicalInfoByUMID);

export default router;
