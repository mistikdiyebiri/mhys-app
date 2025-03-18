import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PagePermission } from '../models/Role';

interface PermissionGuardProps {
  permission: PagePermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * İzin kontrolü yapan bileşen
 * Kullanıcı izne sahipse içeriği gösterir, değilse fallback içeriğini gösterir
 * 
 * Örnek kullanım:
 * <PermissionGuard permission={PagePermission.SETTINGS_VIEW}>
 *   <SettingsPage />
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();
  
  // İzin kontrolü yap
  const canAccess = hasPermission(permission);
  
  // İzin varsa içeriği göster, yoksa fallback içeriğini göster (veya boş)
  return canAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard; 