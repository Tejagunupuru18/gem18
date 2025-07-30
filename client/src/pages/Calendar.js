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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Badge,
  IconButton,
  Tooltip,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CalendarToday,
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
  AccessTime,
  Person,
  Business,
  Event,
  EventNote,
  EventAvailable,
  EventBusy,
  EventSeat,
  EventRepeat,
  EventAvailableOutlined,
  EventBusyOutlined,
  EventSeatOutlined,
  EventRepeatOutlined,
  EventNoteOutlined,
  EventOutlined,
  Today,
  DateRange,
  ViewWeek,
  ViewModule,
  ViewDay,
  ViewAgenda,
  ViewList,
  ViewTimeline,
  ViewComfy,
  ViewCompact,
  ViewHeadline,
  ViewQuilt,
  ViewStream,
  ViewColumn,
  ViewCarousel,
  ViewArray,
  ViewModuleOutlined,
  ViewDayOutlined,
  ViewAgendaOutlined,
  ViewListOutlined,
  ViewTimelineOutlined,
  ViewComfyOutlined,
  ViewCompactOutlined,
  ViewHeadlineOutlined,
  ViewQuiltOutlined,
  ViewStreamOutlined,
  ViewColumnOutlined,
  ViewCarouselOutlined,
  ViewArrayOutlined,
  ExpandMore,
  LocationOn,
  AttachMoney,
  EmojiEvents,
  TrendingDown,
  Warning,
  Info,
  Help,
  ContactSupport,
  Email,
  Phone,
  Language,
  OpenInNew,
  Download,
  Print,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Grade,
  Timeline,
  Assessment,
  PsychologyAlt,
  AutoAwesome,
  Celebration,
  Rocket,
  Lightbulb,
  Group,
  Public,
  LocalLibrary,
  Science,
  Code,
  Brush,
  SportsEsports,
  MusicNote,
  FitnessCenter,
  Restaurant,
  Hotel,
  Flight,
  DirectionsCar,
  LocalHospital,
  Security,
  Gavel,
  AccountBalance,
  SchoolOutlined,
  WorkOutline,
  BusinessCenter,
  Engineering,
  MedicalServices,
  Architecture,
  DesignServices,
  Computer,
  PhoneAndroid,
  TabletMac,
  Laptop,
  Watch,
  Headphones,
  CameraAlt,
  Videocam,
  Mic,
  Keyboard,
  Mouse,
  Router,
  Storage,
  Cloud,
  Wifi,
  Bluetooth,
  Nfc,
  GpsFixed,
  Map,
  Navigation,
  Directions,
  Traffic,
  Train,
  DirectionsBus,
  DirectionsBike,
  DirectionsWalk,
  DirectionsRun,
  DirectionsBoat,
  DirectionsSubway,
  DirectionsTransit,
  DirectionsRailway,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);
  const [view, setView] = useState('month'); // month, week, day, list
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all'); // all, sessions, events, reminders
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsRes, sessionsRes] = await Promise.all([
        axios.get('/api/students/events'),
        axios.get('/api/students/sessions'),
      ]);
      
      // Ensure data is always an array
      const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : 
                        eventsRes.data.events ? eventsRes.data.events : 
                        eventsRes.data.data ? eventsRes.data.data : [];
      const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : 
                          sessionsRes.data.sessions ? sessionsRes.data.sessions : 
                          sessionsRes.data.data ? sessionsRes.data.data : [];
      
      setEvents(eventsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setEvents([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllEvents = () => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    const eventsArray = Array.isArray(events) ? events : [];
    
    const allEvents = [
      ...sessionsArray.map(session => ({
        ...session,
        type: 'session',
        title: session.title,
        start: new Date(session.scheduledDate),
        end: new Date(new Date(session.scheduledDate).getTime() + 60 * 60 * 1000), // 1 hour duration
        color: getEventColor(session.status),
      })),
      ...eventsArray.map(event => ({
        ...event,
        type: 'event',
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        color: getEventColor(event.type),
      })),
    ];
    
    return allEvents.sort((a, b) => a.start - b.start);
  };

  const getEventColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'upcoming':
        return '#2196f3';
      case 'cancelled':
        return '#f44336';
      case 'reminder':
        return '#ff9800';
      case 'deadline':
        return '#e91e63';
      default:
        return '#757575';
    }
  };

  const getFilteredEvents = () => {
    let filtered = getAllEvents();
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    switch (filter) {
      case 'sessions':
        filtered = filtered.filter(event => event.type === 'session');
        break;
      case 'events':
        filtered = filtered.filter(event => event.type === 'event');
        break;
      case 'reminders':
        filtered = filtered.filter(event => event.type === 'reminder');
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return getFilteredEvents().filter(event => 
      event.start.toDateString() === dateStr
    );
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDialog(true);
  };

  const handleJoinSession = (sessionId) => {
    // Implement session joining functionality
    console.log('Joining session:', sessionId);
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await axios.put(`/api/students/sessions/${sessionId}/cancel`);
      fetchCalendarData();
      setEventDialog(false);
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              Previous
            </Button>
            <Button size="small" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button size="small" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              Next
            </Button>
          </Box>
        </Box>
        
        <Grid container>
          {weekDays.map(day => (
            <Grid item xs key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 'bold' }}>
              {day}
            </Grid>
          ))}
          
          {days.map((day, index) => (
            <Grid item xs key={index} sx={{ 
              p: 1, 
              minHeight: 100, 
              border: '1px solid #e0e0e0',
              bgcolor: day && day.toDateString() === new Date().toDateString() ? 'primary.light' : 'inherit'
            }}>
              {day && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {day.getDate()}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {getEventsForDate(day).slice(0, 3).map((event, eventIndex) => (
                      <Chip
                        key={eventIndex}
                        label={event.title}
                        size="small"
                        sx={{ 
                          bgcolor: event.color,
                          color: 'white',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => handleEventClick(event)}
                      />
                    ))}
                    {getEventsForDate(day).length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{getEventsForDate(day).length - 3} more
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  const renderListView = () => {
    const events = getFilteredEvents();
    
    return (
      <Paper>
        <List>
          {events.map((event, index) => (
            <React.Fragment key={event._id || index}>
              <ListItem 
                button 
                onClick={() => handleEventClick(event)}
                sx={{ py: 2 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: event.color }}>
                    {event.type === 'session' ? <VideoCall /> : <Event />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.start)} at {formatTime(event.start)}
                      </Typography>
                      {event.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {event.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < events.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
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
          Calendar 📅
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your schedule, sessions, and important events
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <VideoCall sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Array.isArray(sessions) ? sessions.filter(s => s.status === 'upcoming').length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming Sessions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Event sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {events.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Events
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Array.isArray(sessions) ? sessions.filter(s => s.status === 'completed').length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed Sessions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {getAllEvents().length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={view === 'month' ? 'contained' : 'outlined'}
              onClick={() => setView('month')}
              startIcon={<ViewModule />}
            >
              Month
            </Button>
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
              startIcon={<ViewList />}
            >
              List
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="sessions">Sessions</MenuItem>
                <MenuItem value="events">Events</MenuItem>
                <MenuItem value="reminders">Reminders</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Calendar View */}
      {view === 'month' ? renderMonthView() : renderListView()}

      {/* Event Details Dialog */}
      <Dialog open={eventDialog} onClose={() => setEventDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: selectedEvent?.color }}>
              {selectedEvent?.type === 'session' ? <VideoCall /> : <Event />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedEvent?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEvent?.type === 'session' ? 'Mentoring Session' : 'Event'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedEvent.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedEvent.start)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Time:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                  </Typography>
                </Grid>
                
                {selectedEvent.type === 'session' && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Mentor:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEvent.mentor?.firstName} {selectedEvent.mentor?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Status:
                      </Typography>
                      <Chip
                        label={selectedEvent.status}
                        color={selectedEvent.status === 'upcoming' ? 'primary' : 
                               selectedEvent.status === 'completed' ? 'success' : 'error'}
                        size="small"
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              {selectedEvent.type === 'session' && selectedEvent.status === 'upcoming' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Session will start in {Math.floor((selectedEvent.start - new Date()) / (1000 * 60 * 60))} hours
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialog(false)}>Close</Button>
          {selectedEvent?.type === 'session' && selectedEvent?.status === 'upcoming' && (
            <>
              <Button 
                variant="outlined" 
                startIcon={<Message />}
                onClick={() => {
                  // Navigate to messages
                  window.location.href = '/student/messages';
                }}
              >
                Message Mentor
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleCancelSession(selectedEvent._id)}
              >
                Cancel Session
              </Button>
              <Button 
                variant="contained" 
                startIcon={<VideoCall />}
                onClick={() => handleJoinSession(selectedEvent._id)}
              >
                Join Session
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Add Event"
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

export default Calendar; 