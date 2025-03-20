import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, TicketComment, TicketStatus, TicketPriority } from '../../models/Ticket';
import TicketService from '../../services/TicketService';

interface TicketDetailProps {
  // Eğer prop almıyorsa bu interface boş kalabilir
}

const TicketDetail: React.FC<TicketDetailProps> = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  
  // Ticket verilerini yükle
  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId) return;
      
      try {
        setLoading(true);
        
        // TypeScript hatalarını önlemek için any tipi kullanıyoruz
        const ticketServiceInstance = (TicketService as any).getInstance?.();
        
        if (!ticketServiceInstance) {
          console.error('TicketService instance bulunamadı');
          setLoading(false);
          return;
        }
        
        const ticketData = await ticketServiceInstance.getTicketById(ticketId);
        if (ticketData) {
          setTicket(ticketData);
          
          // Yorumları da yükle
          const commentsData = await ticketServiceInstance.getTicketComments(ticketId);
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Ticket verileri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketData();
  }, [ticketId]);

  // Yorumu gönder
  const handleSendReply = async () => {
    if (!ticketId || !replyText.trim()) return;
    
    try {
      // TypeScript hatalarını önlemek için any tipi kullanıyoruz
      const ticketServiceInstance = (TicketService as any).getInstance?.();
      
      if (!ticketServiceInstance) {
        console.error('TicketService instance bulunamadı');
        return;
      }
      
      // Yeni yorumu ekle
      const employeeId = 'current-employee-id'; // Gerçek implementasyonda mevcut kullanıcı ID'sini alırsınız
      await ticketServiceInstance.addComment(ticketId, employeeId, replyText, false);
      
      // Yorumları yeniden yükle
      const updatedComments = await ticketServiceInstance.getTicketComments(ticketId);
      setComments(updatedComments);
      
      // Form alanını temizle
      setReplyText('');
    } catch (error) {
      console.error('Yanıt gönderilirken hata oluştu:', error);
    }
  };

  // Geri dön butonu
  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box>
        <Typography variant="h5" color="error">Ticket bulunamadı</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Ticket #{ticket.id}</Typography>
      </Box>
      
      {/* Ticket Detayları */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={ticket.title}
          subheader={`Oluşturulma: ${new Date(ticket.createdAt).toLocaleDateString()} - ${ticket.status}`}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="body1">{ticket.description}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ '& > div': { mb: 1 } }}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Oluşturan: {ticket.createdBy}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <AccessTimeIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Son Güncelleme: {new Date(ticket.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <AssignmentIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Atanan: {ticket.assignedTo || 'Atanmamış'}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`Öncelik: ${ticket.priority}`} 
                    color={ticket.priority === TicketPriority.HIGH ? 'error' : 
                          ticket.priority === TicketPriority.MEDIUM ? 'warning' : 'default'} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={`Durum: ${ticket.status}`} 
                    color={ticket.status === TicketStatus.OPEN ? 'info' : 
                          ticket.status === TicketStatus.RESOLVED ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Yorumlar */}
      <Box mt={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>Yanıtlar</Typography>
        
        {comments.length === 0 ? (
          <Typography variant="body2" color="textSecondary">Henüz yanıt bulunmuyor.</Typography>
        ) : (
          comments.map(comment => (
            <Card key={comment.id} variant="outlined" sx={{ mb: 2 }}>
              <CardHeader 
                title={comment.isEmployee ? 'Personel Yanıtı' : 'Müşteri Yanıtı'}
                subheader={`${new Date(comment.createdAt).toLocaleDateString()} - ${comment.createdBy}`}
                avatar={comment.isEmployee ? <PersonIcon color="primary" /> : <PersonIcon />}
              />
              <Divider />
              <CardContent>
                <Typography variant="body1">
                  {comment.text || comment.content}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
      
      {/* Yanıt formu */}
      <Box mt={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>Yanıt Ekle</Typography>
        <Card variant="outlined">
          <CardContent>
            <TextField 
              fullWidth
              multiline
              rows={4}
              label="Yanıtınız"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendReply}
                disabled={!replyText.trim()}
              >
                Yanıt Gönder
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TicketDetail; 