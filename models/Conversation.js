const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    student: {
      type: Number,
      default: 0
    },
    mentor: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a compound index to ensure unique conversations
conversationSchema.index({ studentId: 1, mentorId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema); 