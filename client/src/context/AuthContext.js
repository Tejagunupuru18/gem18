import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';

// Set up axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

// On app load, set Authorization header if token exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.user);
          
          // Initialize Socket.IO connection for existing user
          socketService.connect(token);
          socketService.joinRoom(response.data.user.id);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      // Initialize Socket.IO connection
      socketService.connect(token);
      socketService.joinRoom(user.id);
      
      return { success: true, user };
    } catch (error) {
      let message = 'Login failed';
      let approvalStatus = null;
      let rejectionReason = null;
      
      if (error.response?.status === 429) {
        message = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
        approvalStatus = error.response.data.approvalStatus;
        rejectionReason = error.response.data.rejectionReason;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }
      
      setError(message);
      return { 
        success: false, 
        error: message, 
        approvalStatus,
        rejectionReason
      };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('AuthContext: Attempting registration with data:', userData);
      
      const response = await axios.post('/api/auth/register', userData);
      console.log('AuthContext: Registration response:', response.data);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
      
      let message = 'Registration failed';
      
      if (error.response?.status === 429) {
        message = 'Too many registration attempts. Please wait a few minutes before trying again.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }
      
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    
    // Disconnect Socket.IO
    socketService.disconnect();
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 