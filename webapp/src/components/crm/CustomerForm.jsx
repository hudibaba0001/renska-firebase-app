import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Typography,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    multipleAddresses: [],
    rutRotEligible: false,
    propertyDetails: '',
    internalNotes: '',
    leadSource: '',
    preferredContactMethod: '',
    customerTags: [],
    bookingFrequency: '',
    isCompany: false,
    contactPerson: '',
    secondaryPhone: '',
    secondaryEmail: '',
    companySize: '',
    branchCount: 0,
    consentGiven: false,
    consentTimestamp: '',
    consentDetails: '',
    areaTag: '',
    personnummer: ''
  });

  const [errors, setErrors] = useState({});
  const [newAddress, setNewAddress] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        consentTimestamp: customer.consentTimestamp || ''
      });
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Personnummer validation for individuals
    if (!formData.isCompany && !formData.personnummer) {
      newErrors.personnummer = 'Personnummer is required for individuals';
    }

    // Personnummer format validation
    if (formData.personnummer && !/^\d{8}-\d{4}$/.test(formData.personnummer)) {
      newErrors.personnummer = 'Personnummer must be in format YYYYMMDD-XXXX';
    }

    // Consent validation
    if (formData.consentGiven && !formData.consentDetails.trim()) {
      newErrors.consentDetails = 'Consent details are required when consent is given';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        consentTimestamp: formData.consentGiven ? new Date().toISOString() : null
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addAddress = () => {
    if (newAddress.trim()) {
      setFormData(prev => ({
        ...prev,
        multipleAddresses: [...prev.multipleAddresses, newAddress.trim()]
      }));
      setNewAddress('');
    }
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      multipleAddresses: prev.multipleAddresses.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        customerTags: [...prev.customerTags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      customerTags: prev.customerTags.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Area Tag"
            value={formData.areaTag}
            onChange={(e) => handleChange('areaTag', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Grid>

        {/* Company vs Individual */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isCompany}
                onChange={(e) => handleChange('isCompany', e.target.checked)}
              />
            }
            label="This is a company (not an individual)"
          />
        </Grid>

        {formData.isCompany ? (
          // Company fields
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secondary Phone"
                value={formData.secondaryPhone}
                onChange={(e) => handleChange('secondaryPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secondary Email"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => handleChange('secondaryEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Size"
                value={formData.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Branch Count"
                type="number"
                value={formData.branchCount}
                onChange={(e) => handleChange('branchCount', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </>
        ) : (
          // Individual fields
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Personnummer (YYYYMMDD-XXXX)"
              value={formData.personnummer}
              onChange={(e) => handleChange('personnummer', e.target.value)}
              error={!!errors.personnummer}
              helperText={errors.personnummer || 'Required for individuals'}
              placeholder="19851215-1234"
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Service Details
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rutRotEligible}
                onChange={(e) => handleChange('rutRotEligible', e.target.checked)}
              />
            }
            label="RUT/ROT Eligible"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Lead Source</InputLabel>
            <Select
              value={formData.leadSource}
              label="Lead Source"
              onChange={(e) => handleChange('leadSource', e.target.value)}
            >
              <MenuItem value="referral">Referral</MenuItem>
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="social-media">Social Media</MenuItem>
              <MenuItem value="advertising">Advertising</MenuItem>
              <MenuItem value="tender">Tender</MenuItem>
              <MenuItem value="cold-call">Cold Call</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Preferred Contact Method</InputLabel>
            <Select
              value={formData.preferredContactMethod}
              label="Preferred Contact Method"
              onChange={(e) => handleChange('preferredContactMethod', e.target.value)}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Booking Frequency</InputLabel>
            <Select
              value={formData.bookingFrequency}
              label="Booking Frequency"
              onChange={(e) => handleChange('bookingFrequency', e.target.value)}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="biweekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="on-demand">On Demand</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Property Details"
            multiline
            rows={3}
            value={formData.propertyDetails}
            onChange={(e) => handleChange('propertyDetails', e.target.value)}
            placeholder="Size, rooms, special requirements..."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Internal Notes"
            multiline
            rows={3}
            value={formData.internalNotes}
            onChange={(e) => handleChange('internalNotes', e.target.value)}
            placeholder="Internal notes, access codes, special instructions..."
          />
        </Grid>

        {/* Multiple Addresses */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Additional Addresses
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <TextField
              label="Add Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAddress()}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={addAddress}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {formData.multipleAddresses.map((address, index) => (
              <Chip
                key={index}
                label={address}
                onDelete={() => removeAddress(index)}
                deleteIcon={<CloseIcon />}
              />
            ))}
          </Stack>
        </Grid>

        {/* Customer Tags - Prominent Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Customer Tags
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add tags to categorize and organize your customers
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <TextField
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              sx={{ flexGrow: 1 }}
              placeholder="e.g., VIP, RUT-berättigad, Återkommande, Kommersiell"
            />
            <Button
              variant="outlined"
              onClick={addTag}
              startIcon={<AddIcon />}
            >
              Add Tag
            </Button>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {formData.customerTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => removeTag(index)}
                deleteIcon={<CloseIcon />}
                color="primary"
                variant="filled"
              />
            ))}
          </Stack>
          {formData.customerTags.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No tags added yet. Add tags to help organize your customers.
            </Typography>
          )}
        </Grid>

        {/* GDPR Consent */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            GDPR Consent
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consentGiven}
                onChange={(e) => handleChange('consentGiven', e.target.checked)}
              />
            }
            label="Customer has given consent for data processing"
          />
        </Grid>

        {formData.consentGiven && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Consent Details"
              multiline
              rows={3}
              value={formData.consentDetails}
              onChange={(e) => handleChange('consentDetails', e.target.value)}
              error={!!errors.consentDetails}
              helperText={errors.consentDetails || 'Describe what consent was given for'}
              placeholder="Consent given for marketing emails, service updates, etc."
            />
          </Grid>
        )}

        {/* Form Actions */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {customer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerForm; 