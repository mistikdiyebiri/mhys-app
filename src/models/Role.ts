// Role.ts - Rol yönetimi için gerekli tüm model tanımlamaları

// Sayfa erişimleri için sabitlerimiz
export enum PagePermission {
  // Ana sayfalar
  DASHBOARD = 'dashboard',
  TICKETS = 'tickets',
  EMPLOYEES = 'employees',
  DEPARTMENTS = 'departments',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  GEMINI_SETTINGS = 'gemini_settings',
  ROLES = 'roles',
  NOTIFICATIONS = 'notifications',
  
  // Alt işlemler
  TICKET_VIEW = 'ticket_view',
  TICKET_CREATE = 'ticket_create',
  TICKET_EDIT = 'ticket_edit',
  TICKET_DELETE = 'ticket_delete',
  TICKET_ASSIGN = 'ticket_assign',
  TICKET_CHANGE_STATUS = 'ticket_change_status',
  TICKET_CHANGE_PRIORITY = 'ticket_change_priority',
  
  EMPLOYEE_VIEW = 'employee_view',
  EMPLOYEE_CREATE = 'employee_create',
  EMPLOYEE_EDIT = 'employee_edit',
  EMPLOYEE_DELETE = 'employee_delete',
  
  DEPARTMENT_VIEW = 'department_view',
  DEPARTMENT_CREATE = 'department_create',
  DEPARTMENT_EDIT = 'department_edit',
  DEPARTMENT_DELETE = 'department_delete',
  
  REPORT_VIEW = 'report_view',
  REPORT_CREATE = 'report_create',
  REPORT_EDIT = 'report_edit',
  REPORT_DELETE = 'report_delete',
  REPORT_EXPORT = 'report_export',
  
  SETTINGS_VIEW = 'settings_view',
  SETTINGS_EDIT = 'settings_edit',
  
  GEMINI_VIEW = 'gemini_view',
  GEMINI_EDIT = 'gemini_edit',
  
  ROLE_VIEW = 'role_view',
  ROLE_CREATE = 'role_create',
  ROLE_EDIT = 'role_edit',
  ROLE_DELETE = 'role_delete',
  ROLE_ASSIGN = 'role_assign',
  
  NOTIFICATION_VIEW = 'notification_view',
  NOTIFICATION_CREATE = 'notification_create',
  NOTIFICATION_EDIT = 'notification_edit',
  NOTIFICATION_DELETE = 'notification_delete'
}

// İzin kategorilerini tanımlayalım
export const PermissionCategories = {
  GENERAL: 'Genel Sayfalar',
  TICKETS: 'Destek Talepleri',
  EMPLOYEES: 'Personel Yönetimi',
  DEPARTMENTS: 'Departman Yönetimi',
  REPORTS: 'Raporlar',
  SETTINGS: 'Ayarlar',
  ROLES: 'Rol Yönetimi',
  NOTIFICATIONS: 'Bildirimler'
};

// Tüm izinleri gruplar halinde organize edelim
export const PermissionGroups: Record<string, { title: string; permissions: PagePermission[] }> = {
  GENERAL: {
    title: PermissionCategories.GENERAL,
    permissions: [
      PagePermission.DASHBOARD,
      PagePermission.TICKETS,
      PagePermission.EMPLOYEES,
      PagePermission.DEPARTMENTS,
      PagePermission.REPORTS,
      PagePermission.SETTINGS,
      PagePermission.GEMINI_SETTINGS,
      PagePermission.ROLES,
      PagePermission.NOTIFICATIONS
    ]
  },
  TICKETS: {
    title: PermissionCategories.TICKETS,
    permissions: [
      PagePermission.TICKET_VIEW,
      PagePermission.TICKET_CREATE,
      PagePermission.TICKET_EDIT,
      PagePermission.TICKET_DELETE,
      PagePermission.TICKET_ASSIGN,
      PagePermission.TICKET_CHANGE_STATUS,
      PagePermission.TICKET_CHANGE_PRIORITY
    ]
  },
  EMPLOYEES: {
    title: PermissionCategories.EMPLOYEES,
    permissions: [
      PagePermission.EMPLOYEE_VIEW,
      PagePermission.EMPLOYEE_CREATE,
      PagePermission.EMPLOYEE_EDIT,
      PagePermission.EMPLOYEE_DELETE
    ]
  },
  DEPARTMENTS: {
    title: PermissionCategories.DEPARTMENTS,
    permissions: [
      PagePermission.DEPARTMENT_VIEW,
      PagePermission.DEPARTMENT_CREATE,
      PagePermission.DEPARTMENT_EDIT,
      PagePermission.DEPARTMENT_DELETE
    ]
  },
  REPORTS: {
    title: PermissionCategories.REPORTS,
    permissions: [
      PagePermission.REPORT_VIEW,
      PagePermission.REPORT_CREATE,
      PagePermission.REPORT_EDIT,
      PagePermission.REPORT_DELETE,
      PagePermission.REPORT_EXPORT
    ]
  },
  SETTINGS: {
    title: PermissionCategories.SETTINGS,
    permissions: [
      PagePermission.SETTINGS_VIEW,
      PagePermission.SETTINGS_EDIT,
      PagePermission.GEMINI_VIEW,
      PagePermission.GEMINI_EDIT
    ]
  },
  ROLES: {
    title: PermissionCategories.ROLES,
    permissions: [
      PagePermission.ROLE_VIEW,
      PagePermission.ROLE_CREATE,
      PagePermission.ROLE_EDIT,
      PagePermission.ROLE_DELETE,
      PagePermission.ROLE_ASSIGN
    ]
  },
  NOTIFICATIONS: {
    title: PermissionCategories.NOTIFICATIONS,
    permissions: [
      PagePermission.NOTIFICATION_VIEW,
      PagePermission.NOTIFICATION_CREATE,
      PagePermission.NOTIFICATION_EDIT,
      PagePermission.NOTIFICATION_DELETE
    ]
  }
};

// İzin açıklamaları
export const PermissionDescriptions: Record<PagePermission, string> = {
  [PagePermission.DASHBOARD]: 'Dashboard sayfasını görüntüleme',
  [PagePermission.TICKETS]: 'Destek talepleri sayfasını görüntüleme',
  [PagePermission.EMPLOYEES]: 'Personel yönetimi sayfasını görüntüleme',
  [PagePermission.DEPARTMENTS]: 'Departman yönetimi sayfasını görüntüleme',
  [PagePermission.REPORTS]: 'Raporlar sayfasını görüntüleme',
  [PagePermission.SETTINGS]: 'Ayarlar sayfasını görüntüleme',
  [PagePermission.GEMINI_SETTINGS]: 'Gemini AI ayarları sayfasını görüntüleme',
  [PagePermission.ROLES]: 'Rol yönetimi sayfasını görüntüleme',
  [PagePermission.NOTIFICATIONS]: 'Bildirimler sayfasını görüntüleme',
  
  [PagePermission.TICKET_VIEW]: 'Destek taleplerini görüntüleme',
  [PagePermission.TICKET_CREATE]: 'Yeni destek talebi oluşturma',
  [PagePermission.TICKET_EDIT]: 'Destek taleplerini düzenleme',
  [PagePermission.TICKET_DELETE]: 'Destek taleplerini silme',
  [PagePermission.TICKET_ASSIGN]: 'Destek taleplerini personele atama',
  [PagePermission.TICKET_CHANGE_STATUS]: 'Destek talebi durumunu değiştirme',
  [PagePermission.TICKET_CHANGE_PRIORITY]: 'Destek talebi önceliğini değiştirme',
  
  [PagePermission.EMPLOYEE_VIEW]: 'Personelleri görüntüleme',
  [PagePermission.EMPLOYEE_CREATE]: 'Yeni personel ekleme',
  [PagePermission.EMPLOYEE_EDIT]: 'Personel bilgilerini düzenleme',
  [PagePermission.EMPLOYEE_DELETE]: 'Personel silme',
  
  [PagePermission.DEPARTMENT_VIEW]: 'Departmanları görüntüleme',
  [PagePermission.DEPARTMENT_CREATE]: 'Yeni departman ekleme',
  [PagePermission.DEPARTMENT_EDIT]: 'Departman bilgilerini düzenleme',
  [PagePermission.DEPARTMENT_DELETE]: 'Departman silme',
  
  [PagePermission.REPORT_VIEW]: 'Raporları görüntüleme',
  [PagePermission.REPORT_CREATE]: 'Yeni rapor oluşturma',
  [PagePermission.REPORT_EDIT]: 'Raporları düzenleme',
  [PagePermission.REPORT_DELETE]: 'Raporları silme',
  [PagePermission.REPORT_EXPORT]: 'Raporları dışa aktarma',
  
  [PagePermission.SETTINGS_VIEW]: 'Sistem ayarlarını görüntüleme',
  [PagePermission.SETTINGS_EDIT]: 'Sistem ayarlarını düzenleme',
  
  [PagePermission.GEMINI_VIEW]: 'Gemini AI ayarlarını görüntüleme',
  [PagePermission.GEMINI_EDIT]: 'Gemini AI ayarlarını düzenleme',
  
  [PagePermission.ROLE_VIEW]: 'Rolleri görüntüleme',
  [PagePermission.ROLE_CREATE]: 'Yeni rol oluşturma',
  [PagePermission.ROLE_EDIT]: 'Rolleri düzenleme',
  [PagePermission.ROLE_DELETE]: 'Rolleri silme',
  [PagePermission.ROLE_ASSIGN]: 'Rolleri personele atama',
  
  [PagePermission.NOTIFICATION_VIEW]: 'Bildirimleri görüntüleme',
  [PagePermission.NOTIFICATION_CREATE]: 'Yeni bildirim oluşturma',
  [PagePermission.NOTIFICATION_EDIT]: 'Bildirimleri düzenleme',
  [PagePermission.NOTIFICATION_DELETE]: 'Bildirimleri silme'
};

// Rol model tanımı
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: PagePermission[];
  isSystem?: boolean; // Sistem tarafından oluşturulan roller silinemez
  createdAt: string;
  updatedAt: string;
}

// Varsayılan roller
export const DefaultRoles: Partial<Role>[] = [
  {
    id: 'admin',
    name: 'Yönetici',
    description: 'Tam yetkili yönetici rolü. Tüm sistemde sınırsız yetkiye sahiptir.',
    permissions: Object.values(PagePermission),
    isSystem: true
  },
  {
    id: 'support_manager',
    name: 'Destek Ekibi Yöneticisi',
    description: 'Tüm destek taleplerini yönetebilir, personel ve departmanları düzenleyebilir.',
    permissions: [
      PagePermission.DASHBOARD,
      PagePermission.TICKETS,
      PagePermission.EMPLOYEES,
      PagePermission.DEPARTMENTS,
      PagePermission.NOTIFICATIONS,
      PagePermission.TICKET_VIEW,
      PagePermission.TICKET_CREATE,
      PagePermission.TICKET_EDIT,
      PagePermission.TICKET_ASSIGN,
      PagePermission.TICKET_CHANGE_STATUS,
      PagePermission.TICKET_CHANGE_PRIORITY,
      PagePermission.EMPLOYEE_VIEW,
      PagePermission.EMPLOYEE_EDIT,
      PagePermission.DEPARTMENT_VIEW,
      PagePermission.DEPARTMENT_EDIT,
      PagePermission.REPORT_VIEW,
      PagePermission.REPORT_CREATE,
      PagePermission.GEMINI_VIEW,
      PagePermission.NOTIFICATION_VIEW
    ],
    isSystem: true
  },
  {
    id: 'support_agent',
    name: 'Destek Personeli',
    description: 'Destek taleplerini görüntüleyebilir ve yanıtlayabilir.',
    permissions: [
      PagePermission.DASHBOARD,
      PagePermission.TICKETS,
      PagePermission.TICKET_VIEW,
      PagePermission.TICKET_CREATE,
      PagePermission.TICKET_EDIT,
      PagePermission.TICKET_CHANGE_STATUS,
      PagePermission.EMPLOYEE_VIEW,
      PagePermission.DEPARTMENT_VIEW,
      PagePermission.GEMINI_VIEW,
      PagePermission.NOTIFICATIONS,
      PagePermission.NOTIFICATION_VIEW
    ],
    isSystem: true
  },
  {
    id: 'reports_analyst',
    name: 'Rapor Analisti',
    description: 'Raporları görüntüleyebilir, oluşturabilir ve dışa aktarabilir.',
    permissions: [
      PagePermission.DASHBOARD,
      PagePermission.REPORTS,
      PagePermission.REPORT_VIEW,
      PagePermission.REPORT_CREATE,
      PagePermission.REPORT_EXPORT,
      PagePermission.TICKET_VIEW,
      PagePermission.NOTIFICATIONS,
      PagePermission.NOTIFICATION_VIEW
    ],
    isSystem: true
  }
];

// Rol servisi için gerekli tip tanımları
export interface RoleFormData {
  name: string;
  description?: string;
  permissions: PagePermission[];
}

// Yetki kontrolü yardımcı fonksiyonu
export const hasPermission = (userPermissions: PagePermission[], permission: PagePermission): boolean => {
  return userPermissions.includes(permission);
}; 