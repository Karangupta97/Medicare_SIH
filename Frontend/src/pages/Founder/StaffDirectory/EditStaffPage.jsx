import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useStaffStore } from '../../../store/staffStore';
import { useFounderStore } from '../../../store/founderStore';
import FounderDashboardLayout from '../../../components/Founder/FounderDashboardLayout';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactMail as ContactMailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

const EditStaffPage = () => {
  const { getStaffById, updateStaff, selectedStaff, isLoading, error, clearError } = useStaffStore();
  const { founder } = useFounderStore();
  const navigate = useNavigate();
  const { staffId } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Load staff data when component mounts
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        await getStaffById(staffId);
      } catch (err) {
        console.error('Error loading staff data:', err);
      } finally {
        setLoadingStaff(false);
      }
    };

    loadStaffData();

    // Clean up function
    return () => {
      clearError();
    };
  }, [staffId, getStaffById, clearError]);

  // Update form data when selectedStaff changes
  useEffect(() => {
    if (selectedStaff) {
      setFormData({
        name: selectedStaff.name || '',
        email: selectedStaff.email || '',
        phone: selectedStaff.phone || '',
        role: selectedStaff.role || 'staff',
        isActive: selectedStaff.isActive !== undefined ? selectedStaff.isActive : true
      });
    }
  }, [selectedStaff]);

  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Validate phone (optional, but if provided, must be valid)
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    // For checkbox/switch inputs
    if (name === 'isActive') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user starts typing again
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await updateStaff(staffId, formData);
      
      if (result.success) {
        setSuccessMessage('Staff member updated successfully!');
        
        // Navigate back to staff directory after 2 seconds
        setTimeout(() => {
          navigate('/founder/staff');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating staff:', err);
      // Error will be set in the store
    }
  };

  // Check if user is founder (only founders can change role to manager)
  const isFounder = founder && founder.role === 'founder';

  if (loadingStaff) {
    return (
      <FounderDashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </FounderDashboardLayout>
    );
  }

  if (!selectedStaff && !loadingStaff) {
    return (
      <FounderDashboardLayout>
        <Box>
          <Alert severity="error">
            Staff member not found or you don't have permission to edit.
          </Alert>
          <Button
            variant="contained"
            component={Link}
            to="/founder/staff"
            sx={{ mt: 2 }}
          >
            Back to Staff Directory
          </Button>
        </Box>
      </FounderDashboardLayout>
    );
  }

  return (
    <FounderDashboardLayout>
      <div>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Edit Staff Member
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/founder/staff"
          >
            Back to Directory
          </Button>
        </Box>
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Staff Information
                  </Typography>
                  <Divider />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Staff ID"
                  value={selectedStaff?.staffId || ''}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>
                  Staff ID cannot be changed
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleChange}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label={formData.isActive ? "Active" : "Inactive"}
                  />
                  <FormHelperText>
                    Toggle to enable or disable staff account
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={isLoading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ContactMailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={isLoading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>
                  This email will be used for login and communication
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone || 'Format: +1234567890 or (123) 456-7890'}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    disabled={isLoading || (formData.role === 'manager' && !isFounder)}
                  >
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="manager" disabled={!isFounder}>Manager</MenuItem>
                  </Select>
                  <FormHelperText>
                    {!isFounder && formData.role === 'manager' 
                      ? 'Only founders can change manager roles' 
                      : 'Managers can add/edit staff members'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/founder/staff"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <EditIcon />}
                  >
                    {isLoading ? 'Updating...' : 'Update Staff Member'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </div>
    </FounderDashboardLayout>
  );
};

export default EditStaffPage; 