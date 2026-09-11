import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { getDoctorDB } from "../../DB/connections.js";

const doctorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    default: 0
  },
  licenseDocument: {
    s3Key: String,
    fileUrl: String,
    originalFilename: String
  },
  doctorId: {
    type: String,
    unique: true
  },
  photoURL: {
    type: String,
    default: ""
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
}, {
  timestamps: true
});

// Hash password before saving
doctorSchema.pre("save", async function (next) {
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
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Generate a unique doctor ID
doctorSchema.statics.generateDoctorId = async function() {
  const prefix = "DOC";
  const count = await this.countDocuments();
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${(count + 1).toString().padStart(3, '0')}${randomPart}`;
};

export const Doctor = () => getDoctorDB().model("Doctor", doctorSchema); 