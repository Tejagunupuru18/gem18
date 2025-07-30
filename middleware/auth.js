const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user found.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

const verifyMentor = async (req, res, next) => {
  try {
    const Mentor = require('../models/Mentor');
    const mentor = await Mentor.findOne({ userId: req.user._id });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found.' });
    }

    if (mentor.verification.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Mentor account not yet approved by admin.' 
      });
    }

    req.mentor = mentor;
    next();
  } catch (error) {
    console.error('Mentor verification error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const verifyStudent = async (req, res, next) => {
  try {
    const Student = require('../models/Student');
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('Student verification error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  auth,
  authorize,
  verifyMentor,
  verifyStudent
}; 