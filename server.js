const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const mentorRoutes = require('./routes/mentors');
const adminRoutes = require('./routes/admin');
const sessionRoutes = require('./routes/sessions');
const resourceRoutes = require('./routes/resources');
const quizRoutes = require('./routes/quiz');
const chatRoutes = require('./routes/chat');
const fileRoutes = require('./routes/files');

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    process.env.CLIENT_URL,
    /\.onrender\.com$/
  ],
  credentials: true
}));

// Rate limiting - More lenient for development
const isDevelopment = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 5000 : 1000, // Much higher limit for development
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60) // 15 minutes in minutes
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/api/health' || req.path.startsWith('/uploads/');
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// More lenient rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 50, // Higher limit for development
  message: {
    error: 'Too many authentication requests, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Career Mentorship Portal API is running',
    environment: process.env.NODE_ENV || 'development',
    rateLimit: {
      general: isDevelopment ? '5000 requests per 15 minutes' : '1000 requests per 15 minutes',
      auth: isDevelopment ? '200 requests per 15 minutes' : '50 requests per 15 minutes'
    }
  });
});

// Development-only endpoint to check rate limit status
if (isDevelopment) {
  app.get('/api/dev/rate-limit-status', (req, res) => {
    res.json({
      message: 'Rate limit status (development only)',
      currentLimits: {
        general: '5000 requests per 15 minutes',
        auth: '200 requests per 15 minutes'
      },
      note: 'In production, these limits will be much lower'
    });
  });
}

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://teja:gtejaiit18@cluster0.xjo4byx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  
  // Start server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Socket.IO setup for real-time features
  const io = require('socket.io')(server, {
    cors: {
      origin: [
        "http://localhost:3000", 
        "http://localhost:3001",
        process.env.CLIENT_URL,
        /\.onrender\.com$/
      ],
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room for notifications
    socket.on('join-room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      socket.to(data.recipientId).emit('receive-message', {
        senderId: data.senderId,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Handle video call signaling
    socket.on('join-video-call', (sessionId) => {
      socket.join(sessionId);
      socket.to(sessionId).emit('user-joined-call', socket.id);
    });

    socket.on('video-offer', (data) => {
      socket.to(data.sessionId).emit('video-offer', {
        offer: data.offer,
        from: socket.id
      });
    });

    socket.on('video-answer', (data) => {
      socket.to(data.sessionId).emit('video-answer', {
        answer: data.answer,
        from: socket.id
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.sessionId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
  console.log('2. Verify your MongoDB Atlas cluster is running');
  console.log('3. Check your internet connection');
  console.log('4. Ensure the connection string is correct');
  process.exit(1);
});

module.exports = app; 