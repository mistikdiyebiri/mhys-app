import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Badge,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Drawer
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  ErrorOutline as ErrorOutlineIcon,
  LowPriority as LowPriorityIcon,
  PriorityHigh as PriorityHighIcon,
  Reply as ReplyIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  DeleteOutline as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/TicketService';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../models/Ticket';
import { format } from 'date-fns';
import TicketDetail from './TicketDetail';
import { useAuth } from '../../contexts/AuthContext';

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
      id={`ticket-tabpanel-${index}`}
      aria-labelledby={`ticket-tab-${index}`}
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

// Bilet durumu etiket renklerini ve ikonlarını belirle
const getStatusChipProps = (status: TicketStatus) => {
  switch(status) {
    case TicketStatus.OPEN:
      return { 
        color: 'error' as const, 
        label: 'Açık',
        icon: <ErrorOutlineIcon fontSize="small" />
      };
    case TicketStatus.IN_PROGRESS:
      return { 
        color: 'warning' as const, 
        label: 'İşleniyor',
        icon: <PendingIcon fontSize="small" />
      };
    case TicketStatus.RESOLVED:
      return { 
        color: 'success' as const, 
        label: 'Çözüldü',
        icon: <CheckIcon fontSize="small" />
      };
    case TicketStatus.CLOSED:
      return { 
        color: 'default' as const, 
        label: 'Kapatıldı',
        icon: <CheckIcon fontSize="small" />
      };
    case TicketStatus.WAITING_CUSTOMER:
      return { 
        color: 'info' as const, 
        label: 'Yanıt Bekleniyor',
        icon: <PendingIcon fontSize="small" />
      };
    default:
      return { 
        color: 'default' as const, 
        label: 'Bilinmiyor',
        icon: undefined
      };
  }
};

// Bilet öncelik etiket renklerini ve ikonlarını belirle
const getPriorityChipProps = (priority: TicketPriority) => {
  switch(priority) {
    case TicketPriority.LOW:
      return { 
        color: 'success' as const, 
        label: 'Düşük',
        icon: <LowPriorityIcon fontSize="small" />
      };
    case TicketPriority.MEDIUM:
      return { 
        color: 'info' as const, 
        label: 'Orta',
        icon: undefined
      };
    case TicketPriority.HIGH:
      return { 
        color: 'warning' as const, 
        label: 'Yüksek',
        icon: <PriorityHighIcon fontSize="small" />
      };
    case TicketPriority.URGENT:
      return { 
        color: 'error' as const, 
        label: 'Acil',
        icon: <PriorityHighIcon fontSize="small" />
      };
    default:
      return { 
        color: 'default' as const, 
        label: 'Bilinmiyor',
        icon: undefined
      };
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

interface TicketListProps {
  userId?: string;
  isCustomerView?: boolean;
  onTicketSelect?: (ticketId: string) => void;
  showFilters?: boolean;
  limitRows?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ 
  userId,
  isCustomerView = false,
  onTicketSelect,
  showFilters = true,
  limitRows = false
}) => {
  const theme = useTheme();
  const { userRole } = useAuth();
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const navigate = useNavigate();

  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // Tab değiştiğinde sayfayı sıfırla
  };

  // Biletleri yükle
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        let ticketData: Ticket[];
        
        if (userId && isCustomerView) {
          // Müşteri sadece kendi biletlerini görür
          ticketData = await ticketService.getUserTickets(userId);
        } else {
          // Personel/Admin tüm biletleri görür
          ticketData = await ticketService.getTickets();
        }
        
        setAllTickets(ticketData);
        setFilteredTickets(ticketData);
      } catch (error) {
        console.error('Biletler yüklenirken hata oluştu:', error);
        showNotification('Destek talepleri yüklenirken bir hata oluştu.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadTickets();
  }, [userId, isCustomerView]);

  // Filtreleme işlemi
  useEffect(() => {
    const applyFilters = () => {
      try {
        let filtered = [...allTickets];
        
        // Metin araması
        if (searchText.trim()) {
          const searchLower = searchText.toLowerCase();
          filtered = filtered.filter(ticket => 
            ticket.title.toLowerCase().includes(searchLower) ||
            ticket.description.toLowerCase().includes(searchLower) ||
            ticket.id.toLowerCase().includes(searchLower) ||
            (ticket.createdBy && ticket.createdBy.toLowerCase().includes(searchLower))
          );
        }
        
        // Durum filtresi
        if (statusFilter !== 'all') {
          filtered = filtered.filter(ticket => ticket.status === statusFilter);
        }
        
        // Öncelik filtresi
        if (priorityFilter !== 'all') {
          filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
        }
        
        // Kategori filtresi
        if (categoryFilter !== 'all') {
          filtered = filtered.filter(ticket => ticket.category === categoryFilter);
        }
        
        // Tab filtrelemesi
        if (tabValue === 1) { // Aktif talepler
          filtered = filtered.filter(ticket => 
            ticket.status === TicketStatus.OPEN || 
            ticket.status === TicketStatus.IN_PROGRESS ||
            ticket.status === TicketStatus.WAITING_CUSTOMER
          );
        } else if (tabValue === 2) { // Tamamlanan talepler
          filtered = filtered.filter(ticket => 
            ticket.status === TicketStatus.RESOLVED || 
            ticket.status === TicketStatus.CLOSED
          );
        } else if (tabValue === 3) { // Acil talepler
          filtered = filtered.filter(ticket => 
            ticket.priority === TicketPriority.URGENT || 
            ticket.priority === TicketPriority.HIGH
          );
        }
        
        setFilteredTickets(filtered);
      } catch (error) {
        console.error('Biletler filtrelenirken hata oluştu:', error);
      }
    };
    
    applyFilters();
  }, [allTickets, searchText, statusFilter, priorityFilter, categoryFilter, tabValue]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicket(ticketId);
    if (onTicketSelect) {
      onTicketSelect(ticketId);
    } else if (isCustomerView) {
      // Müşteri görünümünde sayfada göster
      navigate(`/tickets/${ticketId}`);
    } else {
      // Personel/Admin görünümünde drawer'da göster
      setIsDrawerOpen(true);
      console.log("Drawer açılıyor", ticketId); // Debug için log
    }
  };
  
  const handleCloseDetail = () => {
    setSelectedTicket(null);
    setIsDrawerOpen(false);
    console.log("Drawer kapatılıyor"); // Debug için log
  };
  
  const handleRefresh = () => {
    setLoading(true);
    setAllTickets([]);
    setFilteredTickets([]);
    
    // Biletleri yeniden yükle
    setTimeout(async () => {
      try {
        let ticketData: Ticket[];
        
        if (userId && isCustomerView) {
          ticketData = await ticketService.getUserTickets(userId);
        } else {
          ticketData = await ticketService.getTickets();
        }
        
        setAllTickets(ticketData);
        setFilteredTickets(ticketData);
      } catch (error) {
        console.error('Biletler yeniden yüklenirken hata oluştu:', error);
        showNotification('Destek talepleri yeniden yüklenirken bir hata oluştu.', 'error');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // Sayfalama işlemi
  const paginatedTickets = filteredTickets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Farklı tipteki bilet sayıları
  const activeTickets = allTickets.filter(ticket => 
    ticket.status === TicketStatus.OPEN || 
    ticket.status === TicketStatus.IN_PROGRESS ||
    ticket.status === TicketStatus.WAITING_CUSTOMER
  ).length;
  
  const completedTickets = allTickets.filter(ticket => 
    ticket.status === TicketStatus.RESOLVED || 
    ticket.status === TicketStatus.CLOSED
  ).length;
  
  const urgentTickets = allTickets.filter(ticket => 
    ticket.priority === TicketPriority.URGENT || 
    ticket.priority === TicketPriority.HIGH
  ).length;
  
  // Tablonun satır stilini ayarla
  const getRowStyle = (ticket: Ticket) => {
    // Acil talepler için arka plan rengi
    if (ticket.priority === TicketPriority.URGENT) {
      return {
        backgroundColor: alpha(theme.palette.error.main, 0.08),
        '&:hover': {
          backgroundColor: alpha(theme.palette.error.main, 0.15),
        }
      };
    }
    
    // Yüksek öncelikli talepler için arka plan rengi
    if (ticket.priority === TicketPriority.HIGH) {
      return {
        backgroundColor: alpha(theme.palette.warning.main, 0.08),
        '&:hover': {
          backgroundColor: alpha(theme.palette.warning.main, 0.15),
        }
      };
    }
    
    // Bekleyen yanıt durumundaki talepler için arka plan rengi
    if (ticket.status === TicketStatus.WAITING_CUSTOMER) {
      return {
        backgroundColor: alpha(theme.palette.info.main, 0.08),
        '&:hover': {
          backgroundColor: alpha(theme.palette.info.main, 0.15),
        }
      };
    }
    
    return {};
  };

  // Bildirim göster
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Bildirim kapat
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Tüm talepleri temizle
  const handleClearAllTickets = async () => {
    try {
      setLoading(true);
      const cleared = await ticketService.clearAllTickets();
      if (cleared) {
        setAllTickets([]);
        setFilteredTickets([]);
        setClearConfirmOpen(false);
        showNotification('Tüm destek talepleri başarıyla temizlendi.', 'success');
      } else {
        showNotification('Destek talepleri temizlenemedi.', 'error');
      }
    } catch (error) {
      console.error('Talepleri temizlerken hata oluştu:', error);
      showNotification('Talepleri temizlerken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Destek Talepleri</Typography>
        <Tooltip title="Yenile">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Sekmeler */}
      <Box mb={2}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="ticket tabs"
        >
          <Tab 
            label={`Tümü (${allTickets.length})`} 
            id="ticket-tab-0" 
            aria-controls="ticket-tabpanel-0" 
          />
          <Tab 
            label={`Aktif (${activeTickets})`} 
            id="ticket-tab-1" 
            aria-controls="ticket-tabpanel-1" 
          />
          <Tab 
            label={`Tamamlanan (${completedTickets})`}
            id="ticket-tab-2" 
            aria-controls="ticket-tabpanel-2" 
          />
          <Tab 
            label={`Acil (${urgentTickets})`}
            id="ticket-tab-3" 
            aria-controls="ticket-tabpanel-3" 
          />
        </Tabs>
      </Box>
      
      <Box mb={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            variant="outlined"
            placeholder="Bilet ara..."
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            size="small"
          />
          
          <FormControl variant="outlined" sx={{ minWidth: 150 }} size="small">
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Durum"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value={TicketStatus.OPEN}>Açık</MenuItem>
              <MenuItem value={TicketStatus.IN_PROGRESS}>İşleniyor</MenuItem>
              <MenuItem value={TicketStatus.WAITING_CUSTOMER}>Yanıt Bekleniyor</MenuItem>
              <MenuItem value={TicketStatus.RESOLVED}>Çözüldü</MenuItem>
              <MenuItem value={TicketStatus.CLOSED}>Kapatıldı</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" sx={{ minWidth: 150 }} size="small">
            <InputLabel>Öncelik</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Öncelik"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value={TicketPriority.LOW}>Düşük</MenuItem>
              <MenuItem value={TicketPriority.MEDIUM}>Orta</MenuItem>
              <MenuItem value={TicketPriority.HIGH}>Yüksek</MenuItem>
              <MenuItem value={TicketPriority.URGENT}>Acil</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" sx={{ minWidth: 150 }} size="small">
            <InputLabel>Kategori</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Kategori"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value={TicketCategory.TECHNICAL}>Teknik</MenuItem>
              <MenuItem value={TicketCategory.ACCOUNT}>Hesap</MenuItem>
              <MenuItem value={TicketCategory.BILLING}>Fatura</MenuItem>
              <MenuItem value={TicketCategory.GENERAL}>Genel</MenuItem>
              <MenuItem value={TicketCategory.FEATURE_REQUEST}>Özellik Talebi</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {showFilters && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            {!isCustomerView && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setClearConfirmOpen(true)}
                startIcon={<DeleteIcon />}
                disabled={loading}
              >
                Tüm Talepleri Temizle
              </Button>
            )}
          </Box>
          
          {!isCustomerView && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setClearConfirmOpen(true)}
              startIcon={<DeleteIcon />}
              disabled={loading}
            >
              Tüm Talepleri Temizle
            </Button>
          )}
        </Box>
      )}
      
      <TabPanel value={tabValue} index={0}>
        <TableContent 
          tickets={paginatedTickets} 
          loading={loading} 
          isCustomerView={isCustomerView} 
          onTicketClick={handleTicketClick}
          getRowStyle={getRowStyle}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TableContent 
          tickets={paginatedTickets} 
          loading={loading} 
          isCustomerView={isCustomerView} 
          onTicketClick={handleTicketClick}
          getRowStyle={getRowStyle}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <TableContent 
          tickets={paginatedTickets} 
          loading={loading} 
          isCustomerView={isCustomerView} 
          onTicketClick={handleTicketClick}
          getRowStyle={getRowStyle}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <TableContent 
          tickets={paginatedTickets} 
          loading={loading} 
          isCustomerView={isCustomerView} 
          onTicketClick={handleTicketClick}
          getRowStyle={getRowStyle}
        />
      </TabPanel>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredTickets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına satır:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} / ${count}`
        }
      />
      
      {/* Temizleme onay dialog'u */}
      <Dialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
      >
        <DialogTitle>Tüm Destek Taleplerini Temizle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu işlem tüm destek taleplerini ve yanıtları kalıcı olarak silecektir. Bu işlem geri alınamaz.
            Devam etmek istediğinize emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearConfirmOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleClearAllTickets} color="error" variant="contained">
            Tümünü Temizle
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sağ kenardan açılan bilet detay paneli */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDetail}
        sx={{
          width: 680,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 680,
            boxSizing: 'border-box',
            padding: 2
          },
        }}
      >
        {selectedTicket && (
          <TicketDetail 
            ticketId={selectedTicket} 
            userId={userId || ''} 
            userRole={(userRole as 'admin' | 'employee' | 'customer') || 'employee'} 
            onClose={handleCloseDetail} 
          />
        )}
      </Drawer>
      
      {/* Bildirim */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Tablo içeriği bileşeni
interface TableContentProps {
  tickets: Ticket[];
  loading: boolean;
  isCustomerView: boolean;
  onTicketClick: (id: string) => void;
  getRowStyle: (ticket: Ticket) => object;
}

const TableContent: React.FC<TableContentProps> = ({ 
  tickets, 
  loading, 
  isCustomerView, 
  onTicketClick,
  getRowStyle
}) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Başlık</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Öncelik</TableCell>
            <TableCell>Kategori</TableCell>
            {!isCustomerView && <TableCell>Oluşturan</TableCell>}
            <TableCell>Oluşturulma Tarihi</TableCell>
            {!isCustomerView && <TableCell>Atanan</TableCell>}
            <TableCell>İşlem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={isCustomerView ? 7 : 9} align="center">
                <Typography>Yükleniyor...</Typography>
              </TableCell>
            </TableRow>
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isCustomerView ? 7 : 9} align="center">
                <Typography>Bilet bulunamadı.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow 
                key={ticket.id} 
                hover 
                onClick={() => onTicketClick(ticket.id)}
                sx={{ 
                  cursor: 'pointer',
                  ...getRowStyle(ticket)
                }}
              >
                <TableCell>#{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <Chip 
                    {...(getStatusChipProps(ticket.status).icon ? { icon: getStatusChipProps(ticket.status).icon } : {})}
                    label={getStatusChipProps(ticket.status).label}
                    color={getStatusChipProps(ticket.status).color}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    {...(getPriorityChipProps(ticket.priority).icon ? { icon: getPriorityChipProps(ticket.priority).icon } : {})}
                    label={getPriorityChipProps(ticket.priority).label}
                    color={getPriorityChipProps(ticket.priority).color}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getCategoryLabel(ticket.category)}</TableCell>
                {!isCustomerView && (
                  <TableCell>{ticket.createdBy}</TableCell>
                )}
                <TableCell>
                  {format(new Date(ticket.createdAt), 'dd.MM.yyyy HH:mm')}
                </TableCell>
                {!isCustomerView && (
                  <TableCell>
                    {ticket.assignedTo || '-'}
                  </TableCell>
                )}
                <TableCell>
                  <Tooltip title="Yanıtla">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTicketClick(ticket.id);
                      }}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TicketList; 