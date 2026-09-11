import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Staff } from "../../../models/Admin/Staff/staff.model.js";

// Generate JWT token for staff
const generateStaffToken = (staffId, role) => {
  return jwt.sign(
    { id: staffId, role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" } // Token expires in 8 hours
  );
};

// Set secure HTTP-only cookie with token
const sendSecureCookie = (res, token) => {
  res.cookie("staff_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });
};

// Staff login
export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }
    
    // Find the staff by email
    const staff = await Staff.findOne({ email });
    
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Check if staff is active
    if (!staff.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator."
      });
    }
    
    // Verify password
    const isPasswordValid = await staff.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Generate authentication token
    const token = generateStaffToken(staff._id, staff.role);
    
    // Set secure HTTP-only cookie
    sendSecureCookie(res, token);
    
    // Update last login time
    staff.lastLogin = new Date();
    await staff.save();
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        staffId: staff.staffId,
        role: staff.role,
        isFirstLogin: staff.isFirstLogin,
        photoURL: staff.photoURL
      },
      token
    });
    
  } catch (error) {
    console.error("Error in staffLogin:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Staff logout
export const staffLogout = async (req, res) => {
  try {
    // Clear the staff token cookie
    res.clearCookie("staff_token");
    
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Error in staffLogout:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Change password on first login or when needed
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staffId = req.staff.id; // From auth middleware
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password"
      });
    }
    
    // Find staff
    const staff = await Staff.findById(staffId);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }
    
    // Verify current password
    const isPasswordValid = await staff.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Update to new password
    staff.password = newPassword; // Will be hashed by pre-save hook
    
    // If it's first login, update the flag
    if (staff.isFirstLogin) {
      staff.isFirstLogin = false;
    }
    
    await staff.save();
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
    
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email"
      });
    }
    
    // Find staff by email
    const staff = await Staff.findOne({ email });
    
    if (!staff) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: "If your email is registered, a password reset link will be sent"
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and store in database
    staff.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    staff.resetPasswordExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    await staff.save();
    
    // TODO: Send reset password email with resetToken to staff.email
    
    res.status(200).json({
      success: true,
      message: "If your email is registered, a password reset link will be sent"
    });
    
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Check staff authentication status
export const checkStaffAuth = async (req, res) => {
  try {
    const staffId = req.staff.id; // From auth middleware
    
    // Find staff by ID (excluding password field)
    const staff = await Staff.findById(staffId).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }
    
    res.status(200).json({
      success: true,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        staffId: staff.staffId,
        role: staff.role,
        isFirstLogin: staff.isFirstLogin,
        photoURL: staff.photoURL
      }
    });
    
  } catch (error) {
    console.error("Error in checkStaffAuth:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}; 