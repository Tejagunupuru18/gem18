import axios from 'axios';

// Admin Dashboard Statistics
export const getAdminStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin statistics' };
  }
};

// User Management
export const getPendingMentors = async () => {
  try {
    const response = await axios.get('/api/admin/pending-mentors');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch pending mentors' };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get('/api/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user status' };
  }
};

// Mentor Verification
export const approveMentor = async (mentorId) => {
  try {
    const response = await axios.post('/api/admin/mentors/approve', { mentorId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve mentor' };
  }
};

export const rejectMentor = async (mentorId) => {
  try {
    const response = await axios.post('/api/admin/mentors/reject', { mentorId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject mentor' };
  }
};

// Content Management
export const addResource = async (resourceData) => {
  try {
    const response = await axios.post('/api/admin/resources', resourceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add resource' };
  }
};

export const updateResource = async (resourceId, resourceData) => {
  try {
    const response = await axios.put(`/api/admin/resources/${resourceId}`, resourceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update resource' };
  }
};

export const deleteResource = async (resourceId) => {
  try {
    const response = await axios.delete(`/api/admin/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete resource' };
  }
};

// Session Management
export const getAllSessions = async () => {
  try {
    const response = await axios.get('/api/admin/sessions');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch sessions' };
  }
};

// Reports and Issues
export const getReports = async () => {
  try {
    const response = await axios.get('/api/admin/reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reports' };
  }
};

export const resolveReport = async (reportId) => {
  try {
    const response = await axios.post(`/api/admin/reports/${reportId}/resolve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resolve report' };
  }
};

export const dismissReport = async (reportId) => {
  try {
    const response = await axios.post(`/api/admin/reports/${reportId}/dismiss`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to dismiss report' };
  }
};

// Notifications
export const getNotifications = async () => {
  try {
    const response = await axios.get('/api/admin/notifications');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications' };
  }
};

export const sendNotification = async (type, message) => {
  try {
    const response = await axios.post('/api/admin/notifications/send', { type, message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send notification' };
  }
};

// Analytics
export const getAnalytics = async (period = 'month') => {
  try {
    const response = await axios.get(`/api/admin/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch analytics' };
  }
};

// Scholarship Recommendation Engine
export const getScholarshipRecommendations = async (studentData) => {
  try {
    const response = await axios.post('/api/admin/scholarship-recommendations', studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get scholarship recommendations' };
  }
};

// Automated Email/SMS Notifications
export const sendBulkNotification = async (notificationData) => {
  try {
    const response = await axios.post('/api/admin/bulk-notifications', notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send bulk notification' };
  }
};

// Session Reminders
export const sendSessionReminders = async () => {
  try {
    const response = await axios.post('/api/admin/session-reminders');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send session reminders' };
  }
};

// Weekly Reports
export const generateWeeklyReport = async () => {
  try {
    const response = await axios.post('/api/admin/weekly-reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate weekly report' };
  }
};

// Platform Moderation
export const moderateContent = async (contentId, action, reason) => {
  try {
    const response = await axios.post('/api/admin/moderate-content', {
      contentId,
      action,
      reason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to moderate content' };
  }
};

// Dispute Resolution
export const resolveDispute = async (disputeId, resolution) => {
  try {
    const response = await axios.post(`/api/admin/disputes/${disputeId}/resolve`, resolution);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resolve dispute' };
  }
};

// System Settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await axios.put('/api/admin/system-settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update system settings' };
  }
};

// Backup and Maintenance
export const createBackup = async () => {
  try {
    const response = await axios.post('/api/admin/backup');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create backup' };
  }
};

export const performMaintenance = async (maintenanceData) => {
  try {
    const response = await axios.post('/api/admin/maintenance', maintenanceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to perform maintenance' };
  }
};

// User Activity Monitoring
export const getUserActivity = async (userId) => {
  try {
    const response = await axios.get(`/api/admin/user-activity/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user activity' };
  }
};

// Platform Health Check
export const getPlatformHealth = async () => {
  try {
    const response = await axios.get('/api/admin/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch platform health' };
  }
};

// Export all functions
export default {
  getAdminStats,
  getPendingMentors,
  getAllUsers,
  updateUserStatus,
  approveMentor,
  rejectMentor,
  addResource,
  updateResource,
  deleteResource,
  getAllSessions,
  getReports,
  resolveReport,
  dismissReport,
  getNotifications,
  sendNotification,
  getAnalytics,
  getScholarshipRecommendations,
  sendBulkNotification,
  sendSessionReminders,
  generateWeeklyReport,
  moderateContent,
  resolveDispute,
  updateSystemSettings,
  createBackup,
  performMaintenance,
  getUserActivity,
  getPlatformHealth
}; 