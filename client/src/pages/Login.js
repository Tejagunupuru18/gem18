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
  Divider,
  Chip,
} from '@mui/material';
import { School, Business, AdminPanelSettings } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [approvalStatus, setApprovalStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    setApprovalStatus(null);
    setRejectionReason(null);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect based on user role
      const dashboardPath = `/${result.user.role}`;
      navigate(dashboardPath);
    } else {
      // Handle approval status
      if (result.approvalStatus) {
        setApprovalStatus(result.approvalStatus);
        setRejectionReason(result.rejectionReason);
      }
    }
    
    setLoading(false);
  };

  const roles = [
    {
      icon: <School />,
      title: 'Student',
      description: 'Access mentors, resources, and career guidance',
      color: 'primary',
    },
    {
      icon: <Business />,
      title: 'Mentor',
      description: 'Share your expertise and guide students',
      color: 'secondary',
    },
    {
      icon: <AdminPanelSettings />,
      title: 'Admin',
      description: 'Manage platform and user verification',
      color: 'error',
    },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account to continue your journey
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {approvalStatus === 'pending' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Your mentor account is pending approval. Please wait for admin approval before logging in.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will receive a notification once your account is approved.
            </Typography>
          </Alert>
        )}

        {approvalStatus === 'rejected' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Your mentor account has been rejected.
            </Typography>
            {rejectionReason && (
              <Typography variant="body2" color="text.secondary">
                Reason: {rejectionReason}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please contact support if you believe this is an error.
            </Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Chip label="OR" />
        </Divider>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Don't have an account?
          </Typography>
          <Link component={RouterLink} to="/register" variant="body2">
            Create a new account
          </Link>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom textAlign="center">
            Join Our Community
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Choose your role and start making a difference
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {roles.map((role, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => navigate('/register', { state: { role: role.title.toLowerCase() } })}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: `${role.color}.main`,
                    color: 'white',
                  }}
                >
                  {role.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{role.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 