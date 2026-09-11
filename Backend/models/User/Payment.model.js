import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planName: {
      type: String,
      enum: ["pro", "premium"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    amount: {
      type: Number, // amount in paise
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = () => getPatientDB().model("Payment", paymentSchema);
