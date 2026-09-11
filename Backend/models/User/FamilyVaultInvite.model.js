import mongoose from "mongoose";
import { getPatientDB } from "../../DB/connections.js";

const familyVaultInviteSchema = new mongoose.Schema({
  vaultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FamilyVault",
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  inviteeUmid: {
    type: String,
    required: true,
    trim: true,
  },
  inviteeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  relationship: {
    type: String,
    enum: ["child", "parent", "spouse", "sibling", "dependent", "other"],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "expired", "cancelled"],
    default: "pending",
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true,
});

// Index for quick lookups
familyVaultInviteSchema.index({ vaultId: 1, status: 1 });
familyVaultInviteSchema.index({ inviteeUmid: 1, status: 1 });

export const FamilyVaultInvite = () => getPatientDB().model("FamilyVaultInvite", familyVaultInviteSchema);
