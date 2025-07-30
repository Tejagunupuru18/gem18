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
  Bookmark,
  BookmarkBorder,
  BookmarkAdd,
  BookmarkRemove,
  Search,
  FilterList,
  Share,
  Download,
  Print,
  Favorite,
  FavoriteBorder,
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
  LocationOn,
  Map,
  Navigation,
  Directions,
  Traffic,
  Train,
  DirectionsBus,
  DirectionsBike,
  DirectionsWalk,
  DirectionsRun,
  DirectionsCarFilled,
  DirectionsBoat,
  DirectionsSubway,
  DirectionsTransit,
    DirectionsRailway,
  Person,
  Article,
  Assignment,
  VideoCall,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState({
    mentors: [],
    resources: [],
    scholarships: [],
    sessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [bookmarkDialog, setBookmarkDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, recent, favorites

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const [mentorsRes, resourcesRes, scholarshipsRes, sessionsRes] = await Promise.all([
        axios.get('/api/students/bookmarks/mentors'),
        axios.get('/api/students/bookmarks/resources'),
        axios.get('/api/students/bookmarks/scholarships'),
        axios.get('/api/students/bookmarks/sessions'),
      ]);
      
      // Ensure each bookmark type is always an array
      const mentorsData = Array.isArray(mentorsRes.data) ? mentorsRes.data : 
                         mentorsRes.data.mentors ? mentorsRes.data.mentors : 
                         mentorsRes.data.data ? mentorsRes.data.data : [];
      const resourcesData = Array.isArray(resourcesRes.data) ? resourcesRes.data : 
                           resourcesRes.data.resources ? resourcesRes.data.resources : 
                           resourcesRes.data.data ? resourcesRes.data.data : [];
      const scholarshipsData = Array.isArray(scholarshipsRes.data) ? scholarshipsRes.data : 
                              scholarshipsRes.data.scholarships ? scholarshipsRes.data.scholarships : 
                              scholarshipsRes.data.data ? scholarshipsRes.data.data : [];
      const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : 
                          sessionsRes.data.sessions ? sessionsRes.data.sessions : 
                          sessionsRes.data.data ? sessionsRes.data.data : [];
      
      setBookmarks({
        mentors: mentorsData,
        resources: resourcesData,
        scholarships: scholarshipsData,
        sessions: sessionsData,
      });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setBookmarks({
        mentors: [],
        resources: [],
        scholarships: [],
        sessions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredBookmarks = () => {
    let items = [];
    
    switch (tabValue) {
      case 0: // Mentors
        items = Array.isArray(bookmarks.mentors) ? bookmarks.mentors : [];
        break;
      case 1: // Resources
        items = Array.isArray(bookmarks.resources) ? bookmarks.resources : [];
        break;
      case 2: // Scholarships
        items = Array.isArray(bookmarks.scholarships) ? bookmarks.scholarships : [];
        break;
      case 3: // Sessions
        items = Array.isArray(bookmarks.sessions) ? bookmarks.sessions : [];
        break;
      default:
        items = [];
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    switch (filter) {
      case 'recent':
        items = items.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt));
        break;
      case 'favorites':
        items = items.filter(item => item.favorite);
        break;
      default:
        break;
    }
    
    return items;
  };

  const handleRemoveBookmark = async (type, itemId) => {
    try {
      await axios.delete(`/api/students/bookmarks/${type}/${itemId}`);
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleToggleFavorite = async (type, itemId) => {
    try {
      await axios.put(`/api/students/bookmarks/${type}/${itemId}/favorite`);
      fetchBookmarks();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleBookmarkClick = (item) => {
    setSelectedBookmark(item);
    setBookmarkDialog(true);
  };

  const getBookmarkIcon = (type) => {
    switch (type) {
      case 'mentor':
        return <Person />;
      case 'resource':
        return <Article />;
      case 'scholarship':
        return <Assignment />;
      case 'session':
        return <VideoCall />;
      default:
        return <Bookmark />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const totalBookmarks = Object.values(bookmarks).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Bookmarks 🔖
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access your saved mentors, resources, scholarships, and sessions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Bookmark sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {totalBookmarks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Bookmarks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Person sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {bookmarks.mentors.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saved Mentors
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Article sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {bookmarks.resources.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saved Resources
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {bookmarks.scholarships.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saved Scholarships
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Filter"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="recent">Recent</MenuItem>
              <MenuItem value="favorites">Favorites</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab 
            label={`Mentors (${bookmarks.mentors.length})`} 
            icon={<Person />} 
            iconPosition="start"
          />
          <Tab 
            label={`Resources (${bookmarks.resources.length})`} 
            icon={<Article />} 
            iconPosition="start"
          />
          <Tab 
            label={`Scholarships (${bookmarks.scholarships.length})`} 
            icon={<Assignment />} 
            iconPosition="start"
          />
          <Tab 
            label={`Sessions (${bookmarks.sessions.length})`} 
            icon={<VideoCall />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Bookmarks Grid */}
      <Grid container spacing={3}>
        {getFilteredBookmarks().map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 4 },
                position: 'relative',
              }}
              onClick={() => handleBookmarkClick(item)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    src={item.profileImage || item.image}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                    }}
                  >
                    {getBookmarkIcon(tabValue === 0 ? 'mentor' : tabValue === 1 ? 'resource' : tabValue === 2 ? 'scholarship' : 'session')}
                  </Avatar>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(
                          tabValue === 0 ? 'mentors' : 
                          tabValue === 1 ? 'resources' : 
                          tabValue === 2 ? 'scholarships' : 'sessions',
                          item._id
                        );
                      }}
                    >
                      {item.favorite ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBookmark(
                          tabValue === 0 ? 'mentors' : 
                          tabValue === 1 ? 'resources' : 
                          tabValue === 2 ? 'scholarships' : 'sessions',
                          item._id
                        );
                      }}
                    >
                      <BookmarkRemove />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {item.title || item.name || `${item.firstName} ${item.lastName}`}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description || item.bio || item.summary}
                </Typography>

                {tabValue === 0 && item.expertise && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={item.expertise?.[0]?.field || 'General'} size="small" color="primary" />
                    <Chip label={`${item.experience} years`} size="small" />
                  </Box>
                )}

                {tabValue === 1 && item.category && (
                  <Chip label={item.category} size="small" color="primary" sx={{ mb: 2 }} />
                )}

                {tabValue === 2 && item.amount && (
                  <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                    {formatAmount(item.amount)}
                  </Typography>
                )}

                {tabValue === 3 && item.status && (
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={item.status === 'completed' ? 'success' : 
                           item.status === 'upcoming' ? 'primary' : 'error'}
                    sx={{ mb: 2 }}
                  />
                )}

                <Typography variant="caption" color="text.secondary">
                  Bookmarked on {formatDate(item.bookmarkedAt)}
                </Typography>
              </CardContent>

              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<Visibility />}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to the appropriate page
                    if (tabValue === 0) {
                      window.location.href = `/student/mentors/${item._id}`;
                    } else if (tabValue === 1) {
                      window.location.href = `/student/resources/${item._id}`;
                    } else if (tabValue === 2) {
                      window.location.href = `/student/scholarships/${item._id}`;
                    } else {
                      window.location.href = `/student/sessions/${item._id}`;
                    }
                  }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getFilteredBookmarks().length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Bookmark sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookmarks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 && "Start bookmarking mentors you're interested in!"}
            {tabValue === 1 && "Save useful resources for later reference."}
            {tabValue === 2 && "Bookmark scholarships you want to apply for."}
            {tabValue === 3 && "Save important sessions for quick access."}
          </Typography>
        </Paper>
      )}

      {/* Bookmark Details Dialog */}
      <Dialog open={bookmarkDialog} onClose={() => setBookmarkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={selectedBookmark?.profileImage || selectedBookmark?.image}
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.main',
              }}
            >
              {selectedBookmark && getBookmarkIcon(
                tabValue === 0 ? 'mentor' : 
                tabValue === 1 ? 'resource' : 
                tabValue === 2 ? 'scholarship' : 'session'
              )}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedBookmark?.title || selectedBookmark?.name || 
                 `${selectedBookmark?.firstName} ${selectedBookmark?.lastName}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0 ? 'Mentor' : 
                 tabValue === 1 ? 'Resource' : 
                 tabValue === 2 ? 'Scholarship' : 'Session'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBookmark && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedBookmark.description || selectedBookmark.bio || selectedBookmark.summary}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {tabValue === 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Expertise:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBookmark.expertise?.[0]?.field || 'General'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Experience:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBookmark.experience} years
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {tabValue === 1 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Category:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBookmark.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Type:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBookmark.type}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {tabValue === 2 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Amount:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatAmount(selectedBookmark.amount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Deadline:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(selectedBookmark.deadline)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {tabValue === 3 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Date:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(selectedBookmark.scheduledDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Status:
                      </Typography>
                      <Chip
                        label={selectedBookmark.status}
                        color={selectedBookmark.status === 'completed' ? 'success' : 
                               selectedBookmark.status === 'upcoming' ? 'primary' : 'error'}
                        size="small"
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Bookmarked on:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedBookmark.bookmarkedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkDialog(false)}>Close</Button>
          <Button 
            startIcon={<Share />}
            onClick={() => {
              // Implement sharing functionality
              console.log('Sharing bookmark:', selectedBookmark?.title);
            }}
          >
            Share
          </Button>
          {selectedBookmark && (
            <Button 
              variant="contained" 
              onClick={() => {
                // Navigate to the appropriate page
                if (tabValue === 0) {
                  window.location.href = `/student/mentors/${selectedBookmark._id}`;
                } else if (tabValue === 1) {
                  window.location.href = `/student/resources/${selectedBookmark._id}`;
                } else if (tabValue === 2) {
                  window.location.href = `/student/scholarships/${selectedBookmark._id}`;
                } else {
                  window.location.href = `/student/sessions/${selectedBookmark._id}`;
                }
              }}
            >
              View Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Add Bookmark"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => {
          // Navigate to the appropriate page based on current tab
          const pages = ['/student/mentors', '/student/resources', '/student/scholarships', '/student/sessions'];
          window.location.href = pages[tabValue];
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Bookmarks; 