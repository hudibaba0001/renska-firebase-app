import React, { useState, useEffect } from 'react';
import { 
  List, 
  Datagrid, 
  TextField, 
  EmailField, 
  DateField, 
  EditButton, 
  ShowButton,
  Filter,
  SearchInput,
  SelectInput
} from 'react-admin';
import { 
  Box, 
  Chip,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import firebase from '../../firebase/init';

// Debug component to show raw data
const DebugCustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('🔍 Fetching customers from Firestore...');
        const snapshot = await firebase.firestore()
          .collection('customers')
          .where('companyId', '==', 'r7kAsnh-r1')
          .get();
        
        const customerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📊 Found customers:', customerData);
        setCustomers(customerData);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching customers:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading customers...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Customers ({customers.length})</Typography>
        {customers.length === 0 ? (
          <Typography>No customers found. Try loading demo data first.</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {customers.map(customer => (
              <Box key={customer.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography><strong>Name:</strong> {customer.name || 'N/A'}</Typography>
                <Typography><strong>Email:</strong> {customer.email || 'N/A'}</Typography>
                <Typography><strong>Phone:</strong> {customer.phone || 'N/A'}</Typography>
                <Typography><strong>Company:</strong> {customer.company || 'N/A'}</Typography>
                <Typography><strong>Status:</strong> {customer.status || 'N/A'}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Use the debug component for now
const CustomerList = () => {
  return <DebugCustomerList />;
};

export default CustomerList; 