import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeal } from '../../services/dealService';
import DealForm from '../../forms/DealForm';

const DealCreate = ({ companyId }) => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createDeal(companyId, formData);
      navigate(`/admin/${companyId}/crm-data/deals`);
    } catch (error) {
      console.error('Error creating deal:', error);
      // Error handling is done in the service layer
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/deals`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
      </div>
      
      <DealForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Create Deal"
      />
    </div>
  );
};

export default DealCreate; 