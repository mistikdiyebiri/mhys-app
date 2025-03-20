import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  SecurityOutlined as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import emailSettingsService from '../../services/EmailSettingsService';
import { EmailSettings as EmailSettingsModel, EmailServiceType, defaultEmailServerConfigs } from '../../models/Email';

type FormDataType = {
  id: string;
  name: string;
  email: string;
  type: EmailServiceType;
  incomingServer: string;
  incomingPort: number;
  outgoingServer: string;
  outgoingPort: number;
  username: string;
  password: string;
  enableSSL: boolean;
  isActive: boolean;
  pollingInterval: number;
  autoReply: boolean;
  autoReplyTemplate: string;
  createTickets: boolean;
  isDefault: boolean;
};

const EmailSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettingsModel[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<EmailSettingsModel | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [formData, setFormData] = useState<FormDataType>({
    id: '',
    name: '',
    email: '',
    type: EmailServiceType.YANDEX,
    incomingServer: '',
    incomingPort: 993,
    outgoingServer: '',
    outgoingPort: 465,
    username: '',
    password: '',
    enableSSL: true,
    isActive: true,
    pollingInterval: 5,
    autoReply: false,
    autoReplyTemplate: '',
    createTickets: true,
    isDefault: false
  });

  useEffect(() => {
    fetchEmailSettings();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEmailSettings = async () => {
    setLoading(true);
    try {
      const settings = await emailSettingsService.getEmailSettings();
      setEmailSettings(settings);
    } catch (error) {
      showNotification('E-posta ayarları yüklenirken hata oluştu.', 'error');
      console.error('E-posta ayarları yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (setting?: EmailSettingsModel) => {
    if (setting) {
      setFormData({ ...setting });
      setSelectedSetting(setting);
    } else {
      // Yeni bir kayıt için form verilerini sıfırla ve sunucu ayarlarını varsayılan olarak ayarla
      const defaultConfig = defaultEmailServerConfigs[EmailServiceType.YANDEX];
      setFormData({
        id: '',
        name: '',
        email: '',
        type: EmailServiceType.YANDEX,
        incomingServer: defaultConfig.incomingServer,
        incomingPort: defaultConfig.incomingPort,
        outgoingServer: defaultConfig.outgoingServer,
        outgoingPort: defaultConfig.outgoingPort,
        username: '',
        password: '',
        enableSSL: defaultConfig.enableSSL,
        isActive: true,
        pollingInterval: 5,
        autoReply: false,
        autoReplyTemplate: '',
        createTickets: true,
        isDefault: emailSettings.length === 0 // İlk kayıt ise varsayılan olarak işaretle
      });
      setSelectedSetting(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteDialogOpen = (setting: EmailSettingsModel) => {
    setSelectedSetting(setting);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleTestDialogOpen = (setting: EmailSettingsModel) => {
    setSelectedSetting(setting);
    setTestResult(null);
    setOpenTestDialog(true);
  };

  const handleTestDialogClose = () => {
    setOpenTestDialog(false);
  };

  // Text ve sayısal alanlar için
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'incomingPort' || name === 'outgoingPort' || name === 'pollingInterval' 
        ? Number(value) 
        : value
    }));
  };

  // Seçim kutuları için
  const handleSelectChange = (e: SelectChangeEvent<EmailServiceType>) => {
    const { name, value } = e.target;
    const serviceType = value as EmailServiceType;
    
    if (name === 'type') {
      // E-posta servis tipi değiştiğinde, sunucu bilgilerini otomatik olarak güncelle
      const defaultConfig = defaultEmailServerConfigs[serviceType];
      
      if (defaultConfig) {
        setFormData(prev => ({
          ...prev,
          type: serviceType,
          incomingServer: defaultConfig.incomingServer,
          incomingPort: defaultConfig.incomingPort,
          outgoingServer: defaultConfig.outgoingServer,
          outgoingPort: defaultConfig.outgoingPort,
          enableSSL: defaultConfig.enableSSL
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Switch/checkbox için
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selectedSetting) {
        // Mevcut ayarı güncelle
        const updatedSetting = await emailSettingsService.updateEmailSetting(formData);
        
        if (updatedSetting) {
          const updatedSettings = emailSettings.map(setting => 
            setting.id === updatedSetting.id ? updatedSetting : setting
          );
          setEmailSettings(updatedSettings);
          showNotification('E-posta ayarı başarıyla güncellendi.', 'success');
        }
      } else {
        // Yeni ayar oluştur
        const newSetting = await emailSettingsService.createEmailSetting(formData);
        setEmailSettings([...emailSettings, newSetting]);
        showNotification('E-posta ayarı başarıyla oluşturuldu.', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('E-posta ayarı kaydedilirken hata oluştu:', error);
      showNotification('E-posta ayarı kaydedilirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSetting) return;
    
    setLoading(true);
    try {
      const success = await emailSettingsService.deleteEmailSetting(selectedSetting.id);
      
      if (success) {
        const updatedSettings = emailSettings.filter(setting => setting.id !== selectedSetting.id);
        setEmailSettings(updatedSettings);
        showNotification('E-posta ayarı başarıyla silindi.', 'success');
      } else {
        showNotification('E-posta ayarı silinirken bir hata oluştu.', 'error');
      }
      handleDeleteDialogClose();
    } catch (error) {
      console.error('E-posta ayarı silinirken hata oluştu:', error);
      showNotification('E-posta ayarı silinirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedSetting) return;
    
    setTestLoading(true);
    try {
      const result = await emailSettingsService.testEmailSetting(selectedSetting.id);
      setTestResult(result);
    } catch (error) {
      console.error('E-posta bağlantısı test edilirken hata oluştu:', error);
      setTestResult({
        success: false,
        message: 'E-posta bağlantısı test edilirken bir hata oluştu.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          E-posta Ayarları
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni E-posta Hesabı
        </Button>
      </Box>

      {emailSettings.length === 0 && !loading ? (
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" p={3}>
              <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                Henüz bir e-posta hesabı eklenmemiş
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary" paragraph>
                E-posta entegrasyonu için yeni bir hesap ekleyerek başlayın. Gelen e-postalar otomatik olarak destek taleplerine dönüştürülebilir.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                E-posta Hesabı Ekle
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Durumu</TableCell>
                <TableCell>İsim</TableCell>
                <TableCell>E-posta Adresi</TableCell>
                <TableCell>Servis</TableCell>
                <TableCell>Kontrol Sıklığı</TableCell>
                <TableCell>Otomatik Talep</TableCell>
                <TableCell>Varsayılan</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : (
                emailSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>
                      <Chip
                        label={setting.isActive ? 'Aktif' : 'Pasif'}
                        color={setting.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{setting.name}</TableCell>
                    <TableCell>{setting.email}</TableCell>
                    <TableCell>
                      {setting.type === EmailServiceType.YANDEX && 'Yandex Mail'}
                      {setting.type === EmailServiceType.GMAIL && 'Gmail'}
                      {setting.type === EmailServiceType.OUTLOOK && 'Outlook'}
                      {setting.type === EmailServiceType.SMTP && 'SMTP/IMAP'}
                      {setting.type === EmailServiceType.IMAP && 'Özel IMAP'}
                    </TableCell>
                    <TableCell>{setting.pollingInterval} dakika</TableCell>
                    <TableCell>
                      {setting.createTickets ? (
                        <Chip
                          icon={<CheckIcon />}
                          label="Aktif"
                          color="info"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<CloseIcon />}
                          label="Pasif"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {setting.isDefault && (
                        <Chip
                          icon={<CheckIcon />}
                          label="Varsayılan"
                          color="primary"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Düzenle">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(setting)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Test Et">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleTestDialogOpen(setting)}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDialogOpen(setting)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={5}>
        <Typography variant="h6" gutterBottom>
          E-posta Entegrasyonu Hakkında
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">E-posta Entegrasyonu Nasıl Çalışır?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              E-posta entegrasyonu, belirlediğiniz e-posta adreslerine gelen mesajları otomatik olarak destek taleplerine dönüştürür ve yanıtlarınızı e-posta olarak gönderir.
            </Typography>
            <Typography variant="body2" paragraph>
              Sistem, eklediğiniz e-posta hesaplarını belirli aralıklarla (ayarladığınız süre) kontrol eder ve yeni e-postaları bulduğunda bunları destek talepleriy dönüştürür. 
              Talebe yaptığınız yanıtlar da otomatik olarak müşteriye e-posta olarak gönderilir.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Yandex Mail Ayarları</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              <strong>IMAP Sunucu:</strong> imap.yandex.com<br />
              <strong>IMAP Port:</strong> 993<br />
              <strong>SMTP Sunucu:</strong> smtp.yandex.com<br />
              <strong>SMTP Port:</strong> 465<br />
              <strong>SSL/TLS:</strong> Evet<br />
            </Typography>
            <Typography variant="body2" paragraph>
              Yandex Mail hesabınızda IMAP'ın etkinleştirilmiş olduğundan emin olun. 
              Etkinleştirmek için Yandex Mail'de Ayarlar &gt; Tüm Ayarlar &gt; Posta İstemcileri bölümüne gidin.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Gmail Ayarları</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              <strong>IMAP Sunucu:</strong> imap.gmail.com<br />
              <strong>IMAP Port:</strong> 993<br />
              <strong>SMTP Sunucu:</strong> smtp.gmail.com<br />
              <strong>SMTP Port:</strong> 465<br />
              <strong>SSL/TLS:</strong> Evet<br />
            </Typography>
            <Typography variant="body2" paragraph>
              Gmail hesabınızda "Daha az güvenli uygulamalar" özelliğini etkinleştirmeniz veya uygulama şifresi oluşturmanız gerekebilir.
              Ayrıntılı bilgi için Gmail güvenlik ayarlarınızı kontrol edin.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Outlook/Office 365 Ayarları</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              <strong>IMAP Sunucu:</strong> outlook.office365.com<br />
              <strong>IMAP Port:</strong> 993<br />
              <strong>SMTP Sunucu:</strong> smtp.office365.com<br />
              <strong>SMTP Port:</strong> 587<br />
              <strong>SSL/TLS:</strong> Evet<br />
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Modal içerisindeki form */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedSetting ? 'E-posta Hesabını Düzenle' : 'Yeni E-posta Hesabı Ekle'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Hesap Bilgileri</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Görünen İsim"
                name="name"
                value={formData.name}
                onChange={handleTextFieldChange}
                placeholder="Müşteri Destek"
                helperText="Bu hesap için görünen isim"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-posta Adresi"
                name="email"
                value={formData.email}
                onChange={handleTextFieldChange}
                placeholder="destek@firmaniz.com"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>E-posta Servisi</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="E-posta Servisi"
                >
                  <MenuItem value={EmailServiceType.YANDEX}>Yandex Mail</MenuItem>
                  <MenuItem value={EmailServiceType.GMAIL}>Gmail</MenuItem>
                  <MenuItem value={EmailServiceType.OUTLOOK}>Outlook / Office 365</MenuItem>
                  <MenuItem value={EmailServiceType.SMTP}>Özel SMTP/IMAP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                name="username"
                value={formData.username}
                onChange={handleTextFieldChange}
                placeholder="E-posta adresiniz veya kullanıcı adınız"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleTextFieldChange}
                placeholder="********"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kontrol Sıklığı (dakika)"
                name="pollingInterval"
                type="number"
                value={formData.pollingInterval}
                onChange={handleTextFieldChange}
                inputProps={{ min: 1, max: 60 }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Sunucu Ayarları</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IMAP Sunucu"
                name="incomingServer"
                value={formData.incomingServer}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IMAP Port"
                name="incomingPort"
                type="number"
                value={formData.incomingPort}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SMTP Sunucu"
                name="outgoingServer"
                value={formData.outgoingServer}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                name="outgoingPort"
                type="number"
                value={formData.outgoingPort}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableSSL}
                    onChange={handleSwitchChange}
                    name="enableSSL"
                  />
                }
                label="SSL/TLS Kullan"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Destek Talebi Ayarları</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                  />
                }
                label="Bu Hesabı Aktif Et"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.createTickets}
                    onChange={handleSwitchChange}
                    name="createTickets"
                  />
                }
                label="E-postaları Otomatik Destek Talebine Dönüştür"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoReply}
                    onChange={handleSwitchChange}
                    name="autoReply"
                  />
                }
                label="Otomatik Yanıt Gönder"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={handleSwitchChange}
                    name="isDefault"
                  />
                }
                label="Varsayılan E-posta Hesabı"
              />
            </Grid>
            
            {formData.autoReply && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Otomatik Yanıt Şablonu"
                  name="autoReplyTemplate"
                  value={formData.autoReplyTemplate}
                  onChange={handleTextFieldChange}
                  multiline
                  rows={4}
                  placeholder="Sayın müşterimiz, destek talebiniz alınmıştır. En kısa sürede dönüş yapılacaktır."
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay İletişim Kutusu */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>E-posta Hesabını Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedSetting?.name}" ({selectedSetting?.email}) hesabını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test İletişim Kutusu */}
      <Dialog
        open={openTestDialog}
        onClose={handleTestDialogClose}
      >
        <DialogTitle>E-posta Bağlantısını Test Et</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            "{selectedSetting?.name}" ({selectedSetting?.email}) hesabının bağlantı ayarlarını test et.
          </Typography>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {testResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTestDialogClose} color="inherit">
            Kapat
          </Button>
          <Button 
            onClick={handleTestConnection} 
            color="primary"
            variant="contained"
            disabled={testLoading}
            startIcon={testLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
          >
            {testLoading ? 'Test Ediliyor...' : 'Test Et'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailSettings; 