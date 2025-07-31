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
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'mentor', approvalStatus: 'approved' }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'mentor', approvalStatus: 'pending' })
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

// Get pending mentor approvals
router.get('/pending-mentors', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const pendingMentors = await User.find({ 
      role: 'mentor', 
      approvalStatus: 'pending' 
    }).select('-password');

    const mentorsWithProfiles = await Promise.all(
      pendingMentors.map(async (user) => {
        const mentorProfile = await Mentor.findOne({ userId: user._id });
        return {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          createdAt: user.createdAt,
          mentorProfile: mentorProfile || null
        };
      })
    );

    res.json(mentorsWithProfiles);
  } catch (error) {
    console.error('Error fetching pending mentors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rejected mentors
router.get('/rejected-mentors', ...requireAuthAndAdmin, async (req, res) => {
  try {
    const rejectedMentors = await User.find({ 
      role: 'mentor', 
      approvalStatus: 'rejected' 
    }).select('-password');

    const mentorsWithProfiles = await Promise.all(
      rejectedMentors.map(async (user) => {
        const mentorProfile = await Mentor.findOne({ userId: user._id });
        return {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          createdAt: user.createdAt,
          rejectionReason: user.rejectionReason,
          mentorProfile: mentorProfile || null
        };
      })
    );

    res.json(mentorsWithProfiles);
  } catch (error) {
    console.error('Error fetching rejected mentors:', error);
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
router.post('/mentors/:action', ...requireAuthAndAdmin, [
  body('mentorId').isMongoId().withMessage('Valid mentor ID required'),
  body('rejectionReason').optional().isString().withMessage('Rejection reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action } = req.params;
    const { mentorId, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await User.findById(mentorId);
    if (!user || user.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    if (action === 'approve') {
      user.approvalStatus = 'approved';
      user.approvalDate = new Date();
      user.approvedBy = req.user._id;
      user.isVerified = true;
      user.rejectionReason = undefined;
    } else {
      user.approvalStatus = 'rejected';
      user.rejectionReason = rejectionReason || 'No reason provided';
      user.approvedBy = req.user._id;
    }

    await user.save();

    // Update mentor profile verification status
    const mentorProfile = await Mentor.findOne({ userId: mentorId });
    if (mentorProfile) {
      mentorProfile.verification.status = action === 'approve' ? 'approved' : 'rejected';
      mentorProfile.verification.verifiedBy = req.user._id;
      mentorProfile.verification.verifiedAt = new Date();
      if (action === 'reject') {
        mentorProfile.verification.rejectionReason = rejectionReason;
      }
      await mentorProfile.save();
    }

    res.json({ 
      message: `Mentor ${action}d successfully`,
      mentor: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        approvalStatus: user.approvalStatus,
        approvalDate: user.approvalDate
      }
    });
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

// Send notifications to all users
router.post('/notifications/send', requireAuthAndAdmin, async (req, res) => {
  try {
    const { type, message, title } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get all users (students and mentors)
    const User = require('../models/User');
    const users = await User.find({ isActive: true }).select('email firstName lastName role');

    if (users.length === 0) {
      return res.status(404).json({ message: 'No active users found' });
    }

    let sentCount = 0;
    let failedCount = 0;

    if (type === 'email') {
      // Send email to all users
      for (const user of users) {
        try {
          // In a real application, you would integrate with an email service like SendGrid, Mailgun, etc.
          console.log(`Sending email to ${user.email}: ${message}`);
          
          // For now, we'll just log the email sending
          // In production, you would use:
          // await sendEmail(user.email, title || 'Platform Notification', message);
          
          sentCount++;
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          failedCount++;
        }
      }
    } else if (type === 'push') {
      // Send push notification to all users
      for (const user of users) {
        try {
          // In a real application, you would integrate with a push notification service like Firebase, OneSignal, etc.
          console.log(`Sending push notification to ${user.firstName} ${user.lastName}: ${message}`);
          
          // For now, we'll just log the push notification
          // In production, you would use:
          // await sendPushNotification(user.fcmToken, title || 'Platform Notification', message);
          
          sentCount++;
        } catch (error) {
          console.error(`Failed to send push notification to ${user.firstName} ${user.lastName}:`, error);
          failedCount++;
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid notification type. Use "email" or "push"' });
    }

    res.json({
      message: `Notification sent successfully!`,
      details: {
        type,
        totalUsers: users.length,
        sentCount,
        failedCount,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
});

// Get notification settings
router.get('/notifications', requireAuthAndAdmin, async (req, res) => {
  try {
    // In a real application, you would fetch these settings from a database
    const settings = {
      emailNotifications: true,
      smsNotifications: false,
      sessionReminders: true,
      weeklyReports: true
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/notifications', requireAuthAndAdmin, async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, sessionReminders, weeklyReports } = req.body;
    
    // In a real application, you would save these settings to a database
    console.log('Updating notification settings:', {
      emailNotifications,
      smsNotifications,
      sessionReminders,
      weeklyReports
    });
    
    res.json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Failed to update notification settings' });
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