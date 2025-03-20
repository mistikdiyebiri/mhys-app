import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Box,
  useTheme
} from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import ChatIcon from '@mui/icons-material/Chat';
import BusinessIcon from '@mui/icons-material/Business';

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            MHYS - Müşteri Hizmet Yönetim Sistemi
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Müşteri taleplerinizi yönetmek hiç bu kadar kolay olmamıştı!
          </Typography>
          <Box mt={4}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              component={Link} 
              to="/login"
              sx={{ mr: 2 }}
            >
              Giriş Yap
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component="a"
              href="#ozellikler"
            >
              Özelliklerimiz
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="ozellikler">
        <Typography variant="h3" component="h2" gutterBottom align="center" mb={6}>
          Hizmetlerimiz
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <SupportIcon fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center">
                  7/24 Destek
                </Typography>
                <Typography align="center">
                  Teknik destek ekibimiz her zaman yanınızda. İhtiyaç duyduğunuz an bize ulaşabilirsiniz.
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center' }}>
                <Button size="small" color="primary">Daha Fazla</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ChatIcon fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center">
                  AI Destekli Sohbet
                </Typography>
                <Typography align="center">
                  Yapay zeka destekli sohbet botumuz ile anlık sorularınızın cevabını kolayca bulabilirsiniz.
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center' }}>
                <Button size="small" color="primary">Daha Fazla</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <BusinessIcon fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center">
                  Kurumsal Çözümler
                </Typography>
                <Typography align="center">
                  İşletmenize özel müşteri hizmetleri çözümleri sunuyoruz. İhtiyaçlarınıza göre özelleştirilebilir sistemler.
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center' }}>
                <Button size="small" color="primary">Daha Fazla</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* İstatistikler Bölümü */}
      <Box sx={{ bgcolor: theme.palette.primary.light, color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center" mb={4}>
            MHYS İstatistikleri
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h2" component="p" fontWeight="bold">
                  1500+
                </Typography>
                <Typography variant="h6">Mutlu Müşteri</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h2" component="p" fontWeight="bold">
                  98%
                </Typography>
                <Typography variant="h6">Çözüm Oranı</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h2" component="p" fontWeight="bold">
                  24/7
                </Typography>
                <Typography variant="h6">Destek</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h2" component="p" fontWeight="bold">
                  10+
                </Typography>
                <Typography variant="h6">Yıllık Deneyim</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.200', py: 6, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h6" align="center" gutterBottom>
            Müşteri Hizmetleri Platformu
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
            Bize 7/24 ulaşabilirsiniz
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' MHYS. Tüm hakları saklıdır.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 