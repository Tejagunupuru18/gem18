const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, verifyMentor } = require('../middleware/auth');
const File = require('../models/File');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'video/quicktime'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload a file (mentor only)
router.post('/upload', auth, verifyMentor, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, tags } = req.body;
    const mentorId = req.user._id;

    const file = new File({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: category || 'general',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: mentorId,
      isPublic: req.body.isPublic === 'true'
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        _id: file._id,
        title: file.title,
        filename: file.filename,
        originalName: file.originalname,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        category: file.category,
        tags: file.tags,
        uploadedBy: file.uploadedBy,
        isPublic: file.isPublic,
        uploadDate: file.uploadDate
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get all files (students can see public files, mentors can see their own)
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.user.role === 'student') {
      // Students can only see public files
      query.isPublic = true;
    } else if (req.user.role === 'mentor') {
      // Mentors can see their own files and public files
      query.$or = [
        { uploadedBy: req.user._id },
        { isPublic: true }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const files = await File.find(query)
      .populate('uploadedBy', 'firstName lastName')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await File.countDocuments(query);

    res.json({
      files,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Download a file
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check access permissions
    if (!file.isPublic && file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', file.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// Get file info
router.get('/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId).populate('uploadedBy', 'firstName lastName');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check access permissions
    if (!file.isPublic && file.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(file);
  } catch (error) {
    console.error('Error fetching file info:', error);
    res.status(500).json({ message: 'Error fetching file info' });
  }
});

// Update file (mentor only, their own files)
router.put('/:fileId', auth, verifyMentor, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { title, description, category, tags, isPublic } = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    file.title = title || file.title;
    file.description = description || file.description;
    file.category = category || file.category;
    file.tags = tags ? tags.split(',').map(tag => tag.trim()) : file.tags;
    file.isPublic = isPublic !== undefined ? isPublic : file.isPublic;

    await file.save();

    res.json({ message: 'File updated successfully', file });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Error updating file' });
  }
});

// Delete file (mentor only, their own files)
router.delete('/:fileId', auth, verifyMentor, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Get file categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await File.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

module.exports = router; 