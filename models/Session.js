const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60 // minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  sessionType: {
    type: String,
    enum: ['video_call', 'chat', 'email', 'phone'],
    default: 'video_call'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  meetingId: {
    type: String,
    default: ''
  },
  topics: [{
    type: String
  }],
  notes: {
    student: String,
    mentor: String
  },
  feedback: {
    student: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    },
    mentor: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  }],
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['student', 'mentor', 'admin']
    },
    reason: String,
    cancelledAt: Date
  },
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // in minutes
  recordingUrl: String,
  chatHistory: [{
    sender: {
      type: String,
      enum: ['student', 'mentor']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: String,
      enum: ['student', 'mentor']
    },
    uploadedAt: Date
  }],
  followUp: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ studentId: 1, scheduledDate: 1 });
sessionSchema.index({ mentorId: 1, scheduledDate: 1 });
sessionSchema.index({ status: 1, scheduledDate: 1 });

// Virtual for session duration in hours
sessionSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for actual duration in hours
sessionSchema.virtual('actualDurationHours').get(function() {
  return this.actualDuration ? this.actualDuration / 60 : 0;
});

// Check if session is upcoming
sessionSchema.virtual('isUpcoming').get(function() {
  return this.scheduledDate > new Date() && this.status === 'scheduled';
});

// Check if session is overdue
sessionSchema.virtual('isOverdue').get(function() {
  return this.scheduledDate < new Date() && this.status === 'scheduled';
});

// Pre-save middleware to generate meeting link
sessionSchema.pre('save', function(next) {
  if (this.isNew && this.sessionType === 'video_call' && !this.meetingLink) {
    // Generate a unique meeting link (in production, integrate with video service)
    this.meetingLink = `https://meet.jit.si/mentorship-${this._id}`;
    this.meetingId = `mentorship-${this._id}`;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema); 