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
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Pagination,
  Tooltip
} from '@mui/material';
import {
  Upload,
  Download,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  Description,
  Image,
  VideoFile,
  PictureAsPdf,
  InsertDriveFile,
  Search,
  FilterList,
  Add,
  CloudUpload,
  FileCopy,
  Share
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MentorFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
    isPublic: true // Default to true so students can see mentor files
  });

  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, [pagination.current, searchQuery, selectedCategory]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await axios.get(`/api/files?${params}`);
      setFiles(response.data.files);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await axios.get('/api/files/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Set default categories if the API fails
      setCategories([
        { value: 'general', label: 'General' },
        { value: 'study_materials', label: 'Study Materials' },
        { value: 'assignments', label: 'Assignments' },
        { value: 'presentations', label: 'Presentations' },
        { value: 'other', label: 'Other' }
      ]);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', uploadForm.title || file.name);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('tags', uploadForm.tags);
      formData.append('isPublic', uploadForm.isPublic);

      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('File uploaded successfully!');
      setUploadDialog(false);
      resetUploadForm();
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await axios.get(`/api/files/download/${fileId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`/api/files/${fileId}`);
      setSuccess('File deleted successfully!');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(`/api/files/${selectedFile._id}`, {
        title: selectedFile.title,
        description: selectedFile.description,
        category: selectedFile.category,
        tags: selectedFile.tags.join(', '),
        isPublic: selectedFile.isPublic
      });

      setSuccess('File updated successfully!');
      setEditDialog(false);
      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      console.error('Error updating file:', error);
      setError('Failed to update file');
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      category: 'general',
      tags: '',
      isPublic: true
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image />;
    if (mimeType.startsWith('video/')) return <VideoFile />;
    if (mimeType === 'application/pdf') return <PictureAsPdf />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
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
          File Management 📁
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload and manage files for your students
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialog(true)}
              fullWidth
            >
              Upload File
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Files List */}
      <Paper>
        <List>
          {files.map((file, index) => (
            <React.Fragment key={file._id}>
              <ListItem>
                <ListItemIcon>
                  {getFileIcon(file.mimeType)}
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {file.title}
                      </Typography>
                      {file.isPublic ? (
                        <Tooltip title="Public">
                          <Visibility color="primary" fontSize="small" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Private">
                          <VisibilityOff color="action" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {file.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip label={file.category} size="small" color="primary" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.fileSize)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(file.uploadDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.downloadCount} downloads
                        </Typography>
                      </Box>
                      {file.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {file.tags.map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Download">
                      <IconButton
                        onClick={() => handleDownload(file._id, file.originalName)}
                        color="primary"
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => {
                          setSelectedFile(file);
                          setEditDialog(true);
                        }}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(file._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < files.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {files.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No files uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload your first file to get started
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Pagination */}
      {pagination.total > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.total}
            page={pagination.current}
            onChange={(event, page) => setPagination({ ...pagination, current: page })}
            color="primary"
          />
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={uploadForm.isPublic}
                  onChange={(e) => setUploadForm({ ...uploadForm, isPublic: e.target.checked })}
                />
              }
              label="Make file public (visible to all students)"
            />
            <Box sx={{ mt: 2 }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<Upload />}
                  disabled={uploading}
                  fullWidth
                >
                  {uploading ? <CircularProgress size={20} /> : 'Choose File'}
                </Button>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit File</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={selectedFile.title}
                onChange={(e) => setSelectedFile({ ...selectedFile, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={selectedFile.description}
                onChange={(e) => setSelectedFile({ ...selectedFile, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedFile.category}
                  onChange={(e) => setSelectedFile({ ...selectedFile, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={selectedFile.tags.join(', ')}
                onChange={(e) => setSelectedFile({ ...selectedFile, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedFile.isPublic}
                    onChange={(e) => setSelectedFile({ ...selectedFile, isPublic: e.target.checked })}
                  />
                }
                label="Make file public (visible to all students)"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MentorFiles; 