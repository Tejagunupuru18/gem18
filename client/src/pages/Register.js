import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { School, Business, AdminPanelSettings } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '', // Ensure role is always present
    // Student specific fields
    schoolName: '',
    currentClass: '',
    interests: [], // NEW
    careerGoals: '', // NEW
    // Mentor specific fields
    designation: '',
    organization: '',
    experience: '',
    bio: '',
  });

  const steps = ['Basic Information', 'Role Details', 'Account Setup'];

  const interestOptions = [
    'Engineering', 'Medical', 'Arts', 'Commerce', 'Law', 'Agriculture',
    'Computer Science', 'Design', 'Teaching', 'Business', 'Sports',
    'Music', 'Dance', 'Literature', 'Science', 'Technology', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'interests') {
      setFormData({
        ...formData,
        interests: typeof value === 'string' ? value.split(',') : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    if (!formData || !formData.role) {
      alert('Please select a role.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      ...(formData.role === 'student' && {
        schoolName: formData.schoolName,
        currentClass: formData.currentClass,
        interests: formData.interests,
        careerGoals: formData.careerGoals,
      }),
      ...(formData.role === 'mentor' && {
        designation: formData.designation,
        organization: formData.organization,
        experience: formData.experience,
        bio: formData.bio,
      }),
      ...(formData.role === 'admin' && {
        // Admin users don't need additional fields
      }),
    };

    console.log('Sending registration data:', userData);
    const result = await register(userData);
    
    if (result.success) {
      navigate(`/${formData.role}`);
    } else {
      console.error('Registration failed:', result.error);
    }
    
    setLoading(false);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="mentor">Mentor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        if (formData.role === 'student') {
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Class"
                  name="currentClass"
                  value={formData.currentClass}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="interests-label">Interests</InputLabel>
                  <Select
                    labelId="interests-label"
                    id="interests"
                    multiple
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    label="Interests"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {interestOptions.map((interest) => (
                      <MenuItem key={interest} value={interest}>
                        {interest}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Career Goals"
                  name="careerGoals"
                  value={formData.careerGoals}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Describe your career goals or aspirations"
                />
              </Grid>
            </Grid>
          );
        } else if (formData.role === 'mentor') {
          return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
          );
        } else if (formData.role === 'admin') {
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" textAlign="center">
                  Admin Account Setup
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Admin accounts have full platform access and management capabilities.
                </Typography>
              </Grid>
            </Grid>
          );
        } else {
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" color="text.secondary" textAlign="center">
                  Please select a role to continue
                </Typography>
              </Grid>
            </Grid>
          );
        }

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join our community and start your journey
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ px: 4 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 