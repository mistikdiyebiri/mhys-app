import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import TicketList from '../../components/ticket/TicketList';

const Tickets: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
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