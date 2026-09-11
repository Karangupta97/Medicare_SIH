import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment } from "../../models/User/Payment.model.js";
import { User } from "../../models/User/user.model.js";
import { FamilyVault } from "../../models/User/FamilyVault.model.js";
import { PLAN_CONFIG } from "../../config/planConfig.js";

// ─── Razorpay instance (lazy singleton) ────────────────────────────────────
let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// ─── Plan price map (amount in paise) ──────────────────────────────────────
const PLAN_PRICES = {
  pro: {
    monthly: 1100, // ₹11
    annual: 9200, // ₹92.40 (30% off yearly)
  },
  premium: {
    monthly: 39900, // ₹399
    annual: 311200, // ₹3,112
  },
};

// ─── POST /api/payment/create-order ────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { planName, billingCycle } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!planName || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: "Plan name and billing cycle are required",
      });
    }

    if (!PLAN_PRICES[planName]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan name. Must be 'pro' or 'premium'",
      });
    }

    if (!["monthly", "annual"].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing cycle. Must be 'monthly' or 'annual'",
      });
    }

    const amount = PLAN_PRICES[planName][billingCycle];

    // Create Razorpay order
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `mc_${planName}_${userId.slice(-8)}_${Date.now()}`,
      notes: {
        userId,
        planName,
        billingCycle,
      },
    });

    // Save payment record
    const PaymentModel = Payment();
    await PaymentModel.create({
      userId,
      planName,
      billingCycle,
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error?.message || error);
    if (error?.statusCode) {
      console.error("Razorpay API status:", error.statusCode);
    }
    if (error?.error) {
      console.error("Razorpay error details:", JSON.stringify(error.error, null, 2));
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: process.env.NODE_ENV === "development" ? (error?.message || error?.error?.description || String(error)) : undefined,
    });
  }
};

// ─── POST /api/payment/verify ──────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    const PaymentModel = Payment();
    const payment = await PaymentModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Ensure authenticated user owns this payment order
    if (String(payment.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment",
      });
    }

    if (!isSignatureValid) {
      // Mark payment as failed
      payment.status = "failed";
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed — invalid signature",
      });
    }

    // Signature is valid — update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    const newPlan = payment.planName;

    // Update user's plan type
    const UserModel = User();
    await UserModel.findByIdAndUpdate(userId, {
      planType: newPlan,
    });

    // ─── Sync Family Vault limits with new plan ──────────────────────
    const VaultModel = FamilyVault();
    const vault = await VaultModel.findOne({ headMember: userId });

    if (vault) {
      // Update vault planType — the pre-save hook will set maxMembers automatically
      vault.planType = newPlan;
      await vault.save();
    }

    // Build plan details for the response
    const planDetails = PLAN_CONFIG[newPlan] || PLAN_CONFIG.free;

    return res.status(200).json({
      success: true,
      message: `Payment successful! Your plan has been upgraded to ${newPlan}.`,
      plan: newPlan,
      storageLimitBytes: planDetails.storageLimitBytes,
      maxFamilyMembers: planDetails.maxFamilyMembers,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

