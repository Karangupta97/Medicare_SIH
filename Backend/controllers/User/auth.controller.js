import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../../models/User/user.model.js";
import { generateTokenAndsendcookie } from "../../utils/generateTokenAndsendcookie.js";
import { uploadFile, uploadProfilePicture, getFileUrl, refreshProfilePictureUrl } from "../../services/s3.service.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../../services/emails/emails.js";
import generatePatientUMID from "../../UMID/patient.UMID.js";
import dotenv from "dotenv";

dotenv.config();

export const signup = async (req, res) => {
  const { email, password, name, lastname, photoURL } = req.body;
  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
    const UserModel = User();
    const userAlreadyExists = await UserModel.findOne({ email });
    console.log("userAlreadyExists", userAlreadyExists);
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // Generate a Unique UMID
    const userUMID = generatePatientUMID();

    // Create a new user
    const user = new UserModel({
      email,
      password: hashedPassword,
      name,
      lastname,
      umid: userUMID,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000, // 10 min expiry
      photoURL,
    });
    await user.save();

    let emailResult;
    try {
      emailResult = await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      await UserModel.deleteOne({ _id: user._id });
      throw emailError;
    }

    const token = await generateTokenAndsendcookie(res, user._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
      token,
      ...(process.env.NODE_ENV === "development" && emailResult?.id
        ? { verificationEmailId: emailResult.id }
        : {}),
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.code === "MAIL_PROVIDER_ERROR" ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message:
        statusCode === 503
          ? "Verification email service is temporarily unavailable. Please try again later."
          : error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  // 123456 ---- code
  const { code } = req.body;
  try {
    const UserModel = User();
    const user = await UserModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isverified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in VerifyEmail", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const UserModel = User();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = await generateTokenAndsendcookie(res, user._id);

    // Update last login
    user.lastLOGIN = new Date();
    await user.save();

    // Send response with token
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
      token,
    });
  } catch (error) {
    console.log("Error in login", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const UserModel = User();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hours

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    //send email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({
      success: true,
      message: "Reset password link sent to your email",
      ...(process.env.NODE_ENV === "development" && emailResult?.id
        ? { passwordResetEmailId: emailResult.id }
        : {}),
    });
  } catch (error) {
    console.log("Error in forgotPassword", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const UserModel = User();
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update user password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    await sendPasswordResetSuccessEmail(
      user.email,
      `${process.env.CLIENT_URL}/login`
    );
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error in resetPassword", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const UserModel = User();
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
      token: req.headers.authorization?.split(" ")[1],
    });
  } catch (error) {
    console.log("Error in checkAuth", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.userId to req.user.id to match the standard format
    const UserModel = User();
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isverified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    user.verificationToken = otp;
    user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    // Send email
    const emailResult = await sendVerificationEmail(user.email, otp);

    res.status(200).json({
      message: "Verification code resent to email",
      ...(process.env.NODE_ENV === "development" && emailResult?.id
        ? { verificationEmailId: emailResult.id }
        : {}),
    });
  } catch (err) {
    console.error('Error in resendOtp:', err);
    res.status(500).json({ message: "Failed to send verification code. Please try again." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      phone, 
      dob, 
      gender,
      bloodGroup,
    } = req.body;
    const userId = req.user.id;
    
    const updateFields = {};
    if (phone !== undefined) updateFields.phone = phone;
    if (dob !== undefined) updateFields.dob = dob;
    if (gender !== undefined) updateFields.gender = gender;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;

    // Note: Medical information is now handled by /api/medical-info/update endpoint
    // Note: Address updates are handled by a separate endpoint for proper validation

    // Handle profile photo upload
    if (req.file) {
      // Validate file presence and basic properties
      if (!req.file.buffer || !req.file.mimetype || !req.file.size) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file upload: Missing required file properties'
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(415).json({
          success: false,
          message: 'Invalid file type. Only JPEG, JPG and PNG images are allowed'
        });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (req.file.size > maxSize) {
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
      }

      try {
        // Upload to S3 with signed URL for profile pictures
        const { fileUrl, s3Key, expiresAt } = await uploadProfilePicture(req.file, userId, req.user.name);
        if (!fileUrl) {
          throw new Error('Failed to get file URL after upload');
        }
        
        // Store the signed URL, S3 key, and expiration info
        updateFields.photoURL = fileUrl;
        updateFields.photoS3Key = s3Key; // Store the S3 key for URL refresh
        updateFields.photoIsPermanent = true; // Mark this as a long-term URL (7 days)
        updateFields.photoURLExpiresAt = expiresAt; // Store expiration date
      } catch (uploadError) {
        console.error('Profile photo upload error:', {
          error: uploadError,
          userId,
          fileName: req.file.originalname
        });
        
        // Handle specific S3 errors
        if (uploadError.code === 'NoSuchBucket') {
          return res.status(500).json({
            success: false,
            message: 'Storage configuration error'
          });
        } else if (uploadError.code === 'AccessDenied') {
          return res.status(500).json({
            success: false,
            message: 'Storage access error'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile photo. Please try again later.'
        });
      }
    }

    // Update user in database
    const UserModel = User();
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error in updateProfile:', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again later.'
    });
  }
};

export const getUserData = async (req, res) => {
  try {
    const UserModel = User();
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if profile picture URL needs refreshing (if it expires within 24 hours)
    if (user.photoS3Key && user.photoURLExpiresAt) {
      const now = new Date();
      const expirationTime = new Date(user.photoURLExpiresAt);
      const timeUntilExpiration = expirationTime.getTime() - now.getTime();
      const hoursUntilExpiration = timeUntilExpiration / (1000 * 60 * 60);

      // Refresh URL if it expires within 24 hours
      if (hoursUntilExpiration < 24) {
        try {
          console.log('Refreshing profile picture URL for user:', req.user.id);
          const { fileUrl, expiresAt } = await refreshProfilePictureUrl(user.photoS3Key);
          
          // Update user with new URL and expiration
          const UserModel = User();
          await UserModel.findByIdAndUpdate(req.user.id, {
            photoURL: fileUrl,
            photoURLExpiresAt: expiresAt
          });
          
          user.photoURL = fileUrl;
          user.photoURLExpiresAt = expiresAt;
          
          console.log('Profile picture URL refreshed successfully');
        } catch (refreshError) {
          console.error('Error refreshing profile picture URL:', refreshError);
          // Continue with existing URL if refresh fails
        }
      }
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.log("Error in getUserData", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const UserModel = User();
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcryptjs.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

    // Update password in database
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Error in changePassword", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
