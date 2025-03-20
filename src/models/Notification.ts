// Notification.ts - Bildirim modelleri için tip tanımlamaları

export enum NotificationTargetType {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',         // Tüm personeller
  DEPARTMENT = 'DEPARTMENT',               // Belirli bir departman
  DEPARTMENT_MANAGERS = 'DEPARTMENT_MANAGERS', // Departman yöneticileri
  SPECIFIC_EMPLOYEES = 'SPECIFIC_EMPLOYEES'    // Belirli personeller
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationStatus {
  ACTIVE = 'ACTIVE',         // Aktif bildirim
  EXPIRED = 'EXPIRED',       // Süresi dolmuş
  ARCHIVED = 'ARCHIVED'      // Arşivlenmiş
}

// Bildirim modeli
export interface Notification {
  id: string;
  title: string;
  content: string;
  priority: NotificationPriority;
  createdBy: string;
  createdAt: string;
  expiresAt?: string; // İsteğe bağlı son kullanma tarihi
  targetType: NotificationTargetType;
  targetIds?: string[]; // TargetType'a göre departman ID'leri veya personel ID'leri
  status: NotificationStatus;
  readBy?: string[];  // Okunduğunu işaretleyen personel ID'leri
}

// Bildirim oluşturma formu için model
export interface NotificationFormData {
  title: string;
  content: string;
  priority: NotificationPriority;
  targetType: NotificationTargetType;
  targetIds?: string[];
  expiresAt?: string;
}

// Personel bildirim görünümü
export interface EmployeeNotificationView {
  id: string;
  title: string;
  content: string;
  priority: NotificationPriority;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isRead: boolean;
}

// Bildirim servisinin temel CRUD metodları için dönen tip
export interface NotificationResponse {
  notification: Notification;
  success: boolean;
  message?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  success: boolean;
  message?: string;
}

// Bildirim öncelik düzeyleri için renkler
export const NotificationPriorityColors = {
  [NotificationPriority.LOW]: '#4caf50', // Yeşil
  [NotificationPriority.MEDIUM]: '#2196f3', // Mavi
  [NotificationPriority.HIGH]: '#ff9800', // Turuncu
  [NotificationPriority.URGENT]: '#f44336', // Kırmızı
};

// Bildirim öncelik düzeyleri için başlıklar
export const NotificationPriorityTitles = {
  [NotificationPriority.LOW]: 'Düşük',
  [NotificationPriority.MEDIUM]: 'Orta',
  [NotificationPriority.HIGH]: 'Yüksek',
  [NotificationPriority.URGENT]: 'Acil',
};

// Bildirim hedef türleri için başlıklar
export const NotificationTargetTitles = {
  [NotificationTargetType.ALL_EMPLOYEES]: 'Tüm Personel',
  [NotificationTargetType.DEPARTMENT]: 'Departman',
  [NotificationTargetType.DEPARTMENT_MANAGERS]: 'Departman Yöneticileri',
  [NotificationTargetType.SPECIFIC_EMPLOYEES]: 'Belirli Personeller',
};

// Bildirim durumları için başlıklar
export const NotificationStatusTitles = {
  [NotificationStatus.ACTIVE]: 'Aktif',
  [NotificationStatus.EXPIRED]: 'Süresi Dolmuş',
  [NotificationStatus.ARCHIVED]: 'Arşivlenmiş',
}; 