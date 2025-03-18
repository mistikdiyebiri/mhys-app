import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PagePermission } from '../models/Role';

interface MultiPermissionGuardProps {
  permissions: PagePermission[];
  mode?: 'ALL' | 'ANY'; // ALL: Tüm izinlere sahip olmalı, ANY: Herhangi birine sahip olması yeterli
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Birden fazla izin kontrolü yapan bileşen
 * 
 * Örnek kullanım:
 * <MultiPermissionGuard 
 *   permissions={[PagePermission.SETTINGS_VIEW, PagePermission.SETTINGS_EDIT]}
 *   mode="ANY"
 * >
 *   <SettingsPage />
 * </MultiPermissionGuard>
 */
const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  permissions,
  mode = 'ALL',
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();
  
  // İzin kontrolü yap
  let canAccess = false;
  
  if (mode === 'ALL') {
    // Tüm izinlere sahip olmalı
    canAccess = permissions.every(permission => hasPermission(permission));
  } else {
    // En az bir izne sahip olmalı
    canAccess = permissions.some(permission => hasPermission(permission));
  }
  
  // İzin varsa içeriği göster, yoksa fallback içeriğini göster (veya boş)
  return canAccess ? <>{children}</> : <>{fallback}</>;
};

export default MultiPermissionGuard; 