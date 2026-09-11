import jwt from "jsonwebtoken";
import { Doctor } from "../../models/Doctor/doctor.model.js";
import crypto from "crypto";

// Generate JWT token for doctor
const generateDoctorToken = (doctorId) => {
  return jwt.sign(
    { id: doctorId, role: "doctor" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" } // Token expires in 8 hours
  );
};

// Set secure HTTP-only cookie with token
const sendSecureCookie = (res, token) => {
  res.cookie("doctor_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });
};

// Doctor signup
export const doctorSignup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      specialization,
      experience
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if doctor already exists with this email
    const DoctorModel = Doctor();
    const existingDoctor = await DoctorModel.findOne({ email });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Generate unique doctor ID
    const doctorId = await DoctorModel.generateDoctorId();

    // Create new doctor – immediately approved, no manual verification needed
    const newDoctor = new DoctorModel({
      fullName,
      email,
      password, // Will be hashed by pre-save hook
      phone,
      specialization: specialization || "",
      experience: experience || 0,
      doctorId
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor registration successful. You can now log in.",
      doctorId: newDoctor.doctorId
    });
  } catch (error) {
    console.error("Error in doctorSignup:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Doctor login
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }
    
    // Find the doctor by email
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findOne({ email });
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Verify password
    const isPasswordValid = await doctor.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Generate authentication token
    const token = generateDoctorToken(doctor._id);
    
    // Set secure HTTP-only cookie
    sendSecureCookie(res, token);
    
    // Update last login time
    doctor.lastLogin = new Date();
    await doctor.save();
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        doctorId: doctor.doctorId,
        specialization: doctor.specialization,
        photoURL: doctor.photoURL
      },
      token
    });
    
  } catch (error) {
    console.error("Error in doctorLogin:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Doctor logout
export const doctorLogout = async (req, res) => {
  try {
    // Clear the doctor token cookie
    res.clearCookie("doctor_token");
    
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Error in doctorLogout:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get doctor's profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.doctor.id; // From auth middleware
    
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findById(doctorId).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    res.status(200).json({
      success: true,
      doctor
    });
    
  } catch (error) {
    console.error("Error in getDoctorProfile:", error);
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
    
    // Find doctor by email
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findOne({ email });
    
    if (!doctor) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: "If your email is registered, a password reset link will be sent"
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and store in database
    doctor.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    doctor.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    await doctor.save();
    
    // Create reset URL
    const resetURL = `${process.env.CLIENT_URL}/doctor/reset-password/${resetToken}`;
    
    // Send password reset email
    // Implementation will be added in emailService
    
    res.status(200).json({
      success: true,
      message: "Password reset email sent"
    });
    
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Verify authentication status
export const checkDoctorAuth = async (req, res) => {
  try {
    const doctorId = req.doctor.id; // From auth middleware
    
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findById(doctorId).select('-password');
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed"
      });
    }
    
    res.status(200).json({
      success: true,
      isAuthenticated: true,
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        doctorId: doctor.doctorId,
        specialization: doctor.specialization,
        photoURL: doctor.photoURL
      }
    });
    
  } catch (error) {
    console.error("Error in checkDoctorAuth:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
}; 