import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/init';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const LeadShow = () => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id, companyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadLead();
  }, [id]);

  const loadLead = async () => {
    try {
      const docRef = doc(db, `companies/${companyId}/leads`, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setLead({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such lead!');
      }
    } catch (error) {
      console.error('Error loading lead:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
          <p className="text-gray-600 mb-4">The lead you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('leads')}
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
            onClick={() => navigate('leads')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Leads</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`leads/${id}/edit`)}
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
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
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
                    {lead.value ? `${lead.value.toLocaleString()} kr` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{lead.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{lead.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
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