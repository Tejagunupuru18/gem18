import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Person,
  Security,
  Settings,
  AdminPanelSettings,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  VerifiedUser,
  AccessTime,
  TrendingUp,
  Assessment,
  People,
  ContentPaste,
  Report,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      location: {
        city: '',
        state: '',
        country: 'India'
      }
    },
    admin: {
      role: 'admin',
      permissions: [],
      department: '',
      designation: '',
      joinDate: '',
      lastLogin: ''
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      dashboard: {
        defaultView: 'overview',
        autoRefresh: true,
        showAnalytics: true
      }
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminStats, setAdminStats] = useState({});

  useEffect(() => {
    fetchProfileData();
    fetchAdminStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your profile');
        setLoading(false);
        navigate('/login');
        return;
      }
      
      const response = await axios.get('/api/auth/profile');
      if (response.data.user) {
        setProfileData({
          personal: {
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
            dateOfBirth: response.data.user.dateOfBirth || '',
            gender: response.data.user.gender || '',
            location: response.data.user.location || { city: '', state: '', country: 'India' }
          },
          admin: {
            role: 'admin',
            permissions: response.data.user.permissions || ['manage_users', 'manage_content', 'view_analytics'],
            department: response.data.user.department || 'Platform Management',
            designation: response.data.user.designation || 'Administrator',
            joinDate: response.data.user.createdAt || new Date().toISOString(),
            lastLogin: response.data.user.lastLogin || new Date().toISOString()
          },
          preferences: {
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            dashboard: {
              defaultView: 'overview',
              autoRefresh: true,
              showAnalytics: true
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const [statsRes, usersRes, resourcesRes, reportsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/resources'),
        axios.get('/api/admin/reports')
      ]);

      setAdminStats({
        totalUsers: statsRes.data.totalUsers || 0,
        totalMentors: statsRes.data.verifiedMentors || 0,
        totalStudents: statsRes.data.totalUsers ? statsRes.data.totalUsers - (statsRes.data.verifiedMentors || 0) : 0,
        totalResources: resourcesRes.data.resources?.length || resourcesRes.data.length || 0,
        pendingReports: reportsRes.data.length || 0,
        totalSessions: statsRes.data.totalSessions || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updateData = {
        firstName: profileData.personal.firstName,
        lastName: profileData.personal.lastName,
        phone: profileData.personal.phone,
        department: profileData.admin.department,
        designation: profileData.admin.designation,
        preferences: profileData.preferences
      };

      await axios.put('/api/auth/profile', updateData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'error.main' }}>
            <AdminPanelSettings sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {profileData.personal.firstName} {profileData.personal.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.admin.designation} • {profileData.admin.department}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                icon={<AdminPanelSettings />}
                label="Administrator"
                color="error"
                variant="filled"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`Joined ${new Date(profileData.admin.joinDate).toLocaleDateString()}`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={editMode ? "outlined" : "contained"}
            startIcon={editMode ? <Cancel /> : <Edit />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
          {editMode && (
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Profile" icon={<Person />} />
          <Tab label="Admin Overview" icon={<AdminPanelSettings />} />
          <Tab label="Permissions" icon={<Security />} />
          <Tab label="Settings" icon={<Settings />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.personal.firstName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      personal: { ...prev.personal, firstName: e.target.value }
                    }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.personal.lastName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      personal: { ...prev.personal, lastName: e.target.value }
                    }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.personal.email}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.personal.phone}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      personal: { ...prev.personal, phone: e.target.value }
                    }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profileData.admin.department}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      admin: { ...prev.admin, department: e.target.value }
                    }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={profileData.admin.designation}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      admin: { ...prev.admin, designation: e.target.value }
                    }))}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AdminPanelSettings />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role"
                    secondary="Administrator"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Login"
                    secondary={new Date(profileData.admin.lastLogin).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Join Date"
                    secondary={new Date(profileData.admin.joinDate).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Platform Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {adminStats.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {adminStats.totalMentors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Verified Mentors
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {adminStats.totalStudents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Students
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {adminStats.totalResources}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resources
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary="User Management"
                      secondary={`${adminStats.totalUsers} total users registered`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ContentPaste />
                    </ListItemIcon>
                    <ListItemText
                      primary="Content Management"
                      secondary={`${adminStats.totalResources} resources available`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Report />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reports & Issues"
                      secondary={`${adminStats.pendingReports} pending reports`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Administrative Permissions
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Current Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.admin.permissions.map((permission) => (
                  <Chip
                    key={permission}
                    label={permission.replace('_', ' ').toUpperCase()}
                    color="primary"
                    variant="filled"
                    icon={<VerifiedUser />}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Permission Categories
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Management"
                    secondary="Manage all users, approve mentors, suspend accounts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ContentPaste />
                  </ListItemIcon>
                  <ListItemText
                    primary="Content Management"
                    secondary="Add, edit, and remove educational resources"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Analytics & Reports"
                    secondary="View platform analytics and generate reports"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Settings"
                    secondary="Configure platform settings and notifications"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Admin Settings & Preferences
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive email alerts for important events"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive SMS alerts for critical issues"
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Dashboard Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Show Analytics"
                    secondary="Display analytics on dashboard"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Auto Refresh"
                    secondary="Automatically refresh dashboard data"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default AdminProfile; 