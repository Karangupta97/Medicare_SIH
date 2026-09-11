import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Founder } from "../../models/Founder/founder.model.js";
import { User } from "../../models/User/user.model.js";
import { sendFounderLoginOTP, sendFounderSensitiveActionOTP } from "../../services/emails/emails.js";

// JWT token generation for founder
const generateFounderToken = (founderId) => {
  return jwt.sign(
    { id: founderId, role: "founder" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Short expiry for security
  );
};

// Send secure HTTP-only cookie
const sendSecureCookie = (res, token) => {
  res.cookie("founder_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

// Get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress || 
         'Unknown';
};

// Founder Login - Step 1: Email + Password, returns temporary token
export const founderLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }
    
    // Find the founder by email
    const FounderModel = Founder();
    const founder = await FounderModel.findOne({ email });
    
    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Verify password
    const isPasswordValid = await founder.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Generate OTP for 2FA
    const otp = founder.generateOTP();
    await founder.save();
    
    // Send OTP to founder's email
    const clientIp = getClientIp(req);
    await sendFounderLoginOTP(founder.email, otp, clientIp);
    
    // Generate temporary token for next step
    const tempToken = jwt.sign(
      { id: founder._id, step: "otp_required" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      tempToken
    });
    
  } catch (error) {
    console.error("Error in founderLogin:", error);
    const statusCode = error.code === "MAIL_PROVIDER_ERROR" ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503
        ? "Verification email service is temporarily unavailable. Please try again later."
        : "Server error"
    });
  }
};

// Founder Login - Step 2: Verify OTP
export const verifyFounderOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const tempToken = req.headers.authorization?.split(" ")[1];
    
    if (!otp || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "OTP and temporary token are required"
      });
    }
    
    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Verification session expired, please login again"
      });
    }
    
    if (decoded.step !== "otp_required") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication flow"
      });
    }
    
    // Find founder
    const FounderModel2 = Founder();
    const founder = await FounderModel2.findById(decoded.id);
    
    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Founder not found"
      });
    }
    
    // Verify OTP
    if (!founder.verifyOTP(otp)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }
    
    // Clear OTP
    founder.otpToken = null;
    founder.otpTokenExpiresAt = null;
    
    // Update last login
    founder.lastLogin = new Date();
    await founder.save();
    
    // Generate authentication token
    const token = generateFounderToken(founder._id);
    
    // Set secure HTTP-only cookie
    sendSecureCookie(res, token);
    
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      founder: {
        id: founder._id,
        name: founder.name,
        email: founder.email,
        role: founder.role
      },
      token
    });
    
  } catch (error) {
    console.error("Error in verifyFounderOTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Founder Login - Resend OTP (uses the existing tempToken to re-identify the founder)
export const resendFounderOTP = async (req, res) => {
  try {
    const tempToken = req.headers.authorization?.split(" ")[1];

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: "Temporary token is required"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Verification session expired, please login again"
      });
    }

    if (decoded.step !== "otp_required") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication flow"
      });
    }

    const FounderModel = Founder();
    const founder = await FounderModel.findById(decoded.id);

    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Founder not found"
      });
    }

    // Generate a fresh OTP
    const otp = founder.generateOTP();
    await founder.save();

    const clientIp = getClientIp(req);
    await sendFounderLoginOTP(founder.email, otp, clientIp);

    res.status(200).json({
      success: true,
      message: "OTP resent to your email"
    });
  } catch (error) {
    console.error("Error in resendFounderOTP:", error);
    const statusCode = error.code === "MAIL_PROVIDER_ERROR" ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503
        ? "Verification email service is temporarily unavailable. Please try again later."
        : "Server error"
    });
  }
};

// Check Auth - verify current founder session
export const checkFounderAuth = async (req, res) => {
  try {
    const FounderModel = Founder();
    const founder = await FounderModel.findById(req.user.id).select("-password -otpToken -otpTokenExpiresAt -resetPasswordToken -resetPasswordExpiresAt -twoFactorSecret");

    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Founder not found"
      });
    }

    res.status(200).json({
      success: true,
      founder: {
        id: founder._id,
        name: founder.name,
        email: founder.email,
        role: founder.role,
        photoURL: founder.photoURL,
        isActive: founder.isActive,
        lastLogin: founder.lastLogin
      }
    });
  } catch (error) {
    console.error("Error in checkFounderAuth:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Founder Logout
export const founderLogout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("founder_token");
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error in founderLogout:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    // Extract system statistics
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    
    // System health (placeholder - in a real app, this would come from monitoring systems)
    const systemHealth = {
      uptime: "99.99%",
      cpuUsage: "32%",
      memoryUsage: "45%",
      storageUsage: "68%",
      healthScore: "98.7%"
    };
    
    // Recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt');
    
    // System alerts (placeholder - in a real app, these would come from monitoring systems)
    const systemAlerts = [
      {
        type: "security",
        severity: "high",
        message: "3 failed login attempts detected from IP 192.168.1.45",
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        type: "update",
        severity: "info",
        message: "New version 2.4.1 available for deployment",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAdmins,
          systemHealth
        },
        recentUsers,
        systemAlerts
      }
    });
    
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Request OTP for sensitive actions
export const requestSensitiveActionOTP = async (req, res) => {
  try {
    const { actionType, actionDetails } = req.body;
    const founderId = req.user.id;
    
    // Find founder
    const FounderModel3 = Founder();
    const founder = await FounderModel3.findById(founderId);
    
    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Founder not found"
      });
    }
    
    // Generate OTP
    const otp = founder.generateOTP();
    await founder.save();
    
    // Send OTP for sensitive action
    const clientIp = getClientIp(req);
    await sendFounderSensitiveActionOTP(
      founder.email, 
      otp, 
      actionType, 
      actionDetails,
      clientIp
    );
    
    res.status(200).json({
      success: true,
      message: "OTP sent for sensitive action verification"
    });
    
  } catch (error) {
    console.error("Error in requestSensitiveActionOTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Verify OTP for sensitive actions
export const verifySensitiveActionOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const founderId = req.user.id;
    
    // Find founder
    const FounderModel4 = Founder();
    const founder = await FounderModel4.findById(founderId);
    
    if (!founder) {
      return res.status(401).json({
        success: false,
        message: "Founder not found"
      });
    }
    
    // Verify OTP
    if (!founder.verifyOTP(otp)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }
    
    // Clear OTP
    founder.otpToken = null;
    founder.otpTokenExpiresAt = null;
    await founder.save();
    
    res.status(200).json({
      success: true,
      message: "Action verified successfully"
    });
    
  } catch (error) {
    console.error("Error in verifySensitiveActionOTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}; 