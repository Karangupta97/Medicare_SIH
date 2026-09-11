import express from "express";
import { verifyToken } from "../middleware/User/verifyToken.js";
import { submitReview, getApprovedReviews, getDetailedReviews } from "../controllers/review.controller.js";

const router = express.Router();

// Public route for submitting reviews
router.post("/submit", submitReview);

// Public route for getting approved reviews
router.get("/approved", getApprovedReviews);

// Route for getting detailed reviews (for healthcare providers)
router.get("/detailed", getDetailedReviews);

export default router; 