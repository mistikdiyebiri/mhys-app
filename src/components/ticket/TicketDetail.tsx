import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip, 
  Button, 
  TextField,
  CircularProgress,
  Grid,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  ListItemIcon,
  List,
  ListItem,
  ListItemText,
  Alert,
  useTheme
} from '@mui/material';
import {
  Reply as ReplyIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Send as SendIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Lightbulb as LightbulbIcon,
  FormatListBulleted as FormatListBulletedIcon,
  SmartToy as SmartToyIcon,
  AssignmentInd as AssignmentIndIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import ticketService from '../../services/TicketService';
import { Ticket, TicketComment, TicketStatus, TicketPriority, TicketCategory, UpdateTicketRequest } from '../../models/Ticket';
import GeminiAssistant from './GeminiAssistant';
import { alpha } from '@mui/material/styles';
import { geminiService } from '../../services/GeminiService';
import quickReplyService, { QuickReply } from '../../services/QuickReplyService';

// Tab paneli içeriği için ara bileşen
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ticket-detail-tabpanel-${index}`}
      aria-labelledby={`ticket-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Bilet durumu etiket renklerini belirle
const getStatusColor = (status: TicketStatus) => {
  switch(status) {
    case TicketStatus.OPEN:
      return 'error';
    case TicketStatus.IN_PROGRESS:
      return 'warning';
    case TicketStatus.RESOLVED:
      return 'success';
    case TicketStatus.CLOSED:
      return 'default';
    case TicketStatus.WAITING_CUSTOMER:
      return 'info';
    default:
      return 'default';
  }
};

// Bilet öncelik renklerini belirle
const getPriorityColor = (priority: TicketPriority) => {
  switch(priority) {
    case TicketPriority.LOW:
      return 'success';
    case TicketPriority.MEDIUM:
      return 'info';
    case TicketPriority.HIGH:
      return 'warning';
    case TicketPriority.URGENT:
      return 'error';
    default:
      return 'default';
  }
};

// Kategori isimleri
const getCategoryLabel = (category: TicketCategory) => {
  switch(category) {
    case TicketCategory.TECHNICAL:
      return 'Teknik';
    case TicketCategory.ACCOUNT:
      return 'Hesap';
    case TicketCategory.BILLING:
      return 'Fatura';
    case TicketCategory.GENERAL:
      return 'Genel';
    case TicketCategory.FEATURE_REQUEST:
      return 'Özellik Talebi';
    default:
      return 'Bilinmiyor';
  }
};

// Durum isimlerini belirle
const getStatusLabel = (status: TicketStatus) => {
  switch(status) {
    case TicketStatus.OPEN:
      return 'Açık';
    case TicketStatus.IN_PROGRESS:
      return 'İşleniyor';
    case TicketStatus.RESOLVED:
      return 'Çözüldü';
    case TicketStatus.CLOSED:
      return 'Kapatıldı';
    case TicketStatus.WAITING_CUSTOMER:
      return 'Yanıt Bekleniyor';
    default:
      return 'Bilinmiyor';
  }
};

// Öncelik isimlerini belirle
const getPriorityLabel = (priority: TicketPriority) => {
  switch(priority) {
    case TicketPriority.LOW:
      return 'Düşük';
    case TicketPriority.MEDIUM:
      return 'Orta';
    case TicketPriority.HIGH:
      return 'Yüksek';
    case TicketPriority.URGENT:
      return 'Acil';
    default:
      return 'Bilinmiyor';
  }
};

interface TicketDetailProps {
  ticketId: string;
  userId: string;
  userRole: 'admin' | 'employee' | 'customer';
  onClose?: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ 
  ticketId, 
  userId,
  userRole,
  onClose 
}) => {
  const theme = useTheme();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [assigneeUpdateLoading, setAssigneeUpdateLoading] = useState(false);
  const [priorityUpdateLoading, setPriorityUpdateLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | ''>('');
  const [commentText, setCommentText] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | ''>('');
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [quickRepliesLoading, setQuickRepliesLoading] = useState(false);
  
  // Otomatik anahtar kelime etiketlerini engellemek için CSS stillerini ekleyelim
  const preventAutoKeywordStyles = {
    // Sadece bilet başlığının altındaki ilk paper bileşenindeki etiketleri hedefle
    '& .MuiPaper-root:first-of-type .MuiChip-root:nth-of-type(n+4)': { 
      display: 'none' // İlk 3 etiket dışındaki tüm etiketleri gizle (durum, öncelik, kategori dışındakiler)
    }
  };
  
  const isStaff = userRole === 'admin' || userRole === 'employee';
  
  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Hazır yanıtları yükle
  useEffect(() => {
    if (isStaff) {
      setQuickRepliesLoading(true);
      try {
        const replies = quickReplyService.getQuickReplies();
        setQuickReplies(replies);
      } catch (error) {
        console.error('Hazır yanıtlar yüklenirken hata oluştu:', error);
      } finally {
        setQuickRepliesLoading(false);
      }
    }
  }, [isStaff]);

  // Bilet ve yorumları yükle
  useEffect(() => {
    const loadTicketData = async () => {
      setLoading(true);
      try {
        const ticketData = await ticketService.getTicketById(ticketId);
        if (ticketData) {
          setTicket(ticketData);
          setSelectedStatus(ticketData.status);
          setSelectedPriority(ticketData.priority);
          
          // Sadece personel/admin dahili notları görebilir
          const commentsData = await ticketService.getTicketComments(
            ticketId, 
            isStaff // Dahili notları sadece personel/admin görür
          );
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Bilet yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTicketData();
  }, [ticketId, isStaff]);

  // Yeni mesaj eklendiğinde mesaj alanını otomatik kaydır
  useEffect(() => {
    if (messagesContainerRef.current && comments.length > 0) {
      const scrollContainer = messagesContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [comments]);

  // Yorum ekleme
  const handleAddComment = () => {
    if (!commentText.trim() || !ticket) return;
    
    setCommentLoading(true);
    
    // Example async call to add a comment
    setTimeout(() => {
      const newComment: TicketComment = {
        id: `comment-${Date.now()}`,
        ticketId: ticket.id,
        text: commentText,
        createdBy: userRole === 'admin' ? 'personel@mhys.com' : 'musteri@firma.com',
        createdAt: new Date().toISOString(),
        isInternal: isInternalNote
      };
      
      setComments([...comments, newComment]);
      setCommentText('');
      setCommentLoading(false);
      setIsInternalNote(false);
      
      // Yanıt gönderildiğinde başarı mesajını göster
      setSuccessMessage("Yanıtınız gönderildi!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 500);
  };
  
  // Hızlı yanıt seçme
  const handleQuickReplySelect = (replyText: string) => {
    setCommentText(replyText);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const handleAIInsertText = (text: string) => {
    setCommentText(text);
    // Metni ekledikten sonra metin alanına odaklan
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  // Bilet durumunu güncelle
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || selectedStatus === newStatus) return;
    
    setStatusUpdateLoading(true);
    try {
      const updateRequest: UpdateTicketRequest = {
        status: newStatus
      };
      
      const updatedTicket = await ticketService.updateTicket(ticketId, updateRequest);
      if (updatedTicket) {
        setTicket(updatedTicket);
        setSelectedStatus(updatedTicket.status);
        
        // Otomatik yorum ekle
        const statusChangeComment = await ticketService.addComment(
          ticketId,
          userId,
          `Bilet durumu "${getStatusLabel(ticket.status)}" durumundan "${getStatusLabel(newStatus)}" durumuna değiştirildi.`,
          true // Dahili not olarak ekle
        );
        
        setComments(prev => [...prev, statusChangeComment]);
      }
    } catch (error) {
      console.error('Durum güncellenirken hata oluştu:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Bileti kapat fonksiyonu (Yeni eklenecek)
  const handleCloseTicket = async () => {
    if (!ticket || ticket.status === TicketStatus.CLOSED) return;
    
    if (window.confirm("Bu bileti kapatmak istediğinizden emin misiniz?")) {
      setStatusUpdateLoading(true);
      try {
        const updateRequest: UpdateTicketRequest = {
          status: TicketStatus.CLOSED
        };
        
        const updatedTicket = await ticketService.updateTicket(ticketId, updateRequest);
        if (updatedTicket) {
          setTicket(updatedTicket);
          setSelectedStatus(TicketStatus.CLOSED);
          
          // Bileti kapatan yorum ekle
          const closeComment = await ticketService.addComment(
            ticketId,
            userId,
            "Bu bilet personel tarafından kapatılmıştır.",
            true // Dahili not olarak ekle
          );
          
          setComments(prev => [...prev, closeComment]);
          setSuccessMessage("Bilet başarıyla kapatıldı.");
          
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Bilet kapatılırken hata oluştu:', error);
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };

  // Bilet önceliğini güncelle
  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket) return;
    
    setPriorityUpdateLoading(true);
    try {
      const updateRequest: UpdateTicketRequest = {
        priority: newPriority
      };
      
      const updatedTicket = await ticketService.updateTicket(ticketId, updateRequest);
      if (updatedTicket) {
        setTicket(updatedTicket);
        
        // Otomatik yorum ekle
        const priorityComment = await ticketService.addComment(
          ticketId,
          userId,
          `Öncelik ${getPriorityLabel(ticket.priority)} -> ${getPriorityLabel(newPriority)} olarak değiştirildi.`,
          true // Dahili not olarak ekle
        );
        
        setComments(prev => [...prev, priorityComment]);
      }
    } catch (error) {
      console.error('Öncelik güncellenirken hata oluştu:', error);
    } finally {
      setPriorityUpdateLoading(false);
    }
  };

  // Bilet atama
  const handleAssignToDepartment = async () => {
    if (!ticket) return;
    
    setAssigneeUpdateLoading(true);
    try {
      const updateRequest: UpdateTicketRequest = {
        assignedTo: selectedDepartment,
        status: TicketStatus.IN_PROGRESS // Bilet atandığında durumu "İşleniyor" olarak güncelle
      };
      
      const updatedTicket = await ticketService.updateTicket(ticketId, updateRequest);
      if (updatedTicket) {
        setTicket(updatedTicket);
        setSelectedStatus(updatedTicket.status);
        
        // Departman adını alın
        let departmanAdi = "Bilinmeyen Departman";
        switch(selectedDepartment) {
          case "technical": departmanAdi = "Teknik Destek"; break;
          case "billing": departmanAdi = "Fatura / Ödeme"; break;
          case "customer": departmanAdi = "Müşteri Hizmetleri"; break;
          case "product": departmanAdi = "Ürün Yönetimi"; break;
        }
        
        // Otomatik yorum ekle
        const assignComment = await ticketService.addComment(
          ticketId,
          userId,
          `Bilet "${departmanAdi}" departmanına atandı.`,
          true // Dahili not olarak ekle
        );
        
        setComments(prev => [...prev, assignComment]);
      }
    } catch (error) {
      console.error('Bilet atanırken hata oluştu:', error);
    } finally {
      setAssigneeUpdateLoading(false);
    }
  };

  // Gemini AI ile yanıt üret
  const generateAIResponse = async () => {
    if (!ticket) return;
    
    setIsGeminiLoading(true);
    setAiError(null);
    
    try {
      // Son yorumu bul
      const lastComment = comments.length > 0 
        ? comments[comments.length - 1] 
        : null;
      
      // İstem oluştur
      const prompt = `
Destek bileti bilgileri:
Konu: ${ticket.title}
Açıklama: ${ticket.description}
Durum: ${ticket.status}
Öncelik: ${ticket.priority}
Kategori: ${ticket.category}

${lastComment ? `Son müşteri yorumu: ${lastComment.text}` : 'Henüz yorum yok'}

Bu destek talebine nazik, profesyonel ve çözüm odaklı bir yanıt yazın. 
Yanıt şunları içermeli:
1. Müşteriyi saygılı bir şekilde selamlama
2. Sorunlarını anladığınızı, ciddiye aldığınızı belirtme 
3. Destek talebine uygun bir çözüm önerme
4. Gerekirse ek bilgi isteme
5. Nazik bir kapanış
`;
      
      // Gemini AI servisini çağır
      const response = await geminiService.generateResponse(prompt);
      setAiResponse(response);
      setCommentText(response); // Otomatik olarak yanıt alanına yerleştir
    } catch (err: any) {
      console.error("Gemini yanıt hatası:", err);
      setAiError("Yanıt oluşturulurken bir hata oluştu.");
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // AI yanıtını temizle
  const clearAIResponse = () => {
    setAiResponse(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">Bilet bulunamadı.</Typography>
        {onClose && (
          <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
            Geri Dön
          </Button>
        )}
      </Box>
    );
  }

  // Başarı mesajı gösterimi
  const renderSuccessMessage = () => {
    if (!successMessage) return null;
    
    return (
      <Alert 
        severity="success" 
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 9999,
          boxShadow: 3
        }}
        onClose={() => setSuccessMessage(null)}
      >
        {successMessage}
      </Alert>
    );
  };

  return (
    <Box 
      sx={{ 
        maxWidth: '100%', 
        overflowX: 'hidden', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'hidden',
        pr: 1,
        ...preventAutoKeywordStyles
      }}
    >
      {renderSuccessMessage()}
      
      {/* Bilet Başlığı ve Durum - Daha Kompakt */}
      <Paper 
        sx={{ 
          p: 0.75,
          mb: 1,
          borderRadius: '8px',
          boxShadow: theme => theme.shadows[1],
          flexShrink: 0
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" sx={{ mb: 0.25, fontWeight: 500, fontSize: '1rem' }}>
              #{ticket.id}: {ticket.title}
            </Typography>
            
            <Box display="flex" gap={0.75} flexWrap="wrap">
              <Chip 
                label={getStatusLabel(ticket.status)} 
                color={getStatusColor(ticket.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                size="small"
                sx={{ height: '22px', '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
              />
              <Chip 
                label={getPriorityLabel(ticket.priority)} 
                color={getPriorityColor(ticket.priority) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                size="small"
                sx={{ height: '22px', '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
              />
              <Chip 
                label={getCategoryLabel(ticket.category)} 
                variant="outlined"
                size="small"
                sx={{ height: '22px', '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
              />
            </Box>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>
      
      {/* Sekmeler - Daha Kompakt */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 1,
        flexShrink: 0
      }}> 
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="ticket detail tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: '36px',
            '& .MuiTab-root': {
              minHeight: '36px',
              py: 0.25,
              fontSize: '0.8rem'
            },
            '& .MuiTabs-indicator': {
              height: '2px'
            }
          }}
        >
          <Tab 
            icon={<ChatBubbleOutlineIcon sx={{ fontSize: '0.9rem' }} />} 
            iconPosition="start" 
            label="Yazışmalar" 
            id="ticket-detail-tab-0" 
            aria-controls="ticket-detail-tabpanel-0" 
          />
          <Tab 
            icon={<DescriptionIcon sx={{ fontSize: '0.9rem' }} />} 
            iconPosition="start" 
            label="Detaylar" 
            id="ticket-detail-tab-1" 
            aria-controls="ticket-detail-tabpanel-1" 
          />
          {isStaff && (
            <Tab 
              icon={<PersonIcon sx={{ fontSize: '0.9rem' }} />} 
              iconPosition="start" 
              label="Atama" 
              id="ticket-detail-tab-2" 
              aria-controls="ticket-detail-tabpanel-2" 
            />
          )}
        </Tabs>
      </Box>
      
      {/* Tab İçerikleri */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'hidden', // Sayfa seviyesinde kaydırmayı devre dışı bırak
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Yazışmalar Sekmesi */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            gap: 1.5,
            overflowY: 'hidden' // Kaydırmayı sadece mesaj konteynerinde etkinleştir
          }}>
            {/* Yorumlar - Mesajlaşma Alanı */}
            <Paper 
              ref={messagesContainerRef}
              sx={{ 
                p: 1.5, 
                flex: 1,
                overflow: 'auto', // Bu alanın kaydırılabilir olmasını sağla
                borderRadius: '8px',
                boxShadow: theme => theme.shadows[1],
                minHeight: '300px', 
                maxHeight: '55vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                scrollBehavior: 'smooth' // Kaydırma animasyonunu yumuşat
              }}
            >
              {comments.length === 0 ? (
                <Typography color="text.secondary" align="center" py={2}>
                  Henüz yorum bulunmuyor.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ 
                  width: '100%', 
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  pb: 1
                }}>
                  {comments.map((comment) => (
                    <Box 
                      key={comment.id} 
                      sx={{ 
                        p: 1,
                        bgcolor: comment.isInternal ? alpha(theme.palette.grey[200], 0.5) : 'background.paper',
                        borderRadius: 1,
                        border: theme => `1px solid ${comment.isInternal ? theme.palette.grey[300] : theme.palette.divider}`,
                        width: 'auto',
                        maxWidth: '95%',
                        alignSelf: comment.createdBy.includes('admin') ? 'flex-end' : 'flex-start',
                        boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                        '&:hover': {
                          bgcolor: theme => alpha(theme.palette.primary.main, 0.03),
                          borderColor: theme => alpha(theme.palette.primary.main, 0.2)
                        },
                        ml: comment.createdBy.includes('admin') ? 'auto' : 0,
                        mr: comment.createdBy.includes('admin') ? 0 : 'auto',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <Avatar 
                            sx={{ 
                              width: 22,
                              height: 22,
                              bgcolor: comment.createdBy.includes('admin') ? 'primary.main' : 'secondary.main',
                              fontSize: '0.7rem'
                            }}
                          >
                            {comment.createdBy.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500} fontSize="0.8rem">
                            {comment.createdBy}
                            {comment.isInternal && (
                              <Tooltip title="Dahili Not">
                                <LockIcon 
                                  fontSize="small" 
                                  color="action" 
                                  sx={{ ml: 0.5, width: 12, height: 12, verticalAlign: 'middle' }}
                                />
                              </Tooltip>
                            )}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                          {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        whiteSpace="pre-wrap" 
                        sx={{ 
                          pl: 3.5,
                          fontSize: '0.8rem',
                          lineHeight: 1.4
                        }}
                      >
                        {comment.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
            
            {/* Yanıt ve Hazır Yanıtlar Bölümü */}
            <Box sx={{ flexShrink: 0 }}>
              {/* Yorum Ekleme Formu */}
              <Paper 
                sx={{ 
                  p: 1.5,
                  borderRadius: '8px',
                  boxShadow: theme => theme.shadows[1],
                  mb: 1.5,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontSize="0.9rem" fontWeight={600}>
                    Yanıt Ekle
                  </Typography>
                  
                  <Box>
                    {isStaff && (
                      <Tooltip title={isInternalNote ? "Dahili not (müşteri göremez)" : "Genel yanıt (müşteri görebilir)"}>
                        <Button
                          startIcon={isInternalNote ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                          variant="outlined"
                          color={isInternalNote ? "warning" : "primary"}
                          onClick={() => setIsInternalNote(!isInternalNote)}
                          size="small"
                          sx={{ 
                            mr: 0.75,
                            py: 0.25, 
                            minHeight: '28px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {isInternalNote ? 'Dahili Not' : 'Genel Yanıt'}
                        </Button>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Dosya Ekle (Henüz aktif değil)">
                      <span>
                        <IconButton disabled size="small" sx={{ p: 0.25 }}>
                          <AttachFileIcon sx={{ fontSize: '1rem' }}/>
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box position="relative">
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={4}
                    placeholder="Cevabınızı yazın..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={commentLoading || isGeminiLoading}
                    inputRef={textFieldRef}
                    size="small"
                    sx={{ 
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                      },
                      '& .MuiInputBase-inputMultiline': {
                        lineHeight: 1.5
                      }
                    }}
                  />
                </Box>
                
                {aiError && (
                  <Alert severity="error" sx={{ mb: 1, py: 0.5, fontSize: '0.75rem' }} onClose={() => setAiError(null)}>
                    {aiError}
                  </Alert>
                )}
                
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  {isStaff && (
                    <>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={statusUpdateLoading ? <CircularProgress size={16} color="error" /> : <CloseIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={handleCloseTicket}
                        disabled={statusUpdateLoading || commentLoading || ticket.status === TicketStatus.CLOSED}
                        size="small"
                        sx={{ 
                          borderRadius: '6px',
                          py: 0.5,
                          minWidth: '110px',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease-in-out',
                          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {statusUpdateLoading ? 'Kapatılıyor...' : 'Bileti Kapat'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={isGeminiLoading ? <CircularProgress size={16} color="secondary" /> : <SmartToyIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={generateAIResponse}
                        disabled={isGeminiLoading}
                        size="small"
                        sx={{ 
                          borderRadius: '6px',
                          py: 0.5,
                          minWidth: '110px',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease-in-out',
                          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                          background: isGeminiLoading ? alpha(theme.palette.secondary.main, 0.05) : 'inherit',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {isGeminiLoading ? 'Üretiliyor...' : 'AI ile Yanıt'}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={commentLoading ? <CircularProgress size={16} /> : <SendIcon sx={{ fontSize: '0.9rem' }} />}
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || commentLoading || isGeminiLoading}
                    size="small"
                    sx={{ 
                      borderRadius: '6px',
                      py: 0.5,
                      minWidth: '110px',
                      fontSize: '0.8rem',
                      boxShadow: 1,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {commentLoading ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>
                </Box>
              </Paper>
              
              {/* Hazır Yanıtlar Bölümü */}
              {isStaff && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.25,
                    maxHeight: '150px',
                    overflowY: 'auto',
                    borderRadius: '8px',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    background: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Box display="flex" alignItems="center" mb={0.75}>
                    <Typography variant="subtitle2" sx={{ mb: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                      <FormatListBulletedIcon sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
                      Hazır Yanıtlar
                    </Typography>
                  </Box>
                  
                  {quickRepliesLoading ? (
                    <Box display="flex" justifyContent="center" p={0.5}>
                      <CircularProgress size={16} />
                    </Box>
                  ) : quickReplies.length === 0 ? (
                    <Typography color="text.secondary" align="center" fontSize="0.75rem" py={0.5}>
                      Henüz hazır yanıt eklenmemiş.
                    </Typography>
                  ) : (
                    <Grid container spacing={1}>
                      {quickReplies.map((reply) => (
                        <Grid item xs={6} md={4} key={reply.id}>
                          <Tooltip title={reply.text} placement="top">
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ 
                                textTransform: 'none', 
                                justifyContent: 'flex-start',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                py: 0.5,
                                px: 1,
                                fontSize: '0.8rem',
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                                }
                              }}
                              onClick={() => handleQuickReplySelect(reply.text)}
                            >
                              <FormatListBulletedIcon sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                              {reply.title}
                            </Button>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              )}
            </Box>
          </Box>
        </TabPanel>
        
        {/* Detaylar Sekmesi */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Grid container spacing={1.5} sx={{ maxHeight: '70vh' }}>
              <Grid item xs={12} md={7}>
                <Paper 
                  sx={{ 
                    p: 1.5,
                    mb: { xs: 1.5, md: 0 },
                    borderRadius: '8px',
                    boxShadow: theme => theme.shadows[1]
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom fontSize="0.9rem">
                    Açıklama
                  </Typography>
                  
                  <Typography 
                    paragraph 
                    whiteSpace="pre-wrap" 
                    variant="body2"
                    sx={{ 
                      mb: 0,
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                      maxHeight: '350px', // Artırdım
                      overflow: 'auto'
                    }}
                  >
                    {ticket.description}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper 
                  sx={{ 
                    p: 1.5,
                    borderRadius: '8px',
                    boxShadow: theme => theme.shadows[1]
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom fontSize="0.9rem">Bilet Bilgileri</Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ 
                      display: 'flex', 
                      p: 0.75, 
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ width: '40%' }}>Oluşturan</Typography>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ width: '60%', fontWeight: 500 }}>{ticket.createdBy}</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      p: 0.75, 
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ width: '40%' }}>Oluşturulma Tarihi</Typography>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ width: '60%', fontWeight: 500 }}>
                        {format(new Date(ticket.createdAt), 'dd.MM.yyyy HH:mm')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      p: 0.75, 
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ width: '40%' }}>Son Güncelleme</Typography>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ width: '60%', fontWeight: 500 }}>
                        {format(new Date(ticket.updatedAt), 'dd.MM.yyyy HH:mm')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      p: 0.75, 
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ width: '40%' }}>Atanan Kişi</Typography>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ width: '60%', fontWeight: 500 }}>
                        {ticket.assignedTo || 'Henüz kimseye atanmadı'}
                      </Typography>
                    </Box>
                    
                    {isStaff && (
                      <>
                        <Divider sx={{ my: 0.5 }} />
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">Durum</Typography>
                          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Select
                              value={selectedStatus}
                              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                              disabled={statusUpdateLoading}
                              sx={{ fontSize: '0.85rem' }}
                            >
                              <MenuItem value={TicketStatus.OPEN}>Açık</MenuItem>
                              <MenuItem value={TicketStatus.IN_PROGRESS}>İşleniyor</MenuItem>
                              <MenuItem value={TicketStatus.WAITING_CUSTOMER}>Yanıt Bekleniyor</MenuItem>
                              <MenuItem value={TicketStatus.RESOLVED}>Çözüldü</MenuItem>
                              <MenuItem value={TicketStatus.CLOSED}>Kapatıldı</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">Öncelik</Typography>
                          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Select
                              value={selectedPriority}
                              onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                              disabled={priorityUpdateLoading}
                              sx={{ fontSize: '0.85rem' }}
                            >
                              <MenuItem value={TicketPriority.LOW}>Düşük</MenuItem>
                              <MenuItem value={TicketPriority.MEDIUM}>Orta</MenuItem>
                              <MenuItem value={TicketPriority.HIGH}>Yüksek</MenuItem>
                              <MenuItem value={TicketPriority.URGENT}>Acil</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Atama Sekmesi */}
        {isStaff && (
          <TabPanel value={tabValue} index={2}>
            <Paper 
              sx={{ 
                p: 0.75,
                borderRadius: '8px',
                boxShadow: theme => theme.shadows[1]
              }}
            >
              <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                Bilet Ataması
              </Typography>
              
              <Box sx={{ 
                p: 0.75, 
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                mb: 1
              }}>
                <Grid container spacing={0.5}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" fontSize="0.7rem">Mevcut Durum</Typography>
                    <Typography variant="body2" fontSize="0.78rem" fontWeight={500} mb={0.5}>
                      {ticket.assignedTo ? (
                        <>
                          <CheckIcon fontSize="small" color="success" sx={{ 
                            fontSize: '0.75rem', 
                            verticalAlign: 'middle',
                            mr: 0.5
                          }} />
                          {ticket.assignedTo}
                        </>
                      ) : (
                        <>
                          <CloseIcon fontSize="small" color="error" sx={{ 
                            fontSize: '0.75rem', 
                            verticalAlign: 'middle',
                            mr: 0.5
                          }} />
                          Henüz atama yapılmadı
                        </>
                      )}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    <Typography variant="caption" color="text.secondary" fontSize="0.7rem">Departman Seçin</Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 0.25 }}>
                      <Select
                        value={selectedDepartment || ''}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        disabled={assigneeUpdateLoading}
                        sx={{ fontSize: '0.78rem' }}
                      >
                        <MenuItem value="">Seçiniz</MenuItem>
                        <MenuItem value="technical">Teknik Destek</MenuItem>
                        <MenuItem value="billing">Fatura / Ödeme</MenuItem>
                        <MenuItem value="customer">Müşteri Hizmetleri</MenuItem>
                        <MenuItem value="product">Ürün Yönetimi</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ 
                  mt: 0.25,
                  py: 0.5,
                  fontSize: '0.78rem'
                }}
                onClick={handleAssignToDepartment}
                disabled={!selectedDepartment || assigneeUpdateLoading}
                startIcon={assigneeUpdateLoading ? <CircularProgress size={14} /> : <AssignmentIndIcon sx={{ fontSize: '0.9rem' }} />}
                size="small"
              >
                {assigneeUpdateLoading ? 'Atama Yapılıyor...' : 'Departmana Ata'}
              </Button>
              
              {/* Bilet Yönetimi İpuçları */}
              <Paper
                variant="outlined"
                sx={{ 
                  mt: 1.5, 
                  p: 0.75, 
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  borderRadius: '8px',
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <Typography variant="subtitle2" fontSize="0.8rem" color="info.main" gutterBottom>
                  <LightbulbIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                  İpuçları
                </Typography>
                <Typography variant="body2" fontSize="0.75rem" color="text.secondary">
                  • Biletleri ilgili departmanlara atamak, çözüm sürecini hızlandırır.<br />
                  • Bilet atandıktan sonra, bilet durumu otomatik olarak "İşleniyor" olarak güncellenir.<br />
                  • Atama sonrası bilet hakkında bir dahili not oluşturulur.
                </Typography>
              </Paper>
            </Paper>
          </TabPanel>
        )}
      </Box>
    </Box>
  );
};

export default TicketDetail; 