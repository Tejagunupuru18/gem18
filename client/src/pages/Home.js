import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import {
  School,
  Business,
  People,
  Book,
  Quiz,
  Article,
  VideoCall,
  TrendingUp,
  Security,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <People />,
      title: 'Connect with Mentors',
      description: 'Find verified professionals in your field of interest and get personalized guidance.',
    },
    {
      icon: <Quiz />,
      title: 'Career Assessment',
      description: 'Take our interactive quiz to discover career paths that match your interests and skills.',
    },
    {
      icon: <Book />,
      title: 'Book Sessions',
      description: 'Schedule 1:1 mentorship sessions with experts in your chosen field.',
    },
    {
      icon: <Article />,
      title: 'Resource Hub',
      description: 'Access curated scholarship information, exam guides, and career articles.',
    },
    {
      icon: <VideoCall />,
      title: 'Video Sessions',
      description: 'Conduct secure video calls with mentors from anywhere, anytime.',
    },
    {
      icon: <TrendingUp />,
      title: 'Track Progress',
      description: 'Monitor your learning journey and celebrate achievements with badges.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Students Helped' },
    { number: '50+', label: 'Verified Mentors' },
    { number: '1000+', label: 'Sessions Conducted' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Your Career Journey
                <br />
                <Typography
                  component="span"
                  variant="h2"
                  sx={{ color: 'secondary.main', fontWeight: 'bold' }}
                >
                  Starts Here
                </Typography>
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Connect with verified mentors, discover your career path, and access
                resources designed for government school students.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {user ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    component={Link}
                    to="/dashboard"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      component={Link}
                      to="/register"
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      component={Link}
                      to="/login"
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Login
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <School sx={{ fontSize: 200, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                  },
                }}
              >
                <Typography variant="h3" color="primary" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Why Choose Our Platform?
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Designed specifically for government school students to bridge the gap
            in career guidance and mentorship opportunities.
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      transition: 'transform 0.3s ease-in-out',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                        }}
                      >
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of students who have already discovered their career path
              through our mentorship platform.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              {user ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  to="/dashboard"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Continue Learning
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/register"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Join Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/login"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Security & Trust Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Safe & Secure
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Your privacy and security are our top priorities. All mentors are
                verified and sessions are conducted in a safe environment.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<Security />}
                  label="Verified Mentors"
                  color="secondary"
                  variant="filled"
                />
                <Chip
                  icon={<Security />}
                  label="Secure Sessions"
                  color="secondary"
                  variant="filled"
                />
                <Chip
                  icon={<Security />}
                  label="Privacy Protected"
                  color="secondary"
                  variant="filled"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                }}
              >
                <Security sx={{ fontSize: 150, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 