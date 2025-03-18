import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  IconButton,
  Tooltip,
  TextField,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  SelectChangeEvent,
  Badge,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  ChatBubble as ChatBubbleIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket, Department, Employee } from '../../models/schema';

const Tickets: React.FC = () => {
  const { userRole } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openTicketDialog, setOpenTicketDialog] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [commentDialogOpen, setCommentDialogOpen] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');

  // Örnek veri - Gerçek uygulamada API'den alınır
  const sampleTickets: Ticket[] = [
    {
      id: '1',
      title: 'Giriş yapamıyorum',
      description: 'Şifremi girmeme rağmen sisteme giriş yapamıyorum. Şifremi sıfırlamayı denedim ama e-posta gelmiyor.',
      status: 'open',
      priority: 'high',
      customerId: 'user-1',
      departmentId: '1',
      assignedToId: '1',
      customerName: 'Ahmet Yılmaz',
      customerEmail: 'ahmet@example.com',
      createdAt: new Date(2023, 1, 15).toISOString(),
      updatedAt: new Date(2023, 1, 16).toISOString(),
      comments: [
        {
          id: '1',
          text: 'Şifre sıfırlama e-postası yeniden gönderildi.',
          createdById: '1',
          createdAt: new Date(2023, 1, 16, 10, 30).toISOString()
        }
      ]
    },
    {
      id: '2',
      title: 'Fatura bilgilerimi güncelleme',
      description: 'Fatura adresimi değiştirmek istiyorum. Yeni adres bilgilerim ekte.',
      status: 'inProgress',
      priority: 'medium',
      customerId: 'user-2',
      departmentId: '3',
      assignedToId: '3',
      customerName: 'Barış Kaya',
      customerEmail: 'baris@example.com',
      createdAt: new Date(2023, 1, 14).toISOString(),
      updatedAt: new Date(2023, 1, 15).toISOString(),
      comments: []
    },
    {
      id: '3',
      title: 'Ürün iade talebi',
      description: 'Satın aldığım XYZ ürünü hasarlı geldi. İade etmek istiyorum.',
      status: 'resolved',
      priority: 'low',
      customerId: 'user-3',
      departmentId: '2',
      assignedToId: '2',
      customerName: 'Zeynep Demir',
      customerEmail: 'zeynep@example.com',
      createdAt: new Date(2023, 1, 10).toISOString(),
      updatedAt: new Date(2023, 1, 14).toISOString(),
      comments: [
        {
          id: '2',
          text: 'İade talebiniz onaylanmıştır. Kargo bilgileri e-posta ile gönderildi.',
          createdById: '2',
          createdAt: new Date(2023, 1, 12, 11, 45).toISOString()
        },
        {
          id: '3',
          text: 'İade işlemi tamamlanmıştır. Ödeme 3-5 iş günü içinde hesabınıza yatırılacaktır.',
          createdById: '2',
          createdAt: new Date(2023, 1, 14, 9, 20).toISOString()
        }
      ]
    },
    {
      id: '4',
      title: 'Sipariş durumu hakkında',
      description: 'Geçen hafta verdiğim siparişin durumunu öğrenmek istiyorum. Hala kargoya verilmedi.',
      status: 'open',
      priority: 'medium',
      customerId: 'user-4',
      departmentId: '2',
      assignedToId: '',
      customerName: 'Mehmet Şahin',
      customerEmail: 'mehmet@example.com',
      createdAt: new Date(2023, 1, 16).toISOString(),
      updatedAt: new Date(2023, 1, 16).toISOString(),
      comments: []
    },
    {
      id: '5',
      title: 'Mobil uygulama hatası',
      description: 'Mobil uygulamada ödeme ekranında hata alıyorum. Ekran görüntüsü ektedir.',
      status: 'inProgress',
      priority: 'high',
      customerId: 'user-5',
      departmentId: '1',
      assignedToId: '1',
      customerName: 'Ayşe Yıldız',
      customerEmail: 'ayse@example.com',
      createdAt: new Date(2023, 1, 12).toISOString(),
      updatedAt: new Date(2023, 1, 13).toISOString(),
      comments: [
        {
          id: '4',
          text: 'Hata raporu teknik ekibe iletildi. İnceleniyor.',
          createdById: '1',
          createdAt: new Date(2023, 1, 13, 14, 15).toISOString()
        }
      ]
    }
  ];

  const sampleDepartments: Department[] = [
    { id: '1', name: 'Teknik Destek', description: 'Teknik sorunlar ve ürün desteği', createdAt: '', updatedAt: '' },
    { id: '2', name: 'Satış', description: 'Siparişler ve ürün bilgileri', createdAt: '', updatedAt: '' },
    { id: '3', name: 'Finans', description: 'Faturalar ve ödemeler', createdAt: '', updatedAt: '' }
  ];

  const sampleEmployees: Employee[] = [
    { id: '1', firstName: 'Ali', lastName: 'Yılmaz', email: 'ali@example.com', departmentId: '1', role: 'agent', permissions: ['reply', 'view'], createdAt: '', updatedAt: '' },
    { id: '2', firstName: 'Seda', lastName: 'Kaya', email: 'seda@example.com', departmentId: '2', role: 'agent', permissions: ['reply', 'view'], createdAt: '', updatedAt: '' },
    { id: '3', firstName: 'Emre', lastName: 'Demir', email: 'emre@example.com', departmentId: '3', role: 'agent', permissions: ['reply', 'view'], createdAt: '', updatedAt: '' },
    { id: '4', firstName: 'Canan', lastName: 'Şahin', email: 'canan@example.com', departmentId: '1', role: 'supervisor', permissions: ['reply', 'view', 'delete', 'assign'], createdAt: '', updatedAt: '' }
  ];

  useEffect(() => {
    // Gerçek uygulamada GraphQL API çağrısı yapılır
    // const fetchTickets = async () => {
    //   try {
    //     const ticketsData = await API.graphql(graphqlOperation(listTickets));
    //     setTickets(ticketsData.data.listTickets.items);
    //   } catch (error) {
    //     console.error('Error fetching tickets:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // Simüle edilmiş veri yükleme
    setLoading(true);
    setTimeout(() => {
      setTickets(sampleTickets);
      setDepartments(sampleDepartments);
      setEmployees(sampleEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleFilterDepartmentChange = (event: SelectChangeEvent) => {
    setFilterDepartment(event.target.value);
    setPage(0);
  };

  const handleFilterPriorityChange = (event: SelectChangeEvent) => {
    setFilterPriority(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenTicketDialog = (ticket: Ticket | null = null) => {
    setSelectedTicket(ticket);
    setOpenTicketDialog(true);
  };

  const handleCloseTicketDialog = () => {
    setOpenTicketDialog(false);
    setSelectedTicket(null);
  };

  const handleOpenDeleteConfirm = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedTicket(null);
  };

  const handleDeleteTicket = () => {
    if (!selectedTicket) return;
    
    // Gerçek uygulamada:
    // await API.graphql(graphqlOperation(deleteTicket, { input: { id: selectedTicket.id } }));
    
    // UI güncelleme
    setTickets(tickets.filter(ticket => ticket.id !== selectedTicket.id));
    handleCloseDeleteConfirm();
  };

  const handleRefresh = () => {
    setLoading(true);
    // Gerçek uygulamada API çağrısı yapılır
    setTimeout(() => {
      setTickets(sampleTickets);
      setLoading(false);
    }, 1000);
  };

  const handleOpenAssignDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedEmployee(ticket.assignedToId || '');
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
  };

  const handleAssign = () => {
    if (!selectedTicket) return;
    
    // Gerçek uygulamada:
    // await API.graphql(graphqlOperation(updateTicket, { 
    //   input: { id: selectedTicket.id, assignedToId: selectedEmployee || null } 
    // }));
    
    // UI güncelleme
    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { ...ticket, assignedToId: selectedEmployee || '' } 
        : ticket
    ));
    
    handleCloseAssignDialog();
  };

  const handleOpenCommentDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCommentText('');
    setCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
  };

  const handleAddComment = () => {
    if (!selectedTicket || !commentText.trim()) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      createdById: 'current-user', // Gerçek uygulamada oturum açmış kullanıcının ID'si
      createdAt: new Date().toISOString()
    };
    
    // Gerçek uygulamada:
    // await API.graphql(graphqlOperation(createComment, { 
    //   input: { ...newComment, ticketId: selectedTicket.id } 
    // }));
    
    // UI güncelleme
    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            comments: [...(ticket.comments || []), newComment],
            updatedAt: new Date().toISOString()
          } 
        : ticket
    ));
    
    handleCloseCommentDialog();
  };

  const handleUpdateStatus = (ticket: Ticket, newStatus: string) => {
    // Gerçek uygulamada:
    // await API.graphql(graphqlOperation(updateTicket, { 
    //   input: { id: ticket.id, status: newStatus } 
    // }));
    
    // UI güncelleme
    setTickets(tickets.map(t => 
      t.id === ticket.id 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } 
        : t
    ));
  };

  // Yardımcı fonksiyonlar
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

  const getPriorityChip = (priority: string) => {
    switch(priority) {
      case 'low':
        return <Chip label="Düşük" color="success" size="small" />;
      case 'medium':
        return <Chip label="Orta" color="warning" size="small" />;
      case 'high':
        return <Chip label="Yüksek" color="error" size="small" />;
      default:
        return <Chip label={priority} size="small" />;
    }
  };

  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return 'Belirtilmemiş';
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Belirtilmemiş';
  };

  const getAssignedEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return 'Atanmamış';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Atanmamış';
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

  // Filtre ve arama fonksiyonları
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (ticket.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || ticket.departmentId === filterDepartment;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority;
  });

  // Sayfalama için
  const paginatedTickets = filteredTickets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Destek Talepleri
        </Typography>
        <Box>
          <Tooltip title="Yenile">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Yeni Destek Talebi">
            <IconButton 
              color="primary" 
              onClick={() => handleOpenTicketDialog()}
              disabled={loading}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filtreler ve arama */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Ara..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Durum"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="open">Açık</MenuItem>
                <MenuItem value="inProgress">İşlemde</MenuItem>
                <MenuItem value="resolved">Çözüldü</MenuItem>
                <MenuItem value="closed">Kapalı</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Departman</InputLabel>
              <Select
                value={filterDepartment}
                onChange={handleFilterDepartmentChange}
                label="Departman"
              >
                <MenuItem value="all">Tümü</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={filterPriority}
                onChange={handleFilterPriorityChange}
                label="Öncelik"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="low">Düşük</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tablo veya Grid görünümü */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredTickets.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Arama kriterlerine uygun destek talebi bulunamadı.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Başlık</TableCell>
                    <TableCell>Müşteri</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Öncelik</TableCell>
                    <TableCell>Departman</TableCell>
                    <TableCell>Atanan</TableCell>
                    <TableCell>Oluşturulma</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>
                        {ticket.title}
                        {ticket.comments && ticket.comments.length > 0 && (
                          <Badge badgeContent={ticket.comments.length} color="primary" sx={{ ml: 1 }}>
                            <ChatBubbleIcon fontSize="small" color="action" />
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{ticket.customerName || 'İsimsiz Müşteri'}</TableCell>
                      <TableCell>{getStatusChip(ticket.status)}</TableCell>
                      <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                      <TableCell>{getDepartmentName(ticket.departmentId)}</TableCell>
                      <TableCell>{getAssignedEmployeeName(ticket.assignedToId)}</TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Yorum Ekle">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenCommentDialog(ticket)}
                          >
                            <ChatBubbleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ata">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenAssignDialog(ticket)}
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {ticket.status !== 'resolved' && (
                          <Tooltip title="Çözüldü olarak işaretle">
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleUpdateStatus(ticket, 'resolved')}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {ticket.status !== 'closed' && (
                          <Tooltip title="Kapat">
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateStatus(ticket, 'closed')}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenTicketDialog(ticket)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteConfirm(ticket)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredTickets.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına talep:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Yeni/Düzenleme Dialog */}
      <Dialog open={openTicketDialog} onClose={handleCloseTicketDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTicket ? 'Destek Talebi Düzenle' : 'Yeni Destek Talebi'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Başlık"
                variant="outlined"
                defaultValue={selectedTicket?.title || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                variant="outlined"
                multiline
                rows={4}
                defaultValue={selectedTicket?.description || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Müşteri Adı"
                variant="outlined"
                defaultValue={selectedTicket?.customerName || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Müşteri E-posta"
                variant="outlined"
                defaultValue={selectedTicket?.customerEmail || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  label="Durum"
                  defaultValue={selectedTicket?.status || 'open'}
                >
                  <MenuItem value="open">Açık</MenuItem>
                  <MenuItem value="inProgress">İşlemde</MenuItem>
                  <MenuItem value="resolved">Çözüldü</MenuItem>
                  <MenuItem value="closed">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  label="Öncelik"
                  defaultValue={selectedTicket?.priority || 'medium'}
                >
                  <MenuItem value="low">Düşük</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="high">Yüksek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  label="Departman"
                  defaultValue={selectedTicket?.departmentId || ''}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Atanan Personel</InputLabel>
                <Select
                  label="Atanan Personel"
                  defaultValue={selectedTicket?.assignedToId || ''}
                >
                  <MenuItem value="">Atanmamış</MenuItem>
                  {employees.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>{`${emp.firstName} ${emp.lastName}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {selectedTicket && selectedTicket.comments && selectedTicket.comments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Yorumlar
                </Typography>
                <List>
                  {selectedTicket.comments.map(comment => {
                    const commentEmployee = employees.find(emp => emp.id === comment.createdById);
                    return (
                      <ListItem key={comment.id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            {commentEmployee ? 
                              `${commentEmployee.firstName.charAt(0)}${commentEmployee.lastName.charAt(0)}` : 
                              'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={comment.text}
                          secondary={`${commentEmployee ? 
                            `${commentEmployee.firstName} ${commentEmployee.lastName}` : 
                            'Kullanıcı'} - ${formatDate(comment.createdAt)}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTicketDialog}>İptal</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCloseTicketDialog}
          >
            {selectedTicket ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme onay dialogu */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Destek Talebini Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTicket?.title} başlıklı destek talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>İptal</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteTicket}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Atama dialogu */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog}>
        <DialogTitle>Destek Talebini Ata</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTicket?.title} başlıklı destek talebini hangi personele atamak istiyorsunuz?
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Personel</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              label="Personel"
            >
              <MenuItem value="">Atanmamış</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>{`${emp.firstName} ${emp.lastName}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>İptal</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAssign}
          >
            Ata
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yorum ekleme dialogu */}
      <Dialog open={commentDialogOpen} onClose={handleCloseCommentDialog}>
        <DialogTitle>Yorum Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTicket?.title} başlıklı destek talebine bir yorum ekleyin.
          </DialogContentText>
          <TextField
            fullWidth
            label="Yorum"
            variant="outlined"
            multiline
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>İptal</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddComment}
            disabled={!commentText.trim()}
          >
            Yorum Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tickets;