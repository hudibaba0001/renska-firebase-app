import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_LEAD } from '../graphql';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const LeadShow = () => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const { companyId, leadId } = useParams();
  const navigate = useNavigate();

  const { loading: queryLoading, error, data } = useQuery(GET_LEAD, {
    variables: { id: leadId },
  });

  useEffect(() => {
    if (!queryLoading && !error && data) {
      setLead(data.lead);
      setLoading(false);
    }
  }, [queryLoading, error, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">An error occurred while loading the lead: {error.message}</p>
          <button
            onClick={() => navigate(`/admin/${companyId}/leads`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
          <p className="text-gray-600 mb-4">The lead you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/admin/${companyId}/leads`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Leads
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
            onClick={() => navigate(`/admin/${companyId}/leads`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Leads</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/${companyId}/leads/${leadId}/edit`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Lead Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{lead.title}</h1>
          <p className="text-gray-600">{lead.email}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{lead.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{lead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{lead.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900">{lead.company || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'won' ? 'bg-green-100 text-green-800' :
                    lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                    lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Potential Value</label>
                  <p className="text-gray-900 font-semibold">
                    {lead.value ? `${lead.value.toLocaleString()} ${lead.currency}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{lead.createdAt ? format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{lead.updatedAt ? format(new Date(lead.updatedAt), 'yyyy-MM-dd HH:mm') : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expected Close Date</label>
                  <p className="text-gray-900">{lead.expectedCloseDate ? format(new Date(lead.expectedCloseDate), 'yyyy-MM-dd') : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <p className="text-gray-900">{lead.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Area Tag</label>
                  <p className="text-gray-900">{lead.areaTag}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{lead.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          {lead.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadShow;