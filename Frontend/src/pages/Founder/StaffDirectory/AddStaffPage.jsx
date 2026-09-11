import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStaffStore } from '../../../store/staffStore';
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
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactMail as ContactMailIcon
} from '@mui/icons-material';

const AddStaffPage = () => {
  const { addStaff, isLoading, error, clearError } = useStaffStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
      const result = await addStaff(formData);
      
      if (result.success) {
        setSuccessMessage(`Staff member added successfully! Login details have been sent to ${formData.email}`);
        
        // Clear form data
        setFormData({
          name: '',
          email: '',
          phone: ''
        });
        
        // Navigate to staff directory after 2 seconds
        setTimeout(() => {
          navigate('/founder/staff');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding staff:', err);
      // Error will be set in the store
    }
  };

  return (
    <FounderDashboardLayout>
      <div>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Add Staff Member
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Note:</strong> A temporary password will be automatically generated and sent to the staff member's email address along with login instructions. The staff member will be required to change their password on first login.
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Security:</strong> Staff IDs are automatically generated for each staff member.
                  </Typography>
                </Box>
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
                    startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                  >
                    {isLoading ? 'Adding...' : 'Add Staff Member'}
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

export default AddStaffPage; 