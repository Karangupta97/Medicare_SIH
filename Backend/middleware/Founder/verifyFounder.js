import jwt from "jsonwebtoken";
import { Founder } from "../../models/Founder/founder.model.js";

// Middleware to verify founder token and authorization
export const verifyFounder = async (req, res, next) => {
  try {
    // Get token from authorization header or cookie
    let token = req.cookies.founder_token;

    // Check for token in Authorization header as fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again."
      });
    }

    // Check if the token is for a founder
    if (decoded.role !== "founder") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Founder privileges required."
      });
    }

    // Check if the founder still exists in the database
    const FounderModel = Founder();
    const founder = await FounderModel.findById(decoded.id);
    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Founder account not found."
      });
    }

    // Check if founder is active
    if (!founder.isActive) {
      return res.status(403).json({
        success: false,
        message: "Founder account is deactivated."
      });
    }

    // Attach founder information to request
    req.user = {
      id: founder._id,
      email: founder.email,
      name: founder.name,
      role: "founder"
    };

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in verifyFounder middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication"
    });
  }
}; 