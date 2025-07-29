import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeal, updateDeal } from '../../services/dealService';
import DealForm from '../../forms/DealForm';

const DealEdit = ({ companyId }) => {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadDeal();
  }, [id]);

  const loadDeal = async () => {
    try {
      setLoading(true);
      const dealData = await getDeal(companyId, id);
      setDeal(dealData);
    } catch (error) {
      console.error('Error loading deal:', error);
      navigate(`/admin/${companyId}/crm-data/deals`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await updateDeal(companyId, id, formData);
      navigate(`/admin/${companyId}/crm-data/deals/${id}`);
    } catch (error) {
      console.error('Error updating deal:', error);
      // Error handling is done in the service layer
    }
  };

  const handleCancel = () => {
    navigate(`/admin/${companyId}/crm-data/deals/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Deal not found</p>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/deals`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Deal</h1>
      </div>
      
      <DealForm
        initialData={deal}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Update Deal"
      />
    </div>
  );
};

export default DealEdit; 