import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  School,
  Work,
  Psychology,
  Science,
  Palette,
  Business,
  Engineering,
  LocalHospital,
  Computer,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Star,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Quiz = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What subjects do you enjoy studying the most?",
      options: [
        { value: 0, label: "Mathematics and Science", icon: <Science /> },
        { value: 1, label: "Literature and Languages", icon: <School /> },
        { value: 2, label: "Business and Economics", icon: <Business /> },
        { value: 3, label: "Sports and Physical Activities", icon: <Work /> },
      ]
    },
    {
      id: 2,
      question: "How do you prefer to spend your free time?",
      options: [
        { value: 0, label: "Solving puzzles and problems", icon: <Science /> },
        { value: 1, label: "Reading books and writing", icon: <School /> },
        { value: 2, label: "Organizing events and leading groups", icon: <Business /> },
        { value: 3, label: "Creating art or music", icon: <Palette /> },
      ]
    },
    {
      id: 3,
      question: "What type of work environment appeals to you?",
      options: [
        { value: 0, label: "Laboratory or technical setting", icon: <Science /> },
        { value: 1, label: "Office with people interaction", icon: <Work /> },
        { value: 2, label: "Creative studio or workshop", icon: <Palette /> },
        { value: 3, label: "Outdoor or field work", icon: <Work /> },
      ]
    },
    {
      id: 4,
      question: "What are your strengths?",
      options: [
        { value: 0, label: "Analytical thinking and problem-solving", icon: <Science /> },
        { value: 1, label: "Communication and interpersonal skills", icon: <Psychology /> },
        { value: 2, label: "Creativity and artistic abilities", icon: <Palette /> },
        { value: 3, label: "Physical fitness and coordination", icon: <Work /> },
      ]
    },
    {
      id: 5,
      question: "What motivates you the most?",
      options: [
        { value: 0, label: "Innovation and discovery", icon: <Lightbulb /> },
        { value: 1, label: "Helping and teaching others", icon: <School /> },
        { value: 2, label: "Financial success and leadership", icon: <Business /> },
        { value: 3, label: "Creative expression and recognition", icon: <Palette /> },
      ]
    }
  ];



  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      // Convert answers to the format expected by the backend
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId: parseInt(questionId),
        selectedOption: parseInt(selectedOption)
      }));

      const response = await axios.post('/api/quiz/submit', {
        answers: formattedAnswers
      });
      setResults(response.data);
      setQuizCompleted(true);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getTopCareerPath = () => {
    if (results && results.recommendedCareers) {
      return results.recommendedCareers.map(career => ({
        name: career.career,
        description: getCareerDescription(career.career),
        icon: getCareerIcon(career.career),
        score: career.score
      }));
    }
    return [];
  };

  const getCareerDescription = (career) => {
    const descriptions = {
      "Engineering": "Design and build systems, structures, and products",
      "Computer Science": "Software development and technology",
      "Medical": "Healthcare and medical treatment",
      "Technology": "Innovation and digital solutions",
      "Arts": "Creative expression and cultural studies",
      "Literature": "Writing, communication, and storytelling",
      "Teaching": "Education and knowledge sharing",
      "Law": "Legal system and justice",
      "Commerce": "Business, finance, and trade",
      "Business": "Management and entrepreneurship",
      "Finance": "Financial planning and analysis",
      "Management": "Leadership and organizational skills",
      "Sports": "Physical fitness and athletic performance",
      "Physical Education": "Fitness training and coaching",
      "Fitness": "Health and wellness promotion",
      "Coaching": "Mentoring and skill development",
      "Agriculture": "Farming and agricultural sciences",
      "Environmental": "Environmental protection and sustainability",
      "Adventure": "Outdoor activities and exploration",
      "Music": "Musical performance and composition",
      "Design": "Visual design and creative solutions",
      "Creative": "Artistic and innovative expression",
      "Science": "Research and scientific discovery",
      "Research": "Investigation and analysis",
      "Politics": "Government and public service",
      "Journalism": "News reporting and media",
      "Social Work": "Community service and support",
      "Counseling": "Mental health and guidance",
      "Entrepreneurship": "Business creation and innovation"
    };
    return descriptions[career] || "Career in your field of interest";
  };

  const getCareerIcon = (career) => {
    const icons = {
      "Engineering": <Engineering />,
      "Computer Science": <Computer />,
      "Medical": <LocalHospital />,
      "Technology": <Computer />,
      "Arts": <Palette />,
      "Literature": <School />,
      "Teaching": <School />,
      "Law": <Work />,
      "Commerce": <Business />,
      "Business": <Business />,
      "Finance": <Business />,
      "Management": <Work />,
      "Sports": <Work />,
      "Physical Education": <Work />,
      "Fitness": <Work />,
      "Coaching": <Work />,
      "Agriculture": <Work />,
      "Environmental": <Science />,
      "Adventure": <Work />,
      "Music": <Palette />,
      "Design": <Palette />,
      "Creative": <Palette />,
      "Science": <Science />,
      "Research": <Science />,
      "Politics": <Work />,
      "Journalism": <School />,
      "Social Work": <Psychology />,
      "Counseling": <Psychology />,
      "Entrepreneurship": <Business />
    };
    return icons[career] || <Work />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (showResults) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Quiz Completed! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Based on your answers, here are your career recommendations:
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {getTopCareerPath().map((career, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {career.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {career.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {career.description}
                    </Typography>
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Match Score: {career.score}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setShowResults(false);
                setQuizCompleted(false);
                setCurrentQuestion(0);
                setAnswers({});
                setResults(null);
              }}
            >
              Take Quiz Again
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Career Assessment Quiz
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Answer these questions to discover your ideal career path
          </Typography>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(calculateProgress())}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={calculateProgress()} />
        </Box>

        {/* Current Question */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {questions[currentQuestion].question}
          </Typography>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={answers[questions[currentQuestion].id] || ''}
              onChange={(e) => handleAnswer(questions[currentQuestion].id, e.target.value)}
            >
              {questions[currentQuestion].options.map((option, index) => (
                <Card key={index} sx={{ mb: 2, cursor: 'pointer' }}>
                  <FormControlLabel
                    value={option.value}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                        {option.icon}
                        <Typography>{option.label}</Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Card>
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!answers[questions[currentQuestion].id]}
          >
            {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
          </Button>
        </Box>

        {/* Tips */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Be honest with your answers. There are no right or wrong answers - 
            this quiz helps identify careers that match your interests and personality.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default Quiz; 