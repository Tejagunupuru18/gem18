import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Person,
  Schedule,
  Star,
  VideoCall,
  CheckCircle,
  Cancel,
  Assessment,
  CalendarToday,
  BarChart,
  PieChart,
  Timeline
} from '@mui/icons-material';
import axios from 'axios';

const MentorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, sessionsRes] = await Promise.all([
        axios.get('/api/mentors/stats'),
        axios.get('/api/mentors/sessions')
      ]);
      
      setStats(statsRes.data);
      setSessions(sessionsRes.data.sessions || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatusCount = (status) => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    return sessionsArray.filter(session => session.status === status).length;
  };

  const getAverageSessionDuration = () => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    const completedSessions = sessionsArray.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return 0;
    
    const totalDuration = completedSessions.reduce((sum, session) => 
      sum + (session.actualDuration || session.duration || 0), 0
    );
    return Math.round(totalDuration / completedSessions.length);
  };

  const getTopStudents = () => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    const studentSessions = {};
    sessionsArray.forEach(session => {
      if (session.studentId) {
        const studentName = `${session.studentId.firstName} ${session.studentId.lastName}`;
        studentSessions[studentName] = (studentSessions[studentName] || 0) + 1;
      }
    });
    
    return Object.entries(studentSessions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, sessions: count }));
  };

  const getMonthlyTrend = () => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    const monthlyData = {};
    sessionsArray.forEach(session => {
      const date = new Date(session.scheduledDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, sessions: count }));
  };

  const getRatingDistribution = () => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    const ratings = sessionsArray
      .filter(s => s.feedback?.student?.rating)
      .map(s => s.feedback.student.rating);
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    return distribution;
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={fetchAnalytics} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard 📊
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your mentoring performance and insights
        </Typography>
      </Box>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VideoCall sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.overall?.totalSessions || 0}
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats.overall?.completedSessions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {Math.round((stats.overall?.totalHours || 0) / 60)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    {(stats.overall?.averageRating || 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<Assessment />} />
            <Tab label="Performance" icon={<TrendingUp />} />
            <Tab label="Students" icon={<Person />} />
            <Tab label="Sessions" icon={<VideoCall />} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Session Status Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography>Completed</Typography>
                    </Box>
                    <Chip label={getSessionStatusCount('completed')} color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography>Upcoming</Typography>
                    </Box>
                    <Chip label={getSessionStatusCount('upcoming')} color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Cancel sx={{ color: 'error.main', mr: 1 }} />
                      <Typography>Cancelled</Typography>
                    </Box>
                    <Chip label={getSessionStatusCount('cancelled')} color="error" />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Average Session Duration</Typography>
                    <Typography variant="h6">{getAverageSessionDuration()} min</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Completion Rate</Typography>
                    <Typography variant="h6">
                      {stats.overall?.totalSessions > 0 
                        ? Math.round((stats.overall.completedSessions / stats.overall.totalSessions) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Unique Students</Typography>
                    <Typography variant="h6">
                      {new Set(sessions.map(s => s.studentId?._id).filter(Boolean)).size}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Monthly Session Trend
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                  {getMonthlyTrend().map((data, index) => (
                    <Box
                      key={data.month}
                      sx={{
                        flex: 1,
                        height: `${(data.sessions / Math.max(...getMonthlyTrend().map(d => d.sessions))) * 100}%`,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    >
                      {data.sessions}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  {getMonthlyTrend().map(data => (
                    <Typography key={data.month} variant="caption" color="text.secondary">
                      {new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                    </Typography>
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Rating Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(getRatingDistribution()).map(([rating, count]) => (
                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2">{rating}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                        <Box
                          sx={{
                            width: `${count > 0 ? (count / Math.max(...Object.values(getRatingDistribution()))) * 100 : 0}%`,
                            height: '100%',
                            bgcolor: 'warning.main',
                            borderRadius: 1
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 30 }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Students Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Students by Sessions
            </Typography>
            <List>
              {getTopStudents().map((student, index) => (
                <React.Fragment key={student.name}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {student.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={`${student.sessions} session${student.sessions !== 1 ? 's' : ''}`}
                    />
                    <Chip label={`#${index + 1}`} color="primary" size="small" />
                  </ListItem>
                  {index < getTopStudents().length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {/* Sessions Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Sessions
            </Typography>
            <List>
              {sessions.slice(0, 10).map((session, index) => (
                <React.Fragment key={session._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: session.status === 'completed' ? 'success.main' : 'primary.main' }}>
                        <VideoCall />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={session.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Student: {session.studentId?.firstName} {session.studentId?.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(session.scheduledDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={session.status}
                      color={session.status === 'completed' ? 'success' : 'primary'}
                      size="small"
                    />
                  </ListItem>
                  {index < Math.min(sessions.length, 10) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MentorAnalytics; 