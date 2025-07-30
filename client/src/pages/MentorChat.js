import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Badge,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Send,
  Chat,
  Person,
  School,
  Work,
  AccessTime,
  Message,
  Notifications,
  Search,
  MoreVert,
  AttachFile,
  Download,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MentorChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/chat/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await axios.put(`/api/chat/conversations/${conversationId}/read`);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await axios.post(`/api/chat/conversations/${selectedConversation._id}/messages`, {
        content: newMessage
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
      
      // Update conversation in list
      const updatedConversations = conversations.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: response.data, updatedAt: new Date() }
          : conv
      );
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getFilteredConversations = () => {
    if (!searchQuery) return conversations;
    
    return conversations.filter(conversation => {
      const studentName = `${conversation.studentId?.firstName} ${conversation.studentId?.lastName}`;
      const lastMessage = conversation.lastMessage?.content || '';
      const query = searchQuery.toLowerCase();
      
      return studentName.toLowerCase().includes(query) || 
             lastMessage.toLowerCase().includes(query);
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

  const getUnreadCountForConversation = (conversation) => {
    return messages.filter(msg => 
      msg.conversationId === conversation._id && 
      !msg.read && 
      msg.senderId._id !== user._id
    ).length;
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
          Student Queries 💬
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Respond to student questions and provide guidance
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ height: '70vh' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Conversations
                  {unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }}>
                      <Notifications />
                    </Badge>
                  )}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
                size="small"
              />
            </Box>

            {/* Conversations */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                  {error}
                </Alert>
              )}
              
              <List>
                {getFilteredConversations().map((conversation) => {
                  const unreadCount = getUnreadCountForConversation(conversation);
                  const isSelected = selectedConversation?._id === conversation._id;
                  
                  return (
                    <React.Fragment key={conversation._id}>
                      <ListItem
                        button
                        selected={isSelected}
                        onClick={() => setSelectedConversation(conversation)}
                        sx={{
                          backgroundColor: isSelected ? 'action.selected' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={unreadCount}
                            color="error"
                            invisible={unreadCount === 0}
                          >
                            <Avatar>
                              <Person />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: unreadCount > 0 ? 'bold' : 'normal' }}>
                                {conversation.studentId?.firstName} {conversation.studentId?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(conversation.updatedAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </List>
              
              {getFilteredConversations().length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Chat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </Typography>
                </Box>
              )}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {selectedConversation.studentId?.firstName} {selectedConversation.studentId?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Student • {selectedConversation.studentId?.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        icon={<School />} 
                        label="Student" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId._id === user._id;
                    
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                            color: isOwnMessage ? 'white' : 'text.primary',
                            borderRadius: 2,
                            p: 1.5,
                            position: 'relative',
                          }}
                        >
                          {!isOwnMessage && (
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                              {message.senderId.firstName} {message.senderId.lastName}
                            </Typography>
                          )}
                          
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              mt: 0.5,
                              opacity: 0.7,
                              textAlign: isOwnMessage ? 'right' : 'left'
                            }}
                          >
                            {formatTime(message.createdAt)}
                            {isOwnMessage && (
                              <span style={{ marginLeft: '8px' }}>
                                {message.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <IconButton size="small">
                      <AttachFile />
                    </IconButton>
                    
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      sx={{ flex: 1 }}
                    />
                    
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {sending ? <CircularProgress size={20} /> : <Send />}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                p: 3
              }}>
                <Chat sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Choose a conversation from the list to start responding to student queries
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MentorChat; 