import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import roleService from '../../services/RoleService';
import { 
  Role, 
  PagePermission, 
  PermissionGroups, 
  PermissionDescriptions,
  RoleFormData 
} from '../../models/Role';
import PermissionGuard from '../../components/PermissionGuard';

const RolesManagement: React.FC = () => {
  const { userRole } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Yeni/düzenlenen rol için form state'i
  const [roleForm, setRoleForm] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });
  
  // Rolleri yükle
  useEffect(() => {
    loadRoles();
    
    // Test için özel bir rol oluşturalım - sadece bir kere çalışacak
    const testSpecialRole = async () => {
      const allRoles = roleService.getAllRoles();
      // Özel test rolü zaten var mı kontrol et
      const testRoleExists = allRoles.some(role => role.id === 'test_role' || role.name === 'Test Özel Rolü');
      
      if (!testRoleExists) {
        // Test için özel bir rol oluştur (sistem rolü değil)
        const testRoleData = {
          name: 'Test Özel Rolü',
          description: 'Bu özel bir test rolüdür. Silinebilir.',
          permissions: [
            PagePermission.DASHBOARD,
            PagePermission.TICKETS,
            PagePermission.TICKET_VIEW,
          ]
        };
        roleService.createRole(testRoleData);
        loadRoles(); // Rol listesini güncelle
      }
    };
    
    testSpecialRole();
  }, []);
  
  // Rolleri yükleme fonksiyonu
  const loadRoles = () => {
    try {
      const allRoles = roleService.getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('Roller yüklenirken hata:', error);
      setError('Roller yüklenirken bir hata oluştu.');
    }
  };
  
  // Rol ekleme/düzenleme formunu aç
  const openRoleDialog = (role?: Role) => {
    if (role) {
      // Düzenleme modu
      setRoleForm({
        name: role.name,
        description: role.description || '',
        permissions: [...role.permissions]
      });
      setSelectedRole(role);
      setIsEditMode(true);
    } else {
      // Ekleme modu
      setRoleForm({
        name: '',
        description: '',
        permissions: []
      });
      setSelectedRole(null);
      setIsEditMode(false);
    }
    setShowRoleDialog(true);
  };
  
  // Rol ekleme/düzenleme formunu kapat
  const closeRoleDialog = () => {
    setShowRoleDialog(false);
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    });
    setSelectedRole(null);
    setIsEditMode(false);
  };
  
  // Form değerlerini güncelle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setRoleForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // İzinleri kontrol et
  const handlePermissionChange = (permission: PagePermission) => {
    setRoleForm(prev => {
      const newPermissions = [...prev.permissions];
      
      // İzin zaten ekliyse çıkar, değilse ekle
      if (newPermissions.includes(permission)) {
        return {
          ...prev,
          permissions: newPermissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...newPermissions, permission]
        };
      }
    });
  };
  
  // Grup olarak izinleri ekle/çıkar
  const handlePermissionGroupChange = (group: PagePermission[]) => {
    setRoleForm(prev => {
      const currentPermissions = new Set(prev.permissions);
      const allPermissionsInGroup = new Set(group);
      
      // Grubun tüm izinleri var mı kontrol et
      const hasAllPermissions = group.every(permission => currentPermissions.has(permission));
      
      if (hasAllPermissions) {
        // Tüm izinler varsa, bu gruptaki izinleri kaldır
        return {
          ...prev,
          permissions: prev.permissions.filter(p => !allPermissionsInGroup.has(p))
        };
      } else {
        // Tüm izinler yoksa, gruptaki eksik izinleri ekle
        const newPermissions = new Set(Array.from(currentPermissions));
        group.forEach(permission => newPermissions.add(permission));
        
        return {
          ...prev,
          permissions: Array.from(newPermissions)
        };
      }
    });
  };
  
  // Rolü kaydet
  const handleRoleSave = async () => {
    // Form doğrulama
    if (!roleForm.name.trim()) {
      setError('Rol adı gereklidir.');
      return;
    }
    
    if (roleForm.permissions.length === 0) {
      setError('En az bir izin seçmelisiniz.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (isEditMode && selectedRole) {
        // Rol güncelleme
        const updatedRole = roleService.updateRole(selectedRole.id, roleForm);
        if (updatedRole) {
          setSuccessMessage(`"${updatedRole.name}" rolü başarıyla güncellendi.`);
          loadRoles();
        } else {
          setError('Rol güncellenirken bir hata oluştu.');
        }
      } else {
        // Yeni rol ekleme
        const newRole = roleService.createRole(roleForm);
        setSuccessMessage(`"${newRole.name}" rolü başarıyla oluşturuldu.`);
        loadRoles();
      }
      
      // Formu kapat
      closeRoleDialog();
    } catch (error) {
      console.error('Rol kaydedilirken hata:', error);
      setError('Rol kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
      
      // Başarı mesajını 3 saniye sonra temizle
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };
  
  // Rol silme fonksiyonu
  const handleDeleteRole = (role: Role) => {
    // Parametrenin geçerli olduğunu kontrol et
    if (!role || !role.id) {
      setError('Geçersiz rol. Silme işlemi yapılamıyor.');
      return;
    }
    
    // Sistem rollerini silmeye çalışmayı engelle
    if (role.isSystem) {
      setError(`"${role.name}" bir sistem rolüdür ve silinemez!`);
      
      // 3 saniye sonra hata mesajını temizle
      setTimeout(() => {
        setError(null);
      }, 3000);
      
      return;
    }
    
    // Kullanıcıya onay sor
    if (window.confirm(`"${role.name}" rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        // Role servisinden silme işlemini çağır
        const result = roleService.deleteRole(role.id);
        
        // Silme başarılı mı kontrol et
        if (result) {
          // Başarılı mesajı göster
          setSuccessMessage(`"${role.name}" rolü başarıyla silindi.`);
          
          // 3 saniye sonra başarı mesajını temizle
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
          
          // Rol listesini güncelle - doğrudan servisten al
          setRoles(roleService.getAllRoles());
        } else {
          // Silme başarısız ise hata mesajı göster
          setError(`"${role.name}" rolü silinirken bir hata oluştu. Rol bulunamadı veya bir sistem rolü.`);
          
          // 3 saniye sonra hata mesajını temizle
          setTimeout(() => {
            setError(null);
          }, 3000);
        }
      } catch (error) {
        // Hata durumunda konsola bilgi ve kullanıcıya hata mesajı göster
        console.error('Rol silme işlemi sırasında hata:', error);
        setError('Rol silinirken teknik bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        
        // 3 saniye sonra hata mesajını temizle
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  };
  
  // Grup izinleri kontrolü
  const isGroupChecked = (group: PagePermission[]) => {
    return group.every(permission => roleForm.permissions.includes(permission));
  };
  
  const isGroupIndeterminate = (group: PagePermission[]) => {
    return group.some(permission => roleForm.permissions.includes(permission)) && 
           !group.every(permission => roleForm.permissions.includes(permission));
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Rol Yönetimi
        </Typography>
        
        <PermissionGuard permission={PagePermission.ROLE_CREATE}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => openRoleDialog()}
          >
            Yeni Rol Ekle
          </Button>
        </PermissionGuard>
      </Box>
      
      {/* Hata Mesajı */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, animation: 'fadeIn 0.5s' }} 
          onClose={() => setError(null)}
          variant="filled"
        >
          {error}
        </Alert>
      )}
      
      {/* Başarı Mesajı */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, animation: 'fadeIn 0.5s' }} 
          onClose={() => setSuccessMessage(null)}
          variant="filled"
        >
          {successMessage}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rol Adı</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>İzin Sayısı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <Typography variant="subtitle2">{role.name}</Typography>
                </TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.permissions.length}</TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Chip 
                      size="small" 
                      color="primary" 
                      label="Sistem Rolü"
                      title="Sistem rolleri silinemez"
                    />
                  ) : (
                    <Chip 
                      size="small" 
                      color="secondary" 
                      label="Özel Rol"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <PermissionGuard permission={PagePermission.ROLE_EDIT}>
                    <IconButton 
                      color="primary" 
                      onClick={() => openRoleDialog(role)}
                      disabled={userRole !== 'admin' && role.id === 'admin'}
                    >
                      <EditIcon />
                    </IconButton>
                  </PermissionGuard>
                  
                  {/* Sil butonu - doğrudan erişim */}
                  <PermissionGuard permission={PagePermission.ROLE_DELETE}>
                    <Tooltip title={role.isSystem ? "Sistem rolleri silinemez" : "Bu rolü sil"}>
                      <span>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.isSystem || (userRole !== 'admin' && role.id === 'admin')}
                          sx={{ 
                            opacity: role.isSystem ? 0.5 : 1,
                            '&:hover': { 
                              bgcolor: role.isSystem ? 'transparent' : 'error.light',
                              '& svg': { color: role.isSystem ? 'inherit' : '#fff' }
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </PermissionGuard>
                </TableCell>
              </TableRow>
            ))}
            
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Henüz hiç rol eklenmemiş.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Rol ekleme/düzenleme dialog */}
      <Dialog 
        open={showRoleDialog} 
        onClose={closeRoleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Rolü Düzenle' : 'Yeni Rol Ekle'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Rol Adı"
                  name="name"
                  value={roleForm.name}
                  onChange={handleFormChange}
                  disabled={loading || (isEditMode && selectedRole?.isSystem)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  name="description"
                  value={roleForm.description}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  İzinler
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Bu role hangi izinlerin verileceğini seçin. Her izin farklı işlemlere erişim sağlar.
                </Typography>
                
                {Object.entries(PermissionGroups).map(([groupKey, group]) => (
                  <Accordion key={groupKey} sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <FormControlLabel
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        control={
                          <Checkbox
                            checked={isGroupChecked(group.permissions)}
                            indeterminate={isGroupIndeterminate(group.permissions)}
                            onChange={() => handlePermissionGroupChange(group.permissions)}
                            disabled={loading || (isEditMode && selectedRole?.isSystem)}
                          />
                        }
                        label={<Typography variant="subtitle1">{group.title}</Typography>}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormGroup>
                        {group.permissions.map((permission) => (
                          <FormControlLabel
                            key={permission}
                            control={
                              <Checkbox
                                checked={roleForm.permissions.includes(permission)}
                                onChange={() => handlePermissionChange(permission)}
                                disabled={loading || (isEditMode && selectedRole?.isSystem)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2">{PermissionDescriptions[permission]}</Typography>
                                <Tooltip title={`İzin kodu: ${permission}`}>
                                  <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                                </Tooltip>
                              </Box>
                            }
                          />
                        ))}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeRoleDialog} disabled={loading}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRoleSave}
            disabled={loading || (isEditMode && selectedRole?.isSystem)}
          >
            {loading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesManagement; 