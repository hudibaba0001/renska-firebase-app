import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeal, deleteDeal, DEAL_STATUSES, DEAL_PRIORITIES } from '../../services/dealService';
import { Edit, Trash2, ArrowLeft, Calendar, DollarSign, User, FileText } from 'lucide-react';

const DealShow = ({ companyId }) => {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDelete = async () => {
    try {
      await deleteDeal(companyId, id);
      setShowDeleteModal(false);
      navigate(`/admin/${companyId}/crm-data/deals`);
    } catch (error) {
      console.error('Error deleting deal:', error);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/deals`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Deals</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/deals/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Deal Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
              {deal.description && (
                <p className="text-gray-600 mt-2">{deal.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(deal.status)}-100 text-${getStatusColor(deal.status)}-800`}>
                {DEAL_STATUSES.find(s => s.value === deal.status)?.label || deal.status}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getPriorityColor(deal.priority)}-100 text-${getPriorityColor(deal.priority)}-800`}>
                {DEAL_PRIORITIES.find(p => p.value === deal.priority)?.label || deal.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-lg font-medium text-gray-900">{deal.customer}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Deal Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(deal.value)}</p>
                  </div>
                  {deal.probability && (
                    <div>
                      <p className="text-sm text-gray-600">Win Probability</p>
                      <p className="text-lg font-medium text-gray-900">{deal.probability}%</p>
                    </div>
                  )}
                  {deal.currency && (
                    <div>
                      <p className="text-sm text-gray-600">Currency</p>
                      <p className="text-lg font-medium text-gray-900">{deal.currency}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Expected Close Date</p>
                    <p className="text-lg font-medium text-gray-900">{formatDate(deal.expectedCloseDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-lg font-medium text-gray-900">{formatDate(deal.createdAt?.toDate?.())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-lg font-medium text-gray-900">{formatDate(deal.updatedAt?.toDate?.())}</p>
                  </div>
                </div>
              </div>

              {deal.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{deal.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Deal</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deal.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealShow; 