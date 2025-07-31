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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  Business,
  Assessment,
  VerifiedUser,
  Block,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Delete,
  Add,
  TrendingUp,
  TrendingDown,
  Schedule,
  VideoCall,
  Chat,
  Notifications,
  Settings,
  Analytics,
  ContentPaste,
  Security,
  Support,
  Email,
  Sms,
  Report,
  Flag,
  Star,
  Warning,
  AutoAwesome,
  Psychology,
  Work,
  Science,
  Computer,
  Palette,
  MusicNote,
  Book,
  LocalHospital,
  Build,
  Brush,
  Grass,
  Upload,
  Download,
  FilterList,
  Search,
  Refresh,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pendingMentors, setPendingMentors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    weeklyReports: true
  });
  const [emailMessage, setEmailMessage] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'scholarship',
    category: 'General',
    eligibility: '',
    deadline: '',
    amount: '',
    url: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, mentorsRes, usersRes, resourcesRes, sessionsRes, reportsRes, notificationsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/pending-mentors'),
        axios.get('/api/admin/users'),
        axios.get('/api/resources'),
        axios.get('/api/admin/sessions'),
        axios.get('/api/admin/reports'),
        axios.get('/api/admin/notifications')
      ]);

      setStats(statsRes.data);
      setPendingMentors(mentorsRes.data);
      setAllUsers(usersRes.data);
      setResources(resourcesRes.data.resources || resourcesRes.data);
      setSessions(sessionsRes.data);
      setReports(reportsRes.data);
      setNotifications(notificationsRes.data);
      
      // Load notification settings
      if (notificationsRes.data) {
        setNotificationSettings(notificationsRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const [rejectionReason, setRejectionReason] = useState('');

  const handleMentorAction = async (mentorId, action) => {
    try {
      const payload = { mentorId };
      if (action === 'reject' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      
      await axios.post(`/api/admin/mentors/${action}`, payload);
      setSuccess(`Mentor ${action} successfully!`);
      setRejectionReason('');
      fetchDashboardData();
      setDialogOpen(false);
    } catch (err) {
      setError(`Failed to ${action} mentor`);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { status: action });
      setSuccess(`User ${action} successfully!`);
      fetchDashboardData();
      setDialogOpen(false);
    } catch (err) {
      setError(`Failed to ${action} user`);
    }
  };

  const handleNotificationSettingsChange = async (setting) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [setting]: !notificationSettings[setting]
      };
      
      setNotificationSettings(newSettings);
      
      // Save settings to backend
      await axios.put('/api/admin/notifications', newSettings);
      setSuccess('Notification settings updated successfully!');
    } catch (error) {
      console.error('Update notification settings error:', error);
      setError('Failed to update notification settings');
      // Revert the change if it failed
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };

  const handleAddResource = async () => {
    try {
      await axios.post('/api/admin/resources', newResource);
      setSuccess('Resource added successfully!');
      setResourceDialog(false);
      setNewResource({
        title: '',
        description: '',
        type: 'scholarship',
        category: 'General',
        eligibility: '',
        deadline: '',
        amount: '',
        url: ''
      });
      fetchDashboardData();
    } catch (error) {
      setError('Failed to add resource');
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      await axios.post(`/api/admin/reports/${reportId}/${action}`);
      setSuccess(`Report ${action} successfully`);
      fetchDashboardData();
    } catch (error) {
      setError(`Failed to ${action} report`);
    }
  };

  const handleSendNotification = async (type, message) => {
    try {
      setSendingNotification(true);
      setError('');
      
      if (!message || message.trim() === '') {
        setError('Please enter a message');
        return;
      }

      const response = await axios.post('/api/admin/notifications/send', { 
        type, 
        message: message.trim(),
        title: type === 'email' ? 'Platform Update' : 'New Notification'
      });
      
      setSuccess(`${type === 'email' ? 'Email' : 'Push notification'} sent successfully! ${response.data.details?.sentCount || 0} users notified.`);
      
      // Clear the message field after successful send
      if (type === 'email') {
        setEmailMessage('');
      } else {
        setPushMessage('');
      }
      
    } catch (error) {
      console.error('Send notification error:', error);
      setError(error.response?.data?.message || `Failed to send ${type} notification`);
    } finally {
      setSendingNotification(false);
    }
  };

  const getExpertiseIcon = (expertise) => {
    const iconMap = {
      'Engineering': <Build />,
      'Medical': <LocalHospital />,
      'Arts': <Palette />,
      'Commerce': <Business />,
      'Computer Science': <Computer />,
      'Design': <Brush />,
      'Teaching': <School />,
      'Business': <Business />,
      'Science': <Science />,
      'Technology': <Computer />,
      'Agriculture': <Grass />,
      'Music': <MusicNote />,
      'Literature': <Book />,
      'Psychology': <Psychology />,
      'Other': <Work />
    };
    return iconMap[expertise] || <Work />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'mentor': return 'primary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Dashboard sx={{ mr: 2, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}! Manage your mentorship platform.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VerifiedUser sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.verifiedMentors || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Mentors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalSessions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sessions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Report sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {reports.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reports
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Overview" icon={<Dashboard />} />
          <Tab label="User Verification" icon={<VerifiedUser />} />
          <Tab label="Content Management" icon={<ContentPaste />} />
          <Tab label="Session Oversight" icon={<Schedule />} />
          <Tab label="Reports & Issues" icon={<Report />} />
          <Tab label="Analytics" icon={<Analytics />} />
          <Tab label="Notifications" icon={<Notifications />} />
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === 0 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Platform Overview
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="New mentor registrations"
                          secondary={`${pendingMentors.length} pending approval`}
                        />
                        <Chip label="Action Required" color="warning" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Active sessions today"
                          secondary={`${Array.isArray(sessions) ? sessions.filter(s => s.status === 'in-progress').length : 0} ongoing`}
                        />
                        <Chip label="Live" color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="New reports"
                          secondary={`${reports.filter(r => r.status === 'pending').length} pending review`}
                        />
                        <Chip label="Review" color="error" size="small" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<VerifiedUser />}
                          onClick={() => setSelectedTab(1)}
                        >
                          Review Mentors
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<ContentPaste />}
                          onClick={() => setSelectedTab(2)}
                        >
                          Add Resources
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<Report />}
                          onClick={() => setSelectedTab(4)}
                        >
                          View Reports
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<Analytics />}
                          onClick={() => setSelectedTab(5)}
                        >
                          View Analytics
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* User Verification Tab */}
        {selectedTab === 1 && (
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Mentor Verification</Typography>
              <Badge badgeContent={pendingMentors.length} color="error">
                <Button variant="contained" startIcon={<VerifiedUser />}>
                  Pending Approvals
                </Button>
              </Badge>
            </Box>
            
            {pendingMentors.length === 0 ? (
              <Alert severity="info">
                No pending mentor verifications at this time.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Expertise</TableCell>
                      <TableCell>Experience</TableCell>
                      <TableCell>Documents</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingMentors.map((mentor) => (
                      <TableRow key={mentor._id}>
                        <TableCell>{mentor.name}</TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            {mentor.expertise?.map((exp, index) => (
                              <Chip
                                key={index}
                                icon={getExpertiseIcon(exp)}
                                label={exp}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>{mentor.experience} years</TableCell>
                        <TableCell>
                          <Button size="small" startIcon={<Visibility />}>
                            View
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              onClick={() => {
                                setSelectedUser(mentor);
                                setAction('approve');
                                setDialogOpen(true);
                              }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              onClick={() => {
                                setSelectedUser(mentor);
                                setAction('reject');
                                setDialogOpen(true);
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Content Management Tab */}
        {selectedTab === 2 && (
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Content Management</Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setResourceDialog(true)}
              >
                Add Resource
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {resources.map((resource) => (
                <Grid item xs={12} md={6} key={resource._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {resource.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {resource.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip label={resource.type} size="small" />
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Session Oversight Tab */}
        {selectedTab === 3 && (
          <Box p={3}>
            <Typography variant="h6" mb={2}>Session Overview</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Mentor</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session._id}>
                      <TableCell>{session.student?.name}</TableCell>
                      <TableCell>{session.mentor?.name}</TableCell>
                      <TableCell>{session.title}</TableCell>
                      <TableCell>
                        {new Date(session.scheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={session.status}
                          color={session.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Reports & Issues Tab */}
        {selectedTab === 4 && (
          <Box p={3}>
            <Typography variant="h6" mb={2}>Reports & Issues</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reporter</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>{report.reporter?.name}</TableCell>
                      <TableCell>
                        <Chip label={report.type} size="small" />
                      </TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={report.status === 'resolved' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Resolve">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleReportAction(report._id, 'resolve')}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleReportAction(report._id, 'dismiss')}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Analytics Tab */}
        {selectedTab === 5 && (
          <Box p={3}>
            <Typography variant="h6" mb={2}>Platform Analytics</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Growth
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUp sx={{ color: 'success.main', fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4">{stats.totalUsers || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total registered users
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Session Statistics
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Schedule sx={{ color: 'primary.main', fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4">{stats.totalSessions || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total mentorship sessions
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Popular Expertise Areas
                    </Typography>
                    <Grid container spacing={2}>
                      {['Engineering', 'Medical', 'Computer Science', 'Business'].map((expertise) => (
                        <Grid item xs={6} md={3} key={expertise}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getExpertiseIcon(expertise)}
                            <Typography variant="body2">{expertise}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Notifications Tab */}
        {selectedTab === 6 && (
          <Box p={3}>
            <Typography variant="h6" mb={2}>Notification Management</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notification Settings
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onChange={() => handleNotificationSettingsChange('emailNotifications')}
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.sessionReminders}
                            onChange={() => handleNotificationSettingsChange('sessionReminders')}
                          />
                        }
                        label="Session Reminders"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.weeklyReports}
                            onChange={() => handleNotificationSettingsChange('weeklyReports')}
                          />
                        }
                        label="Weekly Reports"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Send Notifications
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        fullWidth
                        label="Email Message"
                        multiline
                        rows={2}
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        startIcon={sendingNotification ? <CircularProgress size={16} /> : <Email />}
                        onClick={() => handleSendNotification('email', emailMessage)}
                        disabled={!emailMessage || sendingNotification}
                      >
                        {sendingNotification ? 'Sending...' : 'Send Email to All Users'}
                      </Button>
                      <TextField
                        fullWidth
                        label="Push Message"
                        multiline
                        rows={2}
                        value={pushMessage}
                        onChange={(e) => setPushMessage(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        startIcon={sendingNotification ? <CircularProgress size={16} /> : <Notifications />}
                        onClick={() => handleSendNotification('push', pushMessage)}
                        disabled={!pushMessage || sendingNotification}
                      >
                        {sendingNotification ? 'Sending...' : 'Send Push Notification'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Resource Dialog */}
      <Dialog open={resourceDialog} onClose={() => setResourceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newResource.description}
                onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newResource.type}
                  onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                  label="Type"
                >
                  <MenuItem value="scholarship">Scholarship</MenuItem>
                  <MenuItem value="career_guide">Career Guide</MenuItem>
                  <MenuItem value="exam_guide">Exam Guide</MenuItem>
                  <MenuItem value="article">Article</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newResource.category}
                  onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Arts">Arts</MenuItem>
                  <MenuItem value="Commerce">Commerce</MenuItem>
                  <MenuItem value="Law">Law</MenuItem>
                  <MenuItem value="Agriculture">Agriculture</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Teaching">Teaching</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                  <MenuItem value="Music">Music</MenuItem>
                  <MenuItem value="Dance">Dance</MenuItem>
                  <MenuItem value="Literature">Literature</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Eligibility"
                value={newResource.eligibility}
                onChange={(e) => setNewResource(prev => ({ ...prev, eligibility: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                value={newResource.deadline}
                onChange={(e) => setNewResource(prev => ({ ...prev, deadline: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Amount"
                value={newResource.amount}
                onChange={(e) => setNewResource(prev => ({ ...prev, amount: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                value={newResource.url}
                onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialog(false)}>Cancel</Button>
          <Button onClick={handleAddResource} variant="contained">
            Add Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {action} {selectedUser?.firstName} {selectedUser?.lastName}?
          </Typography>
          
          {action === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason (Optional)"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Please provide a reason for rejection..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setRejectionReason('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleMentorAction(selectedUser?._id, action)}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 