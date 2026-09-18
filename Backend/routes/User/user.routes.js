import express from "express";
import multer from "multer";
import { verifyToken } from "../../middleware/User/verifyToken.js";
import { getUserPrescriptions, getUserPrescriptionById, getPrescriptionCount, getUserProfileByUmid } from "../../controllers/User/user.controller.js";
import {
  updateProfilePicture,
  setProfilePictureFromAadhaar,
  removeProfilePicture,
  getKycPhoto,
} from "../../controllers/User/profilePicture.controller.js";

const router = express.Router();

// Multer memory storage for profile-picture uploads (image only, 5MB cap).
// Memory storage keeps the bytes in-process so we can run them through the
// shared resize/compress/strip-EXIF pipeline before touching storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

// Public route for QR code scanning - doesn't require authentication
router.get("/profile/:umid", getUserProfileByUmid);

// All subsequent routes are protected with verifyToken middleware
router.use(verifyToken);

// --- App profile picture (independent of the Aadhaar KYC photo) ---
// Change: upload a new image → processed → stored → users.photoURL replaced.
router.put("/profile/picture", upload.single("file"), updateProfilePicture);
// Fetch from Aadhaar: derive the profile picture from the user's own KYC photo.
router.post("/profile/picture/from-aadhaar", setProfilePictureFromAadhaar);
// Remove: clears users.photoURL → frontend falls back to default avatar/initials.
router.delete("/profile/picture", removeProfilePicture);

// --- KYC photo (compliance/admin only; never called by the normal frontend) ---
// Authorized inside the controller (privileged roles) + audited as pii_access.
router.get("/kyc/photo/:userId", getKycPhoto);

// Get user's prescriptions
router.get("/digital-prescriptions", getUserPrescriptions);

// Get prescription count for the logged-in user
router.get("/digital-prescriptions/count", getPrescriptionCount);

// Get a specific prescription by ID
router.get("/digital-prescriptions/:prescriptionId", getUserPrescriptionById);

export default router;