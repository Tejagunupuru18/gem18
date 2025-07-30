import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  CircularProgress,
  IconButton,
  Badge,
  Fab,
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  CheckCircle,
  Cancel,
  Message,
  Star,
  Edit,
  Delete,
  Add,
  FilterList,
  Search,
  CalendarToday,
  AccessTime,
  Person,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/sessions');
      // Ensure sessions is always an array
      const sessionsData = Array.isArray(response.data) ? response.data : 
                          response.data.sessions ? response.data.sessions : 
                          response.data.data ? response.data.data : [];
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredSessions = () => {
    // Ensure sessions is an array before filtering
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    
    switch (tabValue) {
      case 0: // All
        return sessionsArray;
      case 1: // Upcoming
        return sessionsArray.filter(session => session.status === 'upcoming');
      case 2: // Completed
        return sessionsArray.filter(session => session.status === 'completed');
      case 3: // Cancelled
        return sessionsArray.filter(session => session.status === 'cancelled');
      default:
        return sessionsArray;
    }
  };

  const getStatusColor = (status) => {
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

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setSessionDialog(true);
  };

  const handleReviewSubmit = async () => {
    try {
      await axios.post(`/api/students/sessions/${selectedSession._id}/review`, reviewData);
      setReviewDialog(false);
      setReviewData({ rating: 0, comment: '' });
      fetchSessions(); // Refresh data
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await axios.put(`/api/students/sessions/${sessionId}/cancel`);
      fetchSessions(); // Refresh data
    } catch (error) {
      console.error('Error cancelling session:', error);
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
        <Typography variant="h4" gutterBottom>
          My Sessions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your mentoring sessions and track your progress
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Array.isArray(sessions) ? sessions.length : 0}
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
              {Array.isArray(sessions) ? sessions.filter(s => s.status === 'completed').length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <VideoCall sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Array.isArray(sessions) ? sessions.filter(s => s.status === 'upcoming').length : 0}
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
              {Array.isArray(sessions) ? sessions.filter(s => s.review).length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reviewed
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={`All (${Array.isArray(sessions) ? sessions.length : 0})`} />
          <Tab label={`Upcoming (${Array.isArray(sessions) ? sessions.filter(s => s.status === 'upcoming').length : 0})`} />
          <Tab label={`Completed (${Array.isArray(sessions) ? sessions.filter(s => s.status === 'completed').length : 0})`} />
          <Tab label={`Cancelled (${Array.isArray(sessions) ? sessions.filter(s => s.status === 'cancelled').length : 0})`} />
        </Tabs>
      </Paper>

      {/* Sessions List */}
      <Grid container spacing={3}>
        {getFilteredSessions().map((session) => (
          <Grid item xs={12} md={6} key={session._id}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => handleSessionClick(session)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {session.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      with {session.mentor?.firstName} {session.mentor?.lastName}
                    </Typography>
                  </Box>
                  <Chip
                    label={session.status}
                    color={getStatusColor(session.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(session.scheduledDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(session.scheduledDate).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {session.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar src={session.mentor?.profileImage} sx={{ width: 24, height: 24 }}>
                    {session.mentor?.firstName?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    {session.mentor?.designation} at {session.mentor?.organization}
                  </Typography>
                </Box>

                {session.review && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={session.review.rating} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {session.review.comment}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                {session.status === 'upcoming' && (
                  <>
                    <Button size="small" startIcon={<Message />}>
                      Message
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<Cancel />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelSession(session._id);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {session.status === 'completed' && !session.review && (
                  <Button 
                    size="small" 
                    color="primary" 
                    startIcon={<Star />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(session);
                      setReviewDialog(true);
                    }}
                  >
                    Review
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getFilteredSessions().length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No sessions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 && "You haven't booked any sessions yet."}
            {tabValue === 1 && "You don't have any upcoming sessions."}
            {tabValue === 2 && "You don't have any completed sessions."}
            {tabValue === 3 && "You don't have any cancelled sessions."}
          </Typography>
        </Paper>
      )}

      {/* Session Details Dialog */}
      <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Session Details
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedSession.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedSession.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={selectedSession.mentor?.profileImage}>
                  {selectedSession.mentor?.firstName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {selectedSession.mentor?.firstName} {selectedSession.mentor?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSession.mentor?.designation} at {selectedSession.mentor?.organization}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CalendarToday sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">
                  {new Date(selectedSession.scheduledDate).toLocaleDateString()}
                </Typography>
                <AccessTime sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">
                  {new Date(selectedSession.scheduledDate).toLocaleTimeString()}
                </Typography>
              </Box>

              <Chip
                label={selectedSession.status}
                color={getStatusColor(selectedSession.status)}
                sx={{ mb: 2 }}
              />

              {selectedSession.review && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Your Review
                  </Typography>
                  <Rating value={selectedSession.review.rating} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {selectedSession.review.comment}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialog(false)}>Close</Button>
          {selectedSession?.status === 'upcoming' && (
            <Button variant="contained" startIcon={<VideoCall />}>
              Join Session
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Session</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rate your experience with {selectedSession?.mentor?.firstName} {selectedSession?.mentor?.lastName}
            </Typography>
            <Rating
              value={reviewData.rating}
              onChange={(event, newValue) => setReviewData({ ...reviewData, rating: newValue })}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            label="Your Review"
            multiline
            rows={4}
            value={reviewData.comment}
            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            placeholder="Share your experience and feedback..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Book New Session"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => window.location.href = '/student/mentors'}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default MySessions; 