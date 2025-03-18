import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string; // 'admin', 'employee', 'customer' veya 'admin,employee' gibi virgülle ayrılmış roller
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isAuthenticating, userRole } = useAuth();
  
  // Yetkilendirme işlemi tamamlanana kadar bekleme ekranı gösterilebilir
  if (isAuthenticating) {
    return <div>Yükleniyor...</div>;
  }
  
  // Kullanıcı oturum açmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    // Admin sayfasına erişmeye çalışıyorsa admin login'e, değilse normal login'e yönlendir
    if (requiredRole.includes('admin') || requiredRole.includes('employee')) {
      return <Navigate to="/admin/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // Virgülle ayrılmış rolleri diziye çevir
  const requiredRoles = requiredRole.split(',');
  
  // Kullanıcı oturum açmış ancak gerekli role sahip değilse
  if (!userRole || !requiredRoles.includes(userRole)) {
    // Admin veya personel, müşteri sayfasına erişmeye çalışıyorsa admin dashboard'a yönlendir
    if ((userRole === 'admin' || userRole === 'employee') && requiredRole === 'customer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Müşteri, admin sayfasına erişmeye çalışıyorsa müşteri dashboard'a yönlendir
    else if (userRole === 'customer' && (requiredRole.includes('admin') || requiredRole.includes('employee'))) {
      return <Navigate to="/dashboard" replace />;
    }
    // Personel, sadece admin erişimli sayfaya girmeye çalışıyorsa admin dashboard'a yönlendir
    else if (userRole === 'employee' && requiredRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Diğer tüm durumlarda ana sayfaya yönlendir
    else {
      return <Navigate to="/" replace />;
    }
  }
  
  // Kullanıcı oturum açmış ve gerekli role sahipse, istenen sayfayı göster
  return <>{children}</>;
};

export default ProtectedRoute;