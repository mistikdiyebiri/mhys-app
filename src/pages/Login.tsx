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
      await login(email, password);
      navigate('/portal');
    } catch (error: any) {
      console.error('Giriş yaparken hata oluştu:', error);
      
      if (error.code === 'UserNotFoundException') {
        setError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'NotAuthorizedException') {
        setError('Hatalı şifre girdiniz');
      } else if (error.code === 'UserNotConfirmedException') {
        setError('Hesabınız henüz doğrulanmamış');
        // Doğrulama işlemine yönlendirme yapılabilir
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Şifre sıfırlama için lütfen e-posta adresinizi giriniz');
      setShowAlert(true);
      return;
    }
    
    setLoading(true);
    
    try {
      await resetPassword({ username: email });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Şifre sıfırlama işlemi başlatılırken hata oluştu:', error);
      
      if (error.code === 'UserNotFoundException') {
        setError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'LimitExceededException') {
        setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('Şifre sıfırlama işlemi başlatılırken bir hata oluştu.');
      }
      
      setShowAlert(true);
    } finally {
      setLoading(false);
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
            <LockOutlinedIcon />
          </Box>
          <Typography component="h1" variant="h5">
            Müşteri Girişi
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
        
        <Box mt={3}>
          <Typography variant="body2" align="center">
            Yönetici veya personel girişi için{' '}
            <Link to="/admin" style={{ textDecoration: 'none' }}>
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

export default Login; 