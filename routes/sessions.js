const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Session = require('../models/Session');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get session info (public route)
router.get('/info', (req, res) => {
  res.json({
    message: 'Session Management API',
    description: 'Book and manage mentorship sessions with verified mentors.'
  });
});

// Get all sessions (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const sessions = await Session.find(filter)
      .populate([
        { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } },
        { path: 'mentorId', populate: { path: 'userId', select: 'firstName lastName email' } }
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

// Get session by ID
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate([
        { path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } },
        { path: 'mentorId', populate: { path: 'userId', select: 'firstName lastName email' } }
      ]);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    res.json(session);

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error fetching session.' });
  }
});

// Update session (admin only)
router.put('/:sessionId', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (status) session.status = status;
    if (notes) session.notes.admin = notes;

    await session.save();

    res.json({
      message: 'Session updated successfully',
      session
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error updating session.' });
  }
});

// Student submits feedback after session
router.post('/:sessionId/feedback', auth, [
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

    // Only allow feedback if the session is completed and by the student
    if (session.status !== 'completed' || session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this session.' });
    }

    if (session.feedback.student && session.feedback.student.rating) {
      return res.status(400).json({ message: 'Feedback already submitted.' });
    }

    session.feedback.student = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await session.save();

    res.json({ message: 'Feedback submitted successfully', session });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
});

// Get chat messages for a session
router.get('/:sessionId/chat', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    // Only allow mentor or student in the session to view chat
    if (
      session.studentId.toString() !== req.user._id.toString() &&
      session.mentorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view chat for this session.' });
    }
    res.json({ chatHistory: session.chatHistory });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error fetching chat.' });
  }
});

// Post a chat message to a session
router.post('/:sessionId/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    // Only allow mentor or student in the session to post chat
    let sender = null;
    if (session.studentId.toString() === req.user._id.toString()) {
      sender = 'student';
    } else if (session.mentorId.toString() === req.user._id.toString()) {
      sender = 'mentor';
    } else {
      return res.status(403).json({ message: 'Not authorized to post chat for this session.' });
    }
    const chatMsg = {
      sender,
      message,
      timestamp: new Date()
    };
    session.chatHistory.push(chatMsg);
    await session.save();
    res.json({ message: 'Message sent', chat: chatMsg });
  } catch (error) {
    console.error('Post chat error:', error);
    res.status(500).json({ message: 'Server error posting chat.' });
  }
});

module.exports = router; 