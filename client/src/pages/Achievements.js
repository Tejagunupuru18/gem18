import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Badge,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  School,
  Work,
  Psychology,
  Business,
  Book,
  VideoCall,
  CheckCircle,
  Schedule,
  Cancel,
  Add,
  FilterList,
  Search,
  Share,
  Download,
  Print,
  Favorite,
  FavoriteBorder,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Grade,
  Timeline,
  Assessment,
  PsychologyAlt,
  AutoAwesome,
  Celebration,
  Rocket,
  Lightbulb,
  Group,
  Public,
  LocalLibrary,
  Science,
  Code,
  Brush,
  SportsEsports,
  MusicNote,
  FitnessCenter,
  Restaurant,
  Hotel,
  Flight,
  DirectionsCar,
  LocalHospital,
  Security,
  Gavel,
  AccountBalance,
  SchoolOutlined,
  WorkOutline,
  BusinessCenter,
  Engineering,
  MedicalServices,
  Architecture,
  DesignServices,
  Computer,
  PhoneAndroid,
  TabletMac,
  Laptop,
  Watch,
  Headphones,
  CameraAlt,
  Videocam,
  Mic,
  Keyboard,
  Mouse,
  Router,
  Storage,
  Cloud,
  Wifi,
  Bluetooth,
  Nfc,
  GpsFixed,
  LocationOn,
  Map,
  Navigation,
  Directions,
  Traffic,
  Train,
  DirectionsBus,
  DirectionsBike,
  DirectionsWalk,
  DirectionsRun,
  DirectionsCarFilled,
  DirectionsBoat,
  DirectionsSubway,
  DirectionsTransit,
  DirectionsRailway,

} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [achievementDialog, setAchievementDialog] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsRes, badgesRes, progressRes] = await Promise.all([
        axios.get('/api/students/achievements'),
        axios.get('/api/students/badges'),
        axios.get('/api/students/progress'),
      ]);
      
      // Ensure data is always an array
      const achievementsData = Array.isArray(achievementsRes.data) ? achievementsRes.data : 
                              achievementsRes.data.achievements ? achievementsRes.data.achievements : 
                              achievementsRes.data.data ? achievementsRes.data.data : [];
      const badgesData = Array.isArray(badgesRes.data) ? badgesRes.data : 
                        badgesRes.data.badges ? badgesRes.data.badges : 
                        badgesRes.data.data ? badgesRes.data.data : [];
      const progressData = progressRes.data || {};
      
      setAchievements(achievementsData);
      setBadges(badgesData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
      setBadges([]);
      setProgress({});
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    // Ensure achievements is an array before filtering
    let filtered = Array.isArray(achievements) ? achievements : [];
    
    if (filter === 'unlocked') {
      filtered = filtered.filter(achievement => achievement.unlocked);
    } else if (filter === 'locked') {
      filtered = filtered.filter(achievement => !achievement.unlocked);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(achievement => 
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const getAchievementIcon = (category) => {
    const icons = {
      'career': <Work />,
      'education': <School />,
      'mentorship': <Psychology />,
      'business': <Business />,
      'technology': <Code />,
      'arts': <Brush />,
      'sports': <SportsEsports />,
      'music': <MusicNote />,
      'fitness': <FitnessCenter />,
      'hospitality': <Restaurant />,
      'tourism': <Hotel />,
      'transportation': <Flight />,
      'automotive': <DirectionsCar />,
      'healthcare': <LocalHospital />,
      'security': <Security />,
      'law': <Gavel />,
      'finance': <AccountBalance />,
      'engineering': <Engineering />,
      'medical': <MedicalServices />,
      'architecture': <Architecture />,
      'design': <DesignServices />,
      'computing': <Computer />,
      'mobile': <PhoneAndroid />,
      'tablet': <TabletMac />,
      'laptop': <Laptop />,
      'wearable': <Watch />,
      'audio': <Headphones />,
      'photography': <CameraAlt />,
      'video': <Videocam />,
      'audio_recording': <Mic />,
      'input': <Keyboard />,
      'pointing': <Mouse />,
      'networking': <Router />,
      'storage': <Storage />,
      'cloud': <Cloud />,
      'wireless': <Wifi />,
      'bluetooth': <Bluetooth />,
      'nfc': <Nfc />,
      'gps': <GpsFixed />,
      'location': <LocationOn />,
      'mapping': <Map />,
      'navigation': <Navigation />,
      'directions': <Directions />,
      'traffic': <Traffic />,
      'train': <Train />,
      'bus': <DirectionsBus />,
      'bike': <DirectionsBike />,
      'walk': <DirectionsWalk />,
      'run': <DirectionsRun />,
      'car': <DirectionsCarFilled />,
      'boat': <DirectionsBoat />,
      'subway': <DirectionsSubway />,
      'transit': <DirectionsTransit />,
      'railway': <DirectionsRailway />,
      'bike_filled': <DirectionsBike />,
      'walk_filled': <DirectionsWalk />,
      'run_filled': <DirectionsRun />,
      'boat_filled': <DirectionsBoat />,
      'subway_filled': <DirectionsSubway />,
      'transit_filled': <DirectionsTransit />,
      'railway_filled': <DirectionsRailway />,
    };
    
    return icons[category] || <EmojiEvents />;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setAchievementDialog(true);
  };

  const handleShareAchievement = (achievement) => {
    // Implement sharing functionality
    console.log('Sharing achievement:', achievement.title);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Achievements & Progress 🏆
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your learning journey and celebrate your accomplishments
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <EmojiEvents sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Array.isArray(achievements) ? achievements.filter(a => a.unlocked).length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Achievements Unlocked
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {badges.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Badges Earned
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {Math.round(progress.overallProgress || 0)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Grade sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              {progress.currentLevel || 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Level
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Progress Overview */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Learning Progress
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Career Exploration</Typography>
                <Typography variant="body2">{progress.careerProgress || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.careerProgress || 0}
                color={getProgressColor(progress.careerProgress || 0)}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Mentorship Sessions</Typography>
                <Typography variant="body2">{progress.mentorshipProgress || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.mentorshipProgress || 0}
                color={getProgressColor(progress.mentorshipProgress || 0)}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Skill Development</Typography>
                <Typography variant="body2">{progress.skillProgress || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.skillProgress || 0}
                color={getProgressColor(progress.skillProgress || 0)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Resource Utilization</Typography>
                <Typography variant="body2">{progress.resourceProgress || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.resourceProgress || 0}
                color={getProgressColor(progress.resourceProgress || 0)}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Community Engagement</Typography>
                <Typography variant="body2">{progress.communityProgress || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.communityProgress || 0}
                color={getProgressColor(progress.communityProgress || 0)}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Goal Achievement</Typography>
                <Typography variant="body2">{progress.goalProgress || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress.goalProgress || 0}
                color={getProgressColor(progress.goalProgress || 0)}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter and Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          All ({achievements.length})
        </Button>
        <Button
          variant={filter === 'unlocked' ? 'contained' : 'outlined'}
          onClick={() => setFilter('unlocked')}
        >
                      Unlocked ({Array.isArray(achievements) ? achievements.filter(a => a.unlocked).length : 0})
        </Button>
        <Button
          variant={filter === 'locked' ? 'contained' : 'outlined'}
          onClick={() => setFilter('locked')}
        >
                      Locked ({Array.isArray(achievements) ? achievements.filter(a => !a.unlocked).length : 0})
        </Button>
      </Box>

      {/* Achievements Grid */}
      <Grid container spacing={3}>
        {getFilteredAchievements().map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement._id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 4 },
                opacity: achievement.unlocked ? 1 : 0.7,
                position: 'relative',
              }}
              onClick={() => handleAchievementClick(achievement)}
            >
              <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: achievement.unlocked ? 'primary.main' : 'grey.400',
                      fontSize: 40,
                    }}
                  >
                    {getAchievementIcon(achievement.category)}
                  </Avatar>
                  {achievement.unlocked && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: 'success.main',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                  )}
                  {!achievement.unlocked && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: 'grey.500',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lock sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                  )}
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {achievement.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {achievement.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Chip 
                    label={achievement.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  {achievement.rarity && (
                    <Chip 
                      label={achievement.rarity} 
                      size="small" 
                      color={achievement.rarity === 'rare' ? 'warning' : 'default'}
                    />
                  )}
                </Box>

                {achievement.unlocked && (
                  <Typography variant="caption" color="success.main">
                    Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Typography>
                )}

                {!achievement.unlocked && achievement.progress && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Progress</Typography>
                      <Typography variant="caption">{achievement.progress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={achievement.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                {achievement.unlocked && (
                  <Button 
                    size="small" 
                    startIcon={<Share />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareAchievement(achievement);
                    }}
                  >
                    Share
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getFilteredAchievements().length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No achievements found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'all' && "Start your journey to unlock achievements!"}
            {filter === 'unlocked' && "Complete more activities to unlock achievements."}
            {filter === 'locked' && "All achievements are unlocked!"}
          </Typography>
        </Paper>
      )}

      {/* Achievement Details Dialog */}
      <Dialog open={achievementDialog} onClose={() => setAchievementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: selectedAchievement?.unlocked ? 'primary.main' : 'grey.400',
                fontSize: 30,
              }}
            >
              {selectedAchievement && getAchievementIcon(selectedAchievement.category)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedAchievement?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAchievement?.category} • {selectedAchievement?.rarity}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAchievement && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedAchievement.description}
              </Typography>
              
              {selectedAchievement.criteria && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Criteria:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAchievement.criteria}
                  </Typography>
                </Box>
              )}

              {selectedAchievement.rewards && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Rewards:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAchievement.rewards}
                  </Typography>
                </Box>
              )}

              {selectedAchievement.unlocked ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Achievement unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Keep working towards this achievement!
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAchievementDialog(false)}>Close</Button>
          {selectedAchievement?.unlocked && (
            <Button 
              variant="contained" 
              startIcon={<Share />}
              onClick={() => {
                handleShareAchievement(selectedAchievement);
                setAchievementDialog(false);
              }}
            >
              Share Achievement
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="View Progress"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => window.location.href = '/student/profile'}
      >
        <Timeline />
      </Fab>
    </Container>
  );
};

export default Achievements; 