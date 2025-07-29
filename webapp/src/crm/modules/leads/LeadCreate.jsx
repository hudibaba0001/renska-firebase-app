import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createLead } from '../../services/leadService';
import LeadForm from '../../forms/LeadForm';

const LeadCreate = ({ companyId }) => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createLead(companyId, formData);
      navigate(`/admin/${companyId}/crm-data/leads`);
    } catch (error) {
      console.error('Error creating lead:', error);
      // Error handling is done in the service layer
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/leads`);
  };

  return (
    <div className="p-6">
      <LeadForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default LeadCreate;