import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Sayfa Bulunamadı
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;