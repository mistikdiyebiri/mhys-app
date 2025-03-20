// E-posta servis tipleri
export enum EmailServiceType {
  YANDEX = 'yandex',
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  SMTP = 'smtp',
  IMAP = 'imap'
}

// E-posta ayarları arayüzü
export interface EmailSettings {
  id: string;
  name: string; // Görünen isim, örn: "Müşteri Destek" veya "Satış"
  email: string; // E-posta adresi
  type: EmailServiceType; // E-posta servis tipi
  incomingServer: string; // IMAP sunucu adresi
  incomingPort: number; // IMAP port
  outgoingServer: string; // SMTP sunucu adresi
  outgoingPort: number; // SMTP port
  username: string; // Kullanıcı adı
  password: string; // Şifre (saklanırken şifrelenmelidir)
  enableSSL: boolean; // SSL kullanılsın mı
  isActive: boolean; // Bu hesap aktif mi
  createdAt: string; // ISO tarih formatı
  updatedAt: string; // ISO tarih formatı
  pollingInterval: number; // Kontrol sıklığı (dakika)
  autoReply: boolean; // Otomatik yanıt gönderilsin mi
  autoReplyTemplate: string; // Otomatik yanıt şablonu
  createTickets: boolean; // Gelen e-postalar otomatik talep oluştursun mu
  isDefault: boolean; // Varsayılan e-posta hesabı mı
}

// E-posta oluşturma isteği
export interface CreateEmailSettingsRequest {
  name: string;
  email: string;
  type: EmailServiceType;
  incomingServer: string;
  incomingPort: number;
  outgoingServer: string;
  outgoingPort: number;
  username: string;
  password: string;
  enableSSL: boolean;
  isActive: boolean;
  pollingInterval: number;
  autoReply: boolean;
  autoReplyTemplate: string;
  createTickets: boolean;
  isDefault: boolean;
}

// E-posta güncelleme isteği
export interface UpdateEmailSettingsRequest {
  id: string;
  name?: string;
  email?: string;
  type?: EmailServiceType;
  incomingServer?: string;
  incomingPort?: number;
  outgoingServer?: string;
  outgoingPort?: number;
  username?: string;
  password?: string;
  enableSSL?: boolean;
  isActive?: boolean;
  pollingInterval?: number;
  autoReply?: boolean;
  autoReplyTemplate?: string;
  createTickets?: boolean;
  isDefault?: boolean;
}

// Örnek servis tanımları
export const defaultEmailServerConfigs: Record<EmailServiceType, {
  incomingServer: string;
  incomingPort: number;
  outgoingServer: string;
  outgoingPort: number;
  enableSSL: boolean;
}> = {
  [EmailServiceType.YANDEX]: {
    incomingServer: 'imap.yandex.com',
    incomingPort: 993,
    outgoingServer: 'smtp.yandex.com',
    outgoingPort: 465,
    enableSSL: true
  },
  [EmailServiceType.GMAIL]: {
    incomingServer: 'imap.gmail.com',
    incomingPort: 993,
    outgoingServer: 'smtp.gmail.com',
    outgoingPort: 465,
    enableSSL: true
  },
  [EmailServiceType.OUTLOOK]: {
    incomingServer: 'outlook.office365.com',
    incomingPort: 993,
    outgoingServer: 'smtp.office365.com',
    outgoingPort: 587,
    enableSSL: true
  },
  [EmailServiceType.SMTP]: {
    incomingServer: '',
    incomingPort: 993,
    outgoingServer: '',
    outgoingPort: 587,
    enableSSL: true
  },
  [EmailServiceType.IMAP]: {
    incomingServer: '',
    incomingPort: 993,
    outgoingServer: '',
    outgoingPort: 587,
    enableSSL: true
  }
};

// Örnek e-posta ayarları
export const createMockEmailSettings = (): EmailSettings[] => {
  return [
    {
      id: '1',
      name: 'Müşteri Destek',
      email: 'destek@firmaniz.com',
      type: EmailServiceType.YANDEX,
      incomingServer: 'imap.yandex.com',
      incomingPort: 993,
      outgoingServer: 'smtp.yandex.com',
      outgoingPort: 465,
      username: 'destek@firmaniz.com',
      password: '********',
      enableSSL: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pollingInterval: 5,
      autoReply: true,
      autoReplyTemplate: 'Sayın müşterimiz, destek talebiniz alınmıştır. En kısa sürede dönüş yapılacaktır.',
      createTickets: true,
      isDefault: true
    }
  ];
}; 