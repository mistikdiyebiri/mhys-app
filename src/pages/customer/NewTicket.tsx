import React, { useState, useEffect, ReactNode } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Department } from '../../models/schema';

// Stepper adımları
const steps = ['Konu ve Departman', 'Detaylar', 'Tamamlama'];

// Tipini AuthContext ile uyumlu hale getirdik
interface CurrentUser {
  id?: string;
  email?: string;
  username?: string;
}

const NewTicket: React.FC = () => {
  const auth = useAuth();
  const { currentUser } = auth;
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  
  // Form durumu
  const [formState, setFormState] = useState({
    title: '',
    departmentId: '',
    description: '',
    priority: 'medium',
    attachments: [] as File[]
  });
  
  // Form hataları
  const [formErrors, setFormErrors] = useState({
    title: '',
    departmentId: '',
    description: ''
  });
  
  // Departmanlar
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Mock veriler
  const mockDepartments: Department[] = [
    { id: '1', name: 'Teknik Destek', description: 'Teknik sorunlar ve ürün desteği', createdAt: '', updatedAt: '' },
    { id: '2', name: 'Satış', description: 'Siparişler ve ürün bilgileri', createdAt: '', updatedAt: '' },
    { id: '3', name: 'Finans', description: 'Faturalar ve ödemeler', createdAt: '', updatedAt: '' }
  ];
  
  useEffect(() => {
    // Gerçek uygulamada API çağrısı
    // const fetchDepartments = async () => {
    //   try {
    //     const result = await API.graphql(graphqlOperation(listDepartments));
    //     setDepartments(result.data.listDepartments.items);
    //   } catch (error) {
    //     console.error('Error fetching departments', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchDepartments();
    
    // Mock data kullanıyoruz
    setLoading(true);
    setTimeout(() => {
      setDepartments(mockDepartments);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
    
    // Hata mesajını temizle
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Select bileşeni için tip hatasını düzelttik
  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    setFormState({
      ...formState,
      [name]: value
    });
    
    // Hata mesajını temizle
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormState({
        ...formState,
        attachments: [...formState.attachments, ...newFiles]
      });
    }
  };
  
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...formState.attachments];
    updatedFiles.splice(index, 1);
    setFormState({
      ...formState,
      attachments: updatedFiles
    });
  };
  
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newErrors = { ...formErrors };
    
    switch (step) {
      case 0:
        // Konu ve departman validasyonu
        if (!formState.title.trim()) {
          newErrors.title = 'Konu alanı zorunludur';
          isValid = false;
        }
        
        if (!formState.departmentId) {
          newErrors.departmentId = 'Lütfen bir departman seçin';
          isValid = false;
        }
        break;
        
      case 1:
        // Açıklama validasyonu
        if (!formState.description.trim()) {
          newErrors.description = 'Açıklama alanı zorunludur';
          isValid = false;
        } else if (formState.description.trim().length < 20) {
          newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
          isValid = false;
        }
        break;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    
    setSubmitting(true);
    
    // Yeni talep verisi
    const newTicket = {
      title: formState.title,
      description: formState.description,
      status: 'open',
      priority: formState.priority,
      departmentId: formState.departmentId,
      customerId: currentUser?.id || 'user-1', // ID yoksa varsayılan değer
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Gerçek uygulamada:
    // try {
    //   const result = await API.graphql(graphqlOperation(createTicket, { input: newTicket }));
    //   const newTicketId = result.data.createTicket.id;
    //   
    //   // Eğer ekler varsa
    //   if (formState.attachments.length > 0) {
    //     for (const file of formState.attachments) {
    //       await Storage.put(`tickets/${newTicketId}/${file.name}`, file, {
    //         contentType: file.type
    //       });
    //     }
    //   }
    //   
    //   setTicketId(newTicketId);
    //   setTicketSubmitted(true);
    //   setActiveStep(2);
    // } catch (error) {
    //   console.error('Error creating ticket', error);
    //   // Hata mesajı göster
    // } finally {
    //   setSubmitting(false);
    // }
    
    // Mock işlem
    setTimeout(() => {
      const mockTicketId = `ticket-${Date.now()}`;
      setTicketId(mockTicketId);
      setTicketSubmitted(true);
      setActiveStep(2);
      setSubmitting(false);
    }, 2000);
  };
  
  const handleGoBack = () => {
    // Ana müşteri sayfasına yönlendir
    // history.push('/customer/dashboard');
    console.log('Ana sayfaya dön');
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ my: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Talep Konusu"
                  name="title"
                  value={formState.title}
                  onChange={handleTextChange}
                  required
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.departmentId}>
                  <InputLabel id="department-label">Departman</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="departmentId"
                    value={formState.departmentId}
                    onChange={handleSelectChange}
                    label="Departman"
                    disabled={loading}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.departmentId && (
                    <FormHelperText>{formErrors.departmentId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Öncelik</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formState.priority}
                    onChange={handleSelectChange}
                    label="Öncelik"
                  >
                    <MenuItem value="low">Düşük</MenuItem>
                    <MenuItem value="medium">Orta</MenuItem>
                    <MenuItem value="high">Yüksek</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ my: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  name="description"
                  multiline
                  rows={6}
                  value={formState.description}
                  onChange={handleTextChange}
                  required
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  placeholder="Lütfen sorununuzu veya talebinizi detaylı olarak açıklayın..."
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Ekler (İsteğe bağlı)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                >
                  Dosya Ekle
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileChange}
                  />
                </Button>
                
                {formState.attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Eklenmiş Dosyalar ({formState.attachments.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Grid container spacing={1}>
                        {formState.attachments.map((file, index) => (
                          <Grid item xs={12} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                              <Typography variant="body2" noWrap>
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(index)}
                                aria-label="Dosyayı kaldır"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ my: 3, textAlign: 'center' }}>
            {ticketSubmitted ? (
              <>
                <Typography variant="h5" color="primary" gutterBottom>
                  Destek Talebiniz Oluşturuldu!
                </Typography>
                <Typography variant="body1" paragraph>
                  Talebiniz başarıyla oluşturuldu. Talep numaranız: <b>{ticketId}</b>
                </Typography>
                <Typography variant="body2" paragraph>
                  Talebiniz ilgili departmana iletildi. En kısa sürede sizinle iletişime geçilecektir.
                  Talebinizin durumunu "Taleplerim" sayfasından takip edebilirsiniz.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGoBack}
                  sx={{ mt: 2 }}
                >
                  Ana Sayfaya Dön
                </Button>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 2 }}
      >
        Geri Dön
      </Button>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Yeni Destek Talebi Oluştur
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || activeStep === 2}
            onClick={handleBack}
          >
            Geri
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                İleri
              </Button>
            ) : activeStep === steps.length - 1 && !ticketSubmitted ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={submitting}
              >
                {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </Button>
            ) : null}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewTicket;
