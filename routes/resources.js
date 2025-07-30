const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Resource = require('../models/Resource');
const File = require('../models/File'); // Add File model import

const router = express.Router();

// Get all resources (including mentor files)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      featured,
      status = 'active',
      page = 1,
      limit = 10,
      includePending = false, // Only for admin use
      includeMentorFiles = 'true' // Include mentor files by default
    } = req.query;

    const filter = { status: 'active' }; // Always show only active resources to students
    
    // If admin requests pending resources
    if (includePending === 'true') {
      filter.status = { $in: ['active', 'pending'] };
    }
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const resources = await Resource.find(filter)
      .populate('createdBy', 'firstName lastName role')
      .populate('approvedBy', 'firstName lastName')
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    let allResources = [...resources];

    // Include mentor files if requested
    if (includeMentorFiles === 'true') {
      const mentorFiles = await File.find({ isPublic: true })
        .populate('uploadedBy', 'firstName lastName role')
        .sort({ uploadDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Convert mentor files to resource format
      const convertedFiles = mentorFiles.map(file => ({
        _id: file._id,
        title: file.title,
        description: file.description,
        type: 'document',
        category: file.category,
        content: {
          url: `/api/files/${file._id}/download`,
          body: file.description
        },
        createdBy: file.uploadedBy,
        createdAt: file.uploadDate,
        updatedAt: file.lastModified,
        downloadCount: file.downloadCount,
        isMentorFile: true,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType
      }));

      allResources = [...resources, ...convertedFiles];
      
      // Sort by creation date (newest first)
      allResources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = await Resource.countDocuments(filter);
    const totalFiles = includeMentorFiles === 'true' ? await File.countDocuments({ isPublic: true }) : 0;
    const totalCount = total + totalFiles;

    res.json({
      resources: allResources,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      total: totalCount
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error fetching resources.' });
  }
});

// Get resource by ID
router.get('/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Increment view count
    await resource.incrementViews();

    res.json(resource);

  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error fetching resource.' });
  }
});

// Create resource (admin or mentor)
router.post('/', auth, authorize('admin', 'mentor'), [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('type').isIn(['scholarship', 'career_guide', 'exam_guide', 'article', 'video', 'document']),
  body('category').isIn([
    'Engineering', 'Medical', 'Arts', 'Commerce', 'Law', 'Agriculture',
    'Computer Science', 'Design', 'Teaching', 'Business', 'Sports',
    'Music', 'Dance', 'Literature', 'Science', 'Technology', 'General'
  ]),
  body('content.body').optional().trim().notEmpty(),
  body('content.url').optional().isURL(),
  body('eligibility').optional().isObject(),
  body('financialInfo').optional().isObject(),
  body('deadlines.application').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resourceData = {
      ...req.body,
      createdBy: req.user._id,
      status: 'active'
    };

    // If created by mentor, it needs admin approval
    if (req.user.role === 'mentor') {
      resourceData.status = 'pending';
      resourceData.approvedBy = null;
      resourceData.approvedAt = null;
    } else {
      // If created by admin, auto-approve
      resourceData.approvedBy = req.user._id;
      resourceData.approvedAt = new Date();
    }

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      message: req.user.role === 'mentor' 
        ? 'Resource submitted for approval' 
        : 'Resource created successfully',
      resource
    });

  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Server error creating resource.' });
  }
});

// Update resource (admin only)
router.put('/:resourceId', auth, authorize('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.resourceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    res.json({
      message: 'Resource updated successfully',
      resource
    });

  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Server error updating resource.' });
  }
});

// Delete resource (admin only)
router.delete('/:resourceId', auth, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    res.json({ message: 'Resource deleted successfully' });

  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error deleting resource.' });
  }
});

// Submit review for resource
router.post('/:resourceId/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Check if user already reviewed
    const existingReview = resource.reviews.find(
      review => review.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this resource.' });
    }

    resource.reviews.push({
      userId: req.user._id,
      rating,
      comment,
      date: new Date()
    });

    await resource.calculateAverageRating();

    res.json({
      message: 'Review submitted successfully',
      resource
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error submitting review.' });
  }
});

// Approve/reject resource (admin only)
router.put('/:resourceId/approve', auth, authorize('admin'), [
  body('action').isIn(['approve', 'reject']),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, reason } = req.body;
    const resource = await Resource.findById(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (action === 'approve') {
      resource.status = 'active';
      resource.approvedBy = req.user._id;
      resource.approvedAt = new Date();
    } else {
      resource.status = 'inactive';
      resource.rejectionReason = reason;
    }

    await resource.save();

    res.json({
      message: `Resource ${action}d successfully`,
      resource
    });

  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({ message: 'Server error approving resource.' });
  }
});

// Get featured resources
router.get('/featured/list', async (req, res) => {
  try {
    const featuredResources = await Resource.find({
      featured: true,
      status: 'active'
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(6);

    res.json(featuredResources);

  } catch (error) {
    console.error('Get featured resources error:', error);
    res.status(500).json({ message: 'Server error fetching featured resources.' });
  }
});

// Get resources by category
router.get('/category/:category', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const resources = await Resource.find({
      category: req.params.category,
      status: 'active'
    })
    .sort({ featured: -1, priority: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Resource.countDocuments({
      category: req.params.category,
      status: 'active'
    });

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get resources by category error:', error);
    res.status(500).json({ message: 'Server error fetching resources by category.' });
  }
});

// Download resource
router.post('/:resourceId/download', auth, async (req, res) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Increment download count
    await resource.incrementDownloads();

    // If resource has a file URL, return it for download
    if (resource.content && resource.content.fileUrl) {
      return res.json({
        message: 'Download link generated',
        downloadUrl: resource.content.fileUrl,
        filename: resource.title
      });
    }

    // If resource has content body, create a downloadable text file
    if (resource.content && resource.content.body) {
      const content = `
Resource: ${resource.title}
Category: ${resource.category}
Type: ${resource.type}
Description: ${resource.description}

Content:
${resource.content.body}

${resource.financialInfo ? `Financial Information: ${JSON.stringify(resource.financialInfo, null, 2)}` : ''}
${resource.eligibility ? `Eligibility: ${JSON.stringify(resource.eligibility, null, 2)}` : ''}
${resource.applicationProcess ? `Application Process: ${JSON.stringify(resource.applicationProcess, null, 2)}` : ''}
      `;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${resource.title.replace(/[^a-z0-9]/gi, '_')}.txt"`);
      res.send(content);
      return;
    }

    // If resource has a URL, redirect to it
    if (resource.content && resource.content.url) {
      return res.json({
        message: 'External link',
        externalUrl: resource.content.url,
        filename: resource.title
      });
    }

    // If no downloadable content, create a basic info file
    const content = `
Resource Information
==================

Title: ${resource.title}
Category: ${resource.category}
Type: ${resource.type}
Description: ${resource.description}

${resource.financialInfo ? `Financial Information: ${JSON.stringify(resource.financialInfo, null, 2)}` : ''}
${resource.eligibility ? `Eligibility: ${JSON.stringify(resource.eligibility, null, 2)}` : ''}
${resource.applicationProcess ? `Application Process: ${JSON.stringify(resource.applicationProcess, null, 2)}` : ''}
${resource.deadlines && resource.deadlines.application ? `Application Deadline: ${new Date(resource.deadlines.application).toLocaleDateString()}` : ''}

Note: This resource doesn't have downloadable content. Please visit the resource page for more information.
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${resource.title.replace(/[^a-z0-9]/gi, '_')}_info.txt"`);
    res.send(content);

  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ message: 'Server error downloading resource.' });
  }
});

module.exports = router; 