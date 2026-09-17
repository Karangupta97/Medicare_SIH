import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { getPatientDB } from "../../DB/connections.js";

const userSchema = new mongoose.Schema({
  // --- Legacy email/password (now OPTIONAL) ---
  // The primary patient auth is Aadhaar-based. email/password are kept for the
  // deprecated email flow and legacy accounts, so they must be optional now.
  // `unique + sparse` lets many Aadhaar users have no email without colliding on
  // a null value (a plain unique index would reject the 2nd null email).
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false,
  },

  // --- Aadhaar-based authentication ---
  // HMAC-SHA256(aadhaar, pepper). unique + sparse = one account per Aadhaar,
  // while legacy (email) accounts with no hash (null) don't collide. This unique
  // index is the FINAL authority against concurrent-registration races.
  aadhaar_identity_hash: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    default: null,
  },
  aadhaar_hash_version: { type: String, default: null },
  // Login PIN (argon2id preferred; per-user salt stored explicitly).
  pin_hash: { type: String, default: null },
  pin_salt: { type: String, default: null },
  pin_algo: { type: String, enum: ["argon2id", "bcrypt", null], default: null },
  pin_set_at: { type: Date, default: null },
  // Lockout / brute-force state for the PIN login path.
  failed_pin_attempts: { type: Number, default: 0 },
  pin_locked_until: { type: Date, default: null },
  pin_failures_window_start: { type: Date, default: null },
  pin_failures_in_window: { type: Number, default: 0 },
  // Account lifecycle (frozen/deleted both return generic invalid-credentials).
  status: {
    type: String,
    enum: ["active", "frozen", "deleted"],
    default: "active",
    index: true,
  },
  // Bounded list of known device fingerprints for step-up decisions.
  known_devices: [
    {
      fingerprint: { type: String, required: true },
      first_seen_at: { type: Date, default: Date.now },
      last_seen_at: { type: Date, default: Date.now },
    },
  ],

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