import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string; // 'admin', 'employee', 'customer' veya 'admin,employee' gibi virgülle ayrılmış roller
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isAuthenticating, userRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('ProtectedRoute durumu:', { isAuthenticated, isAuthenticating, userRole, requiredRole });
  }, [isAuthenticated, isAuthenticating, userRole, requiredRole]);
  
  // Yetkilendirme işlemi tamamlanana kadar bekleme ekranı gösterilebilir
  if (isAuthenticating) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Yükleniyor...
        </Typography>
      </Box>
    );
  }
  
  // Kullanıcı oturum açmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    // Admin sayfasına erişmeye çalışıyorsa admin login'e, değilse normal login'e yönlendir
    if (requiredRole.includes('admin') || requiredRole.includes('employee')) {
      console.log('Oturum açılmamış, admin login sayfasına yönlendiriliyor');
      return <Navigate to="/admin/login" replace />;
    } else {
      console.log('Oturum açılmamış, müşteri login sayfasına yönlendiriliyor');
      return <Navigate to="/login" replace />;
    }
  }
  
  // Virgülle ayrılmış rolleri diziye çevir
  const requiredRoles = requiredRole.split(',');
  
  // Kullanıcı oturum açmış ancak gerekli role sahip değilse
  if (!userRole || !requiredRoles.includes(userRole)) {
    console.log('Yetkisiz erişim denemesi. Kullanıcı rolü:', userRole, 'Gereken roller:', requiredRoles);
    
    // Admin veya personel, müşteri sayfasına erişmeye çalışıyorsa admin dashboard'a yönlendir
    if ((userRole === 'admin' || userRole === 'employee') && requiredRole === 'customer') {
      console.log('Admin/personel müşteri sayfasına erişmeye çalışıyor, admin paneline yönlendiriliyor');
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Müşteri, admin sayfasına erişmeye çalışıyorsa müşteri dashboard'a yönlendir
    else if (userRole === 'customer' && (requiredRole.includes('admin') || requiredRole.includes('employee'))) {
      console.log('Müşteri admin sayfasına erişmeye çalışıyor, müşteri paneline yönlendiriliyor');
      return <Navigate to="/dashboard" replace />;
    }
    // Personel, sadece admin erişimli sayfaya girmeye çalışıyorsa admin dashboard'a yönlendir
    else if (userRole === 'employee' && requiredRole === 'admin') {
      console.log('Personel sadece admin sayfasına erişmeye çalışıyor, ana dashboard sayfasına yönlendiriliyor');
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Diğer tüm durumlarda ana sayfaya yönlendir
    else {
      console.log('Diğer yetkisiz erişim durumu, ana sayfaya yönlendiriliyor');
      return <Navigate to="/" replace />;
    }
  }
  
  // Kullanıcı oturum açmış ve gerekli role sahipse, istenen sayfayı göster
  console.log('Erişim başarılı. Kullanıcı rolü:', userRole, 'Sayfa erişimi:', requiredRole);
  return <>{children}</>;
};

export default ProtectedRoute;