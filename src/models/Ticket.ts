// Bilet durumları
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'inProgress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  WAITING_CUSTOMER = 'waitingCustomer',
}

// Bilet önceliği
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Bilet kategorileri
export enum TicketCategory {
  TECHNICAL = 'technical',
  ACCOUNT = 'account',
  BILLING = 'billing',
  GENERAL = 'general',
  FEATURE_REQUEST = 'featureRequest',
  TEKNIK = 'teknik',
  GENEL = 'genel',
}

// Temel bilet modeli
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdBy: string; // Müşteri ID'si
  assignedTo: string | null; // Personel ID'si - atanmamışsa null
  createdAt: string; // ISO tarih formatı
  updatedAt: string; // ISO tarih formatı
  closedAt: string | null; // Kapatılmışsa ISO tarih formatı
  attachments?: string[]; // Ek dosya URL'leri
  metadata?: {
    isFromEmail?: boolean;
    fromEmail?: string;
    toEmail?: string;
    emailSubject?: string;
  };
}

// Bilet yanıtları
export interface TicketComment {
  id: string;
  ticketId: string;
  text: string;
  content?: string; // Eski text alanının alternatifi
  createdBy: string; // Kullanıcı ID'si (müşteri veya personel)
  createdAt: string; // ISO tarih formatı
  isInternal: boolean; // Dahili not mu (sadece personel görebilir)
  isEmployee?: boolean; // Yanıt personel tarafından mı oluşturuldu
  attachments?: string[]; // Ek dosya URL'leri
  isEmailSent?: boolean; // E-posta olarak gönderildi mi
}

// Yeni bilet oluşturma
export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority; // Öncelik belirtilmezse otomatik MEDIUM olur
  attachments?: string[];
}

// Bilet güncelleme
export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string | null;
  updatedAt?: string;
}

// API Yanıt Tipleri
export interface TicketsResponse {
  tickets: Ticket[];
}

export interface TicketResponse {
  ticket: Ticket;
}

export interface CommentsResponse {
  comments: TicketComment[];
}

export interface CommentResponse {
  comment: TicketComment;
}

// Mock bilet verisi oluşturma fonksiyonu
export const createMockTickets = (): Ticket[] => {
  const now = new Date().toISOString();
  
  return [
    {
      id: '1',
      title: 'Giriş yapamıyorum',
      description: 'Şifremi sıfırlamaya çalıştım ama hala giriş yapamıyorum.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.ACCOUNT,
      createdBy: 'musteri@firma.com',
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
    },
    {
      id: '2',
      title: 'Uygulama çok yavaş çalışıyor',
      description: 'Son güncellemeden sonra uygulama çok yavaş açılıyor ve sık sık donuyor.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.TECHNICAL,
      createdBy: 'musteri@firma.com',
      assignedTo: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün önce
      updatedAt: now,
      closedAt: null,
    },
    {
      id: '3',
      title: 'Faturamda hata var',
      description: 'Geçen ay kullanmadığım bir hizmet için ücretlendirme yapılmış.',
      status: TicketStatus.WAITING_CUSTOMER,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.BILLING,
      createdBy: 'musteri@firma.com',
      assignedTo: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün önce
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
      closedAt: null,
    },
    {
      id: '4',
      title: 'Yeni özellik talebi',
      description: 'Uygulamaya toplu dosya yükleme özelliği eklenebilir mi?',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      category: TicketCategory.FEATURE_REQUEST,
      createdBy: 'musteri@firma.com',
      assignedTo: 'admin@mhys.com',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün önce
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 gün önce
      closedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 gün önce
    },
    {
      id: '5',
      title: 'Hizmet kesintisi bildirimi',
      description: 'Planlı bakım zamanı hakkında bilgi almak istiyorum.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.GENERAL,
      createdBy: 'musteri@firma.com',
      assignedTo: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 gün önce
      updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 gün önce
      closedAt: null,
    }
  ];
};

// Mock bilet yorumları
export const createMockTicketComments = (): TicketComment[] => {
  return [
    {
      id: '1',
      ticketId: '1',
      text: 'Lütfen şifre sıfırlama e-postasını aldıktan sonra hangi hatayı aldığınızı detaylı olarak paylaşabilir misiniz?',
      createdBy: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 saat önce
      isInternal: false
    },
    {
      id: '2',
      ticketId: '1',
      text: 'Müşteri muhtemelen spam kutusunu kontrol etmemiştir. Yeni bir şifre sıfırlama e-postası gönderdim.',
      createdBy: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(), // 55 dakika önce
      isInternal: true
    },
    {
      id: '3',
      ticketId: '2',
      text: 'Sorununuzla ilgileniyoruz. Hangi tarayıcı ve işletim sistemi kullandığınızı paylaşabilir misiniz?',
      createdBy: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
      isInternal: false
    },
    {
      id: '4',
      ticketId: '2',
      text: 'Chrome tarayıcısında Windows 10 işletim sistemi kullanıyorum.',
      createdBy: 'musteri@firma.com',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
      isInternal: false
    },
    {
      id: '5',
      ticketId: '3',
      text: 'Faturanızı inceledik ve fazla ücretlendirmeyi tespit ettik. Bir sonraki faturanızdan düşülecektir.',
      createdBy: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
      isInternal: false
    },
    {
      id: '6',
      ticketId: '3',
      text: 'Lütfen faturanızda yapılan düzeltmeyi onaylar mısınız?',
      createdBy: 'personel@mhys.com',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
      isInternal: false
    }
  ];
};