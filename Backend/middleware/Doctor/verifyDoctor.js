import jwt from "jsonwebtoken";
import { Doctor } from "../../models/Doctor/doctor.model.js";

// Middleware to verify doctor authentication
export const verifyDoctor = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    let token = req.cookies.doctor_token;
    
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
    
    // Find doctor by ID
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findById(decoded.id).select('-password');
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }
    
    // Add doctor object to request
    req.doctor = {
      id: doctor._id,
      role: "doctor"
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
    }
    
    console.error("Error in verifyDoctor middleware:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please log in again."
    });
  }
}; 