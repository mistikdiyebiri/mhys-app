import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// @ts-ignore
import { AuthProvider } from './contexts/AuthContext';

// Sayfa bileşenleri (lazy-loaded)
// @ts-ignore
const Home = React.lazy(() => import('./pages/Home'));
// @ts-ignore
const Login = React.lazy(() => import('./pages/Login'));
// @ts-ignore
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
// @ts-ignore
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
// @ts-ignore
const CustomerPortal = React.lazy(() => import('./pages/customer/Portal'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    mode: 'light',
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <React.Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <p>Yükleniyor...</p>
            </div>
          }>
            <Routes>
              {/* Müşteri Sayfaları */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/portal/*" element={<CustomerPortal />} />
              
              {/* Admin ve Personel Sayfaları */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
              
              {/* 404 Sayfası */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <h1>404 - Sayfa Bulunamadı</h1>
                  <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                </div>
              } />
            </Routes>
          </React.Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
