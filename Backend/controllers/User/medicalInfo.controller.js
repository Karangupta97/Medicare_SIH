import { MedicalInfo } from "../../models/User/medicalInfo.model.js";
import { User } from "../../models/User/user.model.js";

// Create or update medical information
export const updateMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const medicalData = req.body;

    // Remove userId from the data if it exists (for security)
    delete medicalData.userId;

    const MedicalInfoModel = MedicalInfo();
    const UserModel = User();

    // Check if medical info already exists for this user
    let medicalInfo = await MedicalInfoModel.findOne({ userId });

    if (medicalInfo) {
      // Update existing medical information
      medicalInfo = await MedicalInfoModel.findOneAndUpdate(
        { userId },
        { $set: { ...medicalData, userId } },
        { new: true, runValidators: true }
      );
    } else {
      // Create new medical information
      medicalInfo = new MedicalInfoModel({
        ...medicalData,
        userId
      });
      await medicalInfo.save();

      // Update user to reference the medical info
      await UserModel.findByIdAndUpdate(userId, {
        medicalInfo: medicalInfo._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical information updated successfully',
      medicalInfo
    });

  } catch (error) {
    console.error('Error in updateMedicalInfo:', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update medical information. Please try again later.'
    });
  }
};

// Get medical information for a user
export const getMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const MedicalInfoModel = MedicalInfo();
    const medicalInfo = await MedicalInfoModel.findOne({ userId });

    res.status(200).json({
      success: true,
      medicalInfo: medicalInfo || null
    });

  } catch (error) {
    console.error('Error in getMedicalInfo:', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical information. Please try again later.'
    });
  }
};

// Delete medical information (for privacy/GDPR compliance)
export const deleteMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const MedicalInfoModel = MedicalInfo();
    const UserModel = User();

    // Delete medical information
    const deleted = await MedicalInfoModel.findOneAndDelete({ userId });

    if (deleted) {
      // Remove reference from user
      await UserModel.findByIdAndUpdate(userId, {
        medicalInfo: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical information deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteMedicalInfo:', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete medical information. Please try again later.'
    });
  }
};

// Get medical information by patient UMID (for healthcare providers)
export const getMedicalInfoByUMID = async (req, res) => {
  try {
    const { umid } = req.params;
    
    const UserModel = User();
    const MedicalInfoModel = MedicalInfo();

    // Find user by UMID
    const user = await UserModel.findOne({ umid }).select('_id name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get medical information
    const medicalInfo = await MedicalInfoModel.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      patient: {
        id: user._id,
        name: user.name,
        email: user.email,
        umid
      },
      medicalInfo: medicalInfo || null
    });

  } catch (error) {
    console.error('Error in getMedicalInfoByUMID:', {
      error: error.message,
      umid: req.params?.umid,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient medical information. Please try again later.'
    });
  }
};
