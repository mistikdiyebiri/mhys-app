import { 
  Ticket, 
  TicketComment, 
  CreateTicketRequest, 
  UpdateTicketRequest,
  createMockTickets,
  createMockTicketComments,
  TicketStatus,
  TicketPriority,
  TicketsResponse,
  TicketResponse,
  CommentsResponse,
  CommentResponse
} from '../models/Ticket';
import { get, post, put } from 'aws-amplify/api';

class TicketService {
  private static instance: TicketService;
  private readonly apiGateway: any;
  private readonly isProduction: boolean;
  private tickets: Ticket[] = [];
  private comments: TicketComment[] = [];
  private apiName = 'tickets'; // Amplify API'deki API ismi

  private constructor() {
    this.apiGateway = null; // AWS API Gateway instance would be initialized here
    // Geliştirme modunda olduğumuzu varsayalım
    this.isProduction = false; // Geliştirme modunda çalış
    
    // Geliştirme modunda mock veriler kullan
    if (!this.isProduction) {
      this.tickets = createMockTickets();
      this.comments = createMockTicketComments();
    }
  }

  static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  // Tüm biletleri al
  async getTickets(): Promise<Ticket[]> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden biletleri çek
        const response = await get({
          apiName: this.apiName,
          path: '/tickets'
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'tickets' in data && Array.isArray(data.tickets)) {
          return data.tickets as any as Ticket[];
        }
        return [];
      } catch (error: any) {
        console.error('Biletler çekilirken hata oluştu:', error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...this.tickets]);
        }, 500);
      });
    }
  }

  // Belirli bir kullanıcıya ait biletleri getir
  async getUserTickets(userId: string): Promise<Ticket[]> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden kullanıcı biletlerini çek
        const response = await get({
          apiName: this.apiName,
          path: `/users/${userId}/tickets`
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'tickets' in data && Array.isArray(data.tickets)) {
          return data.tickets as any as Ticket[];
        }
        return [];
      } catch (error: any) {
        console.error(`${userId} için biletler çekilirken hata oluştu:`, error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const userTickets = this.tickets.filter(ticket => ticket.createdBy === userId);
          resolve([...userTickets]);
        }, 500);
      });
    }
  }

  // Belirli bir bilet ID'sine göre bilet bilgilerini getir
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden bilet detaylarını çek
        const response = await get({
          apiName: this.apiName,
          path: `/tickets/${ticketId}`
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'ticket' in data) {
          return data.ticket as any as Ticket;
        }
        return null;
      } catch (error: any) {
        console.error(`${ticketId} ID'li bilet çekilirken hata oluştu:`, error);
        // 404 hatası durumunda null dön
        if (error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const ticket = this.tickets.find(t => t.id === ticketId) || null;
          resolve(ticket ? { ...ticket } : null);
        }, 500);
      });
    }
  }

  // Yeni bir bilet oluştur
  async createTicket(userId: string, request: CreateTicketRequest): Promise<Ticket> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden yeni bilet oluştur
        const response = await post({
          apiName: this.apiName,
          path: '/tickets',
          options: {
            body: {
              ...request,
              createdBy: userId
            } as any
          }
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'ticket' in data) {
          return data.ticket as any as Ticket;
        }
        throw new Error('Bilet oluşturma işlemi başarısız oldu.');
      } catch (error: any) {
        console.error('Bilet oluşturulurken hata oluştu:', error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date().toISOString();
          const newTicket: Ticket = {
            id: (this.tickets.length + 1).toString(),
            title: request.title,
            description: request.description,
            status: TicketStatus.OPEN,
            priority: request.priority || TicketPriority.MEDIUM,
            category: request.category,
            createdBy: userId,
            assignedTo: null,
            createdAt: now,
            updatedAt: now,
            closedAt: null,
            attachments: request.attachments || [],
            tags: request.tags || []
          };

          this.tickets.push(newTicket);
          resolve({ ...newTicket });
        }, 500);
      });
    }
  }

  // Bilet bilgilerini güncelle
  async updateTicket(ticketId: string, request: UpdateTicketRequest): Promise<Ticket | null> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden bilet güncelle
        const response = await put({
          apiName: this.apiName,
          path: `/tickets/${ticketId}`,
          options: {
            body: request as any
          }
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'ticket' in data) {
          return data.ticket as any as Ticket;
        }
        return null;
      } catch (error: any) {
        console.error(`${ticketId} ID'li bilet güncellenirken hata oluştu:`, error);
        // 404 hatası durumunda null dön
        if (error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = this.tickets.findIndex(t => t.id === ticketId);
          
          if (index === -1) {
            resolve(null);
            return;
          }

          const updatedTicket = { 
            ...this.tickets[index],
            ...request,
            updatedAt: new Date().toISOString()
          };

          // Bilet kapandıysa, kapatılma tarihini güncelle
          if (request.status === 'closed' && this.tickets[index].status !== 'closed') {
            updatedTicket.closedAt = new Date().toISOString();
          }

          this.tickets[index] = updatedTicket;
          resolve({ ...updatedTicket });
        }, 500);
      });
    }
  }

  // Bilet yorumlarını getir
  async getTicketComments(ticketId: string, includeInternal: boolean = false): Promise<TicketComment[]> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden bilet yorumlarını çek
        const response = await get({
          apiName: this.apiName,
          path: `/tickets/${ticketId}/comments`,
          options: {
            queryParams: {
              includeInternal: includeInternal.toString()
            }
          }
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'comments' in data && Array.isArray(data.comments)) {
          return data.comments as any as TicketComment[];
        }
        return [];
      } catch (error: any) {
        console.error(`${ticketId} ID'li bilet için yorumlar çekilirken hata oluştu:`, error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredComments = this.comments.filter(comment => comment.ticketId === ticketId);
          
          // Eğer dahili yorumları dahil etmemek gerekiyorsa filtrele
          if (!includeInternal) {
            filteredComments = filteredComments.filter(comment => !comment.isInternal);
          }
          
          resolve([...filteredComments]);
        }, 500);
      });
    }
  }

  // Bilete yorum ekle
  async addComment(ticketId: string, userId: string, text: string, isInternal: boolean = false, attachments: string[] = []): Promise<TicketComment> {
    if (this.isProduction) {
      try {
        // AWS API Gateway üzerinden bilet yorumu ekle
        const response = await post({
          apiName: this.apiName,
          path: `/tickets/${ticketId}/comments`,
          options: {
            body: {
              text,
              createdBy: userId,
              isInternal,
              attachments
            } as any
          }
        }).response;
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'comment' in data) {
          return data.comment as any as TicketComment;
        }
        throw new Error('Yorum ekleme işlemi başarısız oldu.');
      } catch (error: any) {
        console.error(`${ticketId} ID'li bilete yorum eklenirken hata oluştu:`, error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date().toISOString();
          const newComment: TicketComment = {
            id: (this.comments.length + 1).toString(),
            ticketId,
            text,
            createdBy: userId,
            createdAt: now,
            isInternal,
            attachments
          };

          this.comments.push(newComment);
          
          // Bilet durumunu güncelle (müşteri yanıtladıysa veya çalışan yanıtladıysa)
          const ticket = this.tickets.find(t => t.id === ticketId);
          if (ticket) {
            const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
            
            // Müşteri yanıtladıysa ve durum "müşteri bekleniyor" ise durumu "açık" olarak güncelle
            if (userId.includes('musteri') && ticket.status === TicketStatus.WAITING_CUSTOMER) {
              this.tickets[ticketIndex].status = TicketStatus.OPEN;
              this.tickets[ticketIndex].updatedAt = now;
            } 
            // Personel yanıtladıysa ve durum "açık" ise durumu "müşteri bekleniyor" olarak güncelle
            else if (!userId.includes('musteri') && ticket.status === TicketStatus.OPEN) {
              this.tickets[ticketIndex].status = TicketStatus.WAITING_CUSTOMER;
              this.tickets[ticketIndex].updatedAt = now;
            }
          }
          
          resolve({ ...newComment });
        }, 500);
      });
    }
  }

  // Bilet filtreleme
  async filterTickets(params: {
    status?: string | string[],
    priority?: string | string[],
    category?: string | string[],
    assignedTo?: string | null,
    searchText?: string
  }): Promise<Ticket[]> {
    if (this.isProduction) {
      try {
        // Query parametrelerini düzenle
        const queryParams: Record<string, string> = {};
        
        if (params.status) {
          const statusArray = Array.isArray(params.status) ? params.status : [params.status];
          queryParams.status = statusArray.join(',');
        }
        
        if (params.priority) {
          const priorityArray = Array.isArray(params.priority) ? params.priority : [params.priority];
          queryParams.priority = priorityArray.join(',');
        }
        
        if (params.category) {
          const categoryArray = Array.isArray(params.category) ? params.category : [params.category];
          queryParams.category = categoryArray.join(',');
        }
        
        if (params.assignedTo !== undefined) {
          queryParams.assignedTo = params.assignedTo === null ? 'null' : params.assignedTo;
        }
        
        if (params.searchText) {
          queryParams.searchText = params.searchText;
        }
        
        // AWS API Gateway üzerinden biletleri filtrele
        const response = await get({
          apiName: this.apiName,
          path: '/tickets/filter',
          options: {
            queryParams
          }
        }).response;
        
        const data = await response.body.json();
        // Tip güvenliği için kontrol
        if (data && typeof data === 'object' && 'tickets' in data && Array.isArray(data.tickets)) {
          return data.tickets as any as Ticket[];
        }
        return [];
      } catch (error: any) {
        console.error('Biletler filtrelenirken hata oluştu:', error);
        throw error;
      }
    } else {
      // Geliştirme modunda mock veri kullan
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredTickets = [...this.tickets];
          
          // Status filtresi
          if (params.status) {
            const statusArray = Array.isArray(params.status) ? params.status : [params.status];
            filteredTickets = filteredTickets.filter(ticket => statusArray.includes(ticket.status));
          }
          
          // Priority filtresi
          if (params.priority) {
            const priorityArray = Array.isArray(params.priority) ? params.priority : [params.priority];
            filteredTickets = filteredTickets.filter(ticket => priorityArray.includes(ticket.priority));
          }
          
          // Category filtresi
          if (params.category) {
            const categoryArray = Array.isArray(params.category) ? params.category : [params.category];
            filteredTickets = filteredTickets.filter(ticket => categoryArray.includes(ticket.category));
          }
          
          // Atanma durumu filtresi
          if (params.assignedTo !== undefined) {
            filteredTickets = params.assignedTo === null 
              ? filteredTickets.filter(ticket => ticket.assignedTo === null)
              : filteredTickets.filter(ticket => ticket.assignedTo === params.assignedTo);
          }
          
          // Metin araması (başlık ve açıklamada)
          if (params.searchText) {
            const searchText = params.searchText.toLowerCase();
            filteredTickets = filteredTickets.filter(ticket => 
              ticket.title.toLowerCase().includes(searchText) || 
              ticket.description.toLowerCase().includes(searchText) ||
              (ticket.tags && ticket.tags.some(tag => tag.toLowerCase().includes(searchText)))
            );
          }
          
          resolve(filteredTickets);
        }, 500);
      });
    }
  }
}

// Singleton servis örneği
const ticketService = TicketService.getInstance();
export default ticketService;