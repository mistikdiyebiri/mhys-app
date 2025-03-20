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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Card,
  InputAdornment,
  SelectChangeEvent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  BusinessCenter as BusinessCenterIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Employee, Department } from '../../models/schema';
import employeeService from '../../services/EmployeeService';

const availablePermissions = [
  { id: 'view_tickets', name: 'Talepleri Görüntüleme' },
  { id: 'create_tickets', name: 'Talep Oluşturma' },
  { id: 'edit_tickets', name: 'Talep Düzenleme' },
  { id: 'delete_tickets', name: 'Talep Silme' },
  { id: 'assign_tickets', name: 'Talep Atama' },
  { id: 'view_reports', name: 'Raporları Görüntüleme' },
  { id: 'create_reports', name: 'Rapor Oluşturma' },
  { id: 'manage_departments', name: 'Departman Yönetimi' },
  { id: 'manage_employees', name: 'Personel Yönetimi' },
  { id: 'view_dashboard', name: 'Dashboard Görüntüleme' },
  { id: 'admin_panel', name: 'Admin Paneli Erişimi' }
];

const availableRoles = [
  { id: 'agent', name: 'Operatör' },
  { id: 'supervisor', name: 'Süpervizör' },
  { id: 'manager', name: 'Yönetici' },
  { id: 'admin', name: 'Admin' }
];

// Her rol için otomatik atanacak izinler
const rolePermissions = {
  'agent': ['view_tickets', 'create_tickets', 'edit_tickets'],
  'supervisor': ['view_tickets', 'create_tickets', 'edit_tickets', 'assign_tickets', 'view_reports', 'create_reports'],
  'manager': ['view_tickets', 'create_tickets', 'edit_tickets', 'delete_tickets', 'assign_tickets', 'view_reports', 'create_reports', 'manage_departments'],
  'admin': availablePermissions.map(permission => permission.id) // Admin tüm izinlere sahip olsun
};

const Employees: React.FC = () => {
  const { userRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Form state
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    role: 'agent',
    permissions: [] as string[],
    password: '',
    confirmPassword: ''
  });

  // Mesaj durumu
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Örnek veri - Gerçek uygulamada API'den alınır
  const sampleEmployees: Employee[] = [
    { 
      id: '1', 
      firstName: 'Ali', 
      lastName: 'Yılmaz', 
      email: 'ali@example.com', 
      phone: '555-123-4567',
      departmentId: '1', 
      role: 'agent', 
      permissions: ['view_tickets', 'create_tickets', 'edit_tickets'],
      createdAt: new Date(2023, 1, 10).toISOString(),
      updatedAt: new Date(2023, 1, 10).toISOString()
    },
    { 
      id: '2', 
      firstName: 'Ayşe', 
      lastName: 'Demir', 
      email: 'ayse@example.com',
      phone: '555-234-5678', 
      departmentId: '2', 
      role: 'supervisor', 
      permissions: ['view_tickets', 'create_tickets', 'edit_tickets', 'assign_tickets', 'view_reports'],
      createdAt: new Date(2023, 0, 15).toISOString(),
      updatedAt: new Date(2023, 0, 15).toISOString()
    },
    { 
      id: '3', 
      firstName: 'Mehmet', 
      lastName: 'Kaya', 
      email: 'mehmet@example.com',
      phone: '555-345-6789', 
      departmentId: '1', 
      role: 'agent', 
      permissions: ['view_tickets', 'create_tickets'],
      createdAt: new Date(2023, 2, 5).toISOString(),
      updatedAt: new Date(2023, 2, 5).toISOString()
    },
    { 
      id: '4', 
      firstName: 'Zeynep', 
      lastName: 'Şahin', 
      email: 'zeynep@example.com',
      phone: '555-456-7890', 
      departmentId: '3', 
      role: 'manager', 
      permissions: ['view_tickets', 'create_tickets', 'edit_tickets', 'delete_tickets', 'assign_tickets', 'view_reports', 'create_reports', 'manage_departments'],
      createdAt: new Date(2023, 0, 20).toISOString(),
      updatedAt: new Date(2023, 0, 20).toISOString()
    },
    { 
      id: '5', 
      firstName: 'Mustafa', 
      lastName: 'Öztürk', 
      email: 'mustafa@example.com',
      phone: '555-567-8901', 
      departmentId: '2', 
      role: 'agent', 
      permissions: ['view_tickets', 'create_tickets', 'edit_tickets'],
      createdAt: new Date(2023, 1, 25).toISOString(),
      updatedAt: new Date(2023, 1, 25).toISOString()
    },
  ];

  const sampleDepartments: Department[] = [
    { id: '1', name: 'Teknik Destek', description: 'Teknik sorunlar ve ürün desteği', createdAt: '', updatedAt: '' },
    { id: '2', name: 'Satış', description: 'Siparişler ve ürün bilgileri', createdAt: '', updatedAt: '' },
    { id: '3', name: 'Finans', description: 'Faturalar ve ödemeler', createdAt: '', updatedAt: '' }
  ];

  useEffect(() => {
    // Gerçek uygulamada GraphQL API çağrısı yapılır
    // const fetchEmployees = async () => {
    //   try {
    //     const employeesData = await API.graphql(graphqlOperation(listEmployees));
    //     setEmployees(employeesData.data.listEmployees.items);
    //     
    //     const departmentsData = await API.graphql(graphqlOperation(listDepartments));
    //     setDepartments(departmentsData.data.listDepartments.items);
    //   } catch (error) {
    //     console.error('Error fetching employees:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // Çalışanları servisten yükle
    setLoading(true);
    setTimeout(() => {
      setEmployees(employeeService.getAllEmployees());
      setDepartments(sampleDepartments);
      setLoading(false);
    }, 500);
  }, []);

  // Form işleyicileri
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    
    // Rol değiştirildiğinde, role özgü izinleri otomatik ata
    if (fieldName === 'role') {
      const roleId = fieldValue as string;
      const permissions = rolePermissions[roleId as keyof typeof rolePermissions] || [];
      
      setFormState({
        ...formState,
        [fieldName]: fieldValue,
        permissions: permissions
      });
    } else {
      setFormState({
        ...formState,
        [fieldName]: fieldValue
      });
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    const currentPermissions = formState.permissions;
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    
    setFormState({
      ...formState,
      permissions: newPermissions
    });
  };

  // Tablo işleyicileri
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterDepartmentChange = (event: SelectChangeEvent) => {
    setFilterDepartment(event.target.value);
    setPage(0);
  };

  const handleFilterRoleChange = (event: SelectChangeEvent) => {
    setFilterRole(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Personel CRUD işleyicileri
  const handleOpenEmployeeDialog = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    
    if (employee) {
      setFormState({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        departmentId: employee.departmentId || '',
        role: employee.role,
        permissions: employee.permissions || [],
        password: '',
        confirmPassword: ''
      });
    } else {
      // Yeni personel için varsayılan değerler
      const defaultRole = 'agent';
      setFormState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        role: defaultRole,
        permissions: rolePermissions[defaultRole] || ['view_tickets'],
        password: '',
        confirmPassword: ''
      });
    }
    
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    setSelectedEmployee(null);
  };

  const handleSubmitEmployee = () => {
    // Form doğrulama
    if (!formState.firstName || !formState.lastName || !formState.email) {
      showNotification('Ad, soyad ve e-posta alanları zorunludur.', 'error');
      return;
    }

    if (!selectedEmployee && (!formState.password || formState.password.length < 6)) {
      showNotification('Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    if (!selectedEmployee && formState.password !== formState.confirmPassword) {
      showNotification('Şifreler eşleşmiyor.', 'error');
      return;
    }
    
    try {
      if (selectedEmployee) {
        // Güncelleme modu
        const updatedEmployee = employeeService.updateEmployee(selectedEmployee.id, {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          departmentId: formState.departmentId,
          role: formState.role,
          permissions: formState.permissions,
        });
        
        if (updatedEmployee) {
          setEmployees(employeeService.getAllEmployees());
          showNotification('Personel başarıyla güncellendi.', 'success');
        } else {
          showNotification('Personel güncellenirken bir hata oluştu.', 'error');
        }
        
        // Şifre değişikliği varsa uygula
        if (formState.password && formState.password.length >= 6 && formState.password === formState.confirmPassword) {
          employeeService.updateEmployeePassword(selectedEmployee.id, formState.password);
          showNotification('Personel şifresi başarıyla güncellendi.', 'success');
        }
      } else {
        // Yeni personel oluşturma modu
        try {
          const newEmployee = employeeService.createEmployee({
            firstName: formState.firstName,
            lastName: formState.lastName,
            email: formState.email,
            phone: formState.phone,
            departmentId: formState.departmentId,
            role: formState.role,
            permissions: formState.permissions,
          }, formState.password);
          
          setEmployees(employeeService.getAllEmployees());
          showNotification(`${newEmployee.firstName} ${newEmployee.lastName} personeli başarıyla eklendi.`, 'success');
        } catch (error) {
          showNotification(`Hata: ${(error as Error).message}`, 'error');
          return;
        }
      }
      
      handleCloseEmployeeDialog();
    } catch (error) {
      console.error('Personel kaydedilirken hata:', error);
      showNotification(`İşlem sırasında bir hata oluştu: ${(error as Error).message}`, 'error');
    }
  };

  const handleOpenDeleteConfirm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    
    const result = employeeService.deleteEmployee(selectedEmployee.id);
    if (result) {
      setEmployees(employeeService.getAllEmployees());
      showNotification('Personel başarıyla silindi.', 'success');
    } else {
      showNotification('Personel silinirken bir hata oluştu.', 'error');
    }
    
    handleCloseDeleteConfirm();
  };

  const handleRefresh = () => {
    setLoading(true);
    // Personelleri servisten yeniden yükle
    setTimeout(() => {
      setEmployees(employeeService.getAllEmployees());
      setLoading(false);
    }, 500);
  };

  // Filtre ve arama fonksiyonları
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesDepartment = filterDepartment === 'all' || employee.departmentId === filterDepartment;
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Sayfalama için
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Yardımcı fonksiyonlar
  const getRoleName = (roleId: string) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getRoleChip = (role: string) => {
    switch(role) {
      case 'agent':
        return <Chip label="Operatör" color="primary" size="small" />;
      case 'supervisor':
        return <Chip label="Süpervizör" color="info" size="small" />;
      case 'manager':
        return <Chip label="Yönetici" color="warning" size="small" />;
      case 'admin':
        return <Chip label="Admin" color="error" size="small" />;
      default:
        return <Chip label={role} size="small" />;
    }
  };

  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return 'Belirtilmemiş';
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Belirtilmemiş';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Box>
          <Tooltip title="Yenile">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Yeni Personel">
            <IconButton 
              color="primary" 
              onClick={() => handleOpenEmployeeDialog()}
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Ara... (İsim, Soyisim, E-posta, Telefon)"
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
              <InputLabel>Departman</InputLabel>
              <Select
                value={filterDepartment}
                onChange={handleFilterDepartmentChange}
                label="Departman"
              >
                <MenuItem value="all">Tüm Departmanlar</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={filterRole}
                onChange={handleFilterRoleChange}
                label="Rol"
              >
                <MenuItem value="all">Tüm Roller</MenuItem>
                {availableRoles.map(role => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tablo görünümü */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredEmployees.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Arama kriterlerine uygun personel bulunamadı.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Departman</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Oluşturulma</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </Avatar>
                          {employee.firstName} {employee.lastName}
                        </Box>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone || '-'}</TableCell>
                      <TableCell>{getDepartmentName(employee.departmentId)}</TableCell>
                      <TableCell>{getRoleChip(employee.role)}</TableCell>
                      <TableCell>{formatDate(employee.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEmployeeDialog(employee)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteConfirm(employee)}
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
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEmployees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına personel:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Personel Ekleme/Düzenleme Modal */}
      <Dialog open={openEmployeeDialog} onClose={handleCloseEmployeeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedEmployee ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad"
                  name="firstName"
                  value={formState.firstName}
                  onChange={handleTextChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Soyad"
                  name="lastName"
                  value={formState.lastName}
                  onChange={handleTextChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleTextChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  name="phone"
                  value={formState.phone}
                  onChange={handleTextChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    name="departmentId"
                    value={formState.departmentId}
                    onChange={handleSelectChange}
                    label="Departman"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="role"
                    value={formState.role}
                    onChange={handleSelectChange}
                    label="Rol"
                  >
                    {availableRoles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Şifre Alanları */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={selectedEmployee ? "Yeni Şifre (Değişmeyecekse boş bırakın)" : "Şifre"}
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleTextChange}
                  required={!selectedEmployee}
                  helperText={!selectedEmployee ? "En az 6 karakter" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={selectedEmployee ? "Yeni Şifre Tekrar" : "Şifre Tekrar"}
                  name="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={handleTextChange}
                  required={!selectedEmployee}
                  error={formState.password !== formState.confirmPassword && formState.confirmPassword !== ''}
                  helperText={formState.password !== formState.confirmPassword && formState.confirmPassword !== '' ? "Şifreler eşleşmiyor" : ""}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  İzinler
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Bu rol için {formState.role === 'admin' ? 'admin tüm izinlere sahiptir.' : 'gerekli izinleri seçin:'}
                </Typography>
                
                <FormGroup>
                  <Grid container spacing={1}>
                    {availablePermissions.map((permission) => (
                      <Grid item xs={12} sm={6} md={4} key={permission.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formState.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              disabled={formState.role === 'admin'} // Admin tüm izinlere sahip, değiştirilemez
                            />
                          }
                          label={permission.name}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmployeeDialog}>İptal</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitEmployee}>
            {selectedEmployee ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme onay dialogu */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Personeli Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedEmployee && `${selectedEmployee.firstName} ${selectedEmployee.lastName}`} adlı personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>İptal</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteEmployee}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees;
