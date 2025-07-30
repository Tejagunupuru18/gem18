const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, verifyMentor } = require('../middleware/auth');
const Mentor = require('../models/Mentor');
const Session = require('../models/Session');

const router = express.Router();

// Get all mentors (public route)
router.get('/', async (req, res) => {
  try {
    const {
      field,
      rating,
      experience,
      language,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {
      'verification.status': 'approved',
      isActive: true
    };

    if (field) {
      filter['expertise.field'] = field;
    }

    if (rating) {
      filter['ratings.average'] = { $gte: parseFloat(rating) };
    }

    if (experience) {
      filter['professionalInfo.experience'] = { $gte: parseInt(experience) };
    }

    if (language) {
      filter.languages = language;
    }

    const mentors = await Mentor.find(filter)
      .populate('userId', 'firstName lastName email profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'ratings.average': -1, 'stats.totalSessions': -1 });

    const total = await Mentor.countDocuments(filter);

    res.json({
      mentors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ message: 'Server error fetching mentors.' });
  }
});

// Get mentor profile
router.get('/profile', auth, verifyMentor, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email phone profilePicture');

    res.json(mentor);
  } catch (error) {
    console.error('Get mentor profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Update mentor profile
router.put('/profile', auth, verifyMentor, [
  body('professionalInfo.designation').optional().trim().notEmpty(),
  body('professionalInfo.organization').optional().trim().notEmpty(),
  body('professionalInfo.experience').optional().isInt({ min: 0 }),
  body('bio').optional().trim().notEmpty(),
  body('expertise').optional().isArray(),
  body('languages').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const { professionalInfo, bio, expertise, languages, achievements } = req.body;

    if (professionalInfo) updates.professionalInfo = professionalInfo;
    if (bio) updates.bio = bio;
    if (expertise) updates.expertise = expertise;
    if (languages) updates.languages = languages;
    if (achievements) updates.achievements = achievements;

    const mentor = await Mentor.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone profilePicture');

    res.json({
      message: 'Profile updated successfully',
      mentor
    });

  } catch (error) {
    console.error('Update mentor profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// Update availability
router.put('/availability', auth, verifyMentor, [
  body('schedule').optional().isArray(),
  body('timezone').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schedule, timezone } = req.body;

    const mentor = await Mentor.findOneAndUpdate(
      { userId: req.user._id },
      {
        'availability.schedule': schedule,
        'availability.timezone': timezone || 'Asia/Kolkata'
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Availability updated successfully',
      availability: mentor.availability
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error updating availability.' });
  }
});

// Get mentor's sessions
router.get('/sessions', auth, verifyMentor, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { mentorId: req.mentor._id };
    if (status) {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate([
        { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } },
        { path: 'mentorId', populate: { path: 'userId', select: 'firstName lastName email profilePicture' } }
      ])
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(filter);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get mentor sessions error:', error);
    res.status(500).json({ message: 'Server error fetching sessions.' });
  }
});

// Update session status
router.put('/sessions/:sessionId/status', auth, verifyMentor, [
  body('status').isIn(['confirmed', 'in-progress', 'completed', 'cancelled']),
  body('notes').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (session.mentorId.toString() !== req.mentor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this session.' });
    }

    session.status = status;
    if (notes) {
      session.notes.mentor = notes;
    }

    // Set actual times for completed sessions
    if (status === 'completed' && !session.actualEndTime) {
      session.actualEndTime = new Date();
      if (!session.actualStartTime) {
        session.actualStartTime = session.scheduledDate;
      }
      session.actualDuration = Math.round((session.actualEndTime - session.actualStartTime) / 60000);
    }

    await session.save();

    // Update mentor stats if session completed
    if (status === 'completed') {
      await req.mentor.updateStats(session.actualDuration || session.duration);
    }

    res.json({
      message: 'Session status updated successfully',
      session
    });

  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ message: 'Server error updating session status.' });
  }
});

// Submit session feedback
router.post('/sessions/:sessionId/feedback', auth, verifyMentor, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (session.mentorId.toString() !== req.mentor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this session.' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only submit feedback for completed sessions.' });
    }

    if (session.feedback.mentor.rating) {
      return res.status(400).json({ message: 'Feedback already submitted for this session.' });
    }

    session.feedback.mentor = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await session.save();

    res.json({
      message: 'Feedback submitted successfully',
      session
    });

  } catch (error) {
    console.error('Submit mentor feedback error:', error);
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
});

// Get mentor statistics
router.get('/stats', auth, verifyMentor, async (req, res) => {
  try {
    const stats = await Session.aggregate([
      { $match: { mentorId: req.mentor._id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          upcomingSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalHours: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $ifNull: ['$actualDuration', '$duration'] },
                0
              ]
            }
          },
          averageRating: { $avg: '$feedback.student.rating' },
          totalStudents: { $addToSet: '$studentId' }
        }
      }
    ]);

    const monthlyStats = await Session.aggregate([
      { $match: { mentorId: req.mentor._id } },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          sessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          hours: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $ifNull: ['$actualDuration', '$duration'] },
                0
              ]
            }
          },
          averageRating: { $avg: '$feedback.student.rating' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    const weeklyStats = await Session.aggregate([
      { $match: { mentorId: req.mentor._id } },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            week: { $week: '$scheduledDate' }
          },
          sessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          hours: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $ifNull: ['$actualDuration', '$duration'] },
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.week': -1 } },
      { $limit: 4 }
    ]);

    const ratingDistribution = await Session.aggregate([
      { $match: { mentorId: req.mentor._id, 'feedback.student.rating': { $exists: true } } },
      {
        $group: {
          _id: '$feedback.student.rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = {
      totalSessions: stats[0]?.totalSessions || 0,
      completedSessions: stats[0]?.completedSessions || 0,
      upcomingSessions: stats[0]?.upcomingSessions || 0,
      cancelledSessions: stats[0]?.cancelledSessions || 0,
      totalHours: stats[0]?.totalHours || 0,
      monthlyHours: stats[0]?.totalHours || 0, // For backward compatibility
      averageRating: stats[0]?.averageRating || 0,
      totalStudents: stats[0]?.totalStudents?.length || 0,
      monthly: monthlyStats,
      weekly: weeklyStats,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json(result);

  } catch (error) {
    console.error('Get mentor stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics.' });
  }
});

// Get upcoming sessions
router.get('/sessions/upcoming', auth, verifyMentor, async (req, res) => {
  try {
    const upcomingSessions = await Session.find({
      mentorId: req.mentor._id,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate([
      { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } }
    ])
    .sort({ scheduledDate: 1 })
    .limit(10);

    res.json(upcomingSessions);

  } catch (error) {
    console.error('Get upcoming sessions error:', error);
    res.status(500).json({ message: 'Server error fetching upcoming sessions.' });
  }
});

// Get recent sessions
router.get('/sessions/recent', auth, verifyMentor, async (req, res) => {
  try {
    const recentSessions = await Session.find({
      mentorId: req.mentor._id,
      status: 'completed'
    })
    .populate([
      { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } }
    ])
    .sort({ actualEndTime: -1 })
    .limit(5);

    res.json(recentSessions);

  } catch (error) {
    console.error('Get recent sessions error:', error);
    res.status(500).json({ message: 'Server error fetching recent sessions.' });
  }
});

module.exports = router; 