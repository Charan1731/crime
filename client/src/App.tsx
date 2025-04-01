import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportCrime from './pages/ReportCrime';
import ViewCrimes from './pages/ViewCrimes';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ToastDemoPage from './pages/ToastDemoPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/toast-demo" element={<ToastDemoPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-crime"
                  element={
                    <ProtectedRoute>
                      <ReportCrime />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/view-crimes"
                  element={
                    <ProtectedRoute adminOnly>
                      <ViewCrimes />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;