import { Ticket, TicketStatus, TicketPriority, TicketCategory, TicketComment } from '../models/Ticket';
import ticketService from './TicketService';
import emailSettingsService from './EmailSettingsService';
import { EmailSettings } from '../models/Email';

// Singleton servis
class EmailService {
  private static instance: EmailService;
  private pollingInterval: number = 5 * 60 * 1000; // 5 dakika
  private timer: NodeJS.Timeout | null = null;
  private activeEmailSettings: EmailSettings | null = null;

  private constructor() {
    // Private constructor
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * E-posta izlemeyi başlatır
   */
  public async startEmailPolling(): Promise<void> {
    // Varsayılan e-posta ayarlarını yükle
    this.activeEmailSettings = await emailSettingsService.getDefaultEmailSetting();
    
    if (!this.activeEmailSettings) {
      console.error('E-posta izleme başlatılamadı: Varsayılan e-posta ayarı bulunamadı.');
      return;
    }
    
    if (!this.activeEmailSettings.isActive) {
      console.error('E-posta izleme başlatılamadı: Varsayılan e-posta hesabı aktif değil.');
      return;
    }
    
    // Ayarlardan polling interval değerini al
    this.pollingInterval = this.activeEmailSettings.pollingInterval * 60 * 1000;
    
    console.log(`E-posta izleme başlatıldı. Her ${this.activeEmailSettings.pollingInterval} dakikada bir kontrol edilecek.`);
    
    // İlk çalıştırma
    this.checkEmails();
    
    // Periyodik kontrol
    this.timer = setInterval(() => {
      this.checkEmails();
    }, this.pollingInterval);
  }

  /**
   * E-posta izlemeyi durdurur
   */
  public stopEmailPolling(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('E-posta izleme durduruldu.');
    }
  }

  /**
   * E-postaları kontrol eder ve yeni e-postaları destek talebi olarak açar
   */
  private async checkEmails(): Promise<void> {
    if (!this.activeEmailSettings) {
      console.error('E-posta kontrolü yapılamadı: Aktif e-posta ayarı bulunamadı.');
      return;
    }
    
    try {
      console.log('Yeni e-postalar kontrol ediliyor...');
      
      // Gerçek uygulamada burada IMAP ile e-postaları çekme işlemi yapılır
      // Örnek olarak simüle ediyoruz
      const emails = await this.fetchEmailsFromYandex();
      
      if (emails.length > 0) {
        console.log(`${emails.length} yeni e-posta bulundu. Destek taleplerine dönüştürülüyor...`);
        
        for (const email of emails) {
          await this.createTicketFromEmail(email);
        }
      } else {
        console.log('Yeni e-posta bulunamadı.');
      }
    } catch (error) {
      console.error('E-posta kontrolü sırasında hata oluştu:', error);
    }
  }

  /**
   * Yandex Mail üzerinden e-postaları getirir
   */
  private async fetchEmailsFromYandex(): Promise<any[]> {
    if (!this.activeEmailSettings) {
      return [];
    }
    
    // Bu fonksiyon gerçek bir IMAP istemcisi ile Yandex'ten e-postaları çeker
    // Örnek implementasyon için sahte veri döndürüyoruz
    // Gerçek uygulamada "node-imap" veya "imapflow" gibi kütüphaneler kullanılabilir
    
    // Örnek e-posta verisi
    const mockEmails = [
      {
        id: 'email-1',
        from: 'musteri@firma.com',
        fromName: 'Ahmet Yılmaz',
        to: this.activeEmailSettings.email,
        subject: 'Oturum açma sorunu yaşıyorum',
        body: 'Merhaba,\n\nSistemde oturum açmaya çalışıyorum ancak şifremi girdiğimde hata alıyorum. Yardımcı olabilir misiniz?\n\nSaygılarımla,\nAhmet Yılmaz',
        date: new Date(),
        isRead: false
      }
    ];
    
    // Gerçek uygulamada IMAP ile okunmamış e-postaları çekme işlemi yapılır
    return Math.random() > 0.7 ? mockEmails : []; // Demo amaçlı rastgele e-posta döndürüyoruz
  }

  /**
   * E-postayı destek talebine dönüştürür
   */
  private async createTicketFromEmail(email: any): Promise<Ticket | null> {
    if (!this.activeEmailSettings || !this.activeEmailSettings.createTickets) {
      console.log('Bu e-posta hesabı için otomatik destek talebi oluşturma devre dışı.');
      return null;
    }
    
    try {
      // E-posta bilgilerinden destek talebi oluşturma
      const newTicket: Partial<Ticket> = {
        title: email.subject,
        description: email.body,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM, // Varsayılan öncelik
        category: TicketCategory.GENERAL, // Varsayılan kategori
        createdBy: email.fromName || email.from,
        metadata: {
          isFromEmail: true,
          fromEmail: email.from,
          toEmail: email.to,
          emailSubject: email.subject
        }
      };
      
      // Destek talebini oluştur
      const ticket = await ticketService.createTicket(email.fromName || email.from, newTicket as any);
      
      if (ticket) {
        console.log(`E-posta başarıyla destek talebine dönüştürüldü. Talep ID: ${ticket.id}`);
        
        // Eğer otomatik yanıt gönderme aktifse yanıt gönder
        if (this.activeEmailSettings.autoReply) {
          await this.sendAutoReply(email.from, email.subject, this.activeEmailSettings.autoReplyTemplate);
        }
        
        return ticket;
      }
      
      return null;
    } catch (error) {
      console.error('E-postayı destek talebine dönüştürürken hata oluştu:', error);
      return null;
    }
  }

  /**
   * Otomatik yanıt gönderir
   */
  private async sendAutoReply(to: string, subject: string, template: string): Promise<boolean> {
    try {
      // E-posta gönderme işlemi (SMTP)
      const emailSent = await this.sendEmail({
        to,
        subject: `Re: ${subject}`,
        body: template
      });
      
      if (emailSent) {
        console.log(`Otomatik yanıt e-postası gönderildi. Alıcı: ${to}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Otomatik yanıt gönderilirken hata oluştu:', error);
      return false;
    }
  }

  /**
   * Destek talebi yanıtını e-posta olarak gönderir
   */
  public async sendTicketReplyAsEmail(ticketId: string, commentText: string, senderName: string): Promise<boolean> {
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      
      if (!ticket || !ticket.metadata?.isFromEmail || !ticket.metadata?.fromEmail) {
        console.error('Bu destek talebi e-posta kaynaklı değil veya e-posta bilgisi eksik.');
        return false;
      }
      
      // Aktif e-posta ayarı yoksa varsayılan e-posta ayarını getir
      if (!this.activeEmailSettings) {
        this.activeEmailSettings = await emailSettingsService.getDefaultEmailSetting();
        
        if (!this.activeEmailSettings) {
          console.error('E-posta gönderilemedi: Varsayılan e-posta ayarı bulunamadı.');
          return false;
        }
      }
      
      // E-posta gönderme işlemi (SMTP)
      // Gerçek uygulamada "nodemailer" gibi bir kütüphane kullanılabilir
      const emailSent = await this.sendEmail({
        to: ticket.metadata.fromEmail,
        subject: `Re: ${ticket.title} [Talep #${ticket.id}]`,
        body: `${commentText}\n\n--\nSaygılarımla,\n${senderName}\n${this.activeEmailSettings.email}`,
      });
      
      if (emailSent) {
        console.log(`Yanıt e-posta olarak gönderildi. Alıcı: ${ticket.metadata.fromEmail}`);
        
        // Yoruma e-posta gönderildi bilgisi ekle
        await ticketService.addComment(ticketId, senderName, commentText, false, []);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Yanıt e-posta olarak gönderilirken hata oluştu:', error);
      return false;
    }
  }

  /**
   * E-posta gönderme işlemi
   */
  private async sendEmail(emailData: { to: string, subject: string, body: string }): Promise<boolean> {
    if (!this.activeEmailSettings) {
      console.error('E-posta gönderilemedi: Aktif e-posta ayarı bulunamadı.');
      return false;
    }
    
    // Gerçek uygulamada burada SMTP ile e-posta gönderme işlemi yapılır
    // Örnek olarak simüle ediyoruz
    console.log('E-posta gönderiliyor:', emailData);
    
    // Başarılı gönderim simülasyonu
    return true;
  }
}

// Singleton servis örneği
const emailService = EmailService.getInstance();
export default emailService; 