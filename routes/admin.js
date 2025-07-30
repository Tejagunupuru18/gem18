const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Resource = require('../models/Resource');

// Middleware to ensure admin access
const ensureAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Helper function to apply auth and admin middleware
const requireAuthAndAdmin = [auth, ensureAdmin];

// Get admin dashboard statistics
router.get('/stats', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalMentors,
      verifiedMentors,
      totalSessions,
      completedSessions,
      pendingMentors
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Mentor.countDocuments(),
      Mentor.countDocuments({ 'verification.status': 'approved' }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Mentor.countDocuments({ 'verification.status': 'pending' })
    ]);

    // Calculate monthly growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    const newSessionsThisMonth = await Session.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    // Popular expertise areas
    const expertiseStats = await Mentor.aggregate([
      { $unwind: '$expertise' },
      { $group: { _id: '$expertise', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalMentors,
      verifiedMentors,
      totalSessions,
      completedSessions,
      pendingMentors,
      newUsersThisMonth,
      newSessionsThisMonth,
      expertiseStats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending mentor verifications
router.get('/pending-mentors', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const pendingMentors = await Mentor.find({ 'verification.status': 'pending' })
      .populate('userId', 'name email')
      .select('userId expertise experience professional bio verification');

    const mentorsWithUserData = pendingMentors.map(mentor => ({
      _id: mentor._id,
      name: mentor.userId.name,
      email: mentor.userId.email,
      expertise: mentor.expertise,
      experience: mentor.professional?.experience || 0,
      bio: mentor.bio,
      verification: mentor.verification
    }));

    res.json(mentorsWithUserData);
  } catch (error) {
    console.error('Error fetching pending mentors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all sessions
router.get('/sessions', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('studentId', 'name email')
      .populate('mentorId', 'name email')
      .sort({ scheduledDate: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports and issues
router.get('/reports', ...requireAuthAndAdmin, async (req, res) => {
  try {
    // Mock reports data - in a real app, you'd have a Report model
    const reports = [
      {
        _id: '1',
        reporter: { name: 'John Doe', email: 'john@example.com' },
        type: 'inappropriate_behavior',
        description: 'Mentor was unprofessional during session',
        status: 'pending',
        createdAt: new Date()
      },
      {
        _id: '2',
        reporter: { name: 'Jane Smith', email: 'jane@example.com' },
        type: 'technical_issue',
        description: 'Video call quality was poor',
        status: 'resolved',
        createdAt: new Date(Date.now() - 86400000)
      }
    ];

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', ...requireAuthAndAdmin, async (req, res) => {
  try {
    // Mock notifications data - in a real app, you'd have a Notification model
    const notifications = [
      {
        _id: '1',
        type: 'system',
        title: 'Platform Maintenance',
        message: 'Scheduled maintenance on Sunday 2-4 AM',
        status: 'sent',
        createdAt: new Date()
      },
      {
        _id: '2',
        type: 'announcement',
        title: 'New Features Available',
        message: 'Check out our new video calling features',
        status: 'draft',
        createdAt: new Date(Date.now() - 86400000)
      }
    ];

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject mentor
router.post('/mentors/:action', [
  body('mentorId').isMongoId().withMessage('Valid mentor ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action } = req.params;
    const { mentorId } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.verification.status = action === 'approve' ? 'approved' : 'rejected';
    mentor.verification.reviewedBy = req.user._id;
    mentor.verification.reviewedAt = new Date();

    await mentor.save();

    // Update user status if approved
    if (action === 'approve') {
      await User.findByIdAndUpdate(mentor.userId, { status: 'active' });
    }

    res.json({ message: `Mentor ${action}d successfully` });
  } catch (error) {
    console.error('Error processing mentor action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.put('/users/:userId', [
  body('status').isIn(['active', 'suspended', 'banned']).withMessage('Valid status required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new resource
router.post('/resources', ...requireAuthAndAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['scholarship', 'career_guide', 'exam_guide', 'article', 'video', 'document']).withMessage('Valid type required'),
  body('category').isIn([
    'Engineering', 'Medical', 'Arts', 'Commerce', 'Law', 'Agriculture',
    'Computer Science', 'Design', 'Teaching', 'Business', 'Sports',
    'Music', 'Dance', 'Literature', 'Science', 'Technology', 'General'
  ]).withMessage('Valid category required')
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
      approvedAt: new Date(),
      status: 'active'
    });

    await resource.save();
    res.status(201).json({ message: 'Resource added successfully', resource });
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resource
router.put('/resources/:resourceId', ...requireAuthAndAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resourceId } = req.params;
    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      req.body,
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete resource
router.delete('/resources/:resourceId', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findByIdAndDelete(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle reports
router.post('/reports/:reportId/:action', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const { reportId, action } = req.params;

    if (!['resolve', 'dismiss'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // In a real app, you'd update the report status in the database
    // For now, we'll just return a success message
    res.json({ message: `Report ${action}ed successfully` });
  } catch (error) {
    console.error('Error handling report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send notifications
router.post('/notifications/send', ...requireAuthAndAdmin, [
  body('type').isIn(['email', 'sms', 'push']).withMessage('Valid notification type required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, message } = req.body;

    // In a real app, you'd integrate with email/SMS services
    // For now, we'll just log the notification
    console.log(`Sending ${type} notification: ${message}`);

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = await Promise.all([
      // User growth
      User.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Session statistics
      Session.countDocuments({ createdAt: { $gte: startDate } }),
      Session.countDocuments({ status: 'completed', createdAt: { $gte: startDate } }),
      
      // Mentor statistics
      Mentor.countDocuments({ createdAt: { $gte: startDate } }),
      Mentor.countDocuments({ 'verification.status': 'approved', createdAt: { $gte: startDate } })
    ]);

    res.json({
      period,
      newUsers: analytics[0],
      totalSessions: analytics[1],
      completedSessions: analytics[2],
      newMentors: analytics[3],
      approvedMentors: analytics[4]
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 