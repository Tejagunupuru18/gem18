import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search,
  Book,
  School,
  Assignment,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
  Visibility,
  Star,
  StarBorder,
  AttachMoney,
  Schedule,
  LocationOn,
  Work,
  School as SchoolIcon,
  Article,
  VideoLibrary,
  Description,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Resources = () => {
  // const { user } = useAuth(); // Unused variable
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState('');

  const resourceCategories = [
    { value: 'scholarships', label: 'Scholarships', icon: <AttachMoney /> },
    { value: 'guides', label: 'Study Guides', icon: <Book /> },
    { value: 'articles', label: 'Articles', icon: <Article /> },
    { value: 'videos', label: 'Videos', icon: <VideoLibrary /> },
    { value: 'tools', label: 'Tools', icon: <Work /> },
  ];

  const resourceTypes = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'science', label: 'Science' },
    { value: 'business', label: 'Business' },
    { value: 'creative', label: 'Creative Arts' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'technology', label: 'Technology' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  const filterResources = useCallback(() => {
    let filtered = Array.isArray(resources) ? resources : [];

    // Search by title or description
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        (resource.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (resource.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedType]);

  useEffect(() => {
    filterResources();
  }, [filterResources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/resources?includeMentorFiles=true');
      // Handle different response structures
      const resourceList = Array.isArray(response.data) 
        ? response.data 
        : (response.data.resources || response.data.data || []);
      setResources(resourceList);
      setFilteredResources(resourceList);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Resources fetch error:', err);
      setResources([]);
      setFilteredResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  const handleDownload = async (resource) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Downloading resource:', resource._id, resource.title);
      console.log('Token available:', !!token);
      
      // Handle mentor files differently
      if (resource.isMentorFile) {
        console.log('Handling mentor file download');
        // For mentor files, use the file download endpoint
        const response = await axios.get(`/api/files/download/${resource._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        });
        
        // Create blob and download
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/octet-stream' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resource.originalName || resource.title.replace(/[^a-z0-9]/gi, '_');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.log('Handling regular resource download');
        // Handle regular resources
        const response = await axios.post(`/api/resources/${resource._id}/download`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        });

        console.log('Response headers:', response.headers);
        console.log('Response status:', response.status);

        // Check content type to determine response format
        const contentType = response.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          // Parse JSON response for URLs
          const text = await response.data.text();
          const data = JSON.parse(text);
          
          if (data.downloadUrl) {
            // Download file from URL
            window.open(data.downloadUrl, '_blank');
          } else if (data.externalUrl) {
            // Open external URL
            window.open(data.externalUrl, '_blank');
          } else {
            console.error('Unexpected JSON response:', data);
            setError('Download failed: Invalid response format');
          }
        } else {
          // Handle blob response (text file or other content)
          const blob = new Blob([response.data], { 
            type: contentType || 'text/plain' 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Get filename from content-disposition header or use resource title
          const contentDisposition = response.headers['content-disposition'];
          let filename = resource.title.replace(/[^a-z0-9]/gi, '_') + '.txt';
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }
          
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }

      // Refresh resources to update download count
      fetchResources();
    } catch (error) {
      console.error('Download error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      setError('Failed to download resource');
    }
  };

  const handleShare = (resource) => {
    // Handle resource sharing
    console.log('Sharing:', resource.title);
  };

  const handleBookmark = (resource) => {
    // Handle resource bookmarking
    console.log('Bookmarking:', resource.title);
  };

  const getCategoryIcon = (category) => {
    const option = resourceCategories.find(opt => opt.value === category);
    return option ? option.icon : <Book />;
  };

  const getTypeColor = (type) => {
    const colors = {
      engineering: 'primary',
      science: 'success',
      business: 'info',
      creative: 'warning',
      healthcare: 'error',
      technology: 'secondary',
      psychology: 'default',
      general: 'default',
    };
    return colors[type] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Book sx={{ mr: 2, verticalAlign: 'middle' }} />
          Resource Hub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover scholarships, study guides, articles, and tools to advance your career.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search resources"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {resourceCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box display="flex" alignItems="center">
                      {category.icon}
                      <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {resourceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box mb={3}>
        <Typography variant="h6" color="text.secondary">
          Found {Array.isArray(filteredResources) ? filteredResources.length : 0} resource{(Array.isArray(filteredResources) ? filteredResources.length : 0) !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Resources Grid */}
      {Array.isArray(filteredResources) && filteredResources.length > 0 ? (
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Resource Header */}
                <Box display="flex" alignItems="center" mb={2}>
                  {getCategoryIcon(resource.category)}
                  <Box ml={1} flexGrow={1}>
                    <Typography variant="h6" gutterBottom>
                      {resource.title}
                      {resource.isMentorFile && (
                        <Chip
                          label="Mentor File"
                          size="small"
                          color="secondary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Rating value={resource.averageRating || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({resource.totalRatings || 0})
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Category and Type */}
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={resourceCategories.find(c => c.value === resource.category)?.label || resource.category}
                    size="small"
                    icon={getCategoryIcon(resource.category)}
                  />
                  <Chip
                    label={resourceTypes.find(t => t.value === resource.type)?.label || resource.type}
                    color={getTypeColor(resource.type)}
                    size="small"
                  />
                  {resource.isMentorFile && resource.fileSize && (
                    <Chip
                      label={`${(resource.fileSize / 1024 / 1024).toFixed(1)} MB`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" paragraph>
                  {resource.description?.substring(0, 120)}...
                </Typography>

                {/* Stats */}
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {resource.views || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Views
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {resource.downloadCount || resource.downloads || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Downloads
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="info.main">
                      {resource.shares || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Shares
                    </Typography>
                  </Box>
                </Box>

                {/* Mentor File Info */}
                {resource.isMentorFile && resource.createdBy && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2">
                      By: {resource.createdBy.firstName} {resource.createdBy.lastName}
                    </Typography>
                  </Box>
                )}

                {/* Additional Info */}
                {resource.deadline && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Schedule sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2">
                      Deadline: {formatDate(resource.deadline)}
                    </Typography>
                  </Box>
                )}

                {resource.amount && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <AttachMoney sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2">
                      Amount: ${resource.amount}
                    </Typography>
                  </Box>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <Box mb={2}>
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleResourceClick(resource)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleDownload(resource)}
                >
                  Download
                </Button>
                <IconButton size="small" onClick={() => handleShare(resource)}>
                  <Share />
                </IconButton>
                <IconButton size="small" onClick={() => handleBookmark(resource)}>
                  <BookmarkBorder />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters.
          </Typography>
        </Paper>
      )}



      {/* Resource Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {getCategoryIcon(selectedResource.category)}
                <Box ml={2}>
                  <Typography variant="h6">
                    {selectedResource.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resourceCategories.find(c => c.value === selectedResource.category)?.label} • {resourceTypes.find(t => t.value === selectedResource.type)?.label}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs
                value={selectedTab}
                onChange={(e, newValue) => setSelectedTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Overview" />
                <Tab label="Details" />
                <Tab label="Reviews" />
                <Tab label="Related" />
              </Tabs>

              {/* Overview Tab */}
              {selectedTab === 0 && (
                <Box>
                  <Typography variant="body1" paragraph>
                    {selectedResource.description}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating value={selectedResource.averageRating || 0} readOnly />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {selectedResource.averageRating?.toFixed(1)} / 5
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Based on {selectedResource.totalRatings || 0} reviews
                  </Typography>
                </Box>
              )}

              {/* Details Tab */}
              {selectedTab === 1 && (
                <Box>
                  <List>
                    {selectedResource.deadline && (
                      <ListItem>
                        <ListItemIcon>
                          <Schedule />
                        </ListItemIcon>
                        <ListItemText
                          primary="Deadline"
                          secondary={formatDate(selectedResource.deadline)}
                        />
                      </ListItem>
                    )}
                    
                    {selectedResource.amount && (
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney />
                        </ListItemIcon>
                        <ListItemText
                          primary="Amount"
                          secondary={`$${selectedResource.amount}`}
                        />
                      </ListItem>
                    )}
                    
                    {selectedResource.eligibility && (
                      <ListItem>
                        <ListItemIcon>
                          <School />
                        </ListItemIcon>
                        <ListItemText
                          primary="Eligibility"
                          secondary={selectedResource.eligibility}
                        />
                      </ListItem>
                    )}
                    
                    {selectedResource.applicationProcess && (
                      <ListItem>
                        <ListItemIcon>
                          <Assignment />
                        </ListItemIcon>
                        <ListItemText
                          primary="Application Process"
                          secondary={selectedResource.applicationProcess}
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  {selectedResource.tags && selectedResource.tags.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="h6" gutterBottom>
                        Tags
                      </Typography>
                      <Box>
                        {selectedResource.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Reviews Tab */}
              {selectedTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    User Reviews
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reviews will be displayed here.
                  </Typography>
                </Box>
              )}

              {/* Related Tab */}
              {selectedTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Related Resources
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Related resources will be displayed here.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleDownload(selectedResource)}
              >
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Resources; 