import mongoose from "mongoose";
import { getFeedbackDB } from "../DB/connections.js";

const reviewSchema = new mongoose.Schema(
  {
    reviewType: {
      type: String,
      enum: ['detailed', 'normal'],
      default: 'normal'
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['patient', 'doctor', 'hospital-staff', 'healthcare-admin', 'medical-student', 'medical-store', 'other']
    },
    review: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    // Role-specific information stored in a single field
    roleInfo: {
      // For doctor, hospital-staff, healthcare-admin
      institutionName: String,
      institutionLocation: String,
      // For medical-student
      collegeName: String,
      collegeLocation: String,
      // For medical-store
      storeName: String,
      storeLocation: String,
      // For other
      additionalInfo: String
    },
    additionalComments: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual fields for review messages
reviewSchema.virtual('reviewMessage').get(function() {
  const roleInfo = this.getRoleSpecificInfo();
  return `${this.reviewType === 'detailed' ? 'Detailed ' : ''}Review from ${this.isAnonymous ? 'Anonymous' : this.name} (${this.role})${roleInfo ? ` about ${roleInfo}` : ''}`;
});

// Add virtual field for role-specific details
reviewSchema.virtual('roleDetails').get(function() {
  if (!this.roleInfo) return null;
  
  switch(this.role) {
    case 'doctor':
    case 'hospital-staff':
    case 'healthcare-admin':
      return this.roleInfo.institutionName ? {
        name: this.roleInfo.institutionName,
        location: this.roleInfo.institutionLocation
      } : null;
    case 'medical-student':
      return this.roleInfo.collegeName ? {
        name: this.roleInfo.collegeName,
        location: this.roleInfo.collegeLocation
      } : null;
    case 'medical-store':
      return this.roleInfo.storeName ? {
        name: this.roleInfo.storeName,
        location: this.roleInfo.storeLocation
      } : null;
    case 'other':
      return this.roleInfo.additionalInfo ? {
        additionalInfo: this.roleInfo.additionalInfo
      } : null;
    default:
      return null;
  }
});

// Helper method for review message
reviewSchema.methods.getRoleSpecificInfo = function() {
  if (!this.roleInfo) return null;
  
  switch(this.role) {
    case 'doctor':
    case 'hospital-staff':
    case 'healthcare-admin':
      return this.roleInfo.institutionName ? 
        `${this.roleInfo.institutionName} in ${this.roleInfo.institutionLocation}` : null;
    case 'medical-student':
      return this.roleInfo.collegeName ? 
        `${this.roleInfo.collegeName} in ${this.roleInfo.collegeLocation}` : null;
    case 'medical-store':
      return this.roleInfo.storeName ? 
        `${this.roleInfo.storeName} in ${this.roleInfo.storeLocation}` : null;
    case 'other':
      return this.roleInfo.additionalInfo;
    default:
      return null;
  }
};

// Add virtual field for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Add virtual field for rating display
reviewSchema.virtual('ratingDisplay').get(function() {
  return `${this.rating} ${this.rating === 1 ? 'star' : 'stars'}`;
});

const Review = () => getFeedbackDB().model("Review", reviewSchema);

export default Review; 