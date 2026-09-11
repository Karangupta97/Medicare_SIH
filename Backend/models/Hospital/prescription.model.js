import mongoose from "mongoose";
import { getDoctorDB } from "../../DB/connections.js";

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  }
});

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientUMID: {
    type: String,
    required: true,
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  doctor: {
    type: String,
    trim: true
  },
  hospitalName: {
    type: String,
    default: "Medicare Hospital",
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  medications: [medicationSchema],
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Prescription = () => getDoctorDB().model("Prescription", prescriptionSchema);

export { Prescription };