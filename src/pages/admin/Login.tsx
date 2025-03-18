import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  ButtonGroup
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// signOut doğrudan AuthContext'ten kullanacağız
// import { signOut } from '@aws-amplify/auth';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  
  const navigate = useNavigate();
  const { login, getUserAttributes, logout } = useAuth();

  // Kullanıcı bilgilerini kontrol eden fonksiyon - oturum açıldığından emin olmak için kullanılacak
  const checkUserRole = async (maxRetries = 3) => {
    let retries = 0;
    
    // Belirli bir süre bekle, kullanıcı bilgilerinin localStorage'a kaydedilmesi için
    const waitForAttributes = () => new Promise(resolve => setTimeout(resolve, 300));
    
    // İlk çağrıdan önce kısa bir bekleme
    await waitForAttributes();
    
    try {
      // Artık getUserAttributes kendi içinde yeniden deneme yapıyor
      const userAttributes = await getUserAttributes();
      const userRole = userAttributes['custom:role'];
      
      // Sadece admin veya personel rolüne sahip kullanıcılar girebilir
      if (userRole && (userRole === 'admin' || userRole === 'employee')) {
        navigate('/admin/dashboard');
        return true;
      } else {
        // Rolü uygun değilse çıkış yap ve hata göster
        await logout();
        setError('Bu alana erişim yetkiniz bulunmamaktadır.');
        setShowAlert(true);
        return false;
      }
    } catch (error) {
      console.log('Kullanıcı rolü kontrol edilirken hata oluştu:', error);
      setError('Kullanıcı bilgileri alınamadı, lütfen tekrar giriş yapın.');
      setShowAlert(true);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Lütfen e-posta ve şifre giriniz');
      setShowAlert(true);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Kullanıcı girişi yap
      await login(email, password);
      
      // Kullanıcı rolünü kontrol et - otomatik yeniden deneme ile
      await checkUserRole();
    } catch (error: any) {
      console.error('Giriş yaparken hata oluştu:', error);
      
      // Hata mesajlarını daha kullanıcı dostu hale getiriyoruz
      if (error.message) {
        setError(error.message);
      } else if (error.code === 'UserNotFoundException') {
        setError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'NotAuthorizedException') {
        setError('Hatalı şifre girdiniz');
      } else if (error.code === 'UserNotConfirmedException') {
        setError('Hesabınız henüz doğrulanmamış');
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Demo kullanıcıları için hızlı giriş fonksiyonları
  const loginAsAdmin = async () => {
    setLoading(true);
    try {
      await login('admin@mhys.com', 'Admin123!');
      await checkUserRole();
    } catch (error: any) {
      console.error('Demo giriş hatası (Admin):', error);
      setError(error.message || 'Demo giriş başarısız oldu');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const loginAsStaff = async () => {
    setLoading(true);
    try {
      await login('personel@mhys.com', 'Personel123!');
      await checkUserRole();
    } catch (error: any) {
      console.error('Demo giriş hatası (Personel):', error);
      setError(error.message || 'Demo giriş başarısız oldu');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // logout fonksiyonunu AuthContext'ten kullanacağız
  // const logout = async () => {
  //   try {
  //     await signOut();
  //   } catch (error) {
  //     console.error('Çıkış yapılırken hata oluştu:', error);
  //   }
  // };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              borderRadius: '50%', 
              p: 1, 
              mb: 1
            }}
          >
            <AdminPanelSettingsIcon />
          </Box>
          <Typography component="h1" variant="h5">
            Yönetici / Personel Girişi
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Giriş Yap'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                VEYA
              </Typography>
            </Divider>
            
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              Demo Hesapları ile Giriş Yap
            </Typography>
            
            <ButtonGroup fullWidth variant="outlined">
              <Button 
                onClick={loginAsAdmin}
                disabled={loading}
                color="primary"
                sx={{ mt: 1 }}
              >
                Admin Demo
              </Button>
              <Button 
                onClick={loginAsStaff}
                disabled={loading}
                color="secondary"
                sx={{ mt: 1 }}
              >
                Personel Demo
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>
        
        <Box mt={3}>
          <Typography variant="body2" align="center">
            Müşteri girişi için{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" component="span" color="primary">
                tıklayınız
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
      
      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminLogin; 