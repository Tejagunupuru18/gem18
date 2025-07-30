import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
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
import axios from 'axios';
import JitsiMeet from './JitsiMeet';

const VideoCall = ({ open, onClose, sessionId, studentId, studentName }) => {
  const { user } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (open && sessionId) {
      // Generate a unique room name based on session ID
      const generatedRoomName = `mentorship-session-${sessionId}-${Date.now()}`;
      setRoomName(generatedRoomName);
    }
  }, [open, sessionId]);

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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Update session status to 'in-progress'
      await axios.put(`/api/sessions/${sessionId}/status`, {
        status: 'in-progress',
        startTime: new Date().toISOString()
      });
      
      setIsInCall(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to start call. Please try again.');
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    setLoading(true);
    
    try {
      // Update session status to 'completed'
      await axios.put(`/api/sessions/${sessionId}/status`, {
        status: 'completed',
        endTime: new Date().toISOString(),
        duration: callDuration
      });
      
      setIsInCall(false);
      setCallDuration(0);
      setLoading(false);
      onClose();
    } catch (err) {
      setError('Failed to end call properly.');
      setLoading(false);
    }
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

  const copyRoomLink = () => {
    const link = `${window.location.origin}/video-call/${roomName}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied to clipboard! Share this link with the student.');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isInCall ? 'Video Call in Progress' : 'Start Video Call'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isInCall ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Session with: <strong>{studentName}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              margin="normal"
              helperText="This is the unique room name for your video call"
            />

            <Box mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Call Details:
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        Session ID
                      </Typography>
                      <Typography variant="body1">
                        {sessionId}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        Student
                      </Typography>
                      <Typography variant="body1">
                        {studentName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        ) : (
          <Box>
            <JitsiMeet
              roomName={roomName}
              user={user}
              onApiReady={(api) => {
                console.log('Jitsi API ready');
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
              <IconButton
                onClick={toggleMute}
                color={isMuted ? 'error' : 'primary'}
                size="large"
              >
                {isMuted ? <MicOff /> : <Mic />}
              </IconButton>
              
              <IconButton
                onClick={toggleVideo}
                color={isVideoOff ? 'error' : 'primary'}
                size="large"
              >
                {isVideoOff ? <VideocamOff /> : <Videocam />}
              </IconButton>
              
              <IconButton
                onClick={toggleScreenShare}
                color={isScreenSharing ? 'success' : 'primary'}
                size="large"
              >
                <ScreenShare />
              </IconButton>
              
              <IconButton
                onClick={copyRoomLink}
                color="primary"
                size="large"
              >
                <Chat />
              </IconButton>
            </Box>

            {/* Participants */}
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Participants:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`${user?.name || 'Mentor'} (You)`}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={studentName}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!isInCall ? (
          <Button
            onClick={handleStartCall}
            variant="contained"
            color="primary"
            startIcon={<VideoCallIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Start Call'}
          </Button>
        ) : (
          <Button
            onClick={handleEndCall}
            variant="contained"
            color="error"
            startIcon={<CallEnd />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'End Call'}
          </Button>
        )}
        
        <Button onClick={onClose} disabled={isInCall}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoCall; 