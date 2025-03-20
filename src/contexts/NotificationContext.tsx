import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmployeeNotificationView } from '../models/Notification';
import * as NotificationService from '../services/NotificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: EmployeeNotificationView[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  openNotificationsPanel: boolean;
  setOpenNotificationsPanel: React.Dispatch<React.SetStateAction<boolean>>;
}

// Context'in varsayılan değerini oluştur
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  openNotificationsPanel: false,
  setOpenNotificationsPanel: () => {},
});

// Context Hook'u
export const useNotifications = () => useContext(NotificationContext);

// Context Provider
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<EmployeeNotificationView[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openNotificationsPanel, setOpenNotificationsPanel] = useState(false);
  const { user, getUserAttributes } = useAuth();

  // Bildirimleri getir
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userAttrs = await getUserAttributes();
      const userId = userAttrs?.sub || '';
      
      if (userId) {
        const response = await NotificationService.getEmployeeNotifications(userId);
        
        if (response.success) {
          setNotifications(response.notifications);
          
          // Okunmamış bildirim sayısını hesapla
          const unread = response.notifications.filter(notification => !notification.isRead).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const userAttrs = await getUserAttributes();
      const userId = userAttrs?.sub || '';
      
      if (userId) {
        const response = await NotificationService.markAsRead(notificationId, userId);
        
        if (response.success) {
          // Bildirim listesini güncelle
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === notificationId 
                ? { ...notification, isRead: true } 
                : notification
            )
          );
          
          // Okunmamış bildirim sayısını güncelle
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata oluştu:', error);
    }
  };

  // Kullanıcı değiştiğinde bildirimleri yeniden yükle
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Bildirimleri periyodik olarak kontrol et (60 saniyede bir)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 saniye
    
    return () => clearInterval(interval);
  }, [user]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    openNotificationsPanel,
    setOpenNotificationsPanel
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}; 