import React from 'react';
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
  Chip
} from '@mui/material';

// Custom field to display tags
const TagsField = ({ record }) => {
  if (!record?.tags || record.tags.length === 0) return null;
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {record.tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          size="small"
          variant="outlined"
          color="primary"
        />
      ))}
    </Box>
  );
};

// Custom field to display status with color
const StatusField = ({ record }) => {
  if (!record?.status) return null;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };
  
  return (
    <Chip
      label={record.status}
      size="small"
      color={getStatusColor(record.status)}
    />
  );
};

// Customer filters
const CustomerFilters = () => (
  <Filter>
    <SearchInput source="q" placeholder="Search by name, email, or phone" alwaysOn />
    <SelectInput 
      source="status" 
      label="Status"
      choices={[
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
        { id: 'pending', name: 'Pending' }
      ]}
    />
  </Filter>
);

const CustomerList = () => (
  <List filters={<CustomerFilters />} perPage={25}>
    <Datagrid bulkActionButtons={false} rowClick="edit">
      <TextField source="name" label="Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Phone" />
      <TextField source="company" label="Company" />
      <StatusField />
      <TagsField />
      <DateField source="createdAt" label="Created" />
      <DateField source="lastContact" label="Last Contact" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default CustomerList; 