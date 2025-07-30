const express = require('express');
const router = express.Router();
const { auth, verifyMentor, verifyStudent } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Send global message (visible to everyone) - MUST BE FIRST TO AVOID ROUTE CONFLICTS
router.post('/global', auth, async (req, res) => {
  try {
    console.log('=== GLOBAL MESSAGE POST REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('Headers:', req.headers);

    const { content, title } = req.body;
    const senderId = req.user._id;

    console.log('Extracted data:', {
      content,
      title,
      senderId: senderId.toString(),
      userRole: req.user.role
    });

    // Validate input
    if (!content || content.trim() === '') {
      console.log('❌ Validation failed: content is empty');
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (!senderId) {
      console.log('❌ Validation failed: senderId is missing');
      return res.status(400).json({ message: 'Sender ID is required' });
    }

    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    console.log('✅ Database connected. ReadyState:', mongoose.connection.readyState);

    // Create global message
    const messageData = {
      conversationId: null, // Special conversation for global messages
      senderId,
      content: content.trim(),
      messageType: 'global',
      broadcastTitle: title || 'Global Message',
      createdAt: new Date()
    };

    console.log('Message data to save:', JSON.stringify(messageData, null, 2));

    // Validate the message data before creating
    const Message = require('../models/Message');
    const testMessage = new Message(messageData);
    const validationError = testMessage.validateSync();
    
    if (validationError) {
      console.log('❌ Message validation failed:', validationError.message);
      console.log('Validation errors:', validationError.errors);
      return res.status(400).json({ 
        message: 'Message validation failed',
        error: validationError.message,
        details: validationError.errors
      });
    }

    console.log('✅ Message validation passed');

    const message = new Message(messageData);
    console.log('Message object created, attempting to save...');

    const savedMessage = await message.save();
    console.log('✅ Message saved successfully:', savedMessage._id);

    console.log('Populating sender info...');
    await savedMessage.populate('senderId', 'firstName lastName email role');
    console.log('✅ Sender info populated');

    console.log('Global message created successfully:', {
      id: savedMessage._id,
      content: savedMessage.content,
      sender: savedMessage.senderId,
      messageType: savedMessage.messageType
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('=== GLOBAL MESSAGE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    if (error.code) {
      console.error('MongoDB error code:', error.code);
    }
    
    if (error.writeErrors) {
      console.error('MongoDB write errors:', error.writeErrors);
    }

    // Check if it's a MongoDB connection error
    const mongoose = require('mongoose');
    console.error('MongoDB connection state:', mongoose.connection.readyState);
    console.error('MongoDB connection host:', mongoose.connection.host);
    console.error('MongoDB connection port:', mongoose.connection.port);

    res.status(500).json({ 
      message: 'Error sending global message.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get global messages - MUST BE FIRST TO AVOID ROUTE CONFLICTS
router.get('/global', auth, async (req, res) => {
  try {
    console.log('=== GLOBAL MESSAGE GET REQUEST ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user);

    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    console.log('Fetching global messages with:', {
      page: parseInt(page),
      limit: parseInt(limit),
      skip
    });

    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    console.log('✅ Database connected. ReadyState:', mongoose.connection.readyState);

    const messages = await Message.find({
      messageType: 'global'
    })
    .populate('senderId', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);

    console.log(`✅ Found ${messages.length} global messages`);

    const total = await Message.countDocuments({ messageType: 'global' });
    console.log(`✅ Total global messages: ${total}`);

    const response = {
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    };

    console.log('Response data:', {
      messagesCount: messages.length,
      totalPages: response.totalPages,
      currentPage: response.currentPage,
      total: response.total
    });

    res.json(response);

  } catch (error) {
    console.error('=== GLOBAL MESSAGE GET ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    if (error.code) {
      console.error('MongoDB error code:', error.code);
    }

    // Check if it's a MongoDB connection error
    const mongoose = require('mongoose');
    console.error('MongoDB connection state:', mongoose.connection.readyState);
    console.error('MongoDB connection host:', mongoose.connection.host);
    console.error('MongoDB connection port:', mongoose.connection.port);

    res.status(500).json({ 
      message: 'Error fetching global messages.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all conversations for a user (mentor or student)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let conversations;
    if (userRole === 'mentor') {
      conversations = await Conversation.find({ mentorId: userId })
        .populate('studentId', 'firstName lastName email')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
    } else {
      conversations = await Conversation.find({ studentId: userId })
        .populate('mentorId', 'firstName lastName email expertise')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.studentId.toString() !== userId.toString() && 
        conversation.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.studentId.toString() !== senderId.toString() && 
        conversation.mentorId.toString() !== senderId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create new message
    const message = new Message({
      conversationId,
      senderId,
      content: content.trim(),
      messageType: 'text'
    });

    await message.save();

    // Update conversation's last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info for response
    await message.populate('senderId', 'firstName lastName');

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Send broadcast message to all students
router.post('/broadcast', auth, async (req, res) => {
  try {
    const { content, title } = req.body;
    const senderId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Only students can send broadcast messages
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can send broadcast messages' });
    }

    // Get all students except the sender
    const Student = require('../models/Student');
    const students = await Student.find({ userId: { $ne: senderId } })
      .populate('userId', 'firstName lastName email');

    if (students.length === 0) {
      return res.status(404).json({ message: 'No other students found' });
    }

    const broadcastMessages = [];
    const currentTime = new Date();

    // Create broadcast messages for each student
    for (const student of students) {
      if (student.userId && student.userId._id) {
        const message = new Message({
          conversationId: null, // Special conversation for broadcasts
          senderId,
          content: content.trim(),
          messageType: 'broadcast',
          broadcastTitle: title || 'Student Broadcast',
          broadcastTo: student.userId._id,
          createdAt: currentTime
        });
        
        await message.save();
        broadcastMessages.push(message);
      }
    }

    res.json({
      message: 'Broadcast message sent successfully',
      sentTo: students.length,
      messages: broadcastMessages
    });

  } catch (error) {
    console.error('Error sending broadcast message:', error);
    res.status(500).json({ message: 'Error sending broadcast message' });
  }
});

// Get broadcast messages for a student
router.get('/broadcast', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Only students can receive broadcast messages
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can receive broadcast messages' });
    }

    const broadcastMessages = await Message.find({
      messageType: 'broadcast',
      broadcastTo: userId
    })
    .populate('senderId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(broadcastMessages);

  } catch (error) {
    console.error('Error fetching broadcast messages:', error);
    res.status(500).json({ message: 'Error fetching broadcast messages' });
  }
});

// Create a new conversation (student to mentor)
router.post('/conversations', auth, verifyStudent, async (req, res) => {
  try {
    const { mentorId, initialMessage } = req.body;
    const studentId = req.user._id;

    if (!mentorId) {
      return res.status(400).json({ message: 'Mentor ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      studentId,
      mentorId
    });

    if (!conversation) {
      conversation = new Conversation({
        studentId,
        mentorId,
        status: 'active'
      });
      await conversation.save();
    }

    // Send initial message if provided
    if (initialMessage && initialMessage.trim() !== '') {
      const message = new Message({
        conversationId: conversation._id,
        senderId: studentId,
        content: initialMessage.trim(),
        messageType: 'text'
      });

      await message.save();
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    // Populate conversation with user details
    await conversation.populate('mentorId', 'firstName lastName expertise');
    await conversation.populate('studentId', 'firstName lastName');
    await conversation.populate('lastMessage');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Error creating conversation' });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.studentId.toString() !== userId.toString() && 
        conversation.mentorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// Get unread message count for a user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let conversations;
    if (userRole === 'mentor') {
      conversations = await Conversation.find({ mentorId: userId });
    } else {
      conversations = await Conversation.find({ studentId: userId });
    }

    const conversationIds = conversations.map(conv => conv._id);
    
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
});

module.exports = router; 