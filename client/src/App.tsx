import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Register from './components/Register';
import StaffLogin from './components/StaffLogin';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import VehicleManagementPage from './components/VehicleManagementPage';
import AddressManagementPage from './components/AddressManagementPage';
import BookingPage from './components/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Staff from './components/Staff';
import AdminDashboard from './components/AdminDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import RefundPolicy from './components/RefundPolicy';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import ResetPassword from './components/ResetPassword';

// Role-based Dashboard Component
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  // Remove authMode state, as login/register will be routed

  if (loading || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/staff" element={<Staff />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worker/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <VehicleManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/addresses" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <AddressManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
        <Route 
          path="/booking" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile-settings" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ProfileSettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
