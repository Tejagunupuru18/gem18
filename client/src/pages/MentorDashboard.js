import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Rating,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Business,
  Schedule,
  VideoCall as VideoCallIcon,
  TrendingUp,
  Star,
  Person,
  CheckCircle,
  Cancel,
  Edit,
  MoreVert,
  Notifications,
  CalendarToday,
  Assessment,
  Message,
  Settings,
  Visibility,
  Description,
  Close,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import MentorAvailability from './MentorAvailability';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCall from '../components/VideoCall';

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
    totalStudents: 0,
    monthlyHours: 0,
  });
  const [availability, setAvailability] = useState({
    monday: { morning: true, afternoon: true, evening: false },
    tuesday: { morning: true, afternoon: true, evening: false },
    wednesday: { morning: true, afternoon: true, evening: false },
    thursday: { morning: true, afternoon: true, evening: false },
    friday: { morning: true, afternoon: true, evening: false },
    saturday: { morning: false, afternoon: false, evening: false },
    sunday: { morning: false, afternoon: false, evening: false },
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [availabilityDialog, setAvailabilityDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState('');
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [selectedSessionForCall, setSelectedSessionForCall] = useState(null);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [completionData, setCompletionData] = useState({
    duration: '',
    notes: '',
    rating: 0,
    feedback: ''
  });
  const [resources, setResources] = useState([]);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'article',
    category: 'General',
    content: {
      body: '',
      url: ''
    }
  });
  const [bulkCompletionDialog, setBulkCompletionDialog] = useState(false);
  const [selectedSessionsForBulk, setSelectedSessionsForBulk] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchMentorResources();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [sessionsRes, statsRes] = await Promise.all([
        axios.get('/api/mentors/sessions'),
        axios.get('/api/mentors/stats'),
      ]);

      setSessions(sessionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data);
      
      if (error.response?.status === 403) {
        setError('Mentor account not approved. Please contact admin for approval.');
      } else if (error.response?.status === 401) {
        setError('Please log in to access mentor dashboard.');
      } else if (error.response?.status === 404) {
        setError('Mentor profile not found. Please complete your profile setup.');
      } else {
        setError(`Error loading dashboard data: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      await axios.put(`/api/mentors/sessions/${sessionId}`, { status: action });
      fetchDashboardData();
      setSessionDialog(false);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleAvailabilityUpdate = async () => {
    // This function is no longer needed as MentorAvailability component handles its own updates
    setAvailabilityDialog(false);
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartVideoCall = (session) => {
    setSelectedSessionForCall(session);
    setVideoCallOpen(true);
  };

  const handleCloseVideoCall = () => {
    setVideoCallOpen(false);
    setSelectedSessionForCall(null);
  };

  const handleMarkComplete = (session) => {
    setSelectedSession(session);
    setCompletionDialog(true);
  };

  const handleCompleteSession = async () => {
    try {
      const sessionId = selectedSession._id;
      await axios.put(`/api/mentors/sessions/${sessionId}`, {
        status: 'completed',
        actualDuration: parseInt(completionData.duration) || 0,
        mentorNotes: completionData.notes,
        mentorRating: completionData.rating,
        mentorFeedback: completionData.feedback,
        completedDate: new Date().toISOString()
      });
      
      // Reset form
      setCompletionData({
        duration: '',
        notes: '',
        rating: 0,
        feedback: ''
      });
      
      setCompletionDialog(false);
      setSelectedSession(null);
      fetchDashboardData();
      
      // Show success message
      setError('');
    } catch (error) {
      console.error('Error completing session:', error);
      setError('Failed to complete session. Please try again.');
    }
  };

  const handleBulkComplete = () => {
    const inProgressSessions = Array.isArray(sessions) ? sessions.filter(s => s.status === 'in-progress') : [];
    if (inProgressSessions.length === 0) {
      alert('No in-progress sessions to complete.');
      return;
    }
    setSelectedSessionsForBulk(inProgressSessions);
    setBulkCompletionDialog(true);
  };

  const handleBulkCompleteSessions = async () => {
    try {
      await axios.post('/api/mentors/sessions/bulk-complete', {
        sessionIds: selectedSessionsForBulk
      });
      setSuccess('Sessions marked as complete!');
      fetchDashboardData();
      setBulkCompletionDialog(false);
      setSelectedSessionsForBulk([]);
    } catch (error) {
      setError('Failed to complete sessions');
    }
  };

  const fetchMentorResources = async () => {
    try {
      const response = await axios.get('/api/resources', {
        params: { createdBy: user._id }
      });
      const resourceList = Array.isArray(response.data) 
        ? response.data 
        : (response.data.resources || []);
      setResources(resourceList);
    } catch (error) {
      console.error('Error fetching mentor resources:', error);
    }
  };

  const handleAddResource = async () => {
    try {
      if (!newResource.title || !newResource.description) {
        setError('Please fill in all required fields');
        return;
      }

      await axios.post('/api/resources', newResource);
      setSuccess('Resource submitted for approval!');
      setResourceDialog(false);
      setNewResource({
        title: '',
        description: '',
        type: 'article',
        category: 'General',
        content: {
          body: '',
          url: ''
        }
      });
      fetchMentorResources();
    } catch (error) {
      console.error('Error adding resource:', error);
      setError(error.response?.data?.message || 'Failed to add resource');
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
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
          {error.includes('Mentor profile not found') && (
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => navigate('/register')}
              >
                Complete Profile Setup
              </Button>
            </Box>
          )}
          {!error.includes('Mentor profile not found') && (
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => fetchDashboardData()}
              >
                Retry
              </Button>
            </Box>
          )}
        </Alert>
      )}
      
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName || 'Mentor'}! 👨‍💼
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your sessions and help students grow in their careers.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <VideoCall sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {stats.totalSessions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Sessions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {stats.completedSessions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {stats.upcomingSessions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Star sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {(stats.averageRating || 0).toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Upcoming Sessions" />
                <Tab label="Recent Sessions" />
                <Tab label="Statistics" />
                <Tab label="Resources" />
              </Tabs>
            </Box>

            {/* Upcoming Sessions Tab */}
            {tabValue === 0 && (
              <List>
                {Array.isArray(sessions) && sessions
                  .filter(session => session.status === 'upcoming')
                  .map((session, index) => (
                    <React.Fragment key={session._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={session.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Student: {session.student?.firstName} {session.student?.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Date: {new Date(session.scheduledDate).toLocaleDateString()}
                              </Typography>
                              <Chip
                                label={session.status}
                                size="small"
                                color={getSessionStatusColor(session.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedSession(session);
                              setSessionDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                          {session.status === 'scheduled' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleSessionAction(session._id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {session.status === 'confirmed' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleSessionAction(session._id, 'in-progress')}
                              >
                                Start Session
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<VideoCallIcon />}
                                onClick={() => handleStartVideoCall(session)}
                              >
                                Video Call
                              </Button>
                            </>
                          )}
                          {session.status === 'in-progress' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleMarkComplete(session)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </Box>
                      </ListItem>
                      {index < (Array.isArray(sessions) ? sessions.filter(s => s.status === 'upcoming').length : 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            )}

            {/* Recent Sessions Tab */}
            {tabValue === 1 && (
              <List>
                {Array.isArray(sessions) && sessions
                  .filter(session => session.status === 'completed')
                  .slice(0, 5)
                  .map((session, index) => (
                    <React.Fragment key={session._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <CheckCircle />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={session.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Student: {session.student?.firstName} {session.student?.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Completed: {new Date(session.completedDate).toLocaleDateString()}
                              </Typography>
                              {session.rating && (
                                <Rating value={session.rating} size="small" readOnly />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < (Array.isArray(sessions) ? sessions.filter(s => s.status === 'completed').length : 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            )}

            {/* Statistics Tab */}
            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Performance Analytics</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Assessment />}
                    onClick={() => navigate('/mentor/analytics')}
                  >
                    View Detailed Analytics
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Monthly Overview
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {Math.round((stats.monthlyHours || 0) / 60)}h
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hours this month
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Student Reach
                        </Typography>
                        <Typography variant="h4" color="secondary">
                          {stats.totalStudents || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Students mentored
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Completion Rate
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {stats.totalSessions > 0 
                            ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                            : 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sessions completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Average Rating
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {(stats.averageRating || 0).toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Student feedback
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Quick Analytics */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Session Status Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" color="success.main">
                          {stats.completedSessions || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                        <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h5" color="warning.main">
                          {stats.upcomingSessions || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upcoming
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h5" color="info.main">
                          {stats.totalSessions || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}

            {/* Resources Tab */}
            {tabValue === 3 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">My Resources</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Description />}
                    onClick={() => setResourceDialog(true)}
                  >
                    Add Resource
                  </Button>
                </Box>
                
                {resources.length > 0 ? (
                  <Grid container spacing={3}>
                    {resources.map((resource) => (
                      <Grid item xs={12} md={6} key={resource._id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                {resource.title}
                              </Typography>
                              <Chip 
                                label={resource.status} 
                                color={resource.status === 'active' ? 'success' : resource.status === 'pending' ? 'warning' : 'error'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {resource.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip label={resource.type} size="small" />
                              <Chip label={resource.category} size="small" />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(resource.createdAt).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No resources yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Start sharing your knowledge by adding resources for students.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Description />}
                      onClick={() => setResourceDialog(true)}
                    >
                      Add Your First Resource
                    </Button>
                  </Paper>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Schedule />}
                      onClick={() => setAvailabilityDialog(true)}
                    >
                      Update Availability
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Assessment />}
                      onClick={() => navigate('/mentor/analytics')}
                    >
                      View Analytics
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Message />}
                      onClick={() => navigate('/mentor/messages')}
                    >
                      Messages
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Description />}
                      onClick={() => navigate('/mentor/files')}
                    >
                      File Management
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<VideoCallIcon />}
                      onClick={() => {
                        // Show upcoming sessions for video call selection
                        const sessionsArray = Array.isArray(sessions) ? sessions : [];
                        const upcomingSessions = sessionsArray.filter(s => s.status === 'confirmed');
                        if (upcomingSessions.length > 0) {
                          setSelectedSessionForCall(upcomingSessions[0]);
                          setVideoCallOpen(true);
                        } else {
                          alert('No confirmed sessions available for video call');
                        }
                      }}
                    >
                      Start Video Call
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Settings />}
                      onClick={() => navigate('/mentor/profile-settings')}
                    >
                      Profile Settings
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={handleBulkComplete}
                      color="success"
                    >
                      Bulk Complete Sessions
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {Array.isArray(sessions) && sessions.slice(0, 3).map((session) => (
                    <ListItem key={session._id}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <VideoCallIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={session.title}
                        secondary={new Date(session.scheduledDate).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Session Details Dialog */}
      <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Session Details</Typography>
            <IconButton
              aria-label="close"
              onClick={() => setSessionDialog(false)}
            >
              <Cancel />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Grid container spacing={3}>
              {/* Session Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {selectedSession.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Student:</strong> {selectedSession.student?.firstName} {selectedSession.student?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Email:</strong> {selectedSession.student?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Date:</strong> {new Date(selectedSession.scheduledDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Time:</strong> {new Date(selectedSession.scheduledDate).toLocaleTimeString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Duration:</strong> {selectedSession.duration} minutes
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Type:</strong> {selectedSession.sessionType}
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                  <strong>Description:</strong><br />
                  {selectedSession.description}
                </Typography>
                {selectedSession.topics && selectedSession.topics.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Topics:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedSession.topics.map((topic, index) => (
                        <Chip key={index} label={topic} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                <Chip
                  label={selectedSession.status}
                  color={getSessionStatusColor(selectedSession.status)}
                  sx={{ mt: 2 }}
                />
              </Grid>

              {/* Session Actions */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Session Actions
                </Typography>
                
                {/* Status-based actions */}
                {selectedSession.status === 'scheduled' && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => handleSessionAction(selectedSession._id, 'confirmed')}
                  >
                    Confirm Session
                  </Button>
                )}
                
                {selectedSession.status === 'confirmed' && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => handleSessionAction(selectedSession._id, 'in-progress')}
                  >
                    Start Session
                  </Button>
                )}
                
                {selectedSession.status === 'in-progress' && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => handleSessionAction(selectedSession._id, 'completed')}
                  >
                    Complete Session
                  </Button>
                )}

                {/* Video call button */}
                {selectedSession.meetingLink && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mb: 2 }}
                    href={selectedSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<VideoCall />}
                  >
                    Join Video Call
                  </Button>
                )}

                {/* Cancel session */}
                {['scheduled', 'confirmed'].includes(selectedSession.status) && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => handleSessionAction(selectedSession._id, 'cancelled')}
                  >
                    Cancel Session
                  </Button>
                )}

                {/* Session notes */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Session Notes"
                  placeholder="Add notes about this session..."
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Chat UI */}
              <Grid item xs={12}>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2, maxHeight: 250, overflowY: 'auto' }}>
                <Typography variant="subtitle1" gutterBottom>Session Chat</Typography>
                {/* Chat functionality removed as per edit hint */}
              </Box>
              <Box sx={{ display: 'flex', mt: 1 }}>
                {/* Chat input and send button removed as per edit hint */}
              </Box>
            </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedSession?.status === 'upcoming' && (
            <>
              <Button
                onClick={() => handleSessionAction(selectedSession._id, 'completed')}
                color="success"
                variant="contained"
              >
                Mark Complete
              </Button>
              <Button
                onClick={() => handleSessionAction(selectedSession._id, 'cancelled')}
                color="error"
                variant="outlined"
              >
                Cancel Session
              </Button>
            </>
          )}
          <Button onClick={() => setSessionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={availabilityDialog} onClose={() => setAvailabilityDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Availability</DialogTitle>
        <DialogContent>
          <MentorAvailability mentor={user} onClose={() => setAvailabilityDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      {selectedSessionForCall && (
        <VideoCall
          open={videoCallOpen}
          onClose={handleCloseVideoCall}
          sessionId={selectedSessionForCall._id}
          studentId={selectedSessionForCall.student?._id}
          studentName={`${selectedSessionForCall.student?.firstName} ${selectedSessionForCall.student?.lastName}`}
        />
      )}

      {/* Session Completion Dialog */}
      <Dialog open={completionDialog} onClose={() => setCompletionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Complete Session</Typography>
            <IconButton onClick={() => setCompletionDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedSession.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Student: {selectedSession.student?.firstName} {selectedSession.student?.lastName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Actual Duration (minutes)"
                  type="number"
                  value={completionData.duration}
                  onChange={(e) => setCompletionData({...completionData, duration: e.target.value})}
                  helperText="How long did the session actually take?"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Rate the session (1-5)
                  </Typography>
                  <Rating
                    value={completionData.rating}
                    onChange={(event, newValue) => {
                      setCompletionData({...completionData, rating: newValue});
                    }}
                    size="large"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Session Notes"
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({...completionData, notes: e.target.value})}
                  helperText="Brief notes about what was covered in the session"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Feedback for Student"
                  value={completionData.feedback}
                  onChange={(e) => setCompletionData({...completionData, feedback: e.target.value})}
                  helperText="Constructive feedback and next steps for the student"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteSession}
            variant="contained"
            color="success"
            disabled={!completionData.duration || completionData.rating === 0}
          >
            Complete Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Completion Dialog */}
      <Dialog open={bulkCompletionDialog} onClose={() => setBulkCompletionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Bulk Complete Sessions</Typography>
            <IconButton onClick={() => setBulkCompletionDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to complete {selectedSessionsForBulk.length} in-progress sessions with the same details.
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Sessions to be completed:
            </Typography>
            <List dense>
              {selectedSessionsForBulk.map((session, index) => (
                <ListItem key={session._id}>
                  <ListItemText
                    primary={session.title}
                    secondary={`${session.student?.firstName} ${session.student?.lastName} - ${new Date(session.scheduledDate).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Actual Duration (minutes)"
                type="number"
                value={completionData.duration}
                onChange={(e) => setCompletionData({...completionData, duration: e.target.value})}
                helperText="Duration for all sessions"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Rate the sessions (1-5)
                </Typography>
                <Rating
                  value={completionData.rating}
                  onChange={(event, newValue) => {
                    setCompletionData({...completionData, rating: newValue});
                  }}
                  size="large"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Session Notes"
                value={completionData.notes}
                onChange={(e) => setCompletionData({...completionData, notes: e.target.value})}
                helperText="Notes that will apply to all sessions"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Feedback for Students"
                value={completionData.feedback}
                onChange={(e) => setCompletionData({...completionData, feedback: e.target.value})}
                helperText="Feedback that will apply to all students"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCompletionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkCompleteSessions}
            variant="contained"
            color="success"
            disabled={!completionData.duration || completionData.rating === 0}
          >
            Complete All Sessions ({selectedSessionsForBulk.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resource Dialog */}
      <Dialog open={resourceDialog} onClose={() => setResourceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add New Resource</Typography>
            <IconButton onClick={() => setResourceDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Title"
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                helperText="What's the title of your resource?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Description"
                multiline
                rows={3}
                value={newResource.description}
                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                helperText="Describe what your resource is about."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newResource.type === 'article'}
                    onChange={(e) => setNewResource({...newResource, type: e.target.checked ? 'article' : 'video'})}
                    name="type"
                    color="primary"
                  />
                }
                label="Article"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newResource.type === 'video'}
                    onChange={(e) => setNewResource({...newResource, type: e.target.checked ? 'video' : 'article'})}
                    name="type"
                    color="primary"
                  />
                }
                label="Video"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource URL (for articles)"
                value={newResource.content.url}
                onChange={(e) => setNewResource({...newResource, content: {...newResource.content, url: e.target.value}})}
                helperText="Provide a link to the article if it's an article."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Body (for articles)"
                multiline
                rows={4}
                value={newResource.content.body}
                onChange={(e) => setNewResource({...newResource, content: {...newResource.content, body: e.target.value}})}
                helperText="Provide the content of the article if it's an article."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Category"
                value={newResource.category}
                onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                helperText="What category does your resource fall into?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddResource}
            variant="contained"
            color="primary"
            disabled={!newResource.title || !newResource.description || !newResource.type || (!newResource.content.url && newResource.type === 'article')}
          >
            Add Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MentorDashboard; 