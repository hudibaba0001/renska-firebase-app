import React, { useState, useEffect } from 'react';
import { DEAL_STATUSES, DEAL_PRIORITIES } from '../services/dealService';

const DealForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  submitLabel = 'Save Deal'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    customer: '',
    customerId: '',
    value: '',
    status: 'draft',
    priority: 'medium',
    expectedCloseDate: '',
    notes: '',
    description: '',
    probability: 50,
    currency: 'SEK',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        value: initialData.value ? initialData.value.toString() : ''
      }));
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Deal name is required';
    }

    if (!formData.customer?.trim()) {
      newErrors.customer = 'Customer is required';
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Deal value must be a positive number';
    }

    if (formData.expectedCloseDate && new Date(formData.expectedCloseDate) < new Date()) {
      newErrors.expectedCloseDate = 'Expected close date cannot be in the past';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability)
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getStatusColor = (status) => {
    const statusObj = DEAL_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = DEAL_PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || 'gray';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Deal Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter deal name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customer ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter customer name"
              />
              {errors.customer && (
                <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the deal"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Value (SEK) *
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.value ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Win Probability (%)
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.probability ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50"
              />
              {errors.probability && (
                <p className="mt-1 text-sm text-red-600">{errors.probability}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SEK">SEK (Swedish Krona)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Deal Management</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DEAL_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DEAL_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.expectedCloseDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expectedCloseDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedCloseDate}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes about this deal"
              />
            </div>

            {/* Status and Priority Indicators */}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(formData.status)}-100 text-${getStatusColor(formData.status)}-800`}>
                  {DEAL_STATUSES.find(s => s.value === formData.status)?.label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(formData.priority)}-100 text-${getPriorityColor(formData.priority)}-800`}>
                  {DEAL_PRIORITIES.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealForm; 