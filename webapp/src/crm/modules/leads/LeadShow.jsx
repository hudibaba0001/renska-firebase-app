import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Edit, 
  Trash, 
  ArrowLeft, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  DollarSign, 
  Calendar, 
  Globe,
  Linkedin,
  UserCheck,
  Clock
} from 'lucide-react';
import { getLead, deleteLead, convertLeadToCustomer } from '../../services/leadService';
import { getLeadSources, getLeadStatuses } from '../../services/leadService';
import toast from 'react-hot-toast';

const LeadShow = ({ companyId }) => {
  const navigate = useNavigate();
  const { id: leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const leadSources = getLeadSources();
  const leadStatuses = getLeadStatuses();

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

  const handleDelete = async () => {
    if (window.confirm('Är du säker på att du vill radera denna lead?')) {
      try {
        await deleteLead(companyId, leadId);
        navigate(`/admin/${companyId}/crm-data/leads`);
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleConvertToCustomer = async (customerData) => {
    try {
      await convertLeadToCustomer(companyId, leadId, customerData);
      setShowConvertModal(false);
      navigate(`/admin/${companyId}/crm-data/customers`);
    } catch (error) {
      console.error('Error converting lead to customer:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = leadStatuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(value);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/leads`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-gray-600">Lead Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConvertModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Konvertera till Kund
          </button>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/leads/${leadId}/edit`)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash className="h-4 w-4 mr-2" />
            Radera
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Grundläggande information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Namn</label>
                <p className="text-sm text-gray-900">{lead.name}</p>
              </div>
              {lead.position && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <p className="text-sm text-gray-900">{lead.position}</p>
                </div>
              )}
              {lead.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-post</label>
                  <p className="text-sm text-gray-900">
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                      {lead.email}
                    </a>
                  </p>
                </div>
              )}
              {lead.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="text-sm text-gray-900">
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                      {lead.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          {lead.company && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Företagsinformation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Företagsnamn</label>
                  <p className="text-sm text-gray-900">{lead.company}</p>
                </div>
                {lead.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hemsida</label>
                    <p className="text-sm text-gray-900">
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {lead.website}
                      </a>
                    </p>
                  </div>
                )}
                {lead.linkedin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <p className="text-sm text-gray-900">
                      <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {lead.linkedin}
                      </a>
                    </p>
                  </div>
                )}
                {lead.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Adress</label>
                    <p className="text-sm text-gray-900">{lead.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Anteckningar
              </h2>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-yellow-600" />
              Lead Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {leadStatuses.find(s => s.value === lead.status)?.label || lead.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Källa</label>
                <p className="text-sm text-gray-900">
                  {leadSources.find(s => s.value === lead.source)?.label || lead.source || 'N/A'}
                </p>
              </div>
              {lead.priority && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioritet</label>
                  <p className="text-sm text-gray-900 capitalize">{lead.priority}</p>
                </div>
              )}
              {lead.assignedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tilldelad till</label>
                  <p className="text-sm text-gray-900">{lead.assignedTo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Deal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Affärsinformation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Värde</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(lead.value)}</p>
              </div>
              {lead.expectedCloseDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Förväntat stängningsdatum</label>
                  <p className="text-sm text-gray-900">{formatDate(lead.expectedCloseDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Tidsstämplar
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Skapad</label>
                <p className="text-sm text-gray-900">{formatDate(lead.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Senast uppdaterad</label>
                <p className="text-sm text-gray-900">{formatDate(lead.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Convert to Customer Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konvertera till Kund</h3>
            <p className="text-gray-600 mb-4">
              Denna lead kommer att konverteras till en kund. Vill du fortsätta?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleConvertToCustomer({})}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Konvertera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadShow;