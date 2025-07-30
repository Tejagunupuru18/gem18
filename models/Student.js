const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['government', 'private', 'other'],
      default: 'government'
    },
    location: {
      city: String,
      state: String,
      district: String
    }
  },
  education: {
    currentClass: {
      type: String,
      required: true
    },
    board: {
      type: String,
      enum: ['CBSE', 'ICSE', 'State Board', 'Other'],
      default: 'CBSE'
    },
    stream: {
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Not Selected'],
      default: 'Not Selected'
    }
  },
  interests: [{
    type: String,
    enum: [
      'Engineering', 'Medical', 'Arts', 'Commerce', 'Law', 'Agriculture',
      'Computer Science', 'Design', 'Teaching', 'Business', 'Sports',
      'Music', 'Dance', 'Literature', 'Science', 'Technology', 'Other'
    ]
  }],
  careerGoals: [{
    type: String
  }],
  quizResults: {
    completed: {
      type: Boolean,
      default: false
    },
    recommendedCareers: [{
      career: String,
      score: Number
    }],
    completedAt: Date
  },
  preferences: {
    preferredLanguages: [{
      type: String,
      default: ['English', 'Hindi']
    }],
    preferredMentorTypes: [{
      type: String,
      enum: ['Industry Professional', 'Academic', 'Entrepreneur', 'Government Official']
    }],
    preferredSessionDuration: {
      type: Number,
      default: 60 // minutes
    }
  },
  achievements: [{
    title: String,
    description: String,
    date: Date,
    certificate: String
  }],
  scholarships: [{
    name: String,
    amount: Number,
    deadline: Date,
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'awarded', 'rejected'],
      default: 'applied'
    },
    appliedDate: Date
  }],
  progress: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    badges: [{
      name: String,
      description: String,
      earnedAt: Date
    }],
    points: {
      type: Number,
      default: 0
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Virtual for full profile
studentSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    userId: this.userId,
    education: this.education,
    interests: this.interests,
    careerGoals: this.careerGoals,
    progress: this.progress
  };
});

module.exports = mongoose.model('Student', studentSchema); 