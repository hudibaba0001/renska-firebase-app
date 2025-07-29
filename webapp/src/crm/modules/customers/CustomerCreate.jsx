import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '../../forms/CustomerForm';
import { createCustomer, validateCustomer } from '../../services/customerService';
import toast from 'react-hot-toast';

const CustomerCreate = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      // Validate the form data
      const validation = validateCustomer(formData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        toast.error(`Valideringsfel: ${errorMessages}`);
        return;
      }

      // Create the customer
      await createCustomer(companyId, formData);
      
      // Navigate back to the customer list
      navigate(`/admin/${companyId}/crm-data/customers`);
    } catch (error) {
      console.error('Error creating customer:', error);
      // Error message is already handled by the service
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/customers`);
  };

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
            Tillbaka till kunder
          </button>
        </div>

        {/* Customer Form */}
        <CustomerForm
          customer={null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CustomerCreate;