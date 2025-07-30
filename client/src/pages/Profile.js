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
} from '@mui/material';
import {
  Person,
  School,
  Work,
  Star,
  Edit,
  Save,
  Cancel,
  EmojiEvents,
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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
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
    education: {
      currentClass: '',
      board: 'CBSE',
      stream: 'Not Selected',
      school: {
        name: '',
        type: 'government',
        location: {
          city: '',
          state: '',
          district: ''
        }
      }
    },
    interests: [],
    careerGoals: [],
    achievements: [],
    preferences: {
      preferredLanguages: ['English', 'Hindi'],
      preferredMentorTypes: [],
      preferredSessionDuration: 60,
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const interestOptions = [
    { value: 'Engineering', icon: <Build />, color: 'primary' },
    { value: 'Medical', icon: <LocalHospital />, color: 'error' },
    { value: 'Arts', icon: <Palette />, color: 'secondary' },
    { value: 'Commerce', icon: <Business />, color: 'success' },
    { value: 'Law', icon: <Work />, color: 'warning' },
    { value: 'Agriculture', icon: <Grass />, color: 'info' },
    { value: 'Computer Science', icon: <Computer />, color: 'primary' },
    { value: 'Design', icon: <Brush />, color: 'secondary' },
    { value: 'Teaching', icon: <School />, color: 'success' },
    { value: 'Business', icon: <Business />, color: 'warning' },
    { value: 'Sports', icon: <Work />, color: 'error' },
    { value: 'Music', icon: <MusicNote />, color: 'secondary' },
    { value: 'Dance', icon: <MusicNote />, color: 'secondary' },
    { value: 'Literature', icon: <Book />, color: 'info' },
    { value: 'Science', icon: <Science />, color: 'primary' },
    { value: 'Technology', icon: <Computer />, color: 'primary' },
    { value: 'Psychology', icon: <Work />, color: 'secondary' },
    { value: 'Other', icon: <Work />, color: 'default' },
  ];

  const mentorTypeOptions = [
    'Industry Professional',
    'Academic',
    'Entrepreneur',
    'Government Official'
  ];

  const languageOptions = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  useEffect(() => {
    fetchProfileData();
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
      if (response.data.user && response.data.profile) {
        setProfileData({
          personal: {
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
            dateOfBirth: response.data.profile.dateOfBirth || '',
            gender: response.data.profile.gender || '',
            location: response.data.profile.location || { city: '', state: '', country: 'India' }
          },
          education: {
            currentClass: response.data.profile.education?.currentClass || '',
            board: response.data.profile.education?.board || 'CBSE',
            stream: response.data.profile.education?.stream || 'Not Selected',
            school: response.data.profile.school || {
              name: '',
              type: 'government',
              location: { city: '', state: '', district: '' }
            }
          },
          interests: response.data.profile.interests || [],
          careerGoals: response.data.profile.careerGoals || [],
          achievements: response.data.profile.achievements || [],
          preferences: {
            preferredLanguages: response.data.profile.preferences?.preferredLanguages || ['English', 'Hindi'],
            preferredMentorTypes: response.data.profile.preferences?.preferredMentorTypes || [],
            preferredSessionDuration: response.data.profile.preferences?.preferredSessionDuration || 60,
            notifications: {
              email: true,
              sms: false,
              push: true
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updateData = {
        firstName: profileData.personal.firstName,
        lastName: profileData.personal.lastName,
        phone: profileData.personal.phone,
        education: profileData.education,
        interests: profileData.interests,
        careerGoals: profileData.careerGoals,
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

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCareerGoalAdd = (goal) => {
    if (goal.trim() && !profileData.careerGoals.includes(goal.trim())) {
      setProfileData(prev => ({
        ...prev,
        careerGoals: [...prev.careerGoals, goal.trim()]
      }));
    }
  };

  const handleCareerGoalRemove = (goal) => {
    setProfileData(prev => ({
      ...prev,
      careerGoals: prev.careerGoals.filter(g => g !== goal)
    }));
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
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            {profileData.personal.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'S'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {profileData.personal.firstName} {profileData.personal.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.education.currentClass} • {profileData.education.board}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {profileData.interests.slice(0, 3).map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
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
          <Tab label="Personal Info" icon={<Person />} />
          <Tab label="Education" icon={<School />} />
          <Tab label="Interests & Goals" icon={<Star />} />
          <Tab label="Achievements" icon={<EmojiEvents />} />
          <Tab label="Preferences" icon={<Work />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
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
                label="Date of Birth"
                type="date"
                value={profileData.personal.dateOfBirth}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, dateOfBirth: e.target.value }
                }))}
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editMode}>
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
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Education Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Class"
                value={profileData.education.currentClass}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  education: { ...prev.education, currentClass: e.target.value }
                }))}
                disabled={!editMode}
                placeholder="e.g., Class 12, First Year Engineering"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Board</InputLabel>
                <Select
                  value={profileData.education.board}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    education: { ...prev.education, board: e.target.value }
                  }))}
                  label="Board"
                >
                  <MenuItem value="CBSE">CBSE</MenuItem>
                  <MenuItem value="ICSE">ICSE</MenuItem>
                  <MenuItem value="State Board">State Board</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Stream</InputLabel>
                <Select
                  value={profileData.education.stream}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    education: { ...prev.education, stream: e.target.value }
                  }))}
                  label="Stream"
                >
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="Commerce">Commerce</MenuItem>
                  <MenuItem value="Arts">Arts</MenuItem>
                  <MenuItem value="Not Selected">Not Selected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="School Name"
                value={profileData.education.school.name}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  education: {
                    ...prev.education,
                    school: { ...prev.education.school, name: e.target.value }
                  }
                }))}
                disabled={!editMode}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Interests & Career Goals
          </Typography>
          
          {/* Interests */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Areas of Interest
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interestOptions.map((interest) => (
                <Chip
                  key={interest.value}
                  icon={interest.icon}
                  label={interest.value}
                  color={profileData.interests.includes(interest.value) ? interest.color : 'default'}
                  variant={profileData.interests.includes(interest.value) ? 'filled' : 'outlined'}
                  onClick={() => editMode && handleInterestToggle(interest.value)}
                  sx={{ cursor: editMode ? 'pointer' : 'default' }}
                />
              ))}
            </Box>
          </Box>

          {/* Career Goals */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Career Goals
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {profileData.careerGoals.map((goal, index) => (
                <Chip
                  key={index}
                  label={goal}
                  onDelete={editMode ? () => handleCareerGoalRemove(goal) : undefined}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            {editMode && (
              <TextField
                fullWidth
                label="Add Career Goal"
                placeholder="e.g., Become a Software Engineer"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCareerGoalAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            )}
          </Box>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Achievements & Progress
          </Typography>
          
          {profileData.achievements.length > 0 ? (
            <List>
              {profileData.achievements.map((achievement, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <EmojiEvents />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={achievement.title}
                    secondary={achievement.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EmojiEvents sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Achievements Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete sessions and activities to earn achievements
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preferences & Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Preferred Languages
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {languageOptions.map((language) => (
                  <Chip
                    key={language}
                    label={language}
                    color={profileData.preferences.preferredLanguages.includes(language) ? 'primary' : 'default'}
                    variant={profileData.preferences.preferredLanguages.includes(language) ? 'filled' : 'outlined'}
                    onClick={() => editMode && setProfileData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        preferredLanguages: prev.preferences.preferredLanguages.includes(language)
                          ? prev.preferences.preferredLanguages.filter(l => l !== language)
                          : [...prev.preferences.preferredLanguages, language]
                      }
                    }))}
                    sx={{ cursor: editMode ? 'pointer' : 'default' }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Preferred Mentor Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mentorTypeOptions.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    color={profileData.preferences.preferredMentorTypes.includes(type) ? 'primary' : 'default'}
                    variant={profileData.preferences.preferredMentorTypes.includes(type) ? 'filled' : 'outlined'}
                    onClick={() => editMode && setProfileData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        preferredMentorTypes: prev.preferences.preferredMentorTypes.includes(type)
                          ? prev.preferences.preferredMentorTypes.filter(t => t !== type)
                          : [...prev.preferences.preferredMentorTypes, type]
                      }
                    }))}
                    sx={{ cursor: editMode ? 'pointer' : 'default' }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Preferred Session Duration</InputLabel>
                <Select
                  value={profileData.preferences.preferredSessionDuration}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, preferredSessionDuration: e.target.value }
                  }))}
                  label="Preferred Session Duration"
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default Profile; 