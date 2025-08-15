import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash, Eye, Building, User, Download } from 'lucide-react';
import { getCustomers, deleteCustomer, searchCustomers, exportCustomers } from '../../services/customerService';
import { ProfessionalHeader, ProfessionalCard, ProfessionalButton, ProfessionalInput, ProfessionalTable } from '../../components';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    rutEligible: 'all',
    type: 'all'
  });

  useEffect(() => {
    loadCustomers();
  }, [companyId, filters]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const options = {};
      
      if (filters.status !== 'all') {
        options.status = filters.status;
      }
      
      if (filters.rutEligible !== 'all') {
        options.rutEligible = filters.rutEligible === 'true';
      }

      let customerData = await getCustomers(companyId, options);
      
      // Apply type filter
      if (filters.type !== 'all') {
        customerData = customerData.filter(customer => 
          filters.type === 'company' ? customer.is_company : !customer.is_company
        );
      }

      // Apply search if term exists
      if (searchTerm) {
        customerData = await searchCustomers(companyId, searchTerm, options);
      }

      setCustomers(customerData);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Kunde inte ladda kunder');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Är du säker på att du vill ta bort denna kund?')) {
      try {
        await deleteCustomer(companyId, customerId);
        loadCustomers(); // Reload the list
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportCustomers(companyId, 'csv');
      // Create and download CSV file
      const csvContent = csvData.map(row => Object.values(row).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Kunder exporterade framgångsrikt');
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error('Kunde inte exportera kunder');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('sv-SE');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Aktiv' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inaktiv' },
      deleted: { color: 'bg-red-100 text-red-800', text: 'Borttagen' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Namn',
      render: (value, customer) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            {customer.is_company ? (
              <Building className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {customer.is_company ? 'Företag' : 'Privatperson'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'E-post',
      render: (value) => (
        <div className="text-sm text-gray-900">{value}</div>
      )
    },
    {
      key: 'phone',
      header: 'Telefon',
      render: (value) => (
        <div className="text-sm text-gray-900">{value}</div>
      )
    },
    {
      key: 'rut_rot_eligible',
      header: 'RUT/ROT',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Ja' : 'Nej'}
        </span>
      )
    },
    {
      key: 'customer_tags',
      header: 'Taggar',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value && value.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
          {value && value.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{value.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Skapad',
      render: (value) => (
        <div className="text-sm text-gray-500">{formatDate(value)}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      header: 'Åtgärder',
      render: (_, customer) => (
        <div className="flex items-center space-x-2">
          <ProfessionalButton
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/${companyId}/crm-data/customers/${customer.id}`)}
          >
            <Eye className="w-4 h-4" />
          </ProfessionalButton>
          <ProfessionalButton
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/${companyId}/crm-data/customers/${customer.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </ProfessionalButton>
          <ProfessionalButton
            variant="danger"
            size="sm"
            onClick={() => handleDeleteCustomer(customer.id)}
          >
            <Trash className="w-4 h-4" />
          </ProfessionalButton>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ProfessionalHeader
        title="Kunder"
        subtitle={`${customers.length} kunder totalt`}
        onBack={() => navigate(`/admin/${companyId}/crm-data`)}
        showSearch={false}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <ProfessionalCard
          title="Sök och Filtrera"
          subtitle="Hitta specifika kunder"
          headerColor="from-gray-600 to-gray-700"
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <ProfessionalInput
                  placeholder="Sök efter namn, e-post, telefon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <ProfessionalButton type="submit" variant="primary">
                  <Search className="w-4 h-4 mr-2" />
                  Sök
                </ProfessionalButton>
              </form>
            </div>
            
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Alla statusar</option>
                <option value="active">Aktiva</option>
                <option value="inactive">Inaktiva</option>
              </select>
            </div>
            
            <div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Alla typer</option>
                <option value="individual">Privatpersoner</option>
                <option value="company">Företag</option>
              </select>
            </div>
          </div>
        </ProfessionalCard>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <ProfessionalButton
              variant="primary"
              onClick={() => navigate(`/admin/${companyId}/crm-data/customers/create`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Lägg till Kund
            </ProfessionalButton>
            
            <ProfessionalButton
              variant="secondary"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportera
            </ProfessionalButton>
          </div>
          
          <div className="text-sm text-gray-600">
            Visar {customers.length} kunder
          </div>
        </div>

        {/* Customers Table */}
        <ProfessionalTable
          columns={tableColumns}
          data={customers}
          loading={loading}
          emptyMessage="Inga kunder hittades. Skapa din första kund genom att klicka på 'Lägg till Kund'."
          onRowClick={(customer) => navigate(`/admin/${companyId}/crm-data/customers/${customer.id}`)}
        />
      </div>
    </div>
  );
};

export default CustomerList;