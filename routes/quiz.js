const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, verifyStudent } = require('../middleware/auth');
const Student = require('../models/Student');

const router = express.Router();

// Get quiz info (public route)
router.get('/', (req, res) => {
  res.json({
    message: 'Career Assessment Quiz API',
    totalQuestions: careerQuestions.length,
    description: 'Take this quiz to discover your ideal career path based on your interests and strengths.'
  });
});

// Career assessment questions
const careerQuestions = [
  {
    id: 1,
    question: "What subjects do you enjoy studying the most?",
    options: [
      { text: "Mathematics and Science", careers: ["Engineering", "Computer Science", "Medical", "Technology"], weight: 3 },
      { text: "Literature and Languages", careers: ["Arts", "Literature", "Teaching", "Law"], weight: 2 },
      { text: "Business and Economics", careers: ["Commerce", "Business", "Finance", "Management"], weight: 2 },
      { text: "Sports and Physical Activities", careers: ["Sports", "Physical Education", "Fitness", "Coaching"], weight: 1 }
    ]
  },
  {
    id: 2,
    question: "How do you prefer to spend your free time?",
    options: [
      { text: "Solving puzzles and problems", careers: ["Engineering", "Computer Science", "Science", "Technology"], weight: 3 },
      { text: "Reading books and writing", careers: ["Literature", "Arts", "Teaching", "Journalism"], weight: 2 },
      { text: "Organizing events and leading groups", careers: ["Business", "Management", "Teaching", "Politics"], weight: 2 },
      { text: "Creating art or music", careers: ["Arts", "Music", "Design", "Creative"], weight: 2 }
    ]
  },
  {
    id: 3,
    question: "What type of work environment appeals to you?",
    options: [
      { text: "Laboratory or technical setting", careers: ["Science", "Medical", "Engineering", "Technology"], weight: 3 },
      { text: "Office with people interaction", careers: ["Business", "Management", "Teaching", "Law"], weight: 2 },
      { text: "Creative studio or workshop", careers: ["Arts", "Design", "Music", "Creative"], weight: 2 },
      { text: "Outdoor or field work", careers: ["Agriculture", "Sports", "Environmental", "Adventure"], weight: 1 }
    ]
  },
  {
    id: 4,
    question: "What are your strengths?",
    options: [
      { text: "Analytical thinking and problem-solving", careers: ["Engineering", "Computer Science", "Science", "Technology"], weight: 3 },
      { text: "Communication and interpersonal skills", careers: ["Teaching", "Business", "Law", "Management"], weight: 2 },
      { text: "Creativity and artistic abilities", careers: ["Arts", "Design", "Music", "Creative"], weight: 2 },
      { text: "Physical fitness and coordination", careers: ["Sports", "Physical Education", "Dance", "Fitness"], weight: 1 }
    ]
  },
  {
    id: 5,
    question: "What motivates you the most?",
    options: [
      { text: "Innovation and discovery", careers: ["Science", "Technology", "Engineering", "Research"], weight: 3 },
      { text: "Helping and teaching others", careers: ["Teaching", "Medical", "Social Work", "Counseling"], weight: 2 },
      { text: "Financial success and leadership", careers: ["Business", "Management", "Finance", "Entrepreneurship"], weight: 2 },
      { text: "Creative expression and recognition", careers: ["Arts", "Music", "Design", "Entertainment"], weight: 2 }
    ]
  }
];

// Get quiz questions
router.get('/questions', auth, verifyStudent, (req, res) => {
  res.json({
    questions: careerQuestions,
    totalQuestions: careerQuestions.length
  });
});

// Submit quiz answers
router.post('/submit', auth, verifyStudent, [
  body('answers').isArray({ min: 1 }),
  body('answers.*.questionId').isInt({ min: 1 }),
  body('answers.*.selectedOption').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers } = req.body;

    // Calculate career scores
    const careerScores = {};
    
    answers.forEach(answer => {
      const question = careerQuestions.find(q => q.id === answer.questionId);
      if (question && question.options[answer.selectedOption]) {
        const option = question.options[answer.selectedOption];
        option.careers.forEach(career => {
          careerScores[career] = (careerScores[career] || 0) + option.weight;
        });
      }
    });

    // Sort careers by score
    const recommendedCareers = Object.entries(careerScores)
      .map(([career, score]) => ({ career, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Update student's quiz results
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      {
        'quizResults.completed': true,
        'quizResults.recommendedCareers': recommendedCareers,
        'quizResults.completedAt': new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Quiz completed successfully',
      recommendedCareers,
      student: student.quizResults
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error submitting quiz.' });
  }
});

// Get student's quiz results
router.get('/results', auth, verifyStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student.quizResults.completed) {
      return res.status(404).json({ message: 'Quiz not completed yet.' });
    }

    res.json(student.quizResults);

  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Server error fetching quiz results.' });
  }
});

// Get career information
router.get('/careers', (req, res) => {
  const careerInfo = {
    "Engineering": {
      description: "Design and build systems, structures, and products",
      skills: ["Mathematics", "Physics", "Problem-solving", "Technical drawing"],
      courses: ["B.Tech", "B.E.", "Diploma in Engineering"],
      exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE"]
    },
    "Medical": {
      description: "Healthcare and medical treatment",
      skills: ["Biology", "Chemistry", "Compassion", "Attention to detail"],
      courses: ["MBBS", "BDS", "BAMS", "BHMS"],
      exams: ["NEET", "AIIMS", "JIPMER"]
    },
    "Computer Science": {
      description: "Software development and technology",
      skills: ["Programming", "Logic", "Problem-solving", "Creativity"],
      courses: ["B.Tech CSE", "BCA", "B.Sc Computer Science"],
      exams: ["JEE Main", "BITSAT", "VITEEE", "CUET"]
    },
    "Arts": {
      description: "Creative expression and cultural studies",
      skills: ["Creativity", "Communication", "Critical thinking", "Cultural awareness"],
      courses: ["BA", "BFA", "BVA", "B.Des"],
      exams: ["CUET", "NID", "NIFT", "JNUEE"]
    },
    "Commerce": {
      description: "Business, finance, and trade",
      skills: ["Mathematics", "Analytical thinking", "Communication", "Leadership"],
      courses: ["B.Com", "BBA", "BMS", "CA"],
      exams: ["CUET", "IPMAT", "SET", "DUET"]
    },
    "Teaching": {
      description: "Education and knowledge sharing",
      skills: ["Communication", "Patience", "Leadership", "Subject knowledge"],
      courses: ["B.Ed", "BA + B.Ed", "B.Sc + B.Ed"],
      exams: ["CTET", "TET", "CUET"]
    },
    "Law": {
      description: "Legal system and justice",
      skills: ["Analytical thinking", "Communication", "Research", "Ethics"],
      courses: ["LLB", "BA LLB", "BBA LLB"],
      exams: ["CLAT", "AILET", "LSAT"]
    },
    "Business": {
      description: "Management and entrepreneurship",
      skills: ["Leadership", "Communication", "Strategic thinking", "Financial literacy"],
      courses: ["BBA", "BMS", "B.Com", "MBA"],
      exams: ["CUET", "IPMAT", "SET", "CAT"]
    }
  };

  res.json(careerInfo);
});

module.exports = router; 