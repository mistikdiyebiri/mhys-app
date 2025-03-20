import React from 'react';
import { Box, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import TicketList from '../../components/ticket/TicketList';

const Tickets: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <TicketList 
          userId={user?.id} 
          isCustomerView={false}
          showFilters={true}
        />
      </Paper>
    </Box>
  );
};

export default Tickets;