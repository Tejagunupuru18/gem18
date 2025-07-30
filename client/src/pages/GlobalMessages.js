import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  InputAdornment,
  Tabs,
  Tab,
  Pagination,
} from '@mui/material';
import {
  Message,
  Send,
  MoreVert,
  AttachFile,
  EmojiEmotions,
  VideoCall,
  Phone,
  Block,
  Report,
  Delete,
  Archive,
  Star,
  StarBorder,
  OnlinePrediction,
  Schedule,
  CheckCircle,
  Cancel,
  Public,
  Group,
  Announcement,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GlobalMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      setError('Please login to access global messages');
      return;
    }
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    fetchGlobalMessages();
  }, [currentPage, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGlobalMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching global messages for page:', currentPage);
      
      const response = await axios.get(`/api/chat/global?page=${currentPage}&limit=20`);
      console.log('Global messages fetched successfully:', response.data);
      
      // Debug: Log the structure of the first message
      if (response.data.messages && response.data.messages.length > 0) {
        console.log('First message structure:', JSON.stringify(response.data.messages[0], null, 2));
        console.log('Sender data type:', typeof response.data.messages[0].senderId);
        console.log('Sender data:', response.data.messages[0].senderId);
        
        // Check if senderId is an object and has expertise
        if (response.data.messages[0].senderId && typeof response.data.messages[0].senderId === 'object') {
          console.log('Sender object keys:', Object.keys(response.data.messages[0].senderId));
          if (response.data.messages[0].senderId.expertise) {
            console.log('⚠️ WARNING: Sender has expertise data:', response.data.messages[0].senderId.expertise);
          }
        }
      }
      
      setMessages(response.data.messages || []);
      setTotalPages(response.data.totalPages || 1);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching global messages:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load global messages';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to view global messages.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendGlobalMessage = async () => {
    if (!messageContent.trim()) return;

    // Check authentication before sending
    if (!user) {
      setError('Please login to send global messages');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    try {
      console.log('Sending global message:', {
        title: messageTitle || 'Global Message',
        content: messageContent,
        user: user.email
      });

      const response = await axios.post('/api/chat/global', {
        title: messageTitle || 'Global Message',
        content: messageContent
      });

      console.log('Global message sent successfully:', response.data);
      setMessages([response.data, ...messages]);
      setMessageContent('');
      setMessageTitle('');
      setShowSendDialog(false);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error sending global message:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      let errorMessage = 'Failed to send message';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
        // Redirect to login if authentication fails
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to send global messages.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendGlobalMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Safety function to ensure we never render objects
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      console.warn('Attempting to render object:', value);
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (loading && messages.length === 0) {
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Global Messages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Send and view messages that are visible to everyone on the platform
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <Public sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No global messages yet
                  </Typography>
                  <Typography variant="body2">
                    Be the first to send a global message!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {messages.map((message) => (
                    <React.Fragment key={message._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={message.senderId?.profileImage}>
                            {message.senderId?.firstName?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" component="span">
                                {safeRender(message.senderId?.firstName || 'Unknown')} {safeRender(message.senderId?.lastName || 'User')}
                              </Typography>
                              <Chip
                                label={safeRender(message.broadcastTitle || 'Global Message')}
                                size="small"
                                color="primary"
                                icon={<Public />}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {safeRender(formatTime(message.createdAt))}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mt: 1 }}
                            >
                              {safeRender(message.content || '')}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Send Global Message Dialog */}
      <Dialog open={showSendDialog} onClose={() => setShowSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Global Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title (Optional)"
            placeholder="Message title..."
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Message"
            placeholder="Type your global message..."
            multiline
            rows={4}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            required
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This message will be visible to everyone on the platform.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSendDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSendGlobalMessage}
            variant="contained"
            disabled={!messageContent.trim()}
          >
            Send Global Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Send Global Message"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setShowSendDialog(true)}
      >
        <Announcement />
      </Fab>
    </Container>
  );
};

export default GlobalMessages; 