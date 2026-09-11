import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { getPatientDB } from "../../DB/connections.js";

const userSchema = new mongoose.Schema({
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
  lastname: {
    type: String,
    trim: true,
    default: "",
  },
  photoURL: {
    type: String,
    default: "",
  },
  photoS3Key: {
    type: String,
    default: "",
  },
  photoIsPermanent: {
    type: Boolean,
    default: false,
  },
  photoURLExpiresAt: {
    type: Date,
    default: null,
  },
  umid: {
    type: String,
    unique: true,
    required: true,
  },
  planType: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  role: {
    type: String,
    enum: ["user", "hospital", "medical", "admin", "founder", "patient"],
    default: "user",
  },
  isverified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  lastLOGIN: {
    type: Date,
    default: Date.now,
  },
  // Address fields
  addressLine1: {
    type: String,
    trim: true,
    default: "",
  },
  addressLine2: {
    type: String,
    trim: true,
    default: "",
  },
  district: {
    type: String,
    trim: true,
    default: "",
  },
  state: {
    type: String,
    trim: true,
    default: "",
  },
  postalCode: {
    type: String,
    trim: true,
    default: "",
  },
  addressValidated: {
    type: Boolean,
    default: false,
  },
  addressValidatedAt: {
    type: Date,
    default: null,
  },
  // Personal details
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  dob: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "Male", "Female", "Other", ""],
    default: "",
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    default: "",
  },
  // Medical Information Reference
  medicalInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalInfo",
    default: null,
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report"
  }],
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription"
  }],
  // Family Vault reference
  familyVaultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FamilyVault",
    default: null,
  },
}, {
  timestamps: true,
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Pre-save middleware to normalize gender to lowercase
userSchema.pre('save', function (next) {
  if (this.gender && this.gender !== "") {
    this.gender = this.gender.toLowerCase();
  }
  next();
});

// Pre-update middleware to normalize gender to lowercase
userSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.gender && this._update.gender !== "") {
    this._update.gender = this._update.gender.toLowerCase();
  }
  next();
});

export const User = () => getPatientDB().model("User", userSchema); 