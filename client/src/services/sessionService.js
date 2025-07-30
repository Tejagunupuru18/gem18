import api from '../utils/api';

export const sessionService = {
  // Book a session
  bookSession: async (sessionData) => {
    const response = await api.post('/api/sessions', sessionData);
    return response.data;
  },

  // Get user sessions
  getUserSessions: async () => {
    const response = await api.get('/api/sessions');
    return response.data;
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  },

  // Cancel a session
  cancelSession: async (sessionId, reason) => {
    const response = await api.put(`/api/sessions/${sessionId}/cancel`, { reason });
    return response.data;
  },

  // Reschedule a session
  rescheduleSession: async (sessionId, newDateTime) => {
    const response = await api.put(`/api/sessions/${sessionId}/reschedule`, { newDateTime });
    return response.data;
  },

  // Join video call
  joinVideoCall: async (sessionId) => {
    const response = await api.post(`/api/sessions/${sessionId}/join-call`);
    return response.data;
  },

  // End video call
  endVideoCall: async (sessionId) => {
    const response = await api.post(`/api/sessions/${sessionId}/end-call`);
    return response.data;
  },

  // Submit session feedback
  submitFeedback: async (sessionId, feedback) => {
    const response = await api.post(`/api/sessions/${sessionId}/feedback`, feedback);
    return response.data;
  },

  // Get session history
  getSessionHistory: async (filters = {}) => {
    const response = await api.get('/api/sessions/history', { params: filters });
    return response.data;
  }
}; 