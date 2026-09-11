import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffStore } from '../../../store/staffStore';
import { useFounderStore } from '../../../store/founderStore';
import FounderDashboardLayout from '../../../components/Founder/FounderDashboardLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TextField,
  Box,
  IconButton,
  Pagination,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const StaffDirectoryPage = () => {
  const { 
    staffList, 
    totalPages,
    currentPage, 
    isLoading, 
    error,
    getStaffList,
    deleteStaff,
    resetStaffPassword
  } = useStaffStore();
  
  const { founder } = useFounderStore();
  
  const [search, setSearch] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadStaffList();
  }, [currentPage]);

  const loadStaffList = async () => {
    try {
      await getStaffList(currentPage, 10, search);
    } catch (error) {
      console.error('Failed to load staff list:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStaffList();
  };

  const handleChangePage = (e, newPage) => {
    getStaffList(newPage, 10, search);
  };

  const handleDeleteClick = (staffId) => {
    setSelectedStaffId(staffId);
    setOpenDeleteDialog(true);
  };

  const handleResetPasswordClick = (staffId) => {
    setSelectedStaffId(staffId);
    setOpenResetDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStaff(selectedStaffId);
      setDeleteSuccess(true);
      setSuccessMessage('Staff member deleted successfully');
      setOpenDeleteDialog(false);
      
      // Reload the staff list
      loadStaffList();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      setOpenDeleteDialog(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetStaffPassword(selectedStaffId);
      setResetSuccess(true);
      setSuccessMessage('Password reset email sent to staff member');
      setOpenResetDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to reset staff password:', error);
      setOpenResetDialog(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
    setOpenResetDialog(false);
  };

  // Check if user has permission to add staff (founder or manager)
  const canManageStaff = founder && ['founder', 'manager'].includes(founder.role);

  // Only founders can delete staff members
  const canDeleteStaff = founder && founder.role === 'founder';

  return (
    <FounderDashboardLayout>
      <div>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Staff Directory
          </Typography>
          
          {canManageStaff && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/founder/staff/add"
            >
              Add Staff Member
            </Button>
          )}
        </Box>

        {/* Search */}
        <Paper
          component="form"
          sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}
          onSubmit={handleSearchSubmit}
        >
          <TextField
            fullWidth
            placeholder="Search by name, email, or staff ID..."
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
          >
            Search
          </Button>
          <Tooltip title="Refresh list">
            <IconButton onClick={() => loadStaffList()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Success message */}
        {(resetSuccess || deleteSuccess) && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography color="success.contrastText">{successMessage}</Typography>
          </Box>
        )}

        {/* Error message */}
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.contrastText">{error}</Typography>
          </Box>
        )}

        {/* Staff list */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Staff ID</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Added</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : staffList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                staffList.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.staffId}</TableCell>
                    <TableCell>
                      <Chip
                        label={staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                        color={staff.role === 'manager' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={staff.isActive ? 'Active' : 'Inactive'}
                        color={staff.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(staff.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit staff">
                        <IconButton
                          component={Link}
                          to={`/founder/staff/edit/${staff._id}`}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Reset password">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleResetPasswordClick(staff._id)}
                        >
                          <KeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {canDeleteStaff && (
                        <Tooltip title="Delete staff">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(staff._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handleChangePage}
              color="primary"
            />
          </Box>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
          <DialogTitle>Delete Staff Member</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset password confirmation dialog */}
        <Dialog open={openResetDialog} onClose={handleCloseDialog}>
          <DialogTitle>Reset Staff Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to reset this staff member's password? 
              A new temporary password will be generated and sent to their email address.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleConfirmReset} color="primary" autoFocus>
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </FounderDashboardLayout>
  );
};

export default StaffDirectoryPage; 