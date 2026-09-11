import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { getManagementDB } from "../../../DB/connections.js";

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
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
  phone: {
    type: String,
    trim: true,
  },
  staffId: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["staff", "manager", "founder"],
    default: "staff",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
  photoURL: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model for tracking who created this staff
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
}, {
  timestamps: true,
});

// Hash password before saving
staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Generate a unique staff ID
staffSchema.statics.generateStaffId = async function() {
  const prefix = "STF";
  const count = await this.countDocuments();
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${(count + 1).toString().padStart(3, '0')}${randomPart}`;
};

export const Staff = () => getManagementDB().model("Staff", staffSchema); 