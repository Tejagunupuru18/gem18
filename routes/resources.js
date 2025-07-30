const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Resource = require('../models/Resource');

const router = express.Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      featured,
      status = 'active',
      page = 1,
      limit = 10
    } = req.query;

    const filter = { status };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const resources = await Resource.find(filter)
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
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

// Create resource (admin only)
router.post('/', auth, authorize('admin'), [
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

    const resource = new Resource({
      ...req.body,
      createdBy: req.user._id,
      approvedBy: req.user._id,
      approvedAt: new Date()
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource created successfully',
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

module.exports = router; 