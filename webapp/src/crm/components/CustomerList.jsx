import React from 'react';
import { 
  List, 
  Datagrid, 
  TextField, 
  EmailField, 
  DateField, 
  EditButton, 
  ShowButton,
  BooleanField,
  ChipField,
  ReferenceField,
  Filter,
  SearchInput,
  SelectInput,
  BooleanInput,
  DateInput
} from 'react-admin';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Badge
} from '@mui/material';

// Custom field to display CRM tags
const CRMTagsField = ({ record }) => {
  if (!record?.crmTags || record.crmTags.length === 0) return null;
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {record.crmTags.map((tag, index) => (
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
      case 'Converted': return 'success';
      case 'Quoted': return 'info';
      case 'Follow-up Needed': return 'warning';
      case 'Lost': return 'error';
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

// Custom field to display lead indicator
const LeadField = ({ record }) => {
  if (!record?.isLead) return null;
  
  return (
    <Chip
      label="LEAD"
      size="small"
      color="warning"
      variant="filled"
    />
  );
};

// Custom field to display customer type
const CustomerTypeField = ({ record }) => {
  if (!record?.customerType) return null;
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'company': return 'primary';
      case 'lead': return 'warning';
      default: return 'default';
    }
  };
  
  return (
    <Chip
      label={record.customerType}
      size="small"
      color={getTypeColor(record.customerType)}
      variant="outlined"
    />
  );
};

// Customer filters
const CustomerFilters = () => (
  <Filter>
    <SearchInput source="q" placeholder="Search by name, email, or phone" alwaysOn />
    <SelectInput 
      source="customerType" 
      label="Customer Type"
      choices={[
        { id: 'individual', name: 'Individual' },
        { id: 'company', name: 'Company' },
        { id: 'lead', name: 'Lead' }
      ]}
    />
    <SelectInput 
      source="status" 
      label="Status"
      choices={[
        { id: 'New Inquiry', name: 'New Inquiry' },
        { id: 'Quoted', name: 'Quoted' },
        { id: 'Follow-up Needed', name: 'Follow-up Needed' },
        { id: 'Converted', name: 'Converted' },
        { id: 'Lost', name: 'Lost' }
      ]}
    />
    <BooleanInput source="isLead" label="Is Lead" />
    <SelectInput 
      source="source" 
      label="Source"
      choices={[
        { id: 'Website', name: 'Website' },
        { id: 'Referral', name: 'Referral' },
        { id: 'Social Media', name: 'Social Media' },
        { id: 'Google Search', name: 'Google Search' },
        { id: 'Phone Call', name: 'Phone Call' },
        { id: 'Walk-in', name: 'Walk-in' },
        { id: 'Other', name: 'Other' }
      ]}
    />
  </Filter>
);

const CustomerList = () => (
  <List filters={<CustomerFilters />} perPage={25}>
    <Datagrid bulkActionButtons={false} rowClick="edit">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LeadField />
        <TextField source="name" label="Name" />
      </Box>
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Phone" />
      <CustomerTypeField />
      <StatusField />
      <CRMTagsField />
      <TextField source="source" label="Source" />
      <ReferenceField source="assignedTo" reference="users" label="Assigned To">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" label="Created" />
      <DateField source="followUpDate" label="Follow-up" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default CustomerList; 