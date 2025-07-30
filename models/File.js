const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'study-materials', 'assignments', 'presentations', 'resources', 'templates', 'guides']
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified before saving
fileSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Index for efficient querying
fileSchema.index({ uploadedBy: 1, uploadDate: -1 });
fileSchema.index({ category: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ tags: 1 });

module.exports = mongoose.model('File', fileSchema); 