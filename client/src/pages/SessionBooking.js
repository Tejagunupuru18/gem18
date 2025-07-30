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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Schedule,
  VideoCall,
  Chat,
  LocationOn,
  Work,
  Business,
  Engineering,
  Science,
  Palette,
  LocalHospital,
  Computer,
  Psychology,
  VerifiedUser,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SessionBooking = () => {
  const { user } = useAuth();
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('video');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sessionTypes = [
    { value: 'video', label: 'Video Call', icon: <VideoCall /> },
    { value: 'chat', label: 'Chat Session', icon: <Chat /> },
    { value: 'in-person', label: 'In-Person', icon: <LocationOn /> },
  ];

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  const topicOptions = [
    'Career Guidance',
    'Resume Review',
    'Interview Preparation',
    'Skill Development',
    'Industry Insights',
    'Project Discussion',
    'Academic Guidance',
    'Personal Development',
    'Networking Tips',
    'Job Search Strategy',
  ];

  useEffect(() => {
    fetchMentors();
  }, [mentorId]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/mentors?limit=100'); // Request more mentors
      const mentorList = Array.isArray(response.data) 
        ? response.data 
        : (response.data.mentors || []);
      setMentors(mentorList);
      
      // If mentorId is provided, find and select that mentor
      if (mentorId) {
        const mentor = mentorList.find(m => m._id === mentorId);
        if (mentor) {
          setSelectedMentor(mentor);
          setActiveStep(1); // Skip to step 2 (session details)
        } else {
          setError('Mentor not found');
        }
      }
    } catch (err) {
      setError('Failed to load mentors');
      console.error('Mentors fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedMentor(null);
    setSelectedDate('');
    setSelectedTime('');
    setSessionType('video');
    setSessionDuration(60);
    setSessionTitle('');
    setSessionDescription('');
    setTopics([]);
  };

  const handleTopicChange = (topic) => {
    setTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleBookSession = async () => {
    try {
      setBookingLoading(true);
      const sessionData = {
        mentorId: selectedMentor._id,
        title: sessionTitle,
        description: sessionDescription,
        scheduledDate: `${selectedDate}T${selectedTime}:00.000Z`,
        duration: sessionDuration,
        sessionType: sessionType === 'video' ? 'video_call' : 
                    sessionType === 'chat' ? 'chat' : 
                    sessionType === 'in-person' ? 'phone' : 'video_call',
        topics: topics,
      };

      const response = await axios.post('/api/students/sessions', sessionData);
      setSuccess('Session booked successfully! Redirecting to sessions page...');
      // Navigate back to sessions page after successful booking
      setTimeout(() => {
        navigate('/student/sessions');
      }, 2000);
    } catch (err) {
      setError('Failed to book session');
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const getExpertiseIcon = (expertise) => {
    const icons = {
      engineering: <Engineering />,
      science: <Science />,
      business: <Business />,
      creative: <Palette />,
      healthcare: <LocalHospital />,
      technology: <Computer />,
      psychology: <Psychology />,
    };
    return icons[expertise] || <Work />;
  };

  const getAvailableTimeSlots = (mentor) => {
    if (!mentor.availability) return [];
    return mentor.availability.map(slot => ({
      day: slot.day,
      time: `${slot.startTime} - ${slot.endTime}`,
      value: `${slot.day}-${slot.startTime}`
    }));
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
          <Schedule sx={{ mr: 2, verticalAlign: 'middle' }} />
          Book a Session
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Schedule a mentorship session with experienced professionals.
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

      {/* Booking Stepper */}
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select Mentor */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Select a Mentor</Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                {mentors.map((mentor) => (
                  <Grid item xs={12} md={6} lg={4} key={mentor._id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedMentor?._id === mentor._id ? 2 : 1,
                        borderColor: selectedMentor?._id === mentor._id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ width: 50, height: 50, mr: 2 }}>
                            {mentor.name.charAt(0)}
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="h6" gutterBottom>
                              {mentor.name}
                              {mentor.isVerified && (
                                <VerifiedUser sx={{ ml: 1, color: 'primary.main', fontSize: 16 }} />
                              )}
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <Rating value={mentor.averageRating || 0} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({mentor.totalRatings || 0})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                          {getExpertiseIcon(mentor.expertise?.[0]?.field)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {mentor.expertise?.[0]?.field || 'General'}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {mentor.bio?.substring(0, 80)}...
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">
                            <Work sx={{ fontSize: 14, mr: 0.5 }} />
                            {mentor.experience} years
                          </Typography>
                          <Typography variant="body2">
                            <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                            {mentor.totalSessions || 0} sessions
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mb: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!selectedMentor}
                  endIcon={<ArrowForward />}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Select Date & Time */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Choose Date & Time</Typography>
            </StepLabel>
            <StepContent>
              {selectedMentor && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedMentor.name}'s Availability
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Select Date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Select Time</InputLabel>
                        <Select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          label="Select Time"
                        >
                          {getAvailableTimeSlots(selectedMentor).map((slot) => (
                            <MenuItem key={slot.value} value={slot.time}>
                              {slot.day} - {slot.time}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mb: 2, mt: 3 }}>
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!selectedDate || !selectedTime}
                      endIcon={<ArrowForward />}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Session Details */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Session Details</Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">Session Type</FormLabel>
                    <RadioGroup
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                    >
                      {sessionTypes.map((type) => (
                        <FormControlLabel
                          key={type.value}
                          value={type.value}
                          control={<Radio />}
                          label={
                            <Box display="flex" alignItems="center">
                              {type.icon}
                              <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                            </Box>
                          }
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Duration</InputLabel>
                    <Select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      label="Duration"
                    >
                      {durationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Session Title"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g., Career Guidance Session"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Session Description"
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="Describe what you'd like to discuss..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">Topics to Discuss</FormLabel>
                    <FormGroup>
                      <Grid container spacing={1}>
                        {topicOptions.map((topic) => (
                          <Grid item xs={12} sm={6} md={4} key={topic}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={topics.includes(topic)}
                                  onChange={() => handleTopicChange(topic)}
                                />
                              }
                              label={topic}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </FormGroup>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ mb: 2, mt: 3 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!sessionTitle || !sessionDescription}
                  endIcon={<ArrowForward />}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Confirmation */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Confirm Booking</Typography>
            </StepLabel>
            <StepContent>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Session Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mentor
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedMentor?.name}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {sessionDuration} minutes
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Session Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {sessionTypes.find(t => t.value === sessionType)?.label}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Title
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {sessionTitle}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Topics
                    </Typography>
                    <Box>
                      {topics.map((topic) => (
                        <Chip key={topic} label={topic} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              <Box sx={{ mb: 2 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBookSession}
                  disabled={bookingLoading}
                  startIcon={bookingLoading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
        
        {activeStep === 4 && (
          <Paper square elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} sx={{ mt: 1 }}>
              Reset
            </Button>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default SessionBooking; 