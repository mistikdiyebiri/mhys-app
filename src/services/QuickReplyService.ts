import { v4 as uuidv4 } from 'uuid';

export interface QuickReply {
  id: string;
  title: string;
  text: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Örnek kategoriler
export const CATEGORIES = [
  'Genel',
  'Teşekkür',
  'Bilgilendirme',
  'Çözüm',
  'Sorun Giderme',
  'Teknik'
];

// Örnek hazır yanıtlar - localStorage'da saklanacak
const sampleQuickReplies: QuickReply[] = [
  {
    id: '1',
    title: 'Teşekkür mesajı',
    text: 'Talebiniz için teşekkür ederiz. En kısa sürede inceleyip size dönüş yapacağız.',
    category: 'Teşekkür',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'İşleme alındı',
    text: 'Talebiniz işleme alınmıştır. Konuyla ilgili çalışmalarımız devam etmektedir.',
    category: 'Bilgilendirme',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Ek bilgi talebi',
    text: 'Talebinizle ilgili daha detaylı bilgiye ihtiyacımız var. Lütfen aşağıdaki bilgileri paylaşır mısınız?\n\n1. Sorunu ne zaman fark ettiniz?\n2. Sorun hangi durumlarda ortaya çıkıyor?\n3. Daha önce benzer bir sorun yaşadınız mı?',
    category: 'Sorun Giderme',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Çözüm bildirisi',
    text: 'Talebiniz çözümlenmiştir. Sorun [ÇÖZÜM AÇIKLAMASI] şeklinde giderilmiştir. Başka bir sorunla karşılaşırsanız lütfen bize bildirin.',
    category: 'Çözüm',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Tahmini süre',
    text: 'Talebiniz değerlendirme aşamasındadır. Tahmini çözüm süresi 24-48 saat içerisindedir. Anlayışınız için teşekkür ederiz.',
    category: 'Bilgilendirme',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class QuickReplyService {
  private readonly STORAGE_KEY = 'mhys_quick_replies';

  // Hazır yanıtları al
  getQuickReplies = (): QuickReply[] => {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (!storedData) {
      // İlk kez çalıştırıldığında örnek verileri localStorage'a kaydet
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleQuickReplies));
      return sampleQuickReplies;
    }
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Hazır yanıtlar yüklenirken hata oluştu:', error);
      return [];
    }
  }

  // Hazır yanıt ekle
  addQuickReply = (reply: Omit<QuickReply, 'id' | 'createdAt' | 'updatedAt'>): QuickReply => {
    const now = new Date().toISOString();
    const newReply: QuickReply = {
      id: uuidv4(),
      ...reply,
      createdAt: now,
      updatedAt: now
    };
    
    const currentReplies = this.getQuickReplies();
    const updatedReplies = [...currentReplies, newReply];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedReplies));
    return newReply;
  }

  // Hazır yanıt güncelle
  updateQuickReply = (id: string, updates: Partial<Omit<QuickReply, 'id' | 'createdAt' | 'updatedAt'>>): QuickReply | null => {
    const currentReplies = this.getQuickReplies();
    const replyIndex = currentReplies.findIndex(reply => reply.id === id);
    
    if (replyIndex === -1) {
      return null;
    }
    
    const updatedReply: QuickReply = {
      ...currentReplies[replyIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    currentReplies[replyIndex] = updatedReply;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentReplies));
    
    return updatedReply;
  }

  // Hazır yanıt sil
  deleteQuickReply = (id: string): boolean => {
    const currentReplies = this.getQuickReplies();
    const updatedReplies = currentReplies.filter(reply => reply.id !== id);
    
    if (updatedReplies.length === currentReplies.length) {
      return false; // Silinecek bir şey bulunamadı
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedReplies));
    return true;
  }

  // Kategoriye göre hazır yanıtları filtrele
  getQuickRepliesByCategory = (category: string): QuickReply[] => {
    const replies = this.getQuickReplies();
    return category 
      ? replies.filter(reply => reply.category === category)
      : replies;
  }
}

export const quickReplyService = new QuickReplyService();
export default quickReplyService; 