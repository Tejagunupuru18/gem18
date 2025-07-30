const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Auth route hit:', req.method, req.path);
  next();
});

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['student', 'mentor', 'admin']),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      isVerified: role === 'student' // Students are auto-verified
    });

    await user.save();

    // Create role-specific profile
    if (role === 'student') {
      const student = new Student({
        userId: user._id,
        school: {
          name: req.body.schoolName || 'Government School',
          type: 'government',
          location: {
            city: '',
            state: '',
            district: ''
          }
        },
        education: {
          currentClass: req.body.currentClass || 'Class 10',
          board: 'CBSE',
          stream: 'Not Selected'
        },
        interests: req.body.interests || [],
        careerGoals: req.body.careerGoals ? [req.body.careerGoals] : [],
        preferences: {
          preferredLanguages: ['English', 'Hindi'],
          preferredMentorTypes: ['Industry Professional'],
          preferredSessionDuration: 60
        }
      });
      await student.save();
    } else if (role === 'mentor') {
      const mentor = new Mentor({
        userId: user._id,
        professionalInfo: {
          designation: req.body.designation || 'Professional',
          organization: req.body.organization || 'Organization',
          experience: parseInt(req.body.experience) || 0,
          education: {
            degree: '',
            institution: '',
            year: null
          },
          certifications: []
        },
        expertise: [],
        bio: req.body.bio || 'Professional mentor with expertise in career guidance.',
        languages: ['English'],
        availability: {
          schedule: [],
          timezone: 'Asia/Kolkata'
        },
        verification: { 
          status: 'approved',
          documents: [],
          verifiedAt: new Date()
        }
      });
      await mentor.save();
    } else if (role === 'admin') {
      // Admin users don't need additional profile models
      // They are managed through the User model only
      user.isVerified = true; // Admins are auto-verified
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Send more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error during registration.',
        details: error.message 
      });
    } else if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email.' 
      });
    }
    
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get role-specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'mentor') {
      profile = await Mentor.findOne({ userId: user._id });
    }

    res.json({
      user,
      profile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password.' });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Forgot password (send reset email)
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, just return the token
    res.json({
      message: 'Password reset instructions sent to your email.',
      resetToken // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing request.' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
});

module.exports = router; 