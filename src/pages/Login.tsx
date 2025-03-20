import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// @ts-ignore
import { Amplify } from 'aws-amplify';
// @ts-ignore
import { resetPassword } from '@aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Amplify konfigürasyonunu kontrol et
  useEffect(() => {
    try {
      console.log('Login: Amplify konfigürasyonu kontrol ediliyor...');
      // @ts-ignore
      const config = Amplify.getConfig();
      console.log('Login: Mevcut Amplify konfigürasyonu:', JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Login: Amplify konfigürasyonu kontrol edilirken hata:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login: Giriş denemesi yapılıyor:', email);
    
    if (!email || !password) {
      console.warn('Login: E-posta veya şifre boş!');
      setError('Lütfen e-posta ve şifre giriniz');
      setShowAlert(true);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Login: AuthContext.login fonksiyonu çağrılıyor...');
      await login(email, password);
      console.log('Login: Giriş başarılı, portala yönlendiriliyor');
      navigate('/portal');
    } catch (error: any) {
      console.error('Login: Giriş yaparken hata oluştu:', error);
      
      // Error object'in içeriğini incele
      console.log('Login: Hata tipi:', typeof error);
      console.log('Login: Hata mesajı:', error.message);
      console.log('Login: Hata özellikleri:', Object.keys(error));
      
      if (error.code === 'UserNotFoundException') {
        setError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'NotAuthorizedException') {
        setError('Hatalı şifre girdiniz');
      } else if (error.code === 'UserNotConfirmedException') {
        setError('Hesabınız henüz doğrulanmamış');
        // Doğrulama işlemine yönlendirme yapılabilir
      } else {
        // Eğer özel bir hata kodu yoksa, hatanın doğrudan mesajını göster
        setError(error.message || 'Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      console.warn('Login: Şifre sıfırlama için e-posta adresi boş!');
      setError('Şifre sıfırlama için lütfen e-posta adresinizi giriniz');
      setShowAlert(true);
      return;
    }
    
    console.log('Login: Şifre sıfırlama işlemi başlatılıyor:', email);
    setLoading(true);
    
    try {
      // Mock ortamda gerçekten çalışmayacak, sadece simüle ediyoruz
      console.log('Login: resetPassword fonksiyonu çağrılıyor');
      await resetPassword({ username: email });
      console.log('Login: Şifre sıfırlama işlemi başarılı, yönlendiriliyor');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Login: Şifre sıfırlama işlemi başlatılırken hata oluştu:', error);
      
      // Error object'in içeriğini incele
      console.log('Login: Hata tipi:', typeof error);
      console.log('Login: Hata mesajı:', error.message);
      console.log('Login: Hata özellikleri:', Object.keys(error));
      
      if (error.code === 'UserNotFoundException') {
        setError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'LimitExceededException') {
        setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError(error.message || 'Şifre sıfırlama işlemi başlatılırken bir hata oluştu.');
      }
      
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Test kullanıcıları için hızlı giriş
  const setTestUser = (userType: string) => {
    if (userType === 'admin') {
      setEmail('admin@mhys.com');
      setPassword('Admin123!');
    } else if (userType === 'employee') {
      setEmail('personel@mhys.com');
      setPassword('Personel123!');
    } else if (userType === 'customer') {
      setEmail('musteri@firma.com');
      setPassword('Musteri123!');
    }
  };

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
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            width: '100%'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              borderRadius: '50%', 
              p: 1.5, 
              mb: 2
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            MHYS
          </Typography>
          <Typography component="h2" variant="h6" gutterBottom color="primary.main">
            Müşteri Hizmet Yönetim Sistemi
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Talep, destek ve müşteri yönetimi için tek platform
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
            
            <Grid container>
              <Grid item xs>
                <Link 
                  to="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Typography variant="body2" color="primary">
                    Şifremi Unuttum
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography variant="body2" color="primary">
                    Hesabınız yok mu? Kayıt olun
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Geliştirme sırasında test için hızlı giriş butonları */}
        {process.env.NODE_ENV !== 'production' && (
          <Paper
            elevation={2}
            sx={{
              mt: 3,
              p: 2,
              width: '100%',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="subtitle2" align="center" gutterBottom color="text.secondary">
              Hızlı Test Girişi
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => setTestUser('admin')}
                color="secondary"
                sx={{ minWidth: '100px' }}
                startIcon={<span style={{ fontSize: '10px' }}>👑</span>}
              >
                Admin
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setTestUser('employee')}
                color="primary"
                sx={{ minWidth: '100px' }}
                startIcon={<span style={{ fontSize: '10px' }}>👨‍💼</span>}
              >
                Personel
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setTestUser('customer')}
                color="info"
                sx={{ minWidth: '100px' }}
                startIcon={<span style={{ fontSize: '10px' }}>👤</span>}
              >
                Müşteri
              </Button>
            </Box>
          </Paper>
        )}
        
        <Box mt={3}>
          <Typography variant="body2" align="center">
            Yönetici veya personel girişi için{' '}
            <Link to="/admin" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" component="span" color="primary" fontWeight="bold">
                tıklayınız
              </Typography>
            </Link>
          </Typography>
        </Box>
        
        <Box mt={5} sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            © {new Date().getFullYear()} MHYS - Müşteri Hizmet Yönetim Sistemi
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Güvenli bağlantı ile korunmaktadır 🔒
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

export default Login;