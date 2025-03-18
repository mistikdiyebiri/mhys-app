import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon,
  Message as MessageIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Notifications as NotificationsIcon,
  Article as ArticleIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ReceiptLong as ReceiptLongIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket, TicketMessage } from '../../models/schema';

const CustomerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Örnek veriler
  const mockTickets: Ticket[] = [
    {
      id: '1',
      title: 'Ürün iade talebi',
      description: 'Satın aldığım ürün hasarlı geldi. İade etmek istiyorum.',
      status: 'inProgress',
      priority: 'medium',
      customerId: 'user-1',
      departmentId: '2',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: 'm1',
          ticketId: '1',
          content: 'Satın aldığım ürün hasarlı geldi. İade etmek istiyorum.',
          senderId: 'user-1',
          senderType: 'customer',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm2',
          ticketId: '1',
          content: 'Merhaba, talebiniz iletilmiştir. Lütfen ürünün fotoğrafını paylaşabilir misiniz?',
          senderId: 'emp-1',
          senderType: 'employee',
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm3',
          ticketId: '1',
          content: 'Ürünün fotoğrafını ekledim, paket açılırken bile hasarlı olduğu görülebiliyor.',
          senderId: 'user-1',
          senderType: 'customer',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm4',
          ticketId: '1',
          content: 'Teşekkürler. İade kodunuz: IAD12345. Kargo şirketimiz 2 iş günü içinde sizinle iletişime geçecektir.',
          senderId: 'emp-1',
          senderType: 'employee',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '2',
      title: 'Sipariş durumu hakkında',
      description: 'Geçen hafta verdiğim sipariş hala gelmedi, ne zaman gelecek?',
      status: 'open',
      priority: 'high',
      customerId: 'user-1',
      departmentId: '2',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: 'm5',
          ticketId: '2',
          content: 'Geçen hafta verdiğim sipariş hala gelmedi, ne zaman gelecek?',
          senderId: 'user-1',
          senderType: 'customer',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '3',
      title: 'Faturamda hata var',
      description: 'Son faturamda yanlış adres bilgisi görünüyor, düzeltilmesi mümkün mü?',
      status: 'resolved',
      priority: 'low',
      customerId: 'user-1',
      departmentId: '3',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: 'm6',
          ticketId: '3',
          content: 'Son faturamda yanlış adres bilgisi görünüyor, düzeltilmesi mümkün mü?',
          senderId: 'user-1',
          senderType: 'customer',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm7',
          ticketId: '3',
          content: 'Merhaba, adres bilgilerinizi güncelledik. Bir sonraki faturanız doğru adresle gelecektir.',
          senderId: 'emp-3',
          senderType: 'employee',
          createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm8',
          ticketId: '3',
          content: 'Teşekkür ederim!',
          senderId: 'user-1',
          senderType: 'customer',
          createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm9',
          ticketId: '3',
          content: 'Rica ederiz, başka bir sorunuz olursa yardımcı olmaktan memnuniyet duyarız.',
          senderId: 'emp-3',
          senderType: 'employee',
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];
  
  useEffect(() => {
    // Gerçek uygulamada API çağrısı yapılır
    // const fetchTickets = async () => {
    //   try {
    //     const ticketsData = await API.graphql(
    //       graphqlOperation(listTickets, {
    //         filter: { customerId: { eq: currentUser.id } }
    //       })
    //     );
    //     setTickets(ticketsData.data.listTickets.items);
    //   } catch (error) {
    //     console.error('Error fetching tickets', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchTickets();
    
    // Mock veri kullanıyoruz
    setTimeout(() => {
      setTickets(mockTickets);
      if (mockTickets.length > 0) {
        setSelectedTicket(mockTickets[0]);
      }
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };
  
  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    setSendingMessage(true);
    
    const newTicketMessage: TicketMessage = {
      id: `m-${Date.now()}`,
      ticketId: selectedTicket.id,
      content: newMessage,
      senderId: currentUser?.id || 'user-1', // Gerçek uygulamada oturum açmış kullanıcının ID'si
      senderType: 'customer',
      createdAt: new Date().toISOString()
    };
    
    // Gerçek uygulamada: API çağrısı
    // await API.graphql(
    //   graphqlOperation(createTicketMessage, { input: newTicketMessage })
    // );
    
    // Mock güncelleme
    const updatedTicket = {
      ...selectedTicket,
      messages: [...(selectedTicket.messages || []), newTicketMessage],
      updatedAt: new Date().toISOString()
    };
    
    setTickets(
      tickets.map(ticket => 
        ticket.id === selectedTicket.id ? updatedTicket : ticket
      )
    );
    setSelectedTicket(updatedTicket);
    setNewMessage('');
    setSendingMessage(false);
  };
  
  const handleCreateNewTicket = () => {
    // Yeni talep oluşturma sayfasına yönlendirme
    // history.push('/customer/tickets/new');
    console.log('Yeni talep oluştur');
  };
  
  const getStatusChip = (status: string) => {
    switch(status) {
      case 'open':
        return <Chip label="Açık" color="info" size="small" />;
      case 'inProgress':
        return <Chip label="İşlemde" color="warning" size="small" />;
      case 'resolved':
        return <Chip label="Çözüldü" color="success" size="small" />;
      case 'closed':
        return <Chip label="Kapalı" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Birkaç dakika önce' 
        : `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 
        ? 'Dün' 
        : `${diffInDays} gün önce`;
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Müşteri Paneli
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hoş Geldiniz, {currentUser?.firstName || 'Değerli Müşterimiz'}!
            </Typography>
            <Typography variant="body1">
              Destek taleplerinizi bu panelden yönetebilir, yeni talepler oluşturabilir ve mevcut taleplerinizin durumunu takip edebilirsiniz.
            </Typography>
          </Paper>
        </Grid>
        
        {/* İstatistikler */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <QuestionAnswerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {tickets.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Toplam Talep
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <MessageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {tickets.filter(t => t.status === 'open' || t.status === 'inProgress').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Aktif Talepler
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <InfoIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Çözülmüş Talepler
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Ana İçerik */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Taleplerim</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="contained" 
                color="primary"
                onClick={handleCreateNewTicket}
              >
                Yeni Talep
              </Button>
            </Box>
            <Divider />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : tickets.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  Henüz oluşturulmuş talebiniz bulunmamaktadır.
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  variant="contained" 
                  color="primary"
                  onClick={handleCreateNewTicket}
                  sx={{ mt: 2 }}
                >
                  İlk Talebinizi Oluşturun
                </Button>
              </Box>
            ) : (
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {tickets.map((ticket) => (
                  <ListItem
                    key={ticket.id}
                    disablePadding
                    sx={{ 
                      borderLeft: 3, 
                      borderColor: selectedTicket?.id === ticket.id ? 'primary.main' : 'transparent'
                    }}
                  >
                    <ListItemButton
                      selected={selectedTicket?.id === ticket.id}
                      onClick={() => handleTicketSelect(ticket)}
                      sx={{
                        bgcolor: selectedTicket?.id === ticket.id ? 'action.selected' : 'transparent'
                      }}
                    >
                      <ListItemIcon>
                        {ticket.status === 'resolved' || ticket.status === 'closed' ? 
                          <ReceiptLongIcon color="success" /> : 
                          <ArticleIcon color="primary" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={ticket.title}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {getStatusChip(ticket.status)}
                            </Typography>
                            {` • ${getRelativeTime(ticket.updatedAt)}`}
                          </React.Fragment>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedTicket ? (
              <React.Fragment>
                {/* Seçilen Talep Başlığı */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {selectedTicket.title}
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 1, color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Durum: {getStatusChip(selectedTicket.status)}
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Öncelik: {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                    </Typography>
                    <Typography variant="body2">
                      Oluşturulma: {formatDate(selectedTicket.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Mesajlar */}
                <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', maxHeight: 400 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Talep Açıklaması:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedTicket.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Mesajlar:
                  </Typography>
                  
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.senderType === 'customer' ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            bgcolor: message.senderType === 'customer' ? 'primary.lighter' : 'grey.100'
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(message.createdAt)} • {message.senderType === 'customer' ? 'Siz' : 'Destek Ekibi'}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  ) : (
                    <Typography color="textSecondary" align="center">
                      Henüz mesaj yok
                    </Typography>
                  )}
                </Box>
                
                {/* Mesaj Gönderme */}
                {(selectedTicket.status === 'open' || selectedTicket.status === 'inProgress') && (
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Mesajınızı yazın..."
                      value={newMessage}
                      onChange={handleNewMessageChange}
                      size="small"
                    />
                    <IconButton 
                      color="primary" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      sx={{ ml: 1 }}
                    >
                      {sendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
                    </IconButton>
                  </Box>
                )}
                
                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.100' }}>
                    <Typography align="center" color="textSecondary">
                      Bu talep {selectedTicket.status === 'resolved' ? 'çözülmüş' : 'kapatılmış'} durumda. 
                      {selectedTicket.status === 'resolved' && ' Eğer sorununuz devam ediyorsa, lütfen yeni bir talep oluşturun.'}
                    </Typography>
                  </Box>
                )}
              </React.Fragment>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                <QuestionAnswerIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">
                  Mesajlaşmak için bir talep seçin
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  veya yeni bir talep oluşturun
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;
