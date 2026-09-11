import { Staff } from "../../../models/Admin/Staff/staff.model.js";
import { generatePassword } from "../../../utils/passwordGenerator.js";
import { sendStaffWelcomeEmail } from "../../../services/emails/emails.js";

// Add a new staff member
export const addStaff = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const founderUser = req.user; // From auth middleware

    // Check authorization (only founder or manager)
    if (founderUser.role !== 'founder' && founderUser.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders and managers can add staff members",
      });
    }

    // Check if staff with email already exists
    const StaffModel = Staff();
    const existingStaff = await StaffModel.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "A staff member with this email already exists",
      });
    }

    // Generate a temporary password and staff ID
    const temporaryPassword = generatePassword();
    const staffId = await StaffModel.generateStaffId();

    // Create the new staff member
    const newStaff = await Staff.create({
      name,
      email,
      phone,
      staffId,
      password: temporaryPassword, // Will be hashed by pre-save hook
      createdBy: founderUser._id,
      role: "staff", // Default role
    });

    // Send welcome email with login details
    await sendStaffWelcomeEmail(
      email,
      name,
      temporaryPassword,
      staffId
    );

    res.status(201).json({
      success: true,
      message: "Staff member added successfully. Login details sent via email.",
      staff: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        staffId: newStaff.staffId,
        role: newStaff.role,
        createdAt: newStaff.createdAt
      }
    });
  } catch (error) {
    console.error("Error adding staff member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add staff member",
      error: error.message,
    });
  }
};

// List all staff members with pagination and search
export const listStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const founderUser = req.user; // From auth middleware

    // Check authorization
    if (founderUser.role !== 'founder' && founderUser.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders and managers can view staff members",
      });
    }

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { staffId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Execute paginated query
    const staffMembers = await Staff.find(query)
      .select('name email phone staffId role isActive createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Get total count
    const totalCount = await Staff.countDocuments(query);

    res.status(200).json({
      success: true,
      staff: staffMembers,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error listing staff members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve staff members",
      error: error.message,
    });
  }
};

// Get a specific staff member by ID
export const getStaffById = async (req, res) => {
  try {
    const { staffId } = req.params;
    const founderUser = req.user; // From auth middleware

    // Check authorization
    if (founderUser.role !== 'founder' && founderUser.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders and managers can view staff details",
      });
    }

    const staff = await Staff.findById(staffId)
      .select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    console.error("Error retrieving staff member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve staff member",
      error: error.message,
    });
  }
};

// Update a staff member
export const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, email, phone, role, isActive } = req.body;
    const founderUser = req.user; // From auth middleware

    // Check authorization
    if (founderUser.role !== 'founder' && founderUser.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders and managers can update staff",
      });
    }

    // Only founders can change role to manager
    if (role === 'manager' && founderUser.role !== 'founder') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders can assign manager roles",
      });
    }

    // Find staff member
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Check if email is being changed and already exists
    if (email !== staff.email) {
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another staff member",
        });
      }
    }

    // Update staff member
    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      {
        name,
        email,
        phone,
        role,
        isActive,
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      staff: updatedStaff
    });
  } catch (error) {
    console.error("Error updating staff member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update staff member",
      error: error.message,
    });
  }
};

// Reset staff password
export const resetStaffPassword = async (req, res) => {
  try {
    const { staffId } = req.params;
    const founderUser = req.user; // From auth middleware

    // Check authorization
    if (founderUser.role !== 'founder' && founderUser.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders and managers can reset staff passwords",
      });
    }

    // Find staff member
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Generate new temporary password
    const temporaryPassword = generatePassword();

    // Update staff password and set first login flag
    staff.password = temporaryPassword;
    staff.isFirstLogin = true;
    await staff.save();

    // Send email with new password
    await sendStaffPasswordResetEmail(
      staff.email,
      staff.name,
      temporaryPassword
    );

    res.status(200).json({
      success: true,
      message: "Staff password reset successfully. New password sent via email.",
    });
  } catch (error) {
    console.error("Error resetting staff password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset staff password",
      error: error.message,
    });
  }
};

// Delete a staff member
export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const founderUser = req.user; // From auth middleware

    // Check authorization (only founder can delete)
    if (founderUser.role !== 'founder') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only founders can delete staff members",
      });
    }

    // Find and delete staff
    const staff = await Staff.findByIdAndDelete(staffId);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete staff member",
      error: error.message,
    });
  }
}; 