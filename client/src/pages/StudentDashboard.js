import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  School,
  Business,
  Book,
  Quiz,
  Article,
  VideoCall,
  TrendingUp,
  Star,
  Schedule,
  Person,
  Search,
  FilterList,
  Add,
  CheckCircle,
  Cancel,
  Message,
  Notifications,
  Assignment,
  EmojiEvents,
  Psychology,
  Work,
  CalendarToday,
  Bookmark,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    quizScore: 0,
  });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch mentors, sessions, resources, and stats
      const [mentorsRes, sessionsRes, resourcesRes, statsRes] = await Promise.all([
        axios.get('/api/students/mentors'),
        axios.get('/api/students/sessions'),
        axios.get('/api/resources'),
        axios.get('/api/students/stats'),
      ]);

      // Handle mentors data - it could be an array or object with mentors property
      const mentorsData = Array.isArray(mentorsRes.data) 
        ? mentorsRes.data 
        : (mentorsRes.data.mentors || []);
      setMentors(mentorsData.slice(0, 6)); // Show top 6 mentors
      // Handle sessions data - it could be an array or object with sessions property
      const sessionsData = Array.isArray(sessionsRes.data) 
        ? sessionsRes.data 
        : (sessionsRes.data.sessions || sessionsRes.data || []);
      setSessions(sessionsData);
      // Handle resources data - it could be an array or object with resources property
      const resourcesData = Array.isArray(resourcesRes.data) 
        ? resourcesRes.data 
        : (resourcesRes.data.resources || resourcesRes.data);
      setResources(Array.isArray(resourcesData) ? resourcesData.slice(0, 4) : []); // Show top 4 resources
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    try {
      await axios.post('/api/students/sessions', {
        mentorId: selectedMentor._id,
        ...bookingData,
      });
      setBookingDialog(false);
      setSelectedMentor(null);
      setBookingData({ title: '', description: '', date: '', time: '' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error booking session:', error);
    }
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
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName || 'Student'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Continue your learning journey and discover new opportunities.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Book sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
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
            <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {stats.quizScore}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quiz Score
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Featured Mentors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                Featured Mentors
              </Typography>
              <Button size="small" color="primary" onClick={() => navigate('/student/mentors')}>
                View All
              </Button>
            </Box>
            <List>
              {mentors.map((mentor, index) => (
                <React.Fragment key={mentor._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={mentor.profileImage}>
                        {mentor.firstName?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {mentor.firstName} {mentor.lastName}
                          </Typography>
                          <Rating value={mentor.averageRating || 0} size="small" readOnly />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {mentor.designation} at {mentor.organization}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={mentor.expertise} size="small" color="primary" />
                            <Chip label={`${mentor.experience} years`} size="small" />
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      Book Session
                    </Button>
                  </ListItem>
                  {index < mentors.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Sessions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Sessions
              </Typography>
              <Button size="small" color="primary" onClick={() => navigate('/student/sessions')}>
                View All
              </Button>
            </Box>
            <List>
              {sessions.slice(0, 5).map((session, index) => (
                <React.Fragment key={session._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <VideoCall />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={session.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(session.scheduledDate).toLocaleDateString()}
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
                  </ListItem>
                  {index < sessions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access your most important features
              </Typography>
            </Box>
            
            {/* Primary Actions */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }} 
                      onClick={() => navigate('/student/quiz')}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Quiz sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Career Quiz
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Discover your ideal career path
                    </Typography>
                    <Button variant="contained" fullWidth>
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                      onClick={() => navigate('/student/mentors')}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Business sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Find Mentors
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect with industry experts
                    </Typography>
                    <Button variant="contained" fullWidth>
                      Browse Mentors
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                      onClick={() => navigate('/student/resources')}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Article sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Resources Hub
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Scholarships & study guides
                    </Typography>
                    <Button variant="contained" fullWidth>
                      View Resources
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                      onClick={() => navigate('/student/profile')}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Person sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      My Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Update your information
                    </Typography>
                    <Button variant="contained" fullWidth>
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Secondary Actions */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Quick Access
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                      onClick={() => navigate('/student/sessions')}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <VideoCall sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      My Sessions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                      onClick={() => navigate('/student/messages')}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Message sx={{ fontSize: 30, color: 'success.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Messages
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                      onClick={() => navigate('/student/achievements')}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <EmojiEvents sx={{ fontSize: 30, color: 'warning.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Achievements
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                      onClick={() => navigate('/student/scholarships')}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Assignment sx={{ fontSize: 30, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Scholarships
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                      onClick={() => navigate('/student/calendar')}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CalendarToday sx={{ fontSize: 30, color: 'info.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Calendar
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                      onClick={() => navigate('/student/bookmarks')}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Bookmark sx={{ fontSize: 30, color: 'error.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Bookmarks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book Session with {selectedMentor?.firstName} {selectedMentor?.lastName}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Session Title"
            value={bookingData.title}
            onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={bookingData.description}
            onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={bookingData.date}
            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Time"
            type="time"
            value={bookingData.time}
            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button onClick={handleBookSession} variant="contained">
            Book Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Session Booking */}
      <Fab
        color="primary"
        aria-label="Book Session"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => navigate('/student/mentors')}
      >
        <VideoCall />
      </Fab>
    </Container>
  );
};

export default StudentDashboard; 