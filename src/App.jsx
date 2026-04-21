import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import AdminLayout from './components/AdminLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminWrapper = ({ children }) => (
  <ProtectedRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
              <Routes>
                <Route path="/" element={<><Navbar /><Home /></>} />
                <Route path="/login" element={<><Navbar /><Login /></>} />
                <Route path="/dashboard" element={<AdminWrapper><Dashboard /></AdminWrapper>} />
                <Route path="/analytics" element={<AdminWrapper><Analytics /></AdminWrapper>} />
                <Route path="/reports" element={<AdminWrapper><Reports /></AdminWrapper>} />
                <Route path="/team" element={<AdminWrapper><Team /></AdminWrapper>} />
                <Route path="/settings" element={<AdminWrapper><Settings /></AdminWrapper>} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
