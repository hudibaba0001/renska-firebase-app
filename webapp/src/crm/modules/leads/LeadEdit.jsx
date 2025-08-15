import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLead, updateLead } from '../../services/leadService';
import LeadForm from '../../forms/LeadForm';

const LeadEdit = ({ companyId }) => {
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLead();
  }, [companyId, leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const leadData = await getLead(companyId, leadId);
      setLead(leadData);
    } catch (error) {
      console.error('Error loading lead:', error);
      navigate(`/admin/${companyId}/crm-data/leads`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await updateLead(companyId, leadId, formData);
      navigate(`/admin/${companyId}/crm-data/leads/${leadId}`);
    } catch (error) {
      console.error('Error updating lead:', error);
      // Error handling is done in the service layer
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/leads/${leadId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Lead not found</h2>
          <p className="text-gray-600 mt-2">The lead you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/leads`)}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <LeadForm
        lead={lead}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default LeadEdit;