import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  VideoCall,
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  Chat,
  Settings,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JitsiMeet from '../components/JitsiMeet';

const StudentVideoCall = () => {
  const { user } = useAuth();
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    if (roomName) {
      // Extract session ID from room name
      const sessionId = roomName.split('-')[2];
      if (sessionId) {
        fetchSessionInfo(sessionId);
      }
    }
  }, [roomName]);

  useEffect(() => {
    let interval;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall]);

  const fetchSessionInfo = async (sessionId) => {
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`);
      setSessionInfo(response.data);
    } catch (err) {
      setError('Failed to load session information');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinCall = () => {
    setIsInCall(true);
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    setCallDuration(0);
    navigate('/student/dashboard');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  if (!roomName) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No room name provided. Please use a valid video call link.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {isInCall ? 'Video Call in Progress' : 'Join Video Call'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={() => navigate('/student/dashboard')}
          >
            Exit
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {sessionInfo && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Session Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Session Title
                  </Typography>
                  <Typography variant="body1">
                    {sessionInfo.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Mentor
                  </Typography>
                  <Typography variant="body1">
                    {sessionInfo.mentor?.firstName} {sessionInfo.mentor?.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(sessionInfo.scheduledDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(sessionInfo.scheduledDate).toLocaleTimeString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {!isInCall ? (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Ready to join the video call?
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Room: {roomName}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<VideoCall />}
              onClick={handleJoinCall}
              sx={{ mt: 2 }}
            >
              Join Call
            </Button>
          </Box>
        ) : (
          <Box>
            <JitsiMeet
              roomName={roomName}
              user={user}
              onApiReady={(api) => {
                console.log('Jitsi API ready for student');
              }}
              onParticipantJoined={(participant) => {
                console.log('Participant joined:', participant);
              }}
              onParticipantLeft={(participant) => {
                console.log('Participant left:', participant);
              }}
            />
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Duration: {formatDuration(callDuration)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Room: {roomName}
              </Typography>
            </Box>

            {/* Call Controls */}
            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              <Button
                variant="outlined"
                color={isMuted ? 'error' : 'primary'}
                startIcon={isMuted ? <MicOff /> : <Mic />}
                onClick={toggleMute}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              
              <Button
                variant="outlined"
                color={isVideoOff ? 'error' : 'primary'}
                startIcon={isVideoOff ? <VideocamOff /> : <Videocam />}
                onClick={toggleVideo}
              >
                {isVideoOff ? 'Start Video' : 'Stop Video'}
              </Button>
              
              <Button
                variant="outlined"
                color={isScreenSharing ? 'success' : 'primary'}
                startIcon={<ScreenShare />}
                onClick={toggleScreenShare}
              >
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<CallEnd />}
                onClick={handleLeaveCall}
              >
                Leave Call
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StudentVideoCall; 