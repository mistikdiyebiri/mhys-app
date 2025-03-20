import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  ColorLens as ColorLensIcon,
  Storage as StorageIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Settings: React.FC = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Müşteri Hizmetleri Yönetim Sistemi',
    supportEmail: 'destek@mhys.com',
    defaultLanguage: 'tr-TR',
    enablePublicPortal: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    ticketAssignedNotification: true,
    ticketUpdateNotification: true,
    ticketResolvedNotification: true,
    dailyDigest: false
  });
  
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Gerçek uygulamada API isteği gönderilir
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ mb: { xs: 3, md: 0 } }}>
            <List component="nav">
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'general'} 
                  onClick={() => setActiveTab('general')}
                >
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Genel Ayarlar" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'notifications'} 
                  onClick={() => setActiveTab('notifications')}
                >
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Bildirim Ayarları" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'security'} 
                  onClick={() => setActiveTab('security')}
                >
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Güvenlik Ayarları" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'appearance'} 
                  onClick={() => setActiveTab('appearance')}
                >
                  <ListItemIcon>
                    <ColorLensIcon />
                  </ListItemIcon>
                  <ListItemText primary="Görünüm Ayarları" />
                </ListItemButton>
              </ListItem>
              
              {userRole === 'admin' && (
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeTab === 'system'} 
                    onClick={() => setActiveTab('system')}
                  >
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText primary="Sistem Ayarları" />
                  </ListItemButton>
                </ListItem>
              )}
              
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')}
                >
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profil Ayarları" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            {activeTab === 'general' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Genel Ayarlar
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Şirket/Sistem Adı"
                      name="companyName"
                      value={generalSettings.companyName}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Destek E-posta Adresi"
                      name="supportEmail"
                      value={generalSettings.supportEmail}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Varsayılan Dil"
                      name="defaultLanguage"
                      value={generalSettings.defaultLanguage}
                      onChange={handleGeneralSettingsChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generalSettings.enablePublicPortal}
                          onChange={handleGeneralSettingsChange}
                          name="enablePublicPortal"
                        />
                      }
                      label="Müşteri Portalını Etkinleştir"
                    />
                  </Grid>
                </Grid>
              </>
            )}
            
            {activeTab === 'notifications' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Bildirim Ayarları
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationSettingsChange}
                          name="emailNotifications"
                        />
                      }
                      label="E-posta Bildirimleri"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.ticketAssignedNotification}
                          onChange={handleNotificationSettingsChange}
                          name="ticketAssignedNotification"
                          disabled={!notificationSettings.emailNotifications}
                        />
                      }
                      label="Talep Atandığında Bildirim"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.ticketUpdateNotification}
                          onChange={handleNotificationSettingsChange}
                          name="ticketUpdateNotification"
                          disabled={!notificationSettings.emailNotifications}
                        />
                      }
                      label="Talep Güncellendiğinde Bildirim"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.ticketResolvedNotification}
                          onChange={handleNotificationSettingsChange}
                          name="ticketResolvedNotification"
                          disabled={!notificationSettings.emailNotifications}
                        />
                      }
                      label="Talep Çözüldüğünde Bildirim"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.dailyDigest}
                          onChange={handleNotificationSettingsChange}
                          name="dailyDigest"
                          disabled={!notificationSettings.emailNotifications}
                        />
                      }
                      label="Günlük Özet Raporu"
                    />
                  </Grid>
                </Grid>
              </>
            )}
            
            {activeTab === 'security' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Güvenlik Ayarları
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Bu bölüm henüz geliştirilme aşamasındadır.
                </Typography>
              </>
            )}
            
            {activeTab === 'appearance' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Görünüm Ayarları
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Bu bölüm henüz geliştirilme aşamasındadır.
                </Typography>
              </>
            )}
            
            {activeTab === 'system' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Sistem Ayarları
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Bu bölüm henüz geliştirilme aşamasındadır ve yalnızca yöneticiler tarafından görüntülenebilir.
                </Typography>
              </>
            )}
            
            {activeTab === 'profile' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Profil Ayarları
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Bu bölüm henüz geliştirilme aşamasındadır.
                </Typography>
              </>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          Ayarlar başarıyla kaydedildi!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 