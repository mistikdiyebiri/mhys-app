import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import TicketList from '../../components/ticket/TicketList';

const Tickets: React.FC = () => {
  const { user, userRole } = useAuth();
  const [pageTitle] = useState<string>("Destek Talepleri");

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {pageTitle}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Paper sx={{ p: 2 }}>
        <TicketList 
          userId={user?.id} 
          isCustomerView={false} 
        />
      </Paper>
    </Box>
  );
};

export default Tickets;