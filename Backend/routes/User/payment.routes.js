import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../../controllers/User/payment.controller.js";
import { verifyToken } from "../../middleware/User/verifyToken.js";

const router = express.Router();

// POST /api/payment/create-order — create a Razorpay order for a plan
router.post("/create-order", verifyToken, createOrder);

// POST /api/payment/verify — verify Razorpay payment signature & upgrade plan
router.post("/verify", verifyToken, verifyPayment);

export default router;
