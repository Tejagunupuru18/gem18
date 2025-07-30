const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professionalInfo: {
    designation: {
      type: String,
      required: true
    },
    organization: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    education: {
      degree: String,
      institution: String,
      year: Number
    },
    certifications: [{
      name: String,
      issuingBody: String,
      year: Number,
      certificateUrl: String
    }]
  },
  expertise: [{
    field: {
      type: String,
      enum: [
        'Engineering', 'Medical', 'Arts', 'Commerce', 'Law', 'Agriculture',
        'Computer Science', 'Design', 'Teaching', 'Business', 'Sports',
        'Music', 'Dance', 'Literature', 'Science', 'Technology', 'Other'
      ]
    },
    subFields: [String],
    yearsOfExperience: Number
  }],
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Other']
  }],
  availability: {
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      slots: [{
        startTime: String,
        endTime: String,
        isAvailable: {
          type: Boolean,
          default: true
        }
      }]
    }],
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    documents: [{
      type: {
        type: String,
        enum: ['id_proof', 'education_certificate', 'experience_certificate', 'other']
      },
      url: String,
      uploadedAt: Date
    }],
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    reviews: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  achievements: [{
    title: String,
    description: String,
    year: Number,
    certificate: String
  }],
  badges: [{
    name: String,
    description: String,
    earnedAt: Date,
    icon: String
  }],
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    studentsMentored: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    maxStudentsPerMonth: {
      type: Number,
      default: 10
    },
    sessionDuration: {
      type: Number,
      default: 60 // minutes
    },
    preferredCommunication: [{
      type: String,
      enum: ['video_call', 'chat', 'email', 'phone']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate average rating
mentorSchema.methods.calculateAverageRating = function() {
  if (this.ratings.reviews.length === 0) return 0;
  
  const totalRating = this.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / this.ratings.reviews.length) * 10) / 10;
};

// Update stats after session
mentorSchema.methods.updateStats = function(sessionDuration) {
  this.stats.totalSessions += 1;
  this.stats.totalHours += sessionDuration / 60; // Convert minutes to hours
  return this.save();
};

module.exports = mongoose.model('Mentor', mentorSchema); 