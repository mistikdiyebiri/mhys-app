import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Servisler
import emailService from "./services/EmailService";

// Sayfalar
import CustomerLogin from "./pages/customer/Login";
import CustomerDashboard from "./pages/customer/Dashboard";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTickets from "./pages/admin/Tickets";
import AdminEmployees from "./pages/admin/Employees";
import AdminDepartments from "./pages/admin/Departments";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import GeminiSettings from "./pages/admin/GeminiSettings";
import RolesManagement from "./pages/admin/RolesManagement";
import QuickReplySettings from "./pages/admin/QuickReplySettings";
import Notifications from "./pages/admin/Notifications";
import EmailSettings from "./pages/admin/EmailSettings";

// Bileşenler
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

// Tema yapılandırması
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#9333ea",
      light: "#a855f7",
      dark: "#7e22ce",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#06b6d4",
    },
    success: {
      main: "#10b981",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          },
        },
        sizeLarge: {
          padding: "10px 22px",
        },
        sizeSmall: {
          padding: "6px 12px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
        elevation2: {
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#f8fafc",
        },
      },
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    // E-posta izleme servisini başlat
    console.log('EmailService başlatılıyor...');
    emailService.startEmailPolling()
      .then(() => console.log('E-posta izleme başlatıldı.'))
      .catch(err => console.error('E-posta izleme başlatılırken hata oluştu:', err));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Ana Sayfa */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Müşteri Sayfaları */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Sayfaları */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={<Navigate to="/admin/login" replace />}
              />
              <Route
                path="/admin/dashboard/*"
                element={
                  <ProtectedRoute requiredRole="admin,employee">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute requiredRole="admin,employee">
                    <AdminTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminEmployees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDepartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute requiredRole="admin,employee">
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute requiredRole="admin,employee">
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gemini-settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GeminiSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RolesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/quickreplies"
                element={
                  <ProtectedRoute requiredRole="admin,employee">
                    <QuickReplySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/email-settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EmailSettings />
                  </ProtectedRoute>
                }
              />

              {/* 404 Sayfası */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
