import { Team } from '../../../models/Admin/Team/team.model.js';
import { Staff } from '../../../models/Admin/Staff/staff.model.js';

// Middleware to verify if the user has appropriate permission to manage teams
export const verifyTeamPermission = async (req, res, next) => {
  try {
    // User must be authenticated already (handled by previous auth middleware)
    const { role } = req.user;
    
    // Only founders, admins, or managers can manage teams
    if (role !== 'founder' && role !== 'admin' && role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage teams'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in team permission middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying team permissions'
    });
  }
};

// Middleware to validate team creation/update data
export const validateTeamData = async (req, res, next) => {
  try {
    const { name, email, owners } = req.body;

    // Validate required fields
    if (!name || !email || !owners || !Array.isArray(owners) || owners.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Team name, email, and at least one owner are required'
      });
    }

    // Check if email is valid
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if email is already in use (only for new teams)
    if (!req.params.id) {
      const existingTeam = await Team.findOne({ email });
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team email is already in use'
        });
      }
    }

    // Verify all owners exist in staff collection
    const ownerIds = owners.map(owner => typeof owner === 'object' ? owner.id || owner._id : owner);
    const foundOwners = await Staff.countDocuments({ _id: { $in: ownerIds } });
    
    if (foundOwners !== ownerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected owners do not exist'
      });
    }

    next();
  } catch (error) {
    console.error('Error in team validation middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while validating team data'
    });
  }
};

// Middleware to check if the team exists by ID
export const checkTeamExists = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    
    const TeamModel = Team();
    const team = await TeamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Attach team to request object for controller use
    req.team = team;
    next();
  } catch (error) {
    console.error('Error in check team exists middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking team existence'
    });
  }
};
