const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, verifyStudent } = require('../middleware/auth');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Session = require('../models/Session');
const Resource = require('../models/Resource');

const router = express.Router();

// Get all students (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email phone profilePicture isActive isVerified')
      .sort({ createdAt: -1 });

    res.json({
      students,
      total: students.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error fetching students.' });
  }
});

// Get student profile
router.get('/profile', auth, verifyStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email phone profilePicture');

    res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Update student profile
router.put('/profile', auth, verifyStudent, [
  body('school.name').optional().trim().notEmpty(),
  body('education.currentClass').optional().trim().notEmpty(),
  body('education.stream').optional().isIn(['Science', 'Commerce', 'Arts', 'Not Selected']),
  body('interests').optional().isArray(),
  body('careerGoals').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const { school, education, interests, careerGoals, emergencyContact } = req.body;

    if (school) updates.school = school;
    if (education) updates.education = education;
    if (interests) updates.interests = interests;
    if (careerGoals) updates.careerGoals = careerGoals;
    if (emergencyContact) updates.emergencyContact = emergencyContact;

    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone profilePicture');

    res.json({
      message: 'Profile updated successfully',
      student
    });

  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// Get all mentors (with filters)
router.get('/mentors', auth, verifyStudent, async (req, res) => {
  try {
    const {
      field,
      rating,
      experience,
      language,
      availability,
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

// Get mentor details
router.get('/mentors/:mentorId', auth, verifyStudent, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId)
      .populate('userId', 'firstName lastName email phone profilePicture');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    if (mentor.verification.status !== 'approved') {
      return res.status(404).json({ message: 'Mentor not available.' });
    }

    res.json(mentor);

  } catch (error) {
    console.error('Get mentor details error:', error);
    res.status(500).json({ message: 'Server error fetching mentor details.' });
  }
});

// Book a session
router.post('/sessions', auth, verifyStudent, [
  body('mentorId').isMongoId(),
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('scheduledDate').isISO8601(),
  body('duration').isInt({ min: 30, max: 180 }),
  body('sessionType').isIn(['video_call', 'chat', 'email', 'phone'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mentorId, title, description, scheduledDate, duration, sessionType, topics } = req.body;

    // Check if mentor exists and is approved
    const mentor = await Mentor.findById(mentorId);
    if (!mentor || mentor.verification.status !== 'approved') {
      return res.status(404).json({ message: 'Mentor not available.' });
    }

    // Check if student has existing session at this time
    const existingSession = await Session.findOne({
      studentId: req.student._id,
      scheduledDate: {
        $gte: new Date(scheduledDate),
        $lt: new Date(new Date(scheduledDate).getTime() + duration * 60000)
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'You already have a session scheduled at this time.' });
    }

    // Create session
    const session = new Session({
      studentId: req.student._id,
      mentorId,
      title,
      description,
      scheduledDate,
      duration,
      sessionType,
      topics: topics || []
    });

    await session.save();

    // Populate mentor details
    await session.populate([
      { path: 'mentorId', populate: { path: 'userId', select: 'firstName lastName email' } },
      { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } }
    ]);

    res.status(201).json({
      message: 'Session booked successfully',
      session
    });

  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({ message: 'Server error booking session.' });
  }
});

// Get student's sessions
router.get('/sessions', auth, verifyStudent, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { studentId: req.student._id };
    if (status) {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate([
        { path: 'mentorId', populate: { path: 'userId', select: 'firstName lastName email profilePicture' } },
        { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } }
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
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error fetching sessions.' });
  }
});

// Cancel session
router.put('/sessions/:sessionId/cancel', auth, verifyStudent, [
  body('reason').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const { reason } = req.body;

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (session.studentId.toString() !== req.student._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this session.' });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({ message: 'Session is already cancelled.' });
    }

    session.status = 'cancelled';
    session.cancellation = {
      cancelledBy: 'student',
      reason: reason || 'Cancelled by student',
      cancelledAt: new Date()
    };

    await session.save();

    res.json({
      message: 'Session cancelled successfully',
      session
    });

  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({ message: 'Server error cancelling session.' });
  }
});

// Submit session feedback
router.post('/sessions/:sessionId/feedback', auth, verifyStudent, [
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

    if (session.studentId.toString() !== req.student._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this session.' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only submit feedback for completed sessions.' });
    }

    if (session.feedback.student.rating) {
      return res.status(400).json({ message: 'Feedback already submitted for this session.' });
    }

    session.feedback.student = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await session.save();

    // Update mentor's average rating
    const mentor = await Mentor.findById(session.mentorId);
    if (mentor) {
      mentor.ratings.reviews.push({
        studentId: req.student._id,
        rating,
        comment,
        date: new Date()
      });
      mentor.ratings.average = mentor.calculateAverageRating();
      mentor.ratings.totalReviews = mentor.ratings.reviews.length;
      await mentor.save();
    }

    res.json({
      message: 'Feedback submitted successfully',
      session
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
});

// Get resources
router.get('/resources', auth, verifyStudent, async (req, res) => {
  try {
    const {
      type,
      category,
      featured,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { status: 'active' };

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

// Get resource details
router.get('/resources/:resourceId', auth, verifyStudent, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Increment view count
    await resource.incrementViews();

    res.json(resource);

  } catch (error) {
    console.error('Get resource details error:', error);
    res.status(500).json({ message: 'Server error fetching resource details.' });
  }
});

// Submit resource review
router.post('/resources/:resourceId/review', auth, verifyStudent, [
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
    console.error('Submit resource review error:', error);
    res.status(500).json({ message: 'Server error submitting review.' });
  }
});

// Student dashboard stats
router.get('/stats', auth, verifyStudent, async (req, res) => {
  try {
    const studentId = req.student._id;
    const totalSessions = await Session.countDocuments({ studentId });
    const completedSessions = await Session.countDocuments({ studentId, status: 'completed' });
    const upcomingSessions = await Session.countDocuments({ studentId, status: { $in: ['scheduled', 'confirmed', 'in-progress'] } });
    const sessions = await Session.find({ studentId, status: 'completed' });
    let averageRating = 0;
    let totalRatings = 0;
    sessions.forEach(session => {
      if (session.feedback && session.feedback.student && session.feedback.student.rating) {
        averageRating += session.feedback.student.rating;
        totalRatings++;
      }
    });
    averageRating = totalRatings > 0 ? (averageRating / totalRatings) : 0;
    res.json({
      totalSessions,
      completedSessions,
      upcomingSessions,
      averageRating: Math.round(averageRating * 10) / 10
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ message: 'Server error fetching student stats.' });
  }
});

module.exports = router; 