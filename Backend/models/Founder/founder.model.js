import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { getManagementDB } from "../../DB/connections.js";

const founderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  photoURL: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  otpToken: {
    type: String,
    default: null,
  },
  otpTokenExpiresAt: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    default: "founder",
    immutable: true, // Cannot be changed once set
  }
}, {
  timestamps: true,
});

// Hash password before saving
founderSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
founderSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Method to generate OTP
founderSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpToken = otp;
  this.otpTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  return otp;
};

// Method to verify OTP
founderSchema.methods.verifyOTP = function (otp) {
  return this.otpToken === otp && this.otpTokenExpiresAt > Date.now();
};

export const Founder = () => getManagementDB().model("Founder", founderSchema); 