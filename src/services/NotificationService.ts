// NotificationService.ts - Bildirim işlemleri için servis

import { v4 as uuidv4 } from 'uuid';
import { 
  Notification, 
  NotificationFormData, 
  NotificationResponse, 
  NotificationsResponse,
  NotificationStatus,
  NotificationPriority,
  NotificationTargetType,
  EmployeeNotificationView 
} from '../models/Notification';

// Örnek bildirim verileri (gerçek uygulamada veritabanından gelecek)
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Yeni Güncelleme: Sistem Bakımı',
    content: 'Sistem yarın gece 02:00-04:00 arası bakım çalışması nedeniyle geçici olarak erişime kapatılacaktır.',
    priority: NotificationPriority.HIGH,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // 1 gün sonra
    targetType: NotificationTargetType.ALL_EMPLOYEES,
    status: NotificationStatus.ACTIVE,
    readBy: ['user1', 'user2']
  },
  {
    id: '2',
    title: 'Teknik Departman Toplantısı',
    content: 'Teknik departman için haftalık değerlendirme toplantısı yarın saat 10:00\'da Toplantı Odası 2\'de yapılacaktır.',
    priority: NotificationPriority.MEDIUM,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
    expiresAt: new Date(Date.now() + 172800000).toISOString(), // 2 gün sonra
    targetType: NotificationTargetType.DEPARTMENT,
    targetIds: ['dep1'], // Teknik departman ID'si
    status: NotificationStatus.ACTIVE,
    readBy: []
  },
  {
    id: '3',
    title: 'Yeni Özellik: Bildirim Sistemi',
    content: 'Müşteri Hizmetleri Yönetim Sistemine bildirim özelliği eklenmiştir. Artık tüm duyuruları buradan takip edebilirsiniz.',
    priority: NotificationPriority.LOW,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 gün önce
    targetType: NotificationTargetType.ALL_EMPLOYEES,
    status: NotificationStatus.ACTIVE,
    readBy: ['user3']
  },
  {
    id: '4',
    title: 'Acil: Sunucu Hatası',
    content: 'Ana sunucuda performans sorunu tespit edildi. Teknik ekip sorunu çözmek için çalışıyor. Müşteri taleplerinde gecikme olabilir.',
    priority: NotificationPriority.URGENT,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 saat önce
    targetType: NotificationTargetType.DEPARTMENT_MANAGERS,
    status: NotificationStatus.ACTIVE,
    readBy: []
  }
];

// Tüm bildirimleri getir (filtreler seçilebilir)
export const getNotifications = async (
  status: NotificationStatus | 'ALL' = NotificationStatus.ACTIVE,
  page = 1,
  limit = 10
): Promise<NotificationsResponse> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = mockNotifications.filter(notification => 
      notification.status === status || status === 'ALL'
    );
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filtered.slice(start, end);
    
    return {
      notifications: paginatedResults,
      total: filtered.length,
      success: true
    };
  } catch (error) {
    console.error('Bildirimler getirilirken hata oluştu:', error);
    return {
      notifications: [],
      total: 0,
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu.'
    };
  }
};

// Kullanıcı için bildirimleri getir
export const getEmployeeNotifications = async (
  employeeId: string,
  page = 1,
  limit = 10
): Promise<{
  notifications: EmployeeNotificationView[];
  total: number;
  success: boolean;
  message?: string;
}> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Kullanıcıya uygun bildirimleri filtrele (gerçek uygulamada sunucuda yapılacak)
    const userNotifications = mockNotifications.filter(notification => {
      // Sadece aktif bildirimleri göster
      if (notification.status !== NotificationStatus.ACTIVE) return false;
      
      // Süresi geçmiş bildirimleri gösterme
      if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) return false;
      
      // Hedef tipine göre filtrele
      switch (notification.targetType) {
        case NotificationTargetType.ALL_EMPLOYEES:
          return true;
        case NotificationTargetType.SPECIFIC_EMPLOYEES:
          return notification.targetIds?.includes(employeeId);
        case NotificationTargetType.DEPARTMENT:
          // Burada normalde kullanıcının departmanı kontrol edilecek
          // Şimdilik mock data için true döndürelim
          return true;
        case NotificationTargetType.DEPARTMENT_MANAGERS:
          // Burada normalde kullanıcının departman yöneticisi olup olmadığı kontrol edilecek
          // Şimdilik mock data için true döndürelim
          return true;
        default:
          return false;
      }
    });
    
    // Bildirim görünümünü hazırla
    const notificationViews: EmployeeNotificationView[] = userNotifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      priority: notification.priority,
      createdBy: notification.createdBy,
      createdAt: notification.createdAt,
      expiresAt: notification.expiresAt,
      isRead: notification.readBy?.includes(employeeId) || false
    }));
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = notificationViews.slice(start, end);
    
    return {
      notifications: paginatedResults,
      total: userNotifications.length,
      success: true
    };
  } catch (error) {
    console.error('Kullanıcı bildirimleri getirilirken hata oluştu:', error);
    return {
      notifications: [],
      total: 0,
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu.'
    };
  }
};

// Bildirim oluştur
export const createNotification = async (
  data: NotificationFormData,
  createdBy: string
): Promise<NotificationResponse> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Yeni bildirim oluştur
    const newNotification: Notification = {
      id: uuidv4(), // Gerçek uygulama sunucu tarafından ID oluşturulacak
      ...data,
      createdBy,
      createdAt: new Date().toISOString(),
      status: NotificationStatus.ACTIVE,
      readBy: []
    };
    
    // Mock veritabanına ekle (gerçek uygulamada API çağrısı yapılır)
    mockNotifications.push(newNotification);
    
    return {
      notification: newNotification,
      success: true,
      message: 'Bildirim başarıyla oluşturuldu.'
    };
  } catch (error) {
    console.error('Bildirim oluşturulurken hata oluştu:', error);
    return {
      notification: null as any,
      success: false,
      message: 'Bildirim oluşturulurken bir hata oluştu.'
    };
  }
};

// Bildirim güncelle
export const updateNotification = async (
  id: string,
  data: Partial<NotificationFormData>
): Promise<NotificationResponse> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Bildirimi bul
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      return {
        notification: null as any,
        success: false,
        message: 'Bildirim bulunamadı.'
      };
    }
    
    // Bildirimi güncelle
    const updatedNotification = {
      ...mockNotifications[index],
      ...data,
    };
    
    mockNotifications[index] = updatedNotification;
    
    return {
      notification: updatedNotification,
      success: true,
      message: 'Bildirim başarıyla güncellendi.'
    };
  } catch (error) {
    console.error('Bildirim güncellenirken hata oluştu:', error);
    return {
      notification: null as any,
      success: false,
      message: 'Bildirim güncellenirken bir hata oluştu.'
    };
  }
};

// Bildirim sil (arşivle)
export const deleteNotification = async (id: string): Promise<NotificationResponse> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Bildirimi bul
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      return {
        notification: null as any,
        success: false,
        message: 'Bildirim bulunamadı.'
      };
    }
    
    // Bildirimi arşivle (gerçek silme yapmıyoruz)
    const archivedNotification = {
      ...mockNotifications[index],
      status: NotificationStatus.ARCHIVED
    };
    
    mockNotifications[index] = archivedNotification;
    
    return {
      notification: archivedNotification,
      success: true,
      message: 'Bildirim başarıyla arşivlendi.'
    };
  } catch (error) {
    console.error('Bildirim silinirken hata oluştu:', error);
    return {
      notification: null as any,
      success: false,
      message: 'Bildirim silinirken bir hata oluştu.'
    };
  }
};

// Bildirimi okundu olarak işaretle
export const markAsRead = async (
  notificationId: string,
  employeeId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Bildirimi bul
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    if (index === -1) {
      return {
        success: false,
        message: 'Bildirim bulunamadı.'
      };
    }
    
    // Bildirim zaten okunmuş mu kontrol et
    if (mockNotifications[index].readBy?.includes(employeeId)) {
      return {
        success: true,
        message: 'Bildirim zaten okundu olarak işaretlenmiş.'
      };
    }
    
    // Bildirime okundu işareti ekle
    if (!mockNotifications[index].readBy) {
      mockNotifications[index].readBy = [];
    }
    
    // readBy dizisi kesinlikle tanımlı olacak
    mockNotifications[index].readBy!.push(employeeId);
    
    return {
      success: true,
      message: 'Bildirim okundu olarak işaretlendi.'
    };
  } catch (error) {
    console.error('Bildirim okundu işaretlenirken hata oluştu:', error);
    return {
      success: false,
      message: 'Bildirim okundu işaretlenirken bir hata oluştu.'
    };
  }
}; 