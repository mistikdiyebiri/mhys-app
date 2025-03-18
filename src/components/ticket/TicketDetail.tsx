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
        <Box sx={{ pt: 2 }}>
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

// Sık kullanılan yanıtlar
const quickReplies = [
  {
    title: "Teşekkür mesajı",
    text: "Talebiniz için teşekkür ederiz. En kısa sürede inceleyip size dönüş yapacağız."
  },
  {
    title: "İşleme alındı",
    text: "Talebiniz işleme alınmıştır. Konuyla ilgili çalışmalarımız devam etmektedir."
  },
  {
    title: "Ek bilgi talebi",
    text: "Talebinizle ilgili daha detaylı bilgiye ihtiyacımız var. Lütfen aşağıdaki bilgileri paylaşır mısınız?\n\n1. Sorunu ne zaman fark ettiniz?\n2. Sorun hangi durumlarda ortaya çıkıyor?\n3. Daha önce benzer bir sorun yaşadınız mı?"
  },
  {
    title: "Çözüm bildirisi",
    text: "Talebiniz çözümlenmiştir. Sorun [ÇÖZÜM AÇIKLAMASI] şeklinde giderilmiştir. Başka bir sorunla karşılaşırsanız lütfen bize bildirin."
  },
  {
    title: "Tahmini süre",
    text: "Talebiniz değerlendirme aşamasındadır. Tahmini çözüm süresi 24-48 saat içerisindedir. Anlayışınız için teşekkür ederiz."
  }
];

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
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | ''>('');
  
  const isStaff = userRole === 'admin' || userRole === 'employee';
  
  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
    <Box>
      {renderSuccessMessage()}
      
      {/* Bilet Başlığı ve Durum */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="h5" gutterBottom>
              #{ticket.id}: {ticket.title}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label={getStatusLabel(ticket.status)} 
                color={getStatusColor(ticket.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                size="small"
              />
              <Chip 
                label={getPriorityLabel(ticket.priority)} 
                color={getPriorityColor(ticket.priority) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                size="small"
              />
              <Chip 
                label={getCategoryLabel(ticket.category)} 
                variant="outlined"
                size="small"
              />
              {ticket.tags && ticket.tags.map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  variant="outlined" 
                  size="small" 
                  color="default"
                />
              ))}
            </Box>
          </Box>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
      
      {/* Sekmeler */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="ticket detail tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<ChatBubbleOutlineIcon />} 
            iconPosition="start" 
            label="Yazışmalar" 
            id="ticket-detail-tab-0" 
            aria-controls="ticket-detail-tabpanel-0" 
          />
          <Tab 
            icon={<DescriptionIcon />} 
            iconPosition="start" 
            label="Detaylar" 
            id="ticket-detail-tab-1" 
            aria-controls="ticket-detail-tabpanel-1" 
          />
          {isStaff && (
            <Tab 
              icon={<PersonIcon />} 
              iconPosition="start" 
              label="Atama" 
              id="ticket-detail-tab-2" 
              aria-controls="ticket-detail-tabpanel-2" 
            />
          )}
        </Tabs>
      </Box>
      
      {/* Yazışmalar Sekmesi */}
      <TabPanel value={tabValue} index={0}>
        {/* Yorumlar */}
        <Paper sx={{ p: 2, mb: 3, maxHeight: '400px', overflow: 'auto' }}>
          {comments.length === 0 ? (
            <Typography color="text.secondary" align="center" py={3}>
              Henüz yorum bulunmuyor.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {comments.map((comment) => (
                <Box 
                  key={comment.id} 
                  sx={{ 
                    p: 2, 
                    bgcolor: comment.isInternal ? 'grey.100' : 'background.paper',
                    borderRadius: 1,
                    border: theme => `1px solid ${comment.isInternal ? theme.palette.grey[300] : theme.palette.divider}`
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: comment.createdBy.includes('admin') ? 'primary.main' : 'secondary.main' }}>
                        {comment.createdBy.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {comment.createdBy}
                        {comment.isInternal && (
                          <Tooltip title="Dahili Not">
                            <LockIcon fontSize="small" color="action" sx={{ ml: 1, verticalAlign: 'middle' }} />
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" whiteSpace="pre-wrap" sx={{ pl: 5 }}>
                    {comment.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
        
        {/* Yorum Ekleme Formu */}
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Yanıt Ekle
            </Typography>
            
            <Box>
              {isStaff && (
                <Tooltip title={isInternalNote ? "Dahili not (müşteri göremez)" : "Genel yanıt (müşteri görebilir)"}>
                  <Button
                    startIcon={isInternalNote ? <LockIcon /> : <LockOpenIcon />}
                    variant="outlined"
                    color={isInternalNote ? "warning" : "primary"}
                    onClick={() => setIsInternalNote(!isInternalNote)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    {isInternalNote ? 'Dahili Not' : 'Genel Yanıt'}
                  </Button>
                </Tooltip>
              )}
              
              <Tooltip title="Dosya Ekle (Henüz aktif değil)">
                <span>
                  <IconButton disabled size="small">
                    <AttachFileIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          
          <Box position="relative">
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Cevabınızı yazın..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={commentLoading || isGeminiLoading}
              inputRef={textFieldRef}
              sx={{ mb: 2 }}
            />
            
            {isStaff && (
              <Box position="absolute" bottom={24} right={8} zIndex={1}>
                <Tooltip title="Gemini AI ile yanıt üret">
                  <IconButton 
                    color="secondary" 
                    size="small" 
                    onClick={generateAIResponse}
                    disabled={isGeminiLoading}
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.main, 0.2),
                      }
                    }}
                  >
                    {isGeminiLoading ? (
                      <CircularProgress size={18} color="secondary" />
                    ) : (
                      <SmartToyIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
          
          {aiError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAiError(null)}>
              {aiError}
            </Alert>
          )}
          
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={commentLoading ? <CircularProgress size={16} /> : <SendIcon />}
              onClick={handleAddComment}
              disabled={!commentText.trim() || commentLoading || isGeminiLoading}
            >
              Gönder
            </Button>
          </Box>
        </Paper>
        
        {/* Hazır Yanıtlar Bölümü */}
        {isStaff && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Hazır Yanıtlar
            </Typography>
            <Paper variant="outlined" sx={{ p: 1, maxHeight: '150px', overflowY: 'auto' }}>
              <Grid container spacing={1}>
                {quickReplies.map((reply, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
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
                          width: '100%'
                        }}
                        onClick={() => handleQuickReplySelect(reply.text)}
                      >
                        <FormatListBulletedIcon fontSize="small" sx={{ mr: 1 }} />
                        {reply.title}
                      </Button>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
      </TabPanel>
      
      {/* Detaylar Sekmesi */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Açıklama
              </Typography>
              <Typography paragraph whiteSpace="pre-wrap">
                {ticket.description}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Bilet Bilgileri</Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Oluşturan</Typography>
                    <Typography variant="body2">{ticket.createdBy}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Oluşturulma Tarihi</Typography>
                    <Typography variant="body2">
                      {format(new Date(ticket.createdAt), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Son Güncelleme</Typography>
                    <Typography variant="body2">
                      {format(new Date(ticket.updatedAt), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Atanan Kişi</Typography>
                    <Typography variant="body2">
                      {ticket.assignedTo || 'Henüz kimseye atanmadı'}
                    </Typography>
                  </Box>
                  
                  {isStaff && (
                    <>
                      <Divider />
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Durum</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <Select
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                            disabled={statusUpdateLoading}
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
                        <Typography variant="caption" color="text.secondary">Öncelik</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <Select
                            value={selectedPriority}
                            onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                            disabled={priorityUpdateLoading}
                          >
                            <MenuItem value={TicketPriority.LOW}>Düşük</MenuItem>
                            <MenuItem value={TicketPriority.MEDIUM}>Orta</MenuItem>
                            <MenuItem value={TicketPriority.HIGH}>Yüksek</MenuItem>
                            <MenuItem value={TicketPriority.URGENT}>Acil</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Departmana Ata</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <Select
                            value={selectedDepartment || ''}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            disabled={assigneeUpdateLoading}
                          >
                            <MenuItem value="">Seçiniz</MenuItem>
                            <MenuItem value="technical">Teknik Destek</MenuItem>
                            <MenuItem value="billing">Fatura / Ödeme</MenuItem>
                            <MenuItem value="customer">Müşteri Hizmetleri</MenuItem>
                            <MenuItem value="product">Ürün Yönetimi</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={handleAssignToDepartment}
                          disabled={!selectedDepartment || assigneeUpdateLoading}
                          startIcon={assigneeUpdateLoading ? <CircularProgress size={16} /> : <AssignmentIndIcon />}
                        >
                          Departmana Ata
                        </Button>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Atama Sekmesi */}
      {isStaff && (
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Bilet Ataması
            </Typography>
            
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">Atanan Kişi</Typography>
              <Typography variant="body2" mb={2}>
                {ticket.assignedTo || 'Henüz kimseye atanmadı'}
              </Typography>
              
              {!ticket.assignedTo && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Departmana Ata</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <Select
                      value={selectedDepartment || ''}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      disabled={assigneeUpdateLoading}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      <MenuItem value="technical">Teknik Destek</MenuItem>
                      <MenuItem value="billing">Fatura / Ödeme</MenuItem>
                      <MenuItem value="customer">Müşteri Hizmetleri</MenuItem>
                      <MenuItem value="product">Ürün Yönetimi</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={handleAssignToDepartment}
                    disabled={!selectedDepartment || assigneeUpdateLoading}
                    startIcon={assigneeUpdateLoading ? <CircularProgress size={16} /> : <AssignmentIndIcon />}
                  >
                    Departmana Ata
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </TabPanel>
      )}
    </Box>
  );
};

export default TicketDetail; 