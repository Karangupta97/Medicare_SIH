import jwt from "jsonwebtoken";
import { Staff } from "../../../models/Admin/Staff/staff.model.js";

// Middleware to verify staff authentication
export const verifyStaff = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    let token = req.cookies.staff_token;
    
    // If no token in cookie, check authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find staff by ID
    const StaffModel = Staff();
    const staff = await StaffModel.findById(decoded.id).select('-password');
    
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }
    
    // Check if staff is active
    if (!staff.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator."
      });
    }
    
    // Add staff object to request
    req.staff = {
      id: staff._id,
      role: staff.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
    }
    
    console.error("Error in verifyStaff middleware:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again."
    });
  }
};

// Middleware to check if staff has manager role
export const verifyManager = async (req, res, next) => {
  try {
    // First verify that user is authenticated
    await verifyStaff(req, res, () => {
      // Check if staff role is manager or founder
      if (req.staff.role !== 'manager' && req.staff.role !== 'founder') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Manager role required."
        });
      }
      
      next();
    });
  } catch (error) {
    console.error("Error in verifyManager middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Middleware specifically for doctor verification - can be modified to include more roles
export const verifyDoctorVerificationAccess = (req, res, next) => {
  // Check if the request is from the doctor verification routes
  if (req.originalUrl.includes('/doctor-verification')) {
    // Staff may need 'founder' privileges for doctor verification in some places
    // For now, if they've passed the verifyStaff middleware, we'll allow them
    
    // Check the staff role
    const staffRole = req.staff?.role || 'staff';
    
    console.log(`Staff with role '${staffRole}' accessing doctor verification endpoint: ${req.originalUrl}`);
    
    // Add a flag to indicate this has been verified for doctor access
    // This can help identify if something later in the chain is overriding
    req.doctorVerificationAccessGranted = true;
    
    // Proceed regardless of role
    return next();
  }
  next();
}; 