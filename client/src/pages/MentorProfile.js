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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  Schedule,
  VideoCall,
  Chat,
  LocationOn,
  Work,
  School,
  Business,
  Engineering,
  Science,
  Palette,
  LocalHospital,
  Computer,
  Psychology,
  TrendingUp,
  VerifiedUser,
  CalendarToday,
  AccessTime,
  Language,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  Book,
  Assignment,
  EmojiEvents,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MentorProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  // Add to component state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const expertiseOptions = [
    { value: 'engineering', label: 'Engineering', icon: <Engineering /> },
    { value: 'science', label: 'Science', icon: <Science /> },
    { value: 'business', label: 'Business', icon: <Business /> },
    { value: 'creative', label: 'Creative Arts', icon: <Palette /> },
    { value: 'healthcare', label: 'Healthcare', icon: <LocalHospital /> },
    { value: 'technology', label: 'Technology', icon: <Computer /> },
    { value: 'psychology', label: 'Psychology', icon: <Psychology /> },
  ];

  const ratingOptions = [
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Other', label: 'Other' },
  ];

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [mentors, searchTerm, selectedExpertise, selectedRating, selectedLanguage]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/mentors?limit=100'); // Request more mentors
      const mentorList = Array.isArray(response.data) 
        ? response.data 
        : (response.data.mentors || []);
      
      console.log('Mentors data:', mentorList.slice(0, 1)); // Debug first mentor
      console.log('Total mentors fetched:', mentorList.length); // Debug total count
      setMentors(mentorList);
      setFilteredMentors(mentorList);
    } catch (err) {
      setError('Failed to load mentors');
      console.error('Mentors fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;

    // Search by name or expertise
    if (searchTerm) {
      filtered = filtered.filter(mentor => {
        const mentorName = mentor.userId?.firstName && mentor.userId?.lastName 
          ? `${mentor.userId.firstName} ${mentor.userId.lastName}` 
          : mentor.name || '';
        return mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (mentor.expertise?.[0]?.field?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      });
    }

    // Filter by expertise
    if (selectedExpertise) {
      filtered = filtered.filter(mentor => mentor.expertise?.[0]?.field === selectedExpertise);
    }

    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter(mentor => (mentor.averageRating || 0) >= parseFloat(selectedRating));
    }

    // Filter by language
    if (selectedLanguage) {
      filtered = filtered.filter(mentor =>
        mentor.languages && mentor.languages.includes(selectedLanguage)
      );
    }

    setFilteredMentors(filtered);
  };

  const handleBookSession = (mentor) => {
    // Navigate to the session booking page with mentor ID
    navigate(`/student/book-session/${mentor._id}`);
  };

  const handleSlotSelect = (mentor, day, slot) => {
    setBookingDetails({ mentor, day, slot });
    setBookingDialogOpen(true);
  };

  const handleBookSessionConfirm = async () => {
    setBookingLoading(true);
    try {
      await axios.post('/api/students/sessions', {
        mentorId: bookingDetails.mentor._id,
        day: bookingDetails.day,
        startTime: bookingDetails.slot.startTime,
        endTime: bookingDetails.slot.endTime,
      });
      setBookingSuccess(true);
    } catch (err) {
      alert('Booking failed!');
    }
    setBookingLoading(false);
  };

  const getExpertiseIcon = (expertise) => {
    const option = expertiseOptions.find(opt => opt.value === expertise);
    return option ? option.icon : <Work />;
  };

  const getAvailabilityStatus = (mentor) => {
    // Check if mentor is approved and has availability
    if (mentor.verification?.status === 'approved' && mentor.availability?.length > 0) {
      // Check if there are any available slots
      const hasAvailableSlots = mentor.availability.some(day => 
        day.slots && day.slots.some(slot => slot.isAvailable)
      );
      return hasAvailableSlots ? 'Available' : 'Busy';
    }
    return 'Busy';
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
          <SchoolIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Find Your Mentor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with experienced professionals who can guide your career journey.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search mentors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Expertise</InputLabel>
              <Select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                label="Expertise"
              >
                <MenuItem value="">All Expertise</MenuItem>
                {expertiseOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center">
                      {option.icon}
                      <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rating</InputLabel>
              <Select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                label="Rating"
              >
                <MenuItem value="">All Ratings</MenuItem>
                {ratingOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                label="Language"
              >
                <MenuItem value="">All Languages</MenuItem>
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedExpertise('');
                setSelectedRating('');
                setSelectedLanguage('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box mb={3}>
        <Typography variant="h6" color="text.secondary">
          Found {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Mentors Grid */}
      <Grid container spacing={3}>
        {Array.isArray(filteredMentors) && filteredMentors.map((mentor) => (
          <Grid item xs={12} md={6} lg={4} key={mentor._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Mentor Header */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{ width: 60, height: 60, mr: 2 }}
                    src={mentor.userId?.profilePicture}
                  >
                    {(mentor.userId?.firstName || mentor.name || 'M').charAt(0)}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6" gutterBottom>
                      {mentor.userId?.firstName && mentor.userId?.lastName 
                        ? `${mentor.userId.firstName} ${mentor.userId.lastName}`
                        : mentor.name 
                        ? mentor.name
                        : mentor.userId?.firstName 
                        ? mentor.userId.firstName
                        : 'Mentor'}
                      {mentor.verification?.status === 'approved' && (
                        <Tooltip title="Verified Mentor">
                          <VerifiedUser sx={{ ml: 1, color: 'primary.main', fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Rating value={mentor.ratings?.average || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({mentor.ratings?.totalReviews || 0} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Expertise */}
                <Box display="flex" alignItems="center" mb={2}>
                  {getExpertiseIcon(mentor.expertise?.[0]?.field)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {mentor.expertise?.[0]?.field || 'General'}
                  </Typography>
                </Box>

                {/* Experience */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Work sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">
                    {mentor.professionalInfo?.experience || 0} years experience
                  </Typography>
                </Box>

                {/* Bio */}
                <Typography variant="body2" color="text.secondary" paragraph>
                  {mentor.bio?.substring(0, 100)}...
                </Typography>

                {/* Stats */}
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {mentor.totalSessions || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sessions
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {mentor.successRate || 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="info.main">
                      {mentor.responseTime || '24h'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Response Time
                    </Typography>
                  </Box>
                </Box>

                {/* Availability Status */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    label={getAvailabilityStatus(mentor)}
                    color={getAvailabilityStatus(mentor) === 'Available' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                {/* Skills */}
                <Box mb={2}>
                  {mentor.skills?.slice(0, 3).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Schedule />}
                  onClick={() => handleBookSession(mentor)}
                  disabled={getAvailabilityStatus(mentor) !== 'Available'}
                >
                  Book Session
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredMentors.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No mentors found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters.
          </Typography>
        </Paper>
      )}

      {/* Mentor Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMentor && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ mr: 2 }} src={selectedMentor.profileImage}>
                  {(selectedMentor.userId?.firstName || selectedMentor.name || 'M').charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedMentor.userId?.firstName && selectedMentor.userId?.lastName ? `${selectedMentor.userId.firstName} ${selectedMentor.userId.lastName}` : selectedMentor.name || 'Mentor'}
                    {selectedMentor.isVerified && (
                      <VerifiedUser sx={{ ml: 1, color: 'primary.main' }} />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMentor.expertise?.[0]?.field || 'General'} • {selectedMentor.professionalInfo?.experience || 0} years experience
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs
                value={selectedTab}
                onChange={(e, newValue) => setSelectedTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="About" />
                <Tab label="Experience" />
                <Tab label="Reviews" />
                <Tab label="Availability" />
                <Tab label="Achievements" />
              </Tabs>

              {/* About Tab */}
              {selectedTab === 0 && (
                <Box>
                  <Typography variant="body1" paragraph>
                    {selectedMentor.bio || 'No bio available'}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Skills & Expertise
                  </Typography>
                  <Box mb={2}>
                    {selectedMentor.expertise?.map((exp, idx) => (
                      <Chip
                        key={idx}
                        label={`${exp.field}${exp.subFields && exp.subFields.length ? ' - ' + exp.subFields.join(', ') : ''}`}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Languages
                  </Typography>
                  <Box mb={2}>
                    {selectedMentor.languages?.map((lang, idx) => (
                      <Chip key={idx} label={lang} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                  {selectedMentor.location && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Location
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {selectedMentor.location.city}, {selectedMentor.location.state}, {selectedMentor.location.country}
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              {/* Experience Tab */}
              {selectedTab === 1 && (
                <Box>
                  <List>
                    {selectedMentor.experience?.map((exp, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Work />
                        </ListItemIcon>
                        <ListItemText
                          primary={exp.title}
                          secondary={`${exp.company} • ${exp.duration}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Achievements Tab */}
              {selectedTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  {selectedMentor.achievements?.map((ach, idx) => (
                    <Box key={idx} mb={2}>
                      <Typography variant="subtitle1">{ach.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{ach.description}</Typography>
                      <Typography variant="caption">{ach.year}</Typography>
                    </Box>
                  ))}
                  <Typography variant="h6" gutterBottom>
                    Badges
                  </Typography>
                  <Box>
                    {selectedMentor.badges?.map((badge, idx) => (
                      <Chip key={idx} label={badge.name} icon={<EmojiEvents />} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Reviews Tab */}
              {selectedTab === 2 && (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating value={selectedMentor.ratings?.average || 0} readOnly />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {selectedMentor.ratings?.average?.toFixed(1)} / 5
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Based on {selectedMentor.ratings?.totalReviews || 0} reviews
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {selectedMentor.ratings?.reviews?.map((review, idx) => (
                    <Box key={idx} mb={2}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Availability Tab */}
              {selectedTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedMentor.availability?.schedule?.map((slot, idx) => (
                      slot.slots?.filter(s => s.isAvailable).map((s, sIdx) => (
                        <Grid item xs={12} sm={6} key={sIdx}>
                          <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => handleSlotSelect(selectedMentor, slot.day, s)}>
                            <CardContent>
                              <Typography variant="subtitle2">{slot.day}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {s.startTime} - {s.endTime}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ))}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Schedule />}
                onClick={() => {
                  setDialogOpen(false);
                  // Navigate to session booking with mentor ID
                  navigate(`/student/book-session/${selectedMentor._id}`);
                }}
              >
                Book Session
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)}>
        <DialogTitle>Confirm Session Booking</DialogTitle>
        <DialogContent>
          {bookingSuccess ? (
            <Alert severity="success">Session booked successfully!</Alert>
          ) : (
            <>
              <Typography>
                Book a session with {bookingDetails?.mentor?.name} on {bookingDetails?.day} from {bookingDetails?.slot?.startTime} to {bookingDetails?.slot?.endTime}?
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
          {!bookingSuccess && (
            <Button onClick={handleBookSessionConfirm} disabled={bookingLoading} variant="contained">
              {bookingLoading ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MentorProfile; 