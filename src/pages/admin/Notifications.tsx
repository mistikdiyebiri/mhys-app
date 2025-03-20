import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  CircularProgress,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
  SelectChangeEvent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Person as PersonIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import {
  Notification,
  NotificationFormData,
  NotificationPriority,
  NotificationPriorityColors,
  NotificationPriorityTitles,
  NotificationStatus,
  NotificationStatusTitles,
  NotificationTargetType,
  NotificationTargetTitles
} from '../../models/Notification';
import * as NotificationService from '../../services/NotificationService';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Sekmeler için panel bileşeni
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
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

// Ana bileşen
const Notifications: React.FC = () => {
  const theme = useTheme();
  const { getUserAttributes } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    content: '',
    priority: NotificationPriority.MEDIUM,
    targetType: NotificationTargetType.ALL_EMPLOYEES,
    targetIds: [],
    expiresAt: undefined
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [status, setStatus] = useState<NotificationStatus | 'ALL'>(NotificationStatus.ACTIVE);
  const [expireDate, setExpireDate] = useState<Date | null>(null);

  // Örnek departman ve personel verileri (gerçek uygulamada API'den gelecek)
  const departments = [
    { id: 'dep1', name: 'Teknik Destek' },
    { id: 'dep2', name: 'Satış' },
    { id: 'dep3', name: 'Finans' },
    { id: 'dep4', name: 'İnsan Kaynakları' }
  ];

  const employees = [
    { id: 'user1', name: 'Ahmet Yılmaz', department: 'dep1' },
    { id: 'user2', name: 'Ayşe Demir', department: 'dep2' },
    { id: 'user3', name: 'Mehmet Kaya', department: 'dep1' },
    { id: 'user4', name: 'Fatma Şahin', department: 'dep3' },
    { id: 'user5', name: 'Ali Can', department: 'dep4' }
  ];

  // Sekme değişikliği
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Bildirimleri yükle
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await NotificationService.getNotifications(
        status, 
        page + 1, 
        rowsPerPage
      );
      
      if (response.success) {
        setNotifications(response.notifications);
        setTotalNotifications(response.total);
      } else {
        showSnackbar('Bildirimler yüklenirken bir hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Bildirimler getirilirken hata:', error);
      showSnackbar('Bildirimler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ve filtreler değiştiğinde bildirimleri getir
  useEffect(() => {
    fetchNotifications();
  }, [page, rowsPerPage, status]);

  // Form alanı değişiklik işleyicisi
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | SelectChangeEvent<any>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Hata varsa temizle
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Departman seçim değişikliği
  const handleDepartmentChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedDepartments(value);
    setFormData(prev => ({ ...prev, targetIds: value }));
  };

  // Personel seçim değişikliği
  const handleEmployeeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedEmployees(value);
    setFormData(prev => ({ ...prev, targetIds: value }));
  };

  // Son kullanma tarihi değişikliği
  const handleExpireDateChange = (date: Date | null) => {
    setExpireDate(date);
    setFormData(prev => ({
      ...prev,
      expiresAt: date ? date.toISOString() : undefined
    }));
  };

  // Hedef tipi değişikliği
  const handleTargetTypeChange = (event: SelectChangeEvent<NotificationTargetType>) => {
    const value = event.target.value as NotificationTargetType;
    setFormData(prev => ({
      ...prev,
      targetType: value,
      targetIds: [] // Hedef tipi değiştiğinde hedef ID'leri sıfırla
    }));
    
    // Seçimleri sıfırla
    setSelectedDepartments([]);
    setSelectedEmployees([]);
  };

  // Form doğrulama
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Başlık gerekli';
    } else if (formData.title.length > 100) {
      errors.title = 'Başlık en fazla 100 karakter olabilir';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'İçerik gerekli';
    }
    
    if (formData.targetType === NotificationTargetType.DEPARTMENT && (!formData.targetIds || formData.targetIds.length === 0)) {
      errors.targetIds = 'En az bir departman seçilmelidir';
    }
    
    if (formData.targetType === NotificationTargetType.SPECIFIC_EMPLOYEES && (!formData.targetIds || formData.targetIds.length === 0)) {
      errors.targetIds = 'En az bir personel seçilmelidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Bildirimi kaydet
  const saveNotification = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let response;
      const userAttrs = await getUserAttributes();
      const userId = userAttrs?.sub || 'unknown';
      
      if (currentNotification) {
        // Mevcut bildirimi güncelle
        response = await NotificationService.updateNotification(
          currentNotification.id,
          formData
        );
      } else {
        // Yeni bildirim oluştur
        response = await NotificationService.createNotification(
          formData,
          userId
        );
      }
      
      if (response.success) {
        showSnackbar(
          currentNotification
            ? 'Bildirim başarıyla güncellendi'
            : 'Bildirim başarıyla oluşturuldu',
          'success'
        );
        setDialogOpen(false);
        fetchNotifications();
      } else {
        showSnackbar(response.message || 'Bir hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Bildirim kaydedilirken hata:', error);
      showSnackbar('Bildirim kaydedilirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bildirimi sil
  const deleteNotification = async () => {
    if (!currentNotification) return;
    
    setLoading(true);
    try {
      const response = await NotificationService.deleteNotification(currentNotification.id);
      
      if (response.success) {
        showSnackbar('Bildirim başarıyla arşivlendi', 'success');
        setDeleteDialogOpen(false);
        fetchNotifications();
      } else {
        showSnackbar(response.message || 'Bir hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
      showSnackbar('Bildirim silinirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bildirim düzenleme dialogu aç
  const openEditDialog = (notification: Notification) => {
    setCurrentNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      priority: notification.priority,
      targetType: notification.targetType,
      targetIds: notification.targetIds || [],
      expiresAt: notification.expiresAt
    });
    
    // Hedef ID'leri ayarla
    if (notification.targetType === NotificationTargetType.DEPARTMENT) {
      setSelectedDepartments(notification.targetIds || []);
    } else if (notification.targetType === NotificationTargetType.SPECIFIC_EMPLOYEES) {
      setSelectedEmployees(notification.targetIds || []);
    }
    
    // Son kullanma tarihi
    setExpireDate(notification.expiresAt ? new Date(notification.expiresAt) : null);
    
    setDialogOpen(true);
  };

  // Yeni bildirim oluşturma dialogu aç
  const openNewDialog = () => {
    setCurrentNotification(null);
    setFormData({
      title: '',
      content: '',
      priority: NotificationPriority.MEDIUM,
      targetType: NotificationTargetType.ALL_EMPLOYEES,
      targetIds: [],
      expiresAt: undefined
    });
    setSelectedDepartments([]);
    setSelectedEmployees([]);
    setExpireDate(null);
    setDialogOpen(true);
  };

  // Snackbar göster
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Sayfalama işleyicileri
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Durum filtresini değiştir
  const handleStatusChange = (event: SelectChangeEvent<NotificationStatus | 'ALL'>) => {
    setStatus(event.target.value as NotificationStatus | 'ALL');
    setPage(0);
  };

  // Hedef tipine göre simgeyi seç
  const getTargetIcon = (targetType: NotificationTargetType) => {
    switch (targetType) {
      case NotificationTargetType.ALL_EMPLOYEES:
        return <GroupIcon fontSize="small" />;
      case NotificationTargetType.DEPARTMENT:
        return <BusinessIcon fontSize="small" />;
      case NotificationTargetType.DEPARTMENT_MANAGERS:
        return <SupervisorAccountIcon fontSize="small" />;
      case NotificationTargetType.SPECIFIC_EMPLOYEES:
        return <PersonIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Bildirimler" />
          <Tab label="Arşiv" />
        </Tabs>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openNewDialog}
            sx={{ mr: 1 }}
          >
            Yeni Bildirim
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
          >
            Yenile
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterListIcon sx={{ mr: 1 }} color="action" />
          <Typography variant="subtitle2" sx={{ mr: 2 }}>
            Filtrele:
          </Typography>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Durum</InputLabel>
            <Select
              labelId="status-filter-label"
              value={status}
              onChange={handleStatusChange}
              label="Durum"
            >
              <MenuItem value="ALL">Tümü</MenuItem>
              <MenuItem value={NotificationStatus.ACTIVE}>Aktif</MenuItem>
              <MenuItem value={NotificationStatus.EXPIRED}>Süresi Dolmuş</MenuItem>
              <MenuItem value={NotificationStatus.ARCHIVED}>Arşivlenmiş</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">Başlık</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Öncelik</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Hedef</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Oluşturma</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Son Kullanma</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Durum</Typography></TableCell>
                  <TableCell align="right"><Typography fontWeight="bold">İşlemler</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">
                        Bildirim bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={NotificationPriorityTitles[notification.priority]} 
                          size="small"
                          sx={{ 
                            backgroundColor: NotificationPriorityColors[notification.priority],
                            color: '#fff'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getTargetIcon(notification.targetType)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {NotificationTargetTitles[notification.targetType]}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notification.expiresAt 
                            ? format(new Date(notification.expiresAt), 'dd.MM.yyyy HH:mm')
                            : 'Süresiz'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={NotificationStatusTitles[notification.status]} 
                          size="small"
                          sx={{ 
                            backgroundColor: 
                              notification.status === NotificationStatus.ACTIVE 
                                ? theme.palette.success.light
                                : notification.status === NotificationStatus.EXPIRED
                                ? theme.palette.warning.light
                                : theme.palette.grey[400],
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => openEditDialog(notification)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Arşivle">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setCurrentNotification(notification);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalNotifications}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Satır sayısı:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Arşivlenmiş bildirimler burada görüntülenecek.
          </Typography>
        </TabPanel>
      </Paper>
      
      {/* Bildirim Oluşturma/Düzenleme Dialogu */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentNotification ? 'Bildirimi Düzenle' : 'Yeni Bildirim Oluştur'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Başlık"
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={handleFormChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="content"
                label="İçerik"
                fullWidth
                variant="outlined"
                value={formData.content}
                onChange={handleFormChange}
                multiline
                rows={4}
                error={!!formErrors.content}
                helperText={formErrors.content}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Öncelik</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  label="Öncelik"
                >
                  <MenuItem value={NotificationPriority.LOW}>
                    <Chip 
                      label={NotificationPriorityTitles[NotificationPriority.LOW]} 
                      size="small"
                      sx={{ 
                        backgroundColor: NotificationPriorityColors[NotificationPriority.LOW],
                        color: '#fff'
                      }}
                    />
                  </MenuItem>
                  <MenuItem value={NotificationPriority.MEDIUM}>
                    <Chip 
                      label={NotificationPriorityTitles[NotificationPriority.MEDIUM]} 
                      size="small"
                      sx={{ 
                        backgroundColor: NotificationPriorityColors[NotificationPriority.MEDIUM],
                        color: '#fff'
                      }}
                    />
                  </MenuItem>
                  <MenuItem value={NotificationPriority.HIGH}>
                    <Chip 
                      label={NotificationPriorityTitles[NotificationPriority.HIGH]} 
                      size="small"
                      sx={{ 
                        backgroundColor: NotificationPriorityColors[NotificationPriority.HIGH],
                        color: '#fff'
                      }}
                    />
                  </MenuItem>
                  <MenuItem value={NotificationPriority.URGENT}>
                    <Chip 
                      label={NotificationPriorityTitles[NotificationPriority.URGENT]} 
                      size="small"
                      sx={{ 
                        backgroundColor: NotificationPriorityColors[NotificationPriority.URGENT],
                        color: '#fff'
                      }}
                    />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DateTimePicker
                  label="Son Kullanma Tarihi (İsteğe Bağlı)"
                  value={expireDate}
                  onChange={handleExpireDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Hedef Grubu</InputLabel>
                <Select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleTargetTypeChange}
                  label="Hedef Grubu"
                >
                  <MenuItem value={NotificationTargetType.ALL_EMPLOYEES}>
                    <Box display="flex" alignItems="center">
                      <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                      Tüm Personel
                    </Box>
                  </MenuItem>
                  <MenuItem value={NotificationTargetType.DEPARTMENT}>
                    <Box display="flex" alignItems="center">
                      <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                      Belirli Departman(lar)
                    </Box>
                  </MenuItem>
                  <MenuItem value={NotificationTargetType.DEPARTMENT_MANAGERS}>
                    <Box display="flex" alignItems="center">
                      <SupervisorAccountIcon fontSize="small" sx={{ mr: 1 }} />
                      Departman Yöneticileri
                    </Box>
                  </MenuItem>
                  <MenuItem value={NotificationTargetType.SPECIFIC_EMPLOYEES}>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      Belirli Personeller
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Departman seçimi */}
            {formData.targetType === NotificationTargetType.DEPARTMENT && (
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  variant="outlined"
                  error={!!formErrors.targetIds}
                >
                  <InputLabel>Departmanlar</InputLabel>
                  <Select
                    multiple
                    value={selectedDepartments}
                    onChange={handleDepartmentChange}
                    input={<OutlinedInput label="Departmanlar" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const dept = departments.find(d => d.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={dept?.name || value} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        <Checkbox checked={selectedDepartments.indexOf(dept.id) > -1} />
                        <ListItemText primary={dept.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.targetIds && (
                    <FormHelperText>{formErrors.targetIds}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            {/* Personel seçimi */}
            {formData.targetType === NotificationTargetType.SPECIFIC_EMPLOYEES && (
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  variant="outlined"
                  error={!!formErrors.targetIds}
                >
                  <InputLabel>Personeller</InputLabel>
                  <Select
                    multiple
                    value={selectedEmployees}
                    onChange={handleEmployeeChange}
                    input={<OutlinedInput label="Personeller" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const emp = employees.find(e => e.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={emp?.name || value} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        <Checkbox checked={selectedEmployees.indexOf(emp.id) > -1} />
                        <ListItemText 
                          primary={emp.name} 
                          secondary={departments.find(d => d.id === emp.department)?.name}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.targetIds && (
                    <FormHelperText>{formErrors.targetIds}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)} 
            color="inherit"
            disabled={loading}
          >
            İptal
          </Button>
          <Button 
            onClick={saveNotification} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {currentNotification ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Silme Onay Dialogu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Bildirimi Arşivle</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            "{currentNotification?.title}" bildirimini arşivlemek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu işlem bildirimi silmez, yalnızca arşive taşır. Arşivlenen bildirimler personel tarafından görüntülenemez.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="inherit"
            disabled={loading}
          >
            İptal
          </Button>
          <Button 
            onClick={deleteNotification} 
            variant="contained" 
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Arşivle
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications; 