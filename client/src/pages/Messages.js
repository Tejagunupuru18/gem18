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
} from '@mui/material';
import {
  Message,
  Send,
  Search,
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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchConversations();
    // Simulate online users
    setOnlineUsers(new Set(['mentor1', 'mentor2', 'student1']));
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/conversations');
      // Ensure conversations is always an array
      const conversationsData = Array.isArray(response.data) ? response.data : 
                               response.data.conversations ? response.data.conversations : 
                               response.data.data ? response.data.data : [];
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/students/conversations/${conversationId}/messages`);
      // Ensure messages is always an array
      const messagesData = Array.isArray(response.data) ? response.data : 
                          response.data.messages ? response.data.messages : 
                          response.data.data ? response.data.data : [];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]); // Set empty array on error
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axios.post(`/api/students/conversations/${selectedConversation._id}/messages`, {
        content: newMessage,
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFilteredConversations = () => {
    // Ensure conversations is an array before filtering
    const conversationsArray = Array.isArray(conversations) ? conversations : [];
    return conversationsArray.filter(conversation => {
      const searchLower = searchQuery.toLowerCase();
      const participantName = conversation.participant?.firstName + ' ' + conversation.participant?.lastName;
      return participantName.toLowerCase().includes(searchLower) ||
             conversation.lastMessage?.content.toLowerCase().includes(searchLower);
    });
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

  const handleStartNewChat = async (userId) => {
    try {
      const response = await axios.post('/api/students/conversations', {
        participantId: userId,
      });
      setConversations([response.data, ...conversations]);
      setSelectedConversation(response.data);
      setShowNewChatDialog(false);
    } catch (error) {
      console.error('Error starting new conversation:', error);
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
          Messages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with mentors and fellow students
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ height: '70vh' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search and New Chat */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => setShowNewChatDialog(true)}
              >
                New Chat
              </Button>
            </Box>

            {/* Conversations */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {getFilteredConversations().map((conversation, index) => (
                  <React.Fragment key={conversation._id}>
                    <ListItem
                      button
                      selected={selectedConversation?._id === conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{ py: 2 }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            onlineUsers.has(conversation.participant?._id) ? (
                              <OnlinePrediction sx={{ fontSize: 12, color: 'success.main' }} />
                            ) : null
                          }
                        >
                          <Avatar src={conversation.participant?.profileImage}>
                            {conversation.participant?.firstName?.charAt(0)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {conversation.participant?.firstName} {conversation.participant?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </Typography>
                            {conversation.unreadCount > 0 && (
                              <Chip
                                label={conversation.unreadCount}
                                size="small"
                                color="primary"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < getFilteredConversations().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          onlineUsers.has(selectedConversation.participant?._id) ? (
                            <OnlinePrediction sx={{ fontSize: 12, color: 'success.main' }} />
                          ) : null
                        }
                      >
                        <Avatar src={selectedConversation.participant?.profileImage}>
                          {selectedConversation.participant?.firstName?.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1">
                          {selectedConversation.participant?.firstName} {selectedConversation.participant?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {onlineUsers.has(selectedConversation.participant?._id) ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <VideoCall />
                      </IconButton>
                      <IconButton size="small">
                        <Phone />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((message, index) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          backgroundColor: message.sender === user._id ? 'primary.main' : 'grey.100',
                          color: message.sender === user._id ? 'white' : 'text.primary',
                          borderRadius: 2,
                          p: 1.5,
                          position: 'relative',
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: message.sender === user._id ? 'right' : 'left',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <IconButton size="small">
                      <AttachFile />
                    </IconButton>
                    <IconButton size="small">
                      <EmojiEmotions />
                    </IconButton>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{ mx: 1 }}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
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
                <Message sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2">
                  Choose a conversation from the list to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onClose={() => setShowNewChatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Chat</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search users..."
            sx={{ mb: 2, mt: 1 }}
          />
          <List>
            {availableUsers.map((user) => (
              <ListItem
                key={user._id}
                button
                onClick={() => handleStartNewChat(user._id)}
              >
                <ListItemAvatar>
                  <Avatar src={user.profileImage}>
                    {user.firstName?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={user.role === 'mentor' ? 'Mentor' : 'Student'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="New Chat"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setShowNewChatDialog(true)}
      >
        <Message />
      </Fab>
    </Container>
  );
};

export default Messages; 