import api from '../utils/api';

export const mentorService = {
  // Get all mentors
  getAllMentors: async (filters = {}) => {
    const response = await api.get('/api/mentors', { params: filters });
    return response.data;
  },

  // Get mentor by ID
  getMentorById: async (mentorId) => {
    const response = await api.get(`/api/mentors/${mentorId}`);
    return response.data;
  },

  // Get mentor profile
  getMentorProfile: async () => {
    const response = await api.get('/api/mentors/profile');
    return response.data;
  },

  // Update mentor profile
  updateMentorProfile: async (profileData) => {
    const response = await api.put('/api/mentors/profile', profileData);
    return response.data;
  },

  // Update mentor availability
  updateAvailability: async (availability) => {
    const response = await api.put('/api/mentors/availability', availability);
    return response.data;
  },

  // Get mentor sessions
  getMentorSessions: async () => {
    const response = await api.get('/api/mentors/sessions');
    return response.data;
  },

  // Complete a session
  completeSession: async (sessionId, feedback) => {
    const response = await api.put(`/api/mentors/sessions/${sessionId}/complete`, feedback);
    return response.data;
  },

  // Get mentor statistics
  getMentorStats: async () => {
    const response = await api.get('/api/mentors/stats');
    return response.data;
  },

  // Get mentor reviews
  getMentorReviews: async () => {
    const response = await api.get('/api/mentors/reviews');
    return response.data;
  }
}; 