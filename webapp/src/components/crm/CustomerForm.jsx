import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const CustomerForm = ({ customer, onSave, onCancel, mode = 'create' }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    multiple_addresses: [],
    rut_rot_eligible: false,
    property_details: '',
    internal_notes: '',
    lead_source: '',
    preferred_contact_method: 'email',
    customer_tags: [],
    booking_frequency: '',
    feedback_rating: null,
    is_company: false,
    contact_person: '',
    secondary_phone: '',
    secondary_email: '',
    company_size: '',
    branch_count: 0,
    consent_given: false,
    consent_timestamp: null,
    consent_details: '',
    area_tag: '',
    personnummer: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Lead sources for dropdown
  const leadSources = [
    'referral',
    'website',
    'social_media',
    'advertising',
    'tender',
    'cold_call',
    'exhibition',
    'other'
  ];

  // Contact methods
  const contactMethods = [
    'email',
    'phone',
    'sms',
    'postal'
  ];

  // Booking frequencies
  const bookingFrequencies = [
    'one_time',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly',
    'on_demand'
  ];

  // Company sizes
  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-1000',
    '1000+'
  ];

  useEffect(() => {
    if (customer && mode === 'edit') {
      setFormData({
        ...customer,
        multiple_addresses: customer.multiple_addresses || [],
        customer_tags: customer.customer_tags || [],
        consent_timestamp: customer.consent_timestamp ? new Date(customer.consent_timestamp).toISOString().slice(0, 16) : null
      });
    }
  }, [customer, mode]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Personnummer validation for individuals
    if (!formData.is_company && !formData.personnummer) {
      newErrors.personnummer = 'Personnummer is required for individuals';
    } else if (formData.personnummer) {
      const personnummerRegex = /^\d{8}-\d{4}$/;
      if (!personnummerRegex.test(formData.personnummer)) {
        newErrors.personnummer = 'Invalid personnummer format (YYYYMMDD-XXXX)';
      }
    }

    // Consent validation
    if (formData.consent_given) {
      if (!formData.consent_timestamp) {
        newErrors.consent_timestamp = 'Consent timestamp is required when consent is given';
      }
      if (!formData.consent_details || formData.consent_details.trim().length < 10) {
        newErrors.consent_details = 'Consent details must be at least 10 characters';
      }
    }

    // Company-specific validations
    if (formData.is_company) {
      if (!formData.contact_person) {
        newErrors.contact_person = 'Contact person is required for companies';
      }
      if (formData.personnummer) {
        newErrors.personnummer = 'Personnummer should be empty for companies';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const customerData = {
        ...formData,
        consent_timestamp: formData.consent_given ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      await onSave(customerData);
      toast.success(`Customer ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
        </h2>
        <p className="text-gray-600">
          {mode === 'create' ? 'Enter customer information below' : 'Update customer information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Type Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Customer Type</h3>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="is_company"
                value={false}
                checked={!formData.is_company}
                onChange={() => setFormData(prev => ({ ...prev, is_company: false, personnummer: '' }))}
                className="mr-2"
              />
              Individual
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="is_company"
                value={true}
                checked={formData.is_company}
                onChange={() => setFormData(prev => ({ ...prev, is_company: true, personnummer: '' }))}
                className="mr-2"
              />
              Company
            </label>
          </div>
        </div>

        {/* Core Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.is_company ? 'Company Name' : 'Full Name'} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.is_company ? 'Enter company name' : 'Enter full name'}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {!formData.is_company && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personnummer *
              </label>
              <input
                type="text"
                name="personnummer"
                value={formData.personnummer}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.personnummer ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="YYYYMMDD-XXXX"
              />
              {errors.personnummer && <p className="text-red-500 text-sm mt-1">{errors.personnummer}</p>}
            </div>
          )}

          {formData.is_company && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contact_person ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contact_person && <p className="text-red-500 text-sm mt-1">{errors.contact_person}</p>}
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter primary address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Addresses
              </label>
              <textarea
                value={formData.multiple_addresses.join(', ')}
                onChange={(e) => handleArrayInputChange('multiple_addresses', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter additional addresses separated by commas"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple addresses with commas
              </p>
            </div>
          </div>
        </div>

        {/* Property and Service Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Details
            </label>
            <textarea
              name="property_details"
              value={formData.property_details}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter property details (size, rooms, etc.)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea
              name="internal_notes"
              value={formData.internal_notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter internal notes"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="rut_rot_eligible"
              checked={formData.rut_rot_eligible}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              RUT/ROT Eligible
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Tag
            </label>
            <input
              type="text"
              name="area_tag"
              value={formData.area_tag}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Stockholm, Gothenburg"
            />
          </div>
        </div>

        {/* Lead and Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead Source
            </label>
            <select
              name="lead_source"
              value={formData.lead_source}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select lead source</option>
              {leadSources.map(source => (
                <option key={source} value={source}>
                  {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <select
              name="preferred_contact_method"
              value={formData.preferred_contact_method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {contactMethods.map(method => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Frequency
            </label>
            <select
              name="booking_frequency"
              value={formData.booking_frequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select frequency</option>
              {bookingFrequencies.map(freq => (
                <option key={freq} value={freq}>
                  {freq.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Rating
            </label>
            <select
              name="feedback_rating"
              value={formData.feedback_rating || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select rating</option>
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company-specific fields */}
        {formData.is_company && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Phone
              </label>
              <input
                type="tel"
                name="secondary_phone"
                value={formData.secondary_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter secondary phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Email
              </label>
              <input
                type="email"
                name="secondary_email"
                value={formData.secondary_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter secondary email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select company size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Branches
              </label>
              <input
                type="number"
                name="branch_count"
                value={formData.branch_count}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number of branches"
              />
            </div>
          </div>
        )}

        {/* Customer Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Tags
          </label>
          <textarea
            value={formData.customer_tags.join(', ')}
            onChange={(e) => handleArrayInputChange('customer_tags', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tags separated by commas (e.g., VIP, RUT-berättigad, Återkommande)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* GDPR Consent */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">GDPR Consent</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="consent_given"
                checked={formData.consent_given}
                onChange={handleInputChange}
                className="mr-2 mt-1"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer has given consent for data processing
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  This is required for GDPR compliance
                </p>
              </div>
            </div>

            {formData.consent_given && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consent Details *
                  </label>
                  <textarea
                    name="consent_details"
                    value={formData.consent_details}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.consent_details ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe what the customer consented to (minimum 10 characters)"
                  />
                  {errors.consent_details && <p className="text-red-500 text-sm mt-1">{errors.consent_details}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consent Timestamp *
                  </label>
                  <input
                    type="datetime-local"
                    name="consent_timestamp"
                    value={formData.consent_timestamp || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.consent_timestamp ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.consent_timestamp && <p className="text-red-500 text-sm mt-1">{errors.consent_timestamp}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Update Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm; 