import { 
  EmailSettings, 
  CreateEmailSettingsRequest, 
  UpdateEmailSettingsRequest, 
  createMockEmailSettings 
} from '../models/Email';
import { post, get, put, del } from 'aws-amplify/api';

// API yanıt tipleri
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Singleton servis
class EmailSettingsService {
  private static instance: EmailSettingsService;
  private emailSettings: EmailSettings[] = [];
  private readonly isProduction: boolean;
  private readonly apiName = 'emailapi'; // Amplify API'deki API ismi
  
  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    console.log('EmailSettingsService başlatıldı, isProduction:', this.isProduction);
    
    // Geliştirme modunda mock veriler kullan
    if (!this.isProduction) {
      try {
        this.emailSettings = createMockEmailSettings();
        console.log('Mock e-posta ayarları yüklendi, ayar sayısı:', this.emailSettings.length);
      } catch (error) {
        console.error('Mock veri yüklenirken hata oluştu:', error);
      }
    }
  }

  static getInstance(): EmailSettingsService {
    console.log('EmailSettingsService.getInstance çağrıldı');
    if (!EmailSettingsService.instance) {
      console.log('EmailSettingsService örneği oluşturuluyor...');
      EmailSettingsService.instance = new EmailSettingsService();
    }
    return EmailSettingsService.instance;
  }

  // Tüm e-posta ayarlarını getir
  async getEmailSettings(): Promise<EmailSettings[]> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await get({
          apiName: this.apiName,
          path: '/settings'
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{settings: EmailSettings[]}>;
        
        console.log('E-posta ayarları API yanıtı:', responseData);
        return responseData?.settings || [];
      } catch (error: any) {
        console.error('E-posta ayarları alınırken hata oluştu:', error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...this.emailSettings]);
        }, 500);
      });
    }
  }

  // ID'ye göre e-posta ayarı getir
  async getEmailSettingById(id: string): Promise<EmailSettings | null> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await get({
          apiName: this.apiName,
          path: `/settings/${id}`
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{setting: EmailSettings}>;
        
        console.log(`${id} ID'li e-posta ayarı API yanıtı:`, responseData);
        return responseData?.setting || null;
      } catch (error: any) {
        console.error(`${id} ID'li e-posta ayarı alınırken hata oluştu:`, error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const setting = this.emailSettings.find(s => s.id === id) || null;
          resolve(setting ? { ...setting } : null);
        }, 500);
      });
    }
  }

  // Yeni e-posta ayarı oluştur
  async createEmailSetting(request: CreateEmailSettingsRequest): Promise<EmailSettings> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await post({
          apiName: this.apiName,
          path: '/settings',
          options: {
            body: request
          }
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{setting: EmailSettings}>;
        
        console.log('E-posta ayarı oluşturma API yanıtı:', responseData);
        if (!responseData?.setting) {
          throw new Error('API yanıtında geçerli veri bulunamadı');
        }
        return responseData.setting;
      } catch (error: any) {
        console.error('E-posta ayarı oluşturulurken hata oluştu:', error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date().toISOString();
          const newSetting: EmailSettings = {
            id: (this.emailSettings.length + 1).toString(),
            ...request,
            createdAt: now,
            updatedAt: now
          };

          // Eğer varsayılan olarak işaretlenmişse, diğer tüm hesapları varsayılan olmaktan çıkar
          if (request.isDefault) {
            this.emailSettings.forEach(setting => {
              setting.isDefault = false;
            });
          }

          this.emailSettings.push(newSetting);
          resolve({ ...newSetting });
        }, 500);
      });
    }
  }

  // E-posta ayarını güncelle
  async updateEmailSetting(request: UpdateEmailSettingsRequest): Promise<EmailSettings | null> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await put({
          apiName: this.apiName,
          path: `/settings/${request.id}`,
          options: {
            body: request
          }
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{setting: EmailSettings}>;
        
        console.log('E-posta ayarı güncelleme API yanıtı:', responseData);
        return responseData?.setting || null;
      } catch (error: any) {
        console.error(`E-posta ayarı güncellenirken hata oluştu:`, error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = this.emailSettings.findIndex(s => s.id === request.id);
          
          if (index === -1) {
            resolve(null);
            return;
          }

          // Eğer varsayılan olarak işaretlenmişse, diğer tüm hesapları varsayılan olmaktan çıkar
          if (request.isDefault) {
            this.emailSettings.forEach(setting => {
              if (setting.id !== request.id) {
                setting.isDefault = false;
              }
            });
          }

          const updatedSetting = { 
            ...this.emailSettings[index],
            ...request,
            updatedAt: new Date().toISOString()
          };

          this.emailSettings[index] = updatedSetting;
          resolve({ ...updatedSetting });
        }, 500);
      });
    }
  }

  // E-posta ayarını sil
  async deleteEmailSetting(id: string): Promise<boolean> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await del({
          apiName: this.apiName,
          path: `/settings/${id}`
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{}>;
        
        console.log('E-posta ayarı silme API yanıtı:', responseData);
        return responseData.success || false;
      } catch (error: any) {
        console.error(`E-posta ayarı silinirken hata oluştu:`, error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = this.emailSettings.findIndex(s => s.id === id);
          
          if (index === -1) {
            resolve(false);
            return;
          }

          // Eğer silinecek hesap varsayılan ise, başka bir hesabı varsayılan yap
          if (this.emailSettings[index].isDefault && this.emailSettings.length > 1) {
            const nextDefaultIndex = index === 0 ? 1 : 0;
            this.emailSettings[nextDefaultIndex].isDefault = true;
          }

          this.emailSettings.splice(index, 1);
          resolve(true);
        }, 500);
      });
    }
  }

  // E-posta bağlantısını test et
  async testEmailSetting(id: string): Promise<{ success: boolean; message: string }> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await post({
          apiName: this.apiName,
          path: `/settings/${id}/test`,
          options: {
            body: {}
          }
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{}>;
        
        console.log('E-posta ayarı test API yanıtı:', responseData);
        return {
          success: responseData.success || false,
          message: responseData.message || 'Bilinmeyen test sonucu'
        };
      } catch (error: any) {
        console.error(`E-posta bağlantısı test edilirken hata oluştu:`, error);
        return {
          success: false,
          message: `Hata: ${error.message || 'Bilinmeyen hata'}`
        };
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const setting = this.emailSettings.find(s => s.id === id);
          
          if (!setting) {
            resolve({
              success: false,
              message: 'E-posta ayarı bulunamadı'
            });
            return;
          }

          // Burada gerçek bir test yapılabilir, şimdilik rastgele başarılı veya başarısız
          const isSuccess = Math.random() > 0.3; // %70 başarı olasılığı
          
          if (isSuccess) {
            resolve({
              success: true,
              message: 'E-posta bağlantısı başarıyla test edildi! IMAP ve SMTP bağlantıları çalışıyor.'
            });
          } else {
            resolve({
              success: false,
              message: 'E-posta bağlantısı test edilirken hata oluştu. Sunucu ayarlarınızı kontrol edin.'
            });
          }
        }, 1000);
      });
    }
  }

  // Varsayılan e-posta ayarını getir
  async getDefaultEmailSetting(): Promise<EmailSettings | null> {
    if (this.isProduction) {
      try {
        // Gerçek API çağrısı
        const response = await get({
          apiName: this.apiName,
          path: '/settings/default'
        }).response;
        
        const jsonData = await response.body.json();
        const responseData = jsonData as ApiResponse<{setting: EmailSettings}>;
        
        console.log('Varsayılan e-posta ayarı API yanıtı:', responseData);
        return responseData?.setting || null;
      } catch (error: any) {
        console.error('Varsayılan e-posta ayarı alınırken hata oluştu:', error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const setting = this.emailSettings.find(s => s.isDefault) || null;
          resolve(setting ? { ...setting } : null);
        }, 500);
      });
    }
  }
}

// Singleton servis örneği
const emailSettingsService = EmailSettingsService.getInstance();
export default emailSettingsService; 