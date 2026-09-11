import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

const medicalInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Basic Medical Information
  height: {
    type: String,
    default: "",
  },
  weight: {
    type: String,
    default: "",
  },
  chronicConditions: [{
    type: String,
  }],
  allergies: [{
    type: String,
  }],
  
  // Emergency Information
  emergencyContact: {
    type: String,
    default: "",
  },
  emergencyContactPhone: {
    type: String,
    default: "",
  },
  
  // Lifestyle Information
  smokingStatus: {
    type: String,
    enum: ["never", "current", "former", ""],
    default: "",
  },
  alcoholConsumption: {
    type: String,
    enum: ["never", "occasional", "moderate", "frequent", ""],
    default: "",
  },
  exerciseFrequency: {
    type: String,
    default: "",
  },
  
  // Medical History
  previousSurgeries: {
    type: String,
    default: "",
  },
  familyMedicalHistory: {
    type: String,
    default: "",
  },
  currentMedications: {
    type: String,
    default: "",
  },
  
  // Healthcare Providers
  primaryPhysician: {
    type: String,
    default: "",
  },
  primaryPhysicianPhone: {
    type: String,
    default: "",
  },
  preferredPharmacy: {
    type: String,
    default: "",
  },
  pharmacyPhone: {
    type: String,
    default: "",
  },
  
  // Insurance Information
  insuranceProvider: {
    type: String,
    default: "",
  },
  insurancePolicyNumber: {
    type: String,
    default: "",
  },
  
  // Medical Records & Tests
  lastPhysicalExam: {
    type: Date,
    default: null,
  },
  lastBloodWork: {
    type: Date,
    default: null,
  },
  vaccinations: [{
    type: String,
  }],
  
  // Mental Health & Wellness
  mentalHealthStatus: {
    type: String,
    default: "",
  },
  sleepPatterns: {
    type: String,
    default: "",
  },
  stressLevel: {
    type: String,
    enum: ["low", "moderate", "high", ""],
    default: "",
  },
  
  // Occupational Health
  occupationalHazards: [{
    type: String,
  }],
  
  // Reproductive Health
  pregnancyStatus: {
    type: String,
    default: "",
  },
  menstrualCycle: {
    type: String,
    default: "",
  },
  sexuallyActive: {
    type: String,
    enum: ["yes", "no", ""],
    default: "",
  },
  birthControlMethod: {
    type: String,
    default: "",
  },
  
  // Accessibility & Disabilities
  disability: {
    type: String,
    default: "",
  },
  assistiveDevices: [{
    type: String,
  }],
  
  // Legal & Advanced Care
  organDonor: {
    type: String,
    enum: ["yes", "no", ""],
    default: "",
  },
  advancedDirectives: {
    type: String,
    default: "",
  },
  
  // Vital Signs (Latest Readings)
  bloodPressure: {
    type: String,
    default: "",
  },
  heartRate: {
    type: String,
    default: "",
  },
  bodyTemperature: {
    type: String,
    default: "",
  },
  oxygenSaturation: {
    type: String,
    default: "",
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    default: "patient", // patient, doctor, nurse, etc.
  },
}, {
  timestamps: true,
});

// Pre-save middleware to update lastUpdated
medicalInfoSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-update middleware to update lastUpdated
medicalInfoSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

export const MedicalInfo = () => getPatientDB().model("MedicalInfo", medicalInfoSchema);
