import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

// Admin paneli sayfaları
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';

// Müşteri sayfaları
import CustomerLogin from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import TicketDetails from './pages/TicketDetails';

// Ortak bileşenler
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ana sayfa yönlendirmesi */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Müşteri giriş ve paneli */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ticket/:id" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <TicketDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin giriş ve paneli */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin,employee">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Reports />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 sayfası */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;