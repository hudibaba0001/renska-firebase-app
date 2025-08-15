import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Eye, 
  Tag, 
  Building, 
  User,
  DollarSign,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { 
  getLeads, 
  deleteLead, 
  getLeadSources, 
  getLeadStatuses 
} from '../../services/leadService';
import toast from 'react-hot-toast';

const LeadList = ({ companyId }) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  const leadSources = getLeadSources();
  const leadStatuses = getLeadStatuses();

  useEffect(() => {
    loadLeads();
  }, [companyId, searchTerm, statusFilter, sourceFilter, pagination.page]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const result = await getLeads(companyId, {
        searchTerm,
        status: statusFilter || null,
        source: sourceFilter || null,
        page: pagination.page,
        pageSize: pagination.pageSize
      });
      
      setLeads(result.leads);
      setPagination(prev => ({
        ...prev,
        totalCount: result.totalCount,
        totalPages: result.totalPages
      }));
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Är du säker på att du vill radera denna lead?')) {
      try {
        await deleteLead(companyId, leadId);
        await loadLeads(); // Reload the list
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSourceFilter = (e) => {
    setSourceFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSourceFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Hantera dina leads i SwedPrime CRM</p>
        </div>
        <button
          onClick={() => navigate(`/admin/${companyId}/crm-data/leads/create`)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till Lead
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök leads..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Alla statusar</option>
                  {leadStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Källa
                </label>
                <select
                  value={sourceFilter}
                  onChange={handleSourceFilter}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Alla källor</option>
                  {leadSources.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Rensa filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Företag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Värde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Källa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skapad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {lead.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                      {lead.position && (
                        <div className="text-xs text-gray-400">
                          {lead.position}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.company || 'N/A'}</div>
                    {lead.website && (
                      <div className="text-xs text-gray-500">
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {lead.website}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {leadStatuses.find(s => s.value === lead.status)?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(lead.value)}</div>
                    {lead.expectedCloseDate && (
                      <div className="text-xs text-gray-500">
                        Stängs: {formatDate(lead.expectedCloseDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {leadSources.find(s => s.value === lead.source)?.label || lead.source || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(lead.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/admin/${companyId}/crm-data/leads/${lead.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visa detaljer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/${companyId}/crm-data/leads/${lead.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Redigera"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Radera"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Inga leads hittades</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || sourceFilter ? 'Försök att justera dina söktermer.' : 'Kom igång genom att skapa din första lead.'}
            </p>
            {!searchTerm && !statusFilter && !sourceFilter && (
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/admin/${companyId}/crm-data/leads/create`)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Lägg till Lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Föregående
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Nästa
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Visar <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> till{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                </span>{' '}
                av <span className="font-medium">{pagination.totalCount}</span> leads
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Föregående
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.page
                        ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Nästa
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;