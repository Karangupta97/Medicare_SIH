import { User } from "../../models/User/user.model.js";
import { Prescription } from "../../models/Hospital/prescription.model.js";

// Get all prescriptions for the logged-in user
export const getUserPrescriptions = async (req, res) => {
  try {
    // Find prescriptions where the patient ID matches the logged-in user's ID
    const PrescriptionModel = Prescription();
    const prescriptions = await PrescriptionModel.find({ patientId: req.user.id })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    console.error("Error fetching user prescriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message
    });
  }
};

// Get a specific prescription by ID for the logged-in user
export const getUserPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    // Find the prescription by ID
    const PrescriptionModel = Prescription();
    const prescription = await PrescriptionModel.findById(prescriptionId);
    
    // If prescription not found, return 404
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }
    
    // Make sure the prescription belongs to the logged-in user
    if (prescription.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this prescription"
      });
    }
    
    return res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message
    });
  }
};

// Get user's digital prescription count
export const getPrescriptionCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count prescriptions for this user
    const PrescriptionModel = Prescription();
    const count = await PrescriptionModel.countDocuments({ patient: userId });
    
    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error("Error fetching prescription count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription count",
      error: error.message
    });
  }
};

// Get user profile by UMID (for QR code scanning)
export const getUserProfileByUmid = async (req, res) => {
  try {
    const { umid } = req.params;
    
    if (!umid) {
      return res.status(400).json({
        success: false,
        message: "Medicare ID (UMID) is required"
      });
    }
    
    // Find user by UMID
    const UserModel = User();
    const user = await UserModel.findOne({ umid }).select('-password -tokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided Medicare ID"
      });
    }
    
    // Determine if this is an authenticated request
    const isAuthenticated = req.user && req.user.id;
    
    // Return the user profile with appropriate fields based on authentication
    if (isAuthenticated) {
      // Full profile for authenticated users
      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          umid: user.umid,
          verified: user.verified,
          planType: user.planType,
          phone: user.phone,
          address: user.address,
          createdAt: user.createdAt
        }
      });
    } else {
      // Limited profile for public users - only return non-sensitive information
      return res.status(200).json({
        success: true,
        user: {
          name: user.name,
          photoURL: user.photoURL,
          umid: user.umid,
          verified: user.verified,
          planType: user.planType
        }
      });
    }
  } catch (error) {
    console.error("Error fetching user profile by UMID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message
    });
  }
};