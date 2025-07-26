import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../firebase/apollo-client';
import {
  BarChart3,
  Users,
  Target,
  DollarSign,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Clock,
  Tag
} from 'lucide-react';

// GraphQL Queries and Mutations
import { gql, useQuery, useMutation } from '@apollo/client';

// GraphQL Queries
const GET_CUSTOMERS = gql`
  query GetCustomers($companyId: UUID!) {
    customers(where: { company_id: { _eq: $companyId } }) {
      id
      first_name
      last_name
      email
      phone
      status
      created_at
      tags
      address
      notes
    }
  }
`;

const GET_LEADS = gql`
  query GetLeads($companyId: UUID!) {
    leads(where: { company_id: { _eq: $companyId } }) {
      id
      title
      status
      priority
      value
      expected_close_date
      assigned_to
      created_at
      source
      description
    }
  }
`;

const GET_DEALS = gql`
  query GetDeals($companyId: UUID!) {
    deals(where: { company_id: { _eq: $companyId } }) {
      id
      title
      status
      value
      probability
      expected_close_date
      actual_close_date
      assigned_to
      created_at
      description
    }
  }
`;

const GET_TASKS = gql`
  query GetTasks($companyId: UUID!) {
    tasks(where: { company_id: { _eq: $companyId } }) {
      id
      title
      description
      status
      priority
      type
      due_date
      completed_date
      assigned_to
      related_to
      related_type
      created_at
    }
  }
`;

// Mutations
const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: customers_insert_input!) {
    insert_customers_one(object: $input) {
      id
      first_name
      last_name
      email
      phone
      status
      created_at
    }
  }
`;

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: UUID!, $input: customers_set_input!) {
    update_customers_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      first_name
      last_name
      email
      phone
      status
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: UUID!) {
    delete_customers_by_pk(id: $id) {
      id
    }
  }
`;

// Dashboard Component
const CRMDashboard = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLeads: 0,
    totalRevenue: 0,
    openTasks: 0,
  });

  const { data: customersData, loading: customersLoading } = useQuery(GET_CUSTOMERS, {
    variables: { companyId },
    skip: !companyId
  });

  const { data: leadsData, loading: leadsLoading } = useQuery(GET_LEADS, {
    variables: { companyId },
    skip: !companyId
  });

  const { data: dealsData, loading: dealsLoading } = useQuery(GET_DEALS, {
    variables: { companyId },
    skip: !companyId
  });

  const { data: tasksData, loading: tasksLoading } = useQuery(GET_TASKS, {
    variables: { companyId },
    skip: !companyId
  });

  useEffect(() => {
    if (customersData && leadsData && dealsData && tasksData) {
      const customers = customersData.customers || [];
      const leads = leadsData.leads || [];
      const deals = dealsData.deals || [];
      const tasks = tasksData.tasks || [];

      const totalRevenue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const openTasks = tasks.filter(task => task.status !== 'completed').length;
      const activeLeads = leads.filter(lead => lead.status !== 'lost').length;

      setStats({
        totalCustomers: customers.length,
        activeLeads,
        totalRevenue,
        openTasks
      });
    }
  }, [customersData, leadsData, dealsData, tasksData]);

  const loading = customersLoading || leadsLoading || dealsLoading || tasksLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your customer relationships and sales pipeline</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeLeads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">SEK {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('customers/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Customer</span>
          </button>
          <button
            onClick={() => navigate('leads/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Lead</span>
          </button>
          <button
            onClick={() => navigate('deals/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Deal</span>
          </button>
          <button
            onClick={() => navigate('tasks/create')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Form Component
const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    status: customer?.status || 'active',
    notes: customer?.notes || '',
    tags: customer?.tags || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              placeholder="Enter tags separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {customer ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Customers List Component
const CustomersList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_CUSTOMERS, {
    variables: { companyId },
    skip: !companyId
  });

  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER);
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER);

  const customers = data?.customers || [];
  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = async (formData) => {
    try {
      await createCustomer({
        variables: {
          input: {
            ...formData,
            company_id: companyId
          }
        }
      });
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer({
          variables: { id: customerId }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
          <p className="mt-2 text-sm text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CustomerForm
            onSubmit={handleCreateCustomer}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{customer.tags?.join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : customer.status === 'prospect'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`customers/${customer.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`customers/${customer.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900"
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first customer.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Customer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main CRM Component
const DataConnectCRM = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '', description: 'CRM Overview' },
    { label: 'Customers', icon: Users, path: 'customers', description: 'Manage customers' },
    { label: 'Leads', icon: Target, path: 'leads', description: 'Track leads' },
    { label: 'Deals', icon: DollarSign, path: 'deals', description: 'Manage deals' },
    { label: 'Tasks', icon: CheckSquare, path: 'tasks', description: 'Track tasks' },
  ];

  return (
    <ApolloProvider client={apolloClient}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 h-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">CRM System</h2>
            <p className="text-sm text-gray-600">Customer Relationship Management</p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors group hover:bg-gray-50 text-gray-700"
              >
                <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CRM System</h1>
                <p className="text-sm text-gray-600">Company ID: {companyId}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Professional CRM Platform
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="" element={<CRMDashboard />} />
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/create" element={<div className="p-6"><CustomerForm onSubmit={() => {}} onCancel={() => navigate('customers')} /></div>} />
              <Route path="customers/:id" element={<div className="p-6">Customer Details (Coming Soon)</div>} />
              <Route path="customers/:id/edit" element={<div className="p-6">Edit Customer Form (Coming Soon)</div>} />
              <Route path="leads" element={<div className="p-6">Leads List (Coming Soon)</div>} />
              <Route path="deals" element={<div className="p-6">Deals List (Coming Soon)</div>} />
              <Route path="tasks" element={<div className="p-6">Tasks List (Coming Soon)</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
};

export default DataConnectCRM; 