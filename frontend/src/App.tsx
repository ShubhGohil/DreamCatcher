import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  // If user is logged in, show Dashboard; otherwise show LandingPage
  return user ? <Dashboard /> : <LandingPage />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* The password reset route must come BEFORE the catch-all root route */}
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPasswordConfirm />}
          />

          {/* Main App Route */}
          <Route path="/" element={<AppContent />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;