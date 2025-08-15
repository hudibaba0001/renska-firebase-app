import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import CustomerList from '../components/crm/CustomerList';

const CRMPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          SwedPrime CRM
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your customers, track leads, and monitor business relationships
        </Typography>
        
        <Paper sx={{ mt: 3 }}>
          <CustomerList />
        </Paper>
      </Box>
    </Container>
  );
};

export default CRMPage; 