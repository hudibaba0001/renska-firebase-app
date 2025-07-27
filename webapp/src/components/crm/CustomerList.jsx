import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import CustomerForm from './CustomerForm';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterRutRot, setFilterRutRot] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null });

  // Mock data for development (replace with actual API calls)
  const mockCustomers = [
    {
      id: '1',
      name: 'Anna Johansson',
      email: 'anna.johansson@example.com',
      phone: '070-123 45 67',
      address: 'Storgatan 12, 111 52 Stockholm',
      rutRotEligible: true,
      isCompany: false,
      areaTag: 'Stockholm',
      customerTags: ['VIP', 'RUT-berättigad', 'Återkommande'],
      bookingFrequency: 'weekly',
      consentGiven: true,
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Stockholm Office Solutions',
      email: 'info@stockholmoffices.com',
      phone: '08-555 12 34',
      address: 'Kungsgatan 5, 111 43 Stockholm',
      rutRotEligible: false,
      isCompany: true,
      contactPerson: 'Lars Nilsson',
      areaTag: 'Stockholm',
      customerTags: ['Kommersiell', 'Flerårig kontrakt', 'Stor kund'],
      bookingFrequency: 'monthly',
      consentGiven: true,
      createdAt: '2025-01-10T14:20:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = !filterArea || customer.areaTag === filterArea;
    const matchesRutRot = filterRutRot === '' || 
                         (filterRutRot === 'true' && customer.rutRotEligible) ||
                         (filterRutRot === 'false' && !customer.rutRotEligible);
    
    return matchesSearch && matchesArea && matchesRutRot;
  });

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setOpenForm(true);
  };

  const handleDelete = (customer) => {
    setDeleteDialog({ open: true, customer });
  };

  const confirmDelete = () => {
    // Mock delete operation
    setCustomers(customers.filter(c => c.id !== deleteDialog.customer.id));
    setDeleteDialog({ open: false, customer: null });
  };

  const handleFormSubmit = (customerData) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id ? { ...c, ...customerData } : c
      ));
    } else {
      // Add new customer
      const newCustomer = {
        id: Date.now().toString(),
        ...customerData,
        createdAt: new Date().toISOString()
      };
      setCustomers([...customers, newCustomer]);
    }
    setOpenForm(false);
    setEditingCustomer(null);
  };

  const areas = [...new Set(customers.map(c => c.areaTag))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add Customer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search customers"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Area</InputLabel>
          <Select
            value={filterArea}
            label="Area"
            onChange={(e) => setFilterArea(e.target.value)}
          >
            <MenuItem value="">All Areas</MenuItem>
            {areas.map(area => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>RUT/ROT Eligible</InputLabel>
          <Select
            value={filterRutRot}
            label="RUT/ROT Eligible"
            onChange={(e) => setFilterRutRot(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Eligible</MenuItem>
            <MenuItem value="false">Not Eligible</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing {filteredCustomers.length} of {customers.length} customers
      </Typography>

      {/* Customer Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>RUT/ROT</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {customer.name}
                    </Typography>
                    {customer.isCompany && customer.contactPerson && (
                      <Typography variant="caption" color="text.secondary">
                        Contact: {customer.contactPerson}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.areaTag}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.rutRotEligible ? 'Eligible' : 'Not Eligible'}
                    color={customer.rutRotEligible ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap" maxWidth={200}>
                    {customer.customerTags?.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    ))}
                    {(!customer.customerTags || customer.customerTags.length === 0) && (
                      <Typography variant="caption" color="text.secondary">
                        No tags
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(customer)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(customer)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Customer Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingCustomer(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setOpenForm(false);
              setEditingCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, customer: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer "{deleteDialog.customer?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, customer: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerList;
