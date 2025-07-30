import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import MentorProfile from './pages/MentorProfile';
import SessionBooking from './pages/SessionBooking';
import Resources from './pages/Resources';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import MentorAnalytics from './pages/MentorAnalytics';
import Messages from './pages/Messages';
import MentorProfileSettings from './pages/MentorProfileSettings';
import MentorChat from './pages/MentorChat';
import MentorFiles from './pages/MentorFiles';
import MySessions from './pages/MySessions';
import Achievements from './pages/Achievements';
import Scholarships from './pages/Scholarships';
import Calendar from './pages/Calendar';
import Bookmarks from './pages/Bookmarks';
import StudentVideoCall from './pages/StudentVideoCall';
import GlobalMessages from './pages/GlobalMessages';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Global Messages Route - Accessible to all authenticated users */}
          <Route
            path="/global-messages"
            element={
              <ProtectedRoute>
                <GlobalMessages />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/mentors" element={<MentorProfile />} />
                  <Route path="/book-session/:mentorId" element={<SessionBooking />} />
                  <Route path="/sessions" element={<MySessions />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/scholarships" element={<Scholarships />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/video-call/:roomName" element={<StudentVideoCall />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Mentor Routes */}
          <Route
            path="/mentor/*"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <Routes>
                  <Route path="/" element={<MentorDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile-settings" element={<MentorProfileSettings />} />
                  <Route path="/sessions" element={<MentorDashboard />} />
                  <Route path="/analytics" element={<MentorAnalytics />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/chat" element={<MentorChat />} />
                  <Route path="/files" element={<MentorFiles />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/profile" element={<AdminProfile />} />
                  <Route path="/users" element={<AdminDashboard />} />
                  <Route path="/mentors" element={<AdminDashboard />} />
                  <Route path="/resources" element={<AdminDashboard />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Role-based redirects */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'student' && <Navigate to="/student" replace />}
                {user?.role === 'mentor' && <Navigate to="/mentor" replace />}
                {user?.role === 'admin' && <Navigate to="/admin" replace />}
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
};

// App with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 