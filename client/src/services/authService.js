import api from '../utils/api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  }
}; 