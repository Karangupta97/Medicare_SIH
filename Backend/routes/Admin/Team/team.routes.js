import express from 'express';
import { verifyFounder } from '../../../middleware/Founder/verifyFounder.js';
import { 
  verifyTeamPermission,
  validateTeamData,
  checkTeamExists
} from '../../../middleware/Admin/Team/team.middleware.js';
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  addOwner,
  removeOwner,
  getStaffNotInTeam
} from '../../../controllers/Admin/Team/team.controller.js';

const router = express.Router();

// Secure all team routes with authentication
router.use(verifyFounder);
router.use(verifyTeamPermission);

// Team CRUD routes
router.post('/', validateTeamData, createTeam);
router.get('/', getTeams);
router.get('/:id', checkTeamExists, getTeamById);
router.put('/:id', checkTeamExists, validateTeamData, updateTeam);
router.delete('/:id', checkTeamExists, deleteTeam);

// Team membership management routes
router.post('/:teamId/members/:memberId', addMember);
router.delete('/:teamId/members/:memberId', removeMember);
router.post('/:teamId/owners/:ownerId', addOwner);
router.delete('/:teamId/owners/:ownerId', removeOwner);

// Get eligible staff for adding to a team
router.get('/:teamId/eligible-staff', getStaffNotInTeam);

export default router; 