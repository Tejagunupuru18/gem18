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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  School,
  Work,
  Star,
  Edit,
  Save,
  Cancel,
  Business,
  Science,
  Palette,
  MusicNote,
  Book,
  Computer,
  LocalHospital,
  Build,
  Brush,
  Grass,
  Schedule,
  Language,
  LocationOn,
  Verified,
  Upload,
  Delete,
  Add,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentorProfileSettings = () => {
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
    professional: {
      designation: '',
      organization: '',
      experience: 0,
      education: {
        degree: '',
        institution: '',
        year: ''
      },
      certifications: []
    },
    expertise: [],
    bio: '',
    languages: [],
    availability: {
      schedule: [],
      timezone: 'Asia/Kolkata'
    },
    verification: {
      status: 'pending',
      documents: []
    },
    preferences: {
      sessionTypes: ['video', 'audio', 'text'],
      sessionDuration: [30, 60, 90],
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentDialog, setDocumentDialog] = useState(false);
  const [newCertification, setNewCertification] = useState({ name: '', issuingBody: '', year: '' });

  // Options for various fields
  const expertiseOptions = [
    { value: 'Engineering', icon: <Build />, color: 'primary' },
    { value: 'Medical', icon: <LocalHospital />, color: 'error' },
    { value: 'Arts', icon: <Palette />, color: 'secondary' },
    { value: 'Commerce', icon: <Business />, color: 'success' },
    { value: 'Computer Science', icon: <Computer />, color: 'info' },
    { value: 'Design', icon: <Brush />, color: 'warning' },
    { value: 'Teaching', icon: <School />, color: 'primary' },
    { value: 'Business', icon: <Business />, color: 'success' },
    { value: 'Science', icon: <Science />, color: 'info' },
    { value: 'Technology', icon: <Computer />, color: 'primary' },
    { value: 'Agriculture', icon: <Grass />, color: 'success' },
    { value: 'Music', icon: <MusicNote />, color: 'secondary' },
    { value: 'Literature', icon: <Book />, color: 'warning' },
    { value: 'Other', icon: <Work />, color: 'default' }
  ];

  const languageOptions = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Other'
  ];

  const sessionTypeOptions = [
    { value: 'video', label: 'Video Call' },
    { value: 'audio', label: 'Audio Call' },
    { value: 'text', label: 'Text Chat' }
  ];

  const sessionDurationOptions = [30, 60, 90, 120];

  useEffect(() => {
    if (user && user.role === 'mentor') {
      fetchProfileData();
    } else if (user && user.role !== 'mentor') {
      setError('Access denied. Only mentors can access this page.');
      setLoading(false);
      navigate('/');
    } else {
      setError('Please log in to view your profile.');
      setLoading(false);
      navigate('/login');
    }
  }, [user, navigate]);

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
      const data = response.data;

      setProfileData({
        personal: {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          location: data.location || { city: '', state: '', country: 'India' }
        },
        professional: {
          designation: data.professional?.designation || '',
          organization: data.professional?.organization || '',
          experience: data.professional?.experience || 0,
          education: data.professional?.education || { degree: '', institution: '', year: '' },
          certifications: data.professional?.certifications || []
        },
        expertise: data.expertise || [],
        bio: data.bio || '',
        languages: data.languages || [],
        availability: data.availability || { schedule: [], timezone: 'Asia/Kolkata' },
        verification: data.verification || { status: 'pending', documents: [] },
        preferences: data.preferences || {
          sessionTypes: ['video', 'audio', 'text'],
          sessionDuration: [30, 60, 90],
          notifications: { email: true, sms: false, push: true }
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
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
        email: profileData.personal.email,
        phone: profileData.personal.phone,
        dateOfBirth: profileData.personal.dateOfBirth,
        gender: profileData.personal.gender,
        location: profileData.personal.location,
        professional: profileData.professional,
        expertise: profileData.expertise,
        bio: profileData.bio,
        languages: profileData.languages,
        availability: profileData.availability,
        preferences: profileData.preferences
      };

      await axios.put('/api/auth/profile', updateData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Update auth context
      if (updateProfile) {
        updateProfile(updateData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExpertiseToggle = (expertise) => {
    setProfileData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }));
  };

  const handleLanguageToggle = (language) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSessionTypeToggle = (type) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        sessionTypes: prev.preferences.sessionTypes.includes(type)
          ? prev.preferences.sessionTypes.filter(t => t !== type)
          : [...prev.preferences.sessionTypes, type]
      }
    }));
  };

  const handleSessionDurationToggle = (duration) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        sessionDuration: prev.preferences.sessionDuration.includes(duration)
          ? prev.preferences.sessionDuration.filter(d => d !== duration)
          : [...prev.preferences.sessionDuration, duration]
      }
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuingBody && newCertification.year) {
      setProfileData(prev => ({
        ...prev,
        professional: {
          ...prev.professional,
          certifications: [...prev.professional.certifications, { ...newCertification }]
        }
      }));
      setNewCertification({ name: '', issuingBody: '', year: '' });
    }
  };

  const handleRemoveCertification = (index) => {
    setProfileData(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        certifications: prev.professional.certifications.filter((_, i) => i !== index)
      }
    }));
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'rejected': return <Cancel />;
      default: return <Info />;
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mentor Profile Settings ⚙️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your professional profile and preferences
        </Typography>
      </Box>

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

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Personal Info" />
            <Tab label="Professional Info" />
            <Tab label="Expertise & Bio" />
            <Tab label="Availability" />
            <Tab label="Preferences" />
            <Tab label="Verification" />
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Personal Information</Typography>
              <Button
                startIcon={editMode ? <Cancel /> : <Edit />}
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? 'outlined' : 'contained'}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.personal.firstName}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, firstName: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.personal.lastName}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, lastName: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.personal.email}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, email: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.personal.phone}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, phone: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={profileData.personal.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: { ...prev.personal, dateOfBirth: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" disabled={!editMode}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={profileData.personal.gender}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      personal: { ...prev.personal, gender: e.target.value }
                    }))}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={profileData.personal.location.city}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: {
                      ...prev.personal,
                      location: { ...prev.personal.location, city: e.target.value }
                    }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={profileData.personal.location.state}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: {
                      ...prev.personal,
                      location: { ...prev.personal.location, state: e.target.value }
                    }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={profileData.personal.location.country}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    personal: {
                      ...prev.personal,
                      location: { ...prev.personal.location, country: e.target.value }
                    }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
            </Grid>

            {editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Professional Info Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Professional Information</Typography>
              <Button
                startIcon={editMode ? <Cancel /> : <Edit />}
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? 'outlined' : 'contained'}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={profileData.professional.designation}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    professional: { ...prev.professional, designation: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization"
                  value={profileData.professional.organization}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    professional: { ...prev.professional, organization: e.target.value }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  value={profileData.professional.experience}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    professional: { ...prev.professional, experience: parseInt(e.target.value) || 0 }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Degree"
                  value={profileData.professional.education.degree}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    professional: {
                      ...prev.professional,
                      education: { ...prev.professional.education, degree: e.target.value }
                    }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={profileData.professional.education.institution}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    professional: {
                      ...prev.professional,
                      education: { ...prev.professional.education, institution: e.target.value }
                    }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year"
                  value={profileData.professional.education.year}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    professional: {
                      ...prev.professional,
                      education: { ...prev.professional.education, year: e.target.value }
                    }
                  }))}
                  disabled={!editMode}
                  margin="normal"
                />
              </Grid>
            </Grid>

            {/* Certifications */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Certifications
              </Typography>
              {profileData.professional.certifications.map((cert, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">{cert.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cert.issuingBody} • {cert.year}
                        </Typography>
                      </Box>
                      {editMode && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveCertification(index)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {editMode && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add New Certification
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Certification Name"
                        value={newCertification.name}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Issuing Body"
                        value={newCertification.issuingBody}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, issuingBody: e.target.value }))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Year"
                        value={newCertification.year}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, year: e.target.value }))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Button
                        variant="contained"
                        onClick={handleAddCertification}
                        disabled={!newCertification.name || !newCertification.issuingBody || !newCertification.year}
                        sx={{ minWidth: 'auto' }}
                      >
                        <Add />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>

            {editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Expertise & Bio Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Expertise & Bio</Typography>
              <Button
                startIcon={editMode ? <Cancel /> : <Edit />}
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? 'outlined' : 'contained'}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Areas of Expertise
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {expertiseOptions.map((option) => (
                    <Chip
                      key={option.value}
                      icon={option.icon}
                      label={option.value}
                      color={profileData.expertise.includes(option.value) ? option.color : 'default'}
                      variant={profileData.expertise.includes(option.value) ? 'filled' : 'outlined'}
                      onClick={editMode ? () => handleExpertiseToggle(option.value) : undefined}
                      clickable={editMode}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Languages
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {languageOptions.map((language) => (
                    <Chip
                      key={language}
                      label={language}
                      color={profileData.languages.includes(language) ? 'primary' : 'default'}
                      variant={profileData.languages.includes(language) ? 'filled' : 'outlined'}
                      onClick={editMode ? () => handleLanguageToggle(language) : undefined}
                      clickable={editMode}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={6}
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!editMode}
                  margin="normal"
                  placeholder="Tell students about your background, experience, and what you can help them with..."
                />
              </Grid>
            </Grid>

            {editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Availability Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Availability Settings</Typography>
              <Button
                variant="contained"
                startIcon={<Schedule />}
                onClick={() => navigate('/mentor')}
              >
                Manage Availability
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Click "Manage Availability" to set your detailed schedule and time slots for mentoring sessions.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={profileData.availability.timezone}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      availability: { ...prev.availability, timezone: e.target.value }
                    }))}
                    label="Timezone"
                  >
                    <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                    <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Timezone'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Preferences Tab */}
        {activeTab === 4 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Session Preferences</Typography>
              <Button
                startIcon={editMode ? <Cancel /> : <Edit />}
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? 'outlined' : 'contained'}
              >
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Session Types
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sessionTypeOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      color={profileData.preferences.sessionTypes.includes(option.value) ? 'primary' : 'default'}
                      variant={profileData.preferences.sessionTypes.includes(option.value) ? 'filled' : 'outlined'}
                      onClick={editMode ? () => handleSessionTypeToggle(option.value) : undefined}
                      clickable={editMode}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Session Durations (minutes)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sessionDurationOptions.map((duration) => (
                    <Chip
                      key={duration}
                      label={`${duration} min`}
                      color={profileData.preferences.sessionDuration.includes(duration) ? 'primary' : 'default'}
                      variant={profileData.preferences.sessionDuration.includes(duration) ? 'filled' : 'outlined'}
                      onClick={editMode ? () => handleSessionDurationToggle(duration) : undefined}
                      clickable={editMode}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Notification Preferences
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.notifications.email}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              email: e.target.checked
                            }
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.notifications.sms}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              sms: e.target.checked
                            }
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.notifications.push}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              push: e.target.checked
                            }
                          }
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label="Push Notifications"
                  />
                </Box>
              </Grid>
            </Grid>

            {editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Verification Tab */}
        {activeTab === 5 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Status
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {getVerificationStatusIcon(profileData.verification.status)}
                  <Typography variant="h6">
                    Status: {profileData.verification.status.charAt(0).toUpperCase() + profileData.verification.status.slice(1)}
                  </Typography>
                  <Chip
                    label={profileData.verification.status}
                    color={getVerificationStatusColor(profileData.verification.status)}
                    icon={getVerificationStatusIcon(profileData.verification.status)}
                  />
                </Box>
                
                {profileData.verification.status === 'pending' && (
                  <Alert severity="info">
                    Your profile is under review. This usually takes 1-2 business days.
                  </Alert>
                )}
                
                {profileData.verification.status === 'rejected' && (
                  <Alert severity="error">
                    Your profile was not approved. Please review and resubmit your documents.
                  </Alert>
                )}
                
                {profileData.verification.status === 'approved' && (
                  <Alert severity="success">
                    Your profile has been verified! You can now accept mentoring sessions.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Typography variant="subtitle1" gutterBottom>
              Uploaded Documents
            </Typography>
            
            {profileData.verification.documents.length === 0 ? (
              <Alert severity="info">
                No documents uploaded yet. Please contact support to upload verification documents.
              </Alert>
            ) : (
              <List>
                {profileData.verification.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <Upload />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.type}
                      secondary={`Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MentorProfileSettings; 