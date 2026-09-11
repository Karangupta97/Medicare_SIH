import mongoose from "mongoose";
import { getManagementDB } from "../../../DB/connections.js";

// Sub-schema for audit log entries
const auditLogEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['Team Created', 'Member Added', 'Member Removed', 'Owner Added', 'Owner Removed', 'Team Updated', 'Label Added', 'Label Removed']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address']
  },
  description: {
    type: String,
    trim: true
  },
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  labels: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  auditLog: [auditLogEntrySchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to add an audit log entry
teamSchema.methods.addAuditLogEntry = function(action, user, userName, details) {
  this.auditLog.push({
    action,
    user,
    userName,
    details,
    timestamp: new Date()
  });
};

// Add owner validation - at least one owner is required
teamSchema.pre('save', function(next) {
  if (this.owners.length === 0) {
    return next(new Error('At least one owner is required'));
  }
  next();
});

// Remove the medicares.in email validation - allow any valid email
teamSchema.path('email').validate(function(value) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(value);
}, 'Please enter a valid email address');

export const Team = () => getManagementDB().model('Team', teamSchema); 