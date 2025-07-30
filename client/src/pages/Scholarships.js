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
  Slider,
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
} from '@mui/material';
import {
  Assignment,
  School,
  Work,
  Business,
  Psychology,
  Science,
  Engineering,
  MedicalServices,
  Architecture,
  DesignServices,
  Computer,
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
  Search,
  FilterList,
  Favorite,
  FavoriteBorder,
  Share,
  Bookmark,
  BookmarkBorder,
  Send,
  CheckCircle,
  Schedule,
  Cancel,
  Add,
  TrendingUp,
  Star,
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
  ScienceOutlined,
  EngineeringOutlined,
  MedicalServicesOutlined,
  ArchitectureOutlined,
  DesignServicesOutlined,
  ComputerOutlined,
  CodeOutlined,
  BrushOutlined,
  SportsEsportsOutlined,
  MusicNoteOutlined,
  FitnessCenterOutlined,
  RestaurantOutlined,
  HotelOutlined,
  FlightOutlined,
  DirectionsCarOutlined,
  LocalHospitalOutlined,
  SecurityOutlined,
  GavelOutlined,
  AccountBalanceOutlined,
  SchoolOutlined,
  WorkOutline,
  BusinessCenter,
  ExpandMore,
  LocationOn,
  AttachMoney,
  CalendarToday,
  AccessTime,
  Person,
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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Scholarships = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [scholarshipDialog, setScholarshipDialog] = useState(false);
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [filter, setFilter] = useState('all'); // all, applied, saved, recommended
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    amount: [0, 100000],
    deadline: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchScholarships();
    fetchApplications();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/scholarships');
      // Ensure scholarships is always an array
      const scholarshipsData = Array.isArray(response.data) ? response.data : 
                              response.data.scholarships ? response.data.scholarships : 
                              response.data.data ? response.data.data : [];
      setScholarships(scholarshipsData);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      setScholarships([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/students/applications');
      // Ensure applications is always an array
      const applicationsData = Array.isArray(response.data) ? response.data : 
                              response.data.applications ? response.data.applications : 
                              response.data.data ? response.data.data : [];
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Set empty array on error
    }
  };

  const getFilteredScholarships = () => {
    // Ensure scholarships is an array before filtering
    let filtered = Array.isArray(scholarships) ? scholarships : [];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(scholarship => 
        scholarship.title.toLowerCase().includes(query) ||
        scholarship.description.toLowerCase().includes(query) ||
        scholarship.organization.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(scholarship => scholarship.category === filters.category);
    }
    
    // Apply amount filter
    filtered = filtered.filter(scholarship => 
      scholarship.amount >= filters.amount[0] && scholarship.amount <= filters.amount[1]
    );
    
    // Apply deadline filter
    if (filters.deadline) {
      const deadline = new Date(filters.deadline);
      filtered = filtered.filter(scholarship => 
        new Date(scholarship.deadline) >= deadline
      );
    }
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(scholarship => 
        scholarship.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply main filter
    switch (filter) {
      case 'applied':
        const appliedIds = applications.map(app => app.scholarshipId);
        filtered = filtered.filter(scholarship => appliedIds.includes(scholarship._id));
        break;
      case 'saved':
        filtered = filtered.filter(scholarship => scholarship.saved);
        break;
      case 'recommended':
        filtered = filtered.filter(scholarship => scholarship.recommended);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const getScholarshipIcon = (category) => {
    const icons = {
      'academic': <School />,
      'career': <Work />,
      'business': <Business />,
      'technology': <Computer />,
      'engineering': <Engineering />,
      'medical': <MedicalServices />,
      'arts': <Brush />,
      'sports': <SportsEsports />,
      'music': <MusicNote />,
      'science': <Science />,
      'law': <Gavel />,
      'finance': <AccountBalance />,
      'architecture': <Architecture />,
      'design': <DesignServices />,
      'psychology': <Psychology />,
      'hospitality': <Hotel />,
      'tourism': <Flight />,
      'transportation': <DirectionsCar />,
      'healthcare': <LocalHospital />,
      'security': <Security />,
    };
    
    return icons[category] || <Assignment />;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return 'error';
    if (days <= 7) return 'warning';
    return 'success';
  };

  const handleApply = async (scholarshipId) => {
    try {
      await axios.post('/api/students/applications', {
        scholarshipId,
      });
      fetchApplications();
      setScholarshipDialog(false);
    } catch (error) {
      console.error('Error applying for scholarship:', error);
    }
  };

  const handleSaveScholarship = async (scholarshipId) => {
    try {
      await axios.post(`/api/students/scholarships/${scholarshipId}/save`);
      fetchScholarships();
    } catch (error) {
      console.error('Error saving scholarship:', error);
    }
  };

  const handleScholarshipClick = (scholarship) => {
    setSelectedScholarship(scholarship);
    setScholarshipDialog(true);
  };

  const isApplied = (scholarshipId) => {
    return applications.some(app => app.scholarshipId === scholarshipId);
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
          Scholarships & Financial Aid 💰
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover opportunities to fund your education and career development
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {scholarships.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Scholarships
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {applications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Applications Submitted
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Bookmark sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Array.isArray(scholarships) ? scholarships.filter(s => s.saved).length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Saved Scholarships
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {formatAmount(scholarships.reduce((sum, s) => sum + s.amount, 0))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Value
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>

        {/* Filter Options */}
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="academic">Academic</MenuItem>
                    <MenuItem value="career">Career</MenuItem>
                    <MenuItem value="technology">Technology</MenuItem>
                    <MenuItem value="engineering">Engineering</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="arts">Arts</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="science">Science</MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Amount Range: {formatAmount(filters.amount[0])} - {formatAmount(filters.amount[1])}
                  </Typography>
                  <Slider
                    value={filters.amount}
                    onChange={(e, newValue) => setFilters({ ...filters, amount: newValue })}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000}
                    step={1000}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Deadline After"
                  value={filters.deadline}
                  onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  size="small"
                  placeholder="City, State, or Country"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Filter Tabs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          All ({scholarships.length})
        </Button>
        <Button
          variant={filter === 'recommended' ? 'contained' : 'outlined'}
          onClick={() => setFilter('recommended')}
        >
                      Recommended ({Array.isArray(scholarships) ? scholarships.filter(s => s.recommended).length : 0})
        </Button>
        <Button
          variant={filter === 'applied' ? 'contained' : 'outlined'}
          onClick={() => setFilter('applied')}
        >
          Applied ({applications.length})
        </Button>
        <Button
          variant={filter === 'saved' ? 'contained' : 'outlined'}
          onClick={() => setFilter('saved')}
        >
                      Saved ({Array.isArray(scholarships) ? scholarships.filter(s => s.saved).length : 0})
        </Button>
      </Box>

      {/* Scholarships Grid */}
      <Grid container spacing={3}>
        {getFilteredScholarships().map((scholarship) => (
          <Grid item xs={12} sm={6} md={4} key={scholarship._id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 4 },
                position: 'relative',
              }}
              onClick={() => handleScholarshipClick(scholarship)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 50,
                      height: 50,
                    }}
                  >
                    {getScholarshipIcon(scholarship.category)}
                  </Avatar>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {scholarship.recommended && (
                      <Tooltip title="Recommended for you">
                        <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                      </Tooltip>
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveScholarship(scholarship._id);
                      }}
                    >
                      {scholarship.saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {scholarship.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {scholarship.description.substring(0, 100)}...
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary.main">
                    {formatAmount(scholarship.amount)}
                  </Typography>
                  <Chip 
                    label={scholarship.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {scholarship.organization}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {scholarship.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                  </Typography>
                </Box>

                <Chip
                  label={`${getDaysUntilDeadline(scholarship.deadline)} days left`}
                  color={getDeadlineColor(scholarship.deadline)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                {isApplied(scholarship._id) && (
                  <Chip
                    label="Applied"
                    color="success"
                    size="small"
                    icon={<CheckCircle />}
                    sx={{ ml: 1 }}
                  />
                )}
              </CardContent>

              <CardActions>
                <Button 
                  size="small" 
                  variant={isApplied(scholarship._id) ? "outlined" : "contained"}
                                      startIcon={isApplied(scholarship._id) ? <CheckCircle /> : <Send />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isApplied(scholarship._id)) {
                      handleApply(scholarship._id);
                    }
                  }}
                  disabled={isApplied(scholarship._id)}
                  fullWidth
                >
                  {isApplied(scholarship._id) ? 'Applied' : 'Apply Now'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getFilteredScholarships().length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No scholarships found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Paper>
      )}

      {/* Scholarship Details Dialog */}
      <Dialog open={scholarshipDialog} onClose={() => setScholarshipDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 60,
                height: 60,
              }}
            >
              {selectedScholarship && getScholarshipIcon(selectedScholarship.category)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedScholarship?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedScholarship?.organization}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedScholarship && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedScholarship.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Amount:
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatAmount(selectedScholarship.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Category:
                  </Typography>
                  <Chip label={selectedScholarship.category} color="primary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedScholarship.location}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Deadline:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedScholarship.deadline).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              {selectedScholarship.requirements && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">Requirements</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      {selectedScholarship.requirements}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}

              {selectedScholarship.howToApply && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">How to Apply</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      {selectedScholarship.howToApply}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}

              {isApplied(selectedScholarship._id) && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  You have already applied for this scholarship
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScholarshipDialog(false)}>Close</Button>
          <Button 
            startIcon={<Share />}
            onClick={() => {
              // Implement sharing functionality
              console.log('Sharing scholarship:', selectedScholarship?.title);
            }}
          >
            Share
          </Button>
          {selectedScholarship && !isApplied(selectedScholarship._id) && (
            <Button 
              variant="contained" 
                                startIcon={<Send />}
              onClick={() => handleApply(selectedScholarship._id)}
            >
              Apply Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="View Applications"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setFilter('applied')}
      >
        <Assignment />
      </Fab>
    </Container>
  );
};

export default Scholarships; 