import React from 'react';
import { 
  Show, 
  SimpleShowLayout, 
  TextField, 
  EmailField, 
  DateField,
  BooleanField,
  ReferenceField,
  ArrayField,
  Datagrid,
  NumberField
} from 'react-admin';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Divider,
  Grid
} from '@mui/material';

// Custom field to display CRM tags
const CRMTagsField = ({ record }) => {
  if (!record?.crmTags || record.crmTags.length === 0) return <span>No tags</span>;
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
  if (!record?.status) return <span>No status</span>;
  
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
      color={getStatusColor(record.status)}
    />
  );
};

// Custom field to display customer type
const CustomerTypeField = ({ record }) => {
  if (!record?.customerType) return <span>Not specified</span>;
  
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
      color={getTypeColor(record.customerType)}
      variant="outlined"
    />
  );
};

// Custom field to display addresses
const AddressesField = ({ record }) => {
  if (!record?.addresses || record.addresses.length === 0) return <span>No addresses</span>;
  
  return (
    <Box>
      {record.addresses.map((address, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {address.type} Address
          </Typography>
          <Typography variant="body2">{address.address}</Typography>
          <Typography variant="body2">{address.city}, {address.postalCode}</Typography>
        </Box>
      ))}
    </Box>
  );
};

// Custom field to display property details
const PropertyDetailsField = ({ record }) => {
  if (!record?.propertyDetails) return <span>No property details</span>;
  
  const details = record.propertyDetails;
  
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Square Footage:</strong> {details.squareFootage || 'Not specified'} m²
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Rooms:</strong> {details.rooms || 'Not specified'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Features:</strong> {details.features || 'No features specified'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

// Custom field to display preferences
const PreferencesField = ({ record }) => {
  if (!record?.preferences) return <span>No preferences set</span>;
  
  const prefs = record.preferences;
  
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Preferred Products:</strong> {prefs.preferredProducts || 'Not specified'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Special Instructions:</strong> {prefs.specialInstructions || 'None'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Alarm Codes:</strong> {prefs.alarmCodes || 'Not provided'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Pet Info:</strong> {prefs.petInfo || 'No pets'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <strong>Key Locations:</strong> {prefs.keyLocations || 'Not specified'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

// Custom field to display custom fields
const CustomFieldsField = ({ record }) => {
  if (!record?.customFields || Object.keys(record.customFields).length === 0) {
    return <span>No custom fields</span>;
  }
  
  return (
    <Box>
      {Object.entries(record.customFields).map(([key, value]) => (
        <Box key={key} sx={{ mb: 1 }}>
          <Typography variant="body2">
            <strong>{key}:</strong> {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const CustomerShow = () => (
  <Show>
    <SimpleShowLayout>
      {/* Basic Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField source="name" label="Full Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <EmailField source="email" label="Email" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField source="phone" label="Phone Number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomerTypeField />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField source="companyName" label="Company Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField source="source" label="Source" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lead Management */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Lead Management</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <BooleanField source="isLead" label="Is Lead" />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatusField />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReferenceField source="assignedTo" reference="users" label="Assigned To">
                <TextField source="name" />
              </ReferenceField>
            </Grid>
            <Grid item xs={12} md={6}>
              <DateField source="followUpDate" label="Follow-up Date" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Addresses</Typography>
          <AddressesField />
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Property Details</Typography>
          <PropertyDetailsField />
        </CardContent>
      </Card>

      {/* Preferences & Special Instructions */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Preferences & Special Instructions</Typography>
          <PreferencesField />
        </CardContent>
      </Card>

      {/* CRM Tags */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>CRM Tags</Typography>
          <CRMTagsField />
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Custom Fields</Typography>
          <CustomFieldsField />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Notes</Typography>
          <TextField source="notes" label="General Notes" />
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Timestamps</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DateField source="createdAt" label="Created At" />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateField source="updatedAt" label="Updated At" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </SimpleShowLayout>
  </Show>
);

export default CustomerShow; 