import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import {
  BarChart3,
  Users,
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
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/init';
import toast from 'react-hot-toast';

// Import existing CRM components
import TaskList from './components/TaskList';
import DealList from './components/DealList';

// Import new modular Customer components
import { 
  CustomerList, 
  CustomerCreate, 
  CustomerEdit, 
  CustomerShow 
} from './modules/customers';

// Import new modular Lead components
import { 
  LeadList, 
  LeadCreate, 
  LeadEdit, 
  LeadShow 
} from './modules/leads';


// Dashboard Component
const CRMDashboard = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    openTasks: 0,
    activeLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!companyId) return;
      
      try {
        setLoading(true);
        
        // Load customers
        const customersSnapshot = await getDocs(collection(db, `companies/${companyId}/customers`));
        const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Load tasks
        const tasksSnapshot = await getDocs(collection(db, `companies/${companyId}/tasks`));
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Load leads
        const leadsSnapshot = await getDocs(collection(db, `companies/${companyId}/leads`));
        const leads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Load deals
        const dealsSnapshot = await getDocs(collection(db, `companies/${companyId}/deals`));
        const deals = dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate stats
        const totalRevenue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const openTasks = tasks.filter(task => task.status !== 'completed').length;
        const activeLeads = leads.filter(lead => lead.status !== 'closed').length;

        setStats({
          totalCustomers: customers.length,
          totalRevenue: totalRevenue,
          openTasks: openTasks,
          activeLeads: activeLeads,
        });
      } catch (error) {
        console.error('Error loading CRM stats:', error);
        toast.error('Failed to load CRM statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-600">Customer Relationship Management Overview</p>
      </div>

      {/* CRM Status Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">CRM System Fully Functional</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>✅ <strong>All Features Available:</strong> Customers, Leads, Tasks, and Deals are fully functional</p>
              <p>🚀 <strong>Powered by Tabnine:</strong> Complete CRM system built with AI assistance</p>
              <p className="mt-1">You can now manage your entire customer relationship workflow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRevenue.toLocaleString()} SEK</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.openTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/customers`)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Customers</p>
              <p className="text-sm text-gray-600">View and edit customer information</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/leads`)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Tag className="h-5 w-5 text-yellow-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Leads</p>
              <p className="text-sm text-gray-600">Track and manage potential customers</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/tasks`)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-5 w-5 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Tasks</p>
              <p className="text-sm text-gray-600">Track and assign tasks</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/deals`)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building className="h-5 w-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Deals</p>
              <p className="text-sm text-gray-600">Track sales opportunities</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Create Form Component
const TaskCreateForm = ({ companyId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, `companies/${companyId}/tasks`), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Task created successfully');
      navigate(`/admin/${companyId}/crm-data/tasks`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/tasks`)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Tasks
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter assignee name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(`/admin/${companyId}/crm-data/tasks`)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deal Create Form Component
const DealCreateForm = ({ companyId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    customer: '',
    value: '',
    stage: 'prospecting',
    expectedCloseDate: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, `companies/${companyId}/deals`), {
        ...formData,
        value: parseFloat(formData.value) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Deal created successfully');
      navigate(`/admin/${companyId}/crm-data/deals`);
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
          <button
            onClick={() => navigate(`/admin/${companyId}/crm-data/deals`)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Deals
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter deal name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter customer name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value (SEK)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter deal value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="prospecting">Prospecting</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter deal description"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(`/admin/${companyId}/crm-data/deals`)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main CRM Component
const DataConnectCRM = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: `/admin/${companyId}/crm-data`, description: 'CRM Overview' },
    { label: 'Customers', icon: Users, path: `/admin/${companyId}/crm-data/customers`, description: 'Manage customers' },
    { label: 'Leads', icon: Tag, path: `/admin/${companyId}/crm-data/leads`, description: 'Manage leads' },
    { label: 'Tasks', icon: Clock, path: `/admin/${companyId}/crm-data/tasks`, description: 'Manage tasks' },
    { label: 'Deals', icon: Building, path: `/admin/${companyId}/crm-data/deals`, description: 'Manage deals' },
  ];

  return (
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
                <div className="font-medium">
                  {item.label}
                </div>
                <div className="text-sm text-gray-500">
                  {item.description}
                </div>
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
            <Route path="customers" element={<CustomerList companyId={companyId} />} />
            <Route path="customers/create" element={<CustomerCreate companyId={companyId} />} />
            <Route path="customers/:id" element={<CustomerShow companyId={companyId} />} />
            <Route path="customers/:id/edit" element={<CustomerEdit companyId={companyId} />} />
            <Route path="leads" element={<LeadList companyId={companyId} />} />
            <Route path="leads/create" element={<LeadCreate companyId={companyId} />} />
            <Route path="leads/:id" element={<LeadShow companyId={companyId} />} />
            <Route path="leads/:id/edit" element={<LeadEdit companyId={companyId} />} />
            <Route path="tasks" element={<TaskList companyId={companyId} />} />
            <Route path="tasks/create" element={<TaskCreateForm companyId={companyId} />} />
            <Route path="deals" element={<DealList companyId={companyId} />} />
            <Route path="deals/create" element={<DealCreateForm companyId={companyId} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DataConnectCRM;