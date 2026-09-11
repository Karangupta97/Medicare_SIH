import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

const accessLogSchema = new mongoose.Schema(
  {
    accessedAt: {
      type: Date,
      default: Date.now,
    },
    action: {
      type: String,
      enum: ["viewed", "downloaded", "noted"],
      default: "viewed",
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["comment", "medication", "prescription", "general"],
      default: "general",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const reportShareSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorId: {
      type: String,
      required: true,
      trim: true,
    },
    doctorObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    reportIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        required: true,
      },
    ],
    accessDuration: {
      type: String,
      enum: ["24h", "7d", "30d", "custom", "indefinite"],
      default: "7d",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
    accessLog: [accessLogSchema],
    notes: [noteSchema],
    prescriptionUrls: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
reportShareSchema.index({ patientId: 1, status: 1 });
reportShareSchema.index({ doctorId: 1, status: 1 });
reportShareSchema.index({ doctorObjectId: 1, status: 1 });
reportShareSchema.index({ expiresAt: 1 }, { sparse: true });

export const ReportShare = () =>
  getPatientDB().model("ReportShare", reportShareSchema);
