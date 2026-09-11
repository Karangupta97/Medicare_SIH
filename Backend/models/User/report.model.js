import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    reportType: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["medical", "lab", "prescription", "other"],
      default: "medical",
    },
    tags: [{
      type: String,
    }],
    /** When true, the report is private and cannot be viewed by doctors except via Emergency Folder. */
    isPrivate: {
      type: Boolean,
      default: true,
    },
    /** When true, this report is included in the patient's Emergency Folder (intended for emergency-only public disclosure). */
    inEmergencyFolder: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = () => getPatientDB().model("Report", reportSchema);