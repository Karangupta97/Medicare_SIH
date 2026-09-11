import express from "express";
import {
  login,
  signup,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  resendOtp,
  updateProfile,
  getUserData,
  changePassword
} from "../../controllers/User/auth.controller.js";
import { verifyToken } from "../../middleware/User/verifyToken.js";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

router.get("/check-auth", verifyToken, checkAuth);
router.get("/user", verifyToken, getUserData);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);
router.post('/resend-otp', verifyToken, resendOtp);

// Updated route to use 'file' instead of 'photo' for multer
router.put("/update-profile", verifyToken, upload.single('file'), updateProfile);
router.put("/change-password", verifyToken, changePassword);


export default router;
