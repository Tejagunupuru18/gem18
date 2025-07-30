const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['scholarship', 'career_guide', 'exam_guide', 'article', 'video', 'document'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'Engineering', 'Medical', 'Arts', 'Commerce', 'Law', 'Agriculture',
      'Computer Science', 'Design', 'Teaching', 'Business', 'Sports',
      'Music', 'Dance', 'Literature', 'Science', 'Technology', 'General'
    ],
    required: true
  },
  content: {
    body: String,
    url: String,
    fileUrl: String,
    thumbnail: String
  },
  eligibility: {
    minAge: Number,
    maxAge: Number,
    educationLevel: [{
      type: String,
      enum: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Post Graduate']
    }],
    stream: [{
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Any']
    }],
    incomeLimit: Number,
    location: [{
      state: String,
      district: String
    }],
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Any']
    }
  },
  financialInfo: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    type: {
      type: String,
      enum: ['full_scholarship', 'partial_scholarship', 'loan', 'grant', 'free']
    },
    renewable: {
      type: Boolean,
      default: false
    }
  },
  deadlines: {
    application: Date,
    documentSubmission: Date,
    result: Date
  },
  applicationProcess: {
    steps: [{
      step: Number,
      description: String,
      required: Boolean
    }],
    documents: [{
      name: String,
      required: Boolean,
      description: String
    }],
    applicationUrl: String,
    contactInfo: {
      email: String,
      phone: String,
      address: String
    }
  },
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  author: {
    name: String,
    organization: String,
    email: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
  }],
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
resourceSchema.index({ type: 1, category: 1, status: 1 });
resourceSchema.index({ 'deadlines.application': 1 });
resourceSchema.index({ featured: 1, priority: -1 });
resourceSchema.index({ tags: 1 });

// Virtual for days until deadline
resourceSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.deadlines.application) return null;
  const now = new Date();
  const deadline = new Date(this.deadlines.application);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for deadline status
resourceSchema.virtual('deadlineStatus').get(function() {
  if (!this.deadlines.application) return 'no-deadline';
  const days = this.daysUntilDeadline;
  if (days < 0) return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'normal';
});

// Update view count
resourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Update download count
resourceSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Calculate average rating
resourceSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = totalRating / this.reviews.length;
  
  this.rating.average = Math.round(average * 10) / 10;
  this.rating.totalRatings = this.reviews.length;
  
  return this.save();
};

module.exports = mongoose.model('Resource', resourceSchema); 