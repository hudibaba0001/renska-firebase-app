import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  SelectInput, 
  DateInput,
  ArrayInput,
  SimpleFormIterator,
  NumberInput,
  BooleanInput,
  ReferenceInput,
  AutocompleteInput,
  required,
  email,
  useRecordContext
} from 'react-admin';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  TextField,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// CRM Tags options
const CRM_TAGS = [
  { id: 'VIP', name: 'VIP' },
  { id: 'New Client', name: 'New Client' },
  { id: 'Commercial', name: 'Commercial' },
  { id: 'Residential', name: 'Residential' },
  { id: 'RUT-eligible', name: 'RUT-eligible' },
  { id: 'High Value', name: 'High Value' },
  { id: 'Regular', name: 'Regular' },
  { id: 'Prospect', name: 'Prospect' }
];

// Lead Status options
const LEAD_STATUS = [
  { id: 'New Inquiry', name: 'New Inquiry' },
  { id: 'Quoted', name: 'Quoted' },
  { id: 'Follow-up Needed', name: 'Follow-up Needed' },
  { id: 'Converted', name: 'Converted' },
  { id: 'Lost', name: 'Lost' }
];

// Customer Type options
const CUSTOMER_TYPES = [
  { id: 'individual', name: 'Individual' },
  { id: 'company', name: 'Company' },
  { id: 'lead', name: 'Lead' }
];

// Source options
const SOURCE_OPTIONS = [
  { id: 'Website', name: 'Website' },
  { id: 'Referral', name: 'Referral' },
  { id: 'Social Media', name: 'Social Media' },
  { id: 'Google Search', name: 'Google Search' },
  { id: 'Phone Call', name: 'Phone Call' },
  { id: 'Walk-in', name: 'Walk-in' },
  { id: 'Other', name: 'Other' }
];

const CustomerEdit = () => {
  const record = useRecordContext();
  const [selectedTags, setSelectedTags] = useState([]);
  const [customFields, setCustomFields] = useState({});

  // Initialize state from record
  useEffect(() => {
    if (record) {
      setSelectedTags(record.crmTags || []);
      setCustomFields(record.customFields || {});
    }
  }, [record]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomField = () => {
    const key = prompt('Enter field name:');
    if (key) {
      setCustomFields(prev => ({ ...prev, [key]: '' }));
    }
  };

  const removeCustomField = (key) => {
    setCustomFields(prev => {
      const newFields = { ...prev };
      delete newFields[key];
      return newFields;
    });
  };

  const updateCustomField = (key, value) => {
    setCustomFields(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Edit>
      <SimpleForm>
        {/* Basic Information */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextInput source="name" label="Full Name" validate={required()} fullWidth />
              <TextInput source="email" label="Email" type="email" validate={email()} fullWidth />
              <TextInput source="phone" label="Phone Number" fullWidth />
              <SelectInput 
                source="customerType" 
                label="Customer Type"
                choices={CUSTOMER_TYPES}
                fullWidth
              />
              <TextInput source="companyName" label="Company Name" fullWidth />
              <SelectInput 
                source="source" 
                label="How did they find you?"
                choices={SOURCE_OPTIONS}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        {/* Lead Management */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Lead Management</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <BooleanInput source="isLead" label="Is Lead" />
              <SelectInput 
                source="status" 
                label="Status"
                choices={LEAD_STATUS}
                fullWidth
              />
              <ReferenceInput source="assignedTo" reference="users" fullWidth>
                <AutocompleteInput label="Assigned To" />
              </ReferenceInput>
              <DateInput source="followUpDate" label="Follow-up Date" fullWidth />
            </Box>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Addresses</Typography>
            <ArrayInput source="addresses">
              <SimpleFormIterator>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <SelectInput 
                    source="type" 
                    label="Address Type"
                    choices={[
                      { id: 'primary', name: 'Primary' },
                      { id: 'secondary', name: 'Secondary' },
                      { id: 'billing', name: 'Billing' }
                    ]}
                    fullWidth
                  />
                  <TextInput source="address" label="Street Address" multiline rows={2} fullWidth />
                  <TextInput source="city" label="City" fullWidth />
                  <TextInput source="postalCode" label="Postal Code" fullWidth />
                </Box>
              </SimpleFormIterator>
            </ArrayInput>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Property Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <NumberInput source="propertyDetails.squareFootage" label="Square Footage (m²)" fullWidth />
              <NumberInput source="propertyDetails.rooms" label="Number of Rooms" fullWidth />
              <TextInput 
                source="propertyDetails.features" 
                label="Property Features" 
                multiline 
                rows={3} 
                fullWidth 
                helperText="e.g., hardwood floors, pool, garden, etc."
              />
            </Box>
          </CardContent>
        </Card>

        {/* Preferences & Special Instructions */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Preferences & Special Instructions</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextInput 
                source="preferences.preferredProducts" 
                label="Preferred Cleaning Products" 
                multiline 
                rows={2} 
                fullWidth 
              />
              <TextInput 
                source="preferences.specialInstructions" 
                label="Special Instructions" 
                multiline 
                rows={2} 
                fullWidth 
              />
              <TextInput 
                source="preferences.alarmCodes" 
                label="Alarm Codes" 
                fullWidth 
              />
              <TextInput 
                source="preferences.petInfo" 
                label="Pet Information" 
                fullWidth 
              />
              <TextInput 
                source="preferences.keyLocations" 
                label="Key Locations" 
                fullWidth 
                helperText="Where to find keys, access codes, etc."
              />
            </Box>
          </CardContent>
        </Card>

        {/* CRM Tags */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>CRM Tags</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {CRM_TAGS.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() => handleTagToggle(tag.id)}
                  color={selectedTags.includes(tag.id) ? 'primary' : 'default'}
                  variant={selectedTags.includes(tag.id) ? 'filled' : 'outlined'}
                  clickable
                />
              ))}
            </Box>
            <TextInput 
              source="crmTags" 
              label="Selected Tags" 
              value={selectedTags.join(', ')} 
              disabled 
              fullWidth 
            />
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Custom Fields</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={addCustomField}
                variant="outlined"
                size="small"
              >
                Add Field
              </Button>
            </Box>
            {Object.keys(customFields).map((key) => (
              <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label={key}
                  value={customFields[key]}
                  onChange={(e) => updateCustomField(key, e.target.value)}
                  fullWidth
                  size="small"
                />
                <IconButton 
                  onClick={() => removeCustomField(key)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <TextInput 
              source="customFields" 
              label="Custom Fields Data" 
              value={JSON.stringify(customFields)} 
              disabled 
              fullWidth 
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <TextInput 
              source="notes" 
              label="General Notes" 
              multiline 
              rows={4} 
              fullWidth 
            />
          </CardContent>
        </Card>
      </SimpleForm>
    </Edit>
  );
};

export default CustomerEdit; 