import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MailIcon from '@mui/icons-material/Mail';
import { useAuth } from '../../contexts/AuthContext';
import * as EmailService from '../../services/EmailService';

const EmailSettings = () => {
  const { getUserAttributes } = useAuth();
  const [userRole, setUserRole] = useState('user');
  const [emailConfigs, setEmailConfigs] = useState<EmailService.EmailConfiguration[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    description: '',
    department: '',
    active: true
  });

  // Kullanıcı rolünü yükle
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const attributes = await getUserAttributes();
        // Kullanıcı rolünü attributes objesinden al
        setUserRole(attributes && 'custom:role' in attributes ? attributes['custom:role'] as string : 'user');
      } catch (error) {
        console.error('Kullanıcı rolü alınırken hata oluştu:', error);
      }
    };
    
    fetchUserRole();
  }, [getUserAttributes]);

  // E-posta yapılandırmalarını yükle
  const fetchEmailConfigs = async () => {
    try {
      const result = await EmailService.getEmailConfigurations();
      setEmailConfigs(result.emailConfigurations || []);
    } catch (error) {
      console.error('E-posta yapılandırmaları yüklenirken hata oluştu:', error);
    }
  };

  useEffect(() => {
    fetchEmailConfigs();
  }, []);

  const handleOpenDialog = (emailConfig: EmailService.EmailConfiguration | null = null) => {
    if (emailConfig) {
      setFormData({
        email: emailConfig.email,
        description: emailConfig.description || '',
        department: emailConfig.department || '',
        active: emailConfig.active
      });
      setEditId(emailConfig.id);
    } else {
      setFormData({
        email: '',
        description: '',
        department: '',
        active: true
      });
      setEditId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      email: '',
      description: '',
      department: '',
      active: true
    });
    setEditId(null);
  };

  // Tüm TextField bileşenleri için değişiklik fonksiyonu
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await EmailService.updateEmailConfiguration({
          id: editId,
          ...formData
        });
      } else {
        await EmailService.createEmailConfiguration({
          ...formData,
          createdAt: new Date().toISOString()
        } as any);
      }
      fetchEmailConfigs();
      handleCloseDialog();
    } catch (error) {
      console.error('E-posta yapılandırması kaydedilirken hata oluştu:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu e-posta yapılandırmasını silmek istediğinizden emin misiniz?')) {
      try {
        await EmailService.deleteEmailConfiguration(id);
        fetchEmailConfigs();
      } catch (error) {
        console.error('E-posta yapılandırması silinirken hata oluştu:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">E-posta Ayarları</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni E-posta Ekle
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="body1" paragraph>
            Bu bölümde destek taleplerinin otomatik oluşturulması için e-posta adreslerini yönetebilirsiniz.
            Her e-posta adresi için ayrı bir departman atayabilirsiniz.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            {emailConfigs.map((config) => (
              <Grid item xs={12} key={config.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" color="primary">
                          {config.email}
                          {!config.active && (
                            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                              (Pasif)
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {config.description}
                        </Typography>
                        {config.department && (
                          <Typography variant="body2">
                            Departman: {config.department}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton onClick={() => handleOpenDialog(config)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(config.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {emailConfigs.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary" align="center">
                  Henüz eklenmiş e-posta adresi bulunmuyor.
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      {/* E-posta Yapılandırma Diyaloğu */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editId ? 'E-posta Yapılandırmasını Düzenle' : 'Yeni E-posta Yapılandırması'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta Adresi"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange as (event: SelectChangeEvent<string>) => void}
                  label="Departman"
                >
                  <MenuItem value="">Seçilmedi</MenuItem>
                  <MenuItem value="Genel">Genel</MenuItem>
                  <MenuItem value="Teknik">Teknik</MenuItem>
                  <MenuItem value="Satış">Satış</MenuItem>
                  <MenuItem value="Muhasebe">Muhasebe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleSwitchChange}
                    name="active"
                  />
                }
                label="Aktif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailSettings; 