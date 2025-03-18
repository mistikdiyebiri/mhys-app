import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer
} from '@mui/material';
import {
  Add as AddIcon,
  Inbox as InboxIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import TicketList from '../../components/ticket/TicketList';
import TicketDetail from '../../components/ticket/TicketDetail';
import CreateTicketForm from '../../components/ticket/CreateTicketForm';
import ticketService from '../../services/TicketService';
import { Ticket, TicketStatus } from '../../models/Ticket';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CustomerDashboard: React.FC = () => {
  const { user, currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const userId = currentUser?.username || '';
  
  // Biletleri yükle
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const ticketData = await ticketService.getUserTickets(userId);
        setTickets(ticketData);
      } catch (error) {
        console.error('Biletler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadTickets();
    }
  }, [userId]);

  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedTicketId(null);
    setShowNewTicketForm(false);
  };

  // Bilet seçimi
  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowNewTicketForm(false);
  };

  // Yeni bilet oluştur
  const handleNewTicket = () => {
    setShowNewTicketForm(true);
    setSelectedTicketId(null);
  };

  // Bilet oluşturma başarılı
  const handleTicketCreateSuccess = () => {
    // Biletleri yeniden yükle
    const loadTickets = async () => {
      try {
        const ticketData = await ticketService.getUserTickets(userId);
        setTickets(ticketData);
      } catch (error) {
        console.error('Biletler yüklenirken hata oluştu:', error);
      }
    };
    
    loadTickets();
    
    // Form görünümünü kapat
    setTimeout(() => {
      setShowNewTicketForm(false);
    }, 2000);
  };

  // Drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Bildirimleri kontrol et
  const getActiveTicketCount = () => {
    return tickets.filter(ticket => 
      ticket.status !== TicketStatus.CLOSED && 
      ticket.status !== TicketStatus.RESOLVED
    ).length;
  };

  // Waiting-customer durumundaki biletleri kontrol et
  const getWaitingResponseCount = () => {
    return tickets.filter(ticket => ticket.status === TicketStatus.WAITING_CUSTOMER).length;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Mobil Menü */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, py: 1 }}>
        <Container>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <IconButton onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Müşteri Paneli</Typography>
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Box>
        </Container>
        
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
        >
          <Box sx={{ width: 250 }} role="presentation">
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Menü</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setTabValue(0); toggleDrawer(); }}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Tüm Biletler" />
            </MenuItem>
            <MenuItem onClick={() => { handleNewTicket(); toggleDrawer(); }}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Yeni Destek Talebi" />
            </MenuItem>
          </Box>
        </Drawer>
      </Box>
      
      <Container>
        {/* Dashboard Özeti */}
        <Box sx={{ mt: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Aktif Destek Talepleri
                  </Typography>
                  <Typography variant="h4">
                    {getActiveTicketCount()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Yanıt Bekleyen Talepler
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {getWaitingResponseCount()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Toplam Destek Talebi
                  </Typography>
                  <Typography variant="h4">
                    {tickets.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Ana İçerik */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="müşteri dashboard tabları">
            <Tab label="Tüm Biletler" {...a11yProps(0)} />
          </Tabs>
          
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewTicket}
              sx={{ mr: 2 }}
            >
              Yeni Destek Talebi
            </Button>
          </Box>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Paper>
            {selectedTicketId ? (
              <TicketDetail
                ticketId={selectedTicketId}
                userId={userId}
                userRole="customer"
                onClose={() => setSelectedTicketId(null)}
              />
            ) : showNewTicketForm ? (
              <CreateTicketForm
                userId={userId}
                onSuccess={handleTicketCreateSuccess}
                onCancel={() => setShowNewTicketForm(false)}
              />
            ) : (
              <TicketList
                userId={userId}
                isCustomerView={true}
                onTicketSelect={handleTicketSelect}
              />
            )}
          </Paper>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default CustomerDashboard;
