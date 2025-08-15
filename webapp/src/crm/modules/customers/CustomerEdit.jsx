import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '../../forms/CustomerForm';
import { getCustomer, updateCustomer, validateCustomer } from '../../services/customerService';
import toast from 'react-hot-toast';

const CustomerEdit = () => {
  const { companyId, customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [companyId, customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const customerData = await getCustomer(companyId, customerId);
      setCustomer(customerData);
    } catch (error) {
      console.error('Error loading customer:', error);
      toast.error('Kunde inte ladda kund');
      navigate(`/admin/${companyId}/crm-data/customers`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Validate the form data
      const validation = validateCustomer(formData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        toast.error(`Valideringsfel: ${errorMessages}`);
        return;
      }

      // Update the customer
      await updateCustomer(companyId, customerId, formData);
      
      // Navigate back to the customer details
      navigate(`/admin/${companyId}/crm-data/customers/${customerId}`);
    } catch (error) {
      console.error('Error updating customer:', error);
      // Error message is already handled by the service
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/customers/${customerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Kund hittades inte
          </h2>
          <p className="text-gray-600 mb-4">
            Den begärda kunden kunde inte hittas.
          </p>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/customers`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tillbaka till kunder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till kund
          </button>
        </div>

        {/* Customer Form */}
        <CustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CustomerEdit;