import { Team } from '../../../models/Admin/Team/team.model.js';
import { Staff } from '../../../models/Admin/Staff/staff.model.js';
import { Founder } from '../../../models/Founder/founder.model.js';

// Create a new team
export const createTeam = async (req, res) => {
  try {
    const { name, email, description, owners, members = [], labels = [] } = req.body;
    const createdBy = req.user.id; // Use id instead of _id
    const userRole = req.user.role;

    // Convert string IDs to ObjectIDs if needed
    const ownerIds = owners.map(owner => typeof owner === 'object' ? owner.id || owner._id : owner);
    const memberIds = members.map(member => typeof member === 'object' ? member.id || member._id : member);

    // Get creator details for audit log - handle both Staff and Founder
    let creatorName;
    
    if (userRole === 'founder') {
      // If creator is a founder, use their name directly from req.user
      creatorName = req.user.name;
    } else {
      // If creator is staff, look up their details
      const creatorDetails = await Staff.findById(createdBy, 'name');
      if (!creatorDetails) {
        return res.status(404).json({
          success: false,
          message: 'Staff creating the team was not found'
        });
      }
      creatorName = creatorDetails.name;
    }

    // Create new team
    const newTeam = new Team({
      name,
      email,
      description,
      owners: ownerIds,
      members: memberIds,
      labels,
      createdBy
    });

    // Add audit log entry for team creation
    newTeam.addAuditLogEntry(
      'Team Created',
      createdBy,
      creatorName,
      'Initial setup'
    );

    await newTeam.save();

    // Populate owners and members for the response
    const populatedTeam = await Team.findById(newTeam._id)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL')
      .populate('createdBy', 'name');

    return res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: populatedTeam
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating team'
    });
  }
};

// Get all teams with pagination and search
export const getTeams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { labels: { $elemMatch: { $regex: search, $options: 'i' } } }
        ]
      };
    }

    // Execute query with pagination
    const teams = await Team.find(query)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalCount = await Team.countDocuments(query);

    return res.status(200).json({
      success: true,
      teams,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalCount
    });
  } catch (error) {
    console.error('Error getting teams:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting teams'
    });
  }
};

// Get a single team by ID
export const getTeamById = async (req, res) => {
  try {
    const teamId = req.params.id;

    const team = await Team.findById(teamId)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL')
      .populate('createdBy', 'name')
      .populate('auditLog.user', 'name');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    return res.status(200).json({
      success: true,
      team
    });
  } catch (error) {
    console.error('Error getting team by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting team'
    });
  }
};

// Update a team
export const updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { name, email, description, owners, labels } = req.body;
    const updatedBy = req.user.id; // Use id instead of _id
    const userRole = req.user.role;

    // Get updater details for audit log - handle both Staff and Founder
    let updaterName;
    
    if (userRole === 'founder') {
      // If updater is a founder, use their name directly from req.user
      updaterName = req.user.name;
    } else {
      // If updater is staff, look up their details
      const updaterDetails = await Staff.findById(updatedBy, 'name');
      if (!updaterDetails) {
        return res.status(404).json({
          success: false,
          message: 'Staff updating the team was not found'
        });
      }
      updaterName = updaterDetails.name;
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Update fields
    if (name) team.name = name;
    if (email) team.email = email;
    if (description !== undefined) team.description = description;
    if (owners && Array.isArray(owners) && owners.length > 0) {
      team.owners = owners.map(owner => typeof owner === 'object' ? owner.id || owner._id : owner);
    }
    if (labels) team.labels = labels;

    // Add audit log entry
    team.addAuditLogEntry(
      'Team Updated',
      updatedBy,
      updaterName,
      'Team details updated'
    );

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL');

    return res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating team'
    });
  }
};

// Delete a team
export const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    if (!deletedTeam) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting team'
    });
  }
};

// Add a member to a team
export const addMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const addedBy = req.user.id;
    const userRole = req.user.role;

    // Validate if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate if staff member exists
    const member = await Staff.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if already a member
    if (team.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Staff is already a member of this team'
      });
    }

    // Check if already an owner (can't be both)
    if (team.owners.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Staff is already an owner of this team'
      });
    }

    // Get user details for audit log
    let adderName;
    
    if (userRole === 'founder') {
      // If adder is a founder, use name directly from req.user
      adderName = req.user.name;
    } else {
      // If adder is staff, look up details
      const adderDetails = await Staff.findById(addedBy, 'name');
      if (!adderDetails) {
        return res.status(404).json({
          success: false,
          message: 'Staff adding the member was not found'
        });
      }
      adderName = adderDetails.name;
    }

    // Add member to team
    team.members.push(memberId);

    // Add audit log entry
    team.addAuditLogEntry(
      'Member Added',
      addedBy,
      adderName,
      `Added ${member.name}`
    );

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL');

    return res.status(200).json({
      success: true,
      message: 'Member added successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error adding member to team:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding member to team'
    });
  }
};

// Remove a member from a team
export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const removedBy = req.user.id;
    const userRole = req.user.role;

    // Validate if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate if staff member exists
    const member = await Staff.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if member is part of the team
    if (!team.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Staff is not a member of this team'
      });
    }

    // Get user details for audit log
    let removerName;
    
    if (userRole === 'founder') {
      // If remover is a founder, use name directly from req.user
      removerName = req.user.name;
    } else {
      // If remover is staff, look up details
      const removerDetails = await Staff.findById(removedBy, 'name');
      if (!removerDetails) {
        return res.status(404).json({
          success: false,
          message: 'Staff removing the member was not found'
        });
      }
      removerName = removerDetails.name;
    }

    // Remove member from team
    team.members = team.members.filter(id => id.toString() !== memberId);

    // Add audit log entry
    team.addAuditLogEntry(
      'Member Removed',
      removedBy,
      removerName,
      `Removed ${member.name}`
    );

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL');

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error removing member from team:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing member from team'
    });
  }
};

// Add an owner to a team
export const addOwner = async (req, res) => {
  try {
    const { teamId, ownerId } = req.params;
    const addedBy = req.user.id;
    const userRole = req.user.role;

    // Validate if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate if staff member exists
    const owner = await Staff.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if already an owner
    if (team.owners.includes(ownerId)) {
      return res.status(400).json({
        success: false,
        message: 'Staff is already an owner of this team'
      });
    }

    // Get user details for audit log
    let adderName;
    
    if (userRole === 'founder') {
      // If adder is a founder, use name directly from req.user
      adderName = req.user.name;
    } else {
      // If adder is staff, look up details
      const adderDetails = await Staff.findById(addedBy, 'name');
      if (!adderDetails) {
        return res.status(404).json({
          success: false,
          message: 'Staff adding the owner was not found'
        });
      }
      adderName = adderDetails.name;
    }

    // If staff is a member, remove from members first
    if (team.members.includes(ownerId)) {
      team.members = team.members.filter(id => id.toString() !== ownerId);
    }

    // Add owner to team
    team.owners.push(ownerId);

    // Add audit log entry
    team.addAuditLogEntry(
      'Owner Added',
      addedBy,
      adderName,
      `Added ${owner.name} as owner`
    );

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL');

    return res.status(200).json({
      success: true,
      message: 'Owner added successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error adding owner to team:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding owner to team'
    });
  }
};

// Remove an owner from a team
export const removeOwner = async (req, res) => {
  try {
    const { teamId, ownerId } = req.params;
    const removedBy = req.user.id;
    const userRole = req.user.role;

    // Validate if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate if staff member exists
    const owner = await Staff.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if owner is part of the team
    if (!team.owners.includes(ownerId)) {
      return res.status(400).json({
        success: false,
        message: 'Staff is not an owner of this team'
      });
    }

    // Ensure there's at least one owner left
    if (team.owners.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Team must have at least one owner'
      });
    }

    // Get user details for audit log
    let removerName;
    
    if (userRole === 'founder') {
      // If remover is a founder, use name directly from req.user
      removerName = req.user.name;
    } else {
      // If remover is staff, look up details
      const removerDetails = await Staff.findById(removedBy, 'name');
      if (!removerDetails) {
        return res.status(404).json({
          success: false,
          message: 'Staff removing the owner was not found'
        });
      }
      removerName = removerDetails.name;
    }

    // Remove owner from team
    team.owners = team.owners.filter(id => id.toString() !== ownerId);

    // Add audit log entry
    team.addAuditLogEntry(
      'Owner Removed',
      removedBy,
      removerName,
      `Removed ${owner.name} as owner`
    );

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate('owners', 'name email photoURL')
      .populate('members', 'name email photoURL');

    return res.status(200).json({
      success: true,
      message: 'Owner removed successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error removing owner from team:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing owner from team'
    });
  }
};

// Get all staff members not in a specific team (for adding new members)
export const getStaffNotInTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { search = '' } = req.query;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get all members and owners IDs
    const teamMemberIds = [
      ...team.members.map(id => id.toString()),
      ...team.owners.map(id => id.toString())
    ];

    // Build query to find staff not in the team
    let query = {
      _id: { $nin: teamMemberIds },
      isActive: true
    };

    // Add search criteria if provided
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Find eligible staff members
    const staffMembers = await Staff.find(query, 'name email photoURL role')
      .sort({ name: 1 })
      .limit(20); // Limit results to prevent large payloads

    return res.status(200).json({
      success: true,
      staffMembers
    });
  } catch (error) {
    console.error('Error getting staff not in team:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting staff not in team'
    });
  }
}; 