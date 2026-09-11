import { Doctor } from "../../../../models/Doctor/doctor.model.js";
import { sendDoctorApprovalEmail, sendDoctorRejectionEmail } from "../../../../services/emails/emails.js";

// Check staff permissions for doctor verification
const checkStaffPermissions = (req, res) => {
  // If we've already verified access in the middleware, proceed
  if (req.doctorVerificationAccessGranted) {
    return true;
  }
  
  // Access should be granted to any authenticated staff member
  if (req.staff) {
    return true;
  }
  
  res.status(403).json({
    success: false,
    message: "Access denied. Staff authentication required."
  });
  return false;
};

// Get all doctors with pending verification
export const getPendingDoctors = async (req, res) => {
  try {
    // Check if staff has permission
    if (!checkStaffPermissions(req, res)) {
      return;
    }
    
    const DoctorModel = Doctor();
    const pendingDoctors = await DoctorModel.find({ isVerified: "pending" })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      doctors: pendingDoctors,
      data: pendingDoctors // Keep for backward compatibility
    });
  } catch (error) {
    console.error("Error in getPendingDoctors:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all verified doctors (approved/rejected)
export const getVerifiedDoctors = async (req, res) => {
  try {
    // Check if staff has permission
    if (!checkStaffPermissions(req, res)) {
      return;
    }
    
    const DoctorModel = Doctor();
    const verifiedDoctors = await DoctorModel.find({ 
      isVerified: { $in: ["approved", "rejected"] } 
    })
      .select('-password')
      .sort({ verifiedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: verifiedDoctors.length,
      doctors: verifiedDoctors,
      data: verifiedDoctors // Keep for backward compatibility
    });
  } catch (error) {
    console.error("Error in getVerifiedDoctors:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get doctor details by ID
export const getDoctorDetails = async (req, res) => {
  try {
    // Check if staff has permission
    if (!checkStaffPermissions(req, res)) {
      return;
    }
    
    const { doctorId } = req.params;
    
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findById(doctorId)
      .select('-password')
      .populate('verifiedBy', 'name email staffId');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    res.status(200).json({
      success: true,
      doctor: doctor,
      data: doctor // Keep for backward compatibility
    });
  } catch (error) {
    console.error("Error in getDoctorDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Approve doctor registration
export const approveDoctor = async (req, res) => {
  try {
    // Check if staff has permission
    if (!checkStaffPermissions(req, res)) {
      return;
    }
    
    const { doctorId } = req.params;
    
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    // Check if already verified
    if (doctor.isVerified !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Doctor verification is already ${doctor.isVerified}`
      });
    }
    
    // Update doctor status to approved
    doctor.isVerified = "approved";
    doctor.verifiedBy = req.staff.id; // Staff ID from middleware
    doctor.verifiedAt = new Date();
    
    await doctor.save();
    
    // Send approval email to doctor
    try {
      await sendDoctorApprovalEmail(doctor.email, doctor.fullName);
    } catch (emailError) {
      console.error("Error sending doctor approval email:", emailError);
      // Continue even if email fails
    }
    
    // Return updated doctor data in response
    const DoctorModel2 = Doctor();
    const updatedDoctor = await DoctorModel2.findById(doctorId)
      .select('-password')
      .populate('verifiedBy', 'name email staffId');
      
    res.status(200).json({
      success: true,
      message: "Doctor verification approved successfully",
      doctor: updatedDoctor,
      data: updatedDoctor // Keep for backward compatibility
    });
  } catch (error) {
    console.error("Error in approveDoctor:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Reject doctor registration
export const rejectDoctor = async (req, res) => {
  try {
    // Check if staff has permission
    if (!checkStaffPermissions(req, res)) {
      return;
    }
    
    const { doctorId } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }
    
    const DoctorModel3 = Doctor();
    const doctor = await DoctorModel3.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    // Check if already verified
    if (doctor.isVerified !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Doctor verification is already ${doctor.isVerified}`
      });
    }
    
    // Update doctor status to rejected
    doctor.isVerified = "rejected";
    doctor.rejectionReason = rejectionReason;
    doctor.verifiedBy = req.staff.id; // Staff ID from middleware
    doctor.verifiedAt = new Date();
    
    await doctor.save();
    
    // Send rejection email to doctor
    try {
      await sendDoctorRejectionEmail(doctor.email, doctor.fullName, rejectionReason);
    } catch (emailError) {
      console.error("Error sending doctor rejection email:", emailError);
      // Continue even if email fails
    }
    
    // Return updated doctor data in response
    const DoctorModel4 = Doctor();
    const updatedDoctor = await DoctorModel4.findById(doctorId)
      .select('-password')
      .populate('verifiedBy', 'name email staffId');
    
    res.status(200).json({
      success: true,
      message: "Doctor verification rejected successfully",
      doctor: updatedDoctor,
      data: updatedDoctor // Keep for backward compatibility
    });
  } catch (error) {
    console.error("Error in rejectDoctor:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}; 