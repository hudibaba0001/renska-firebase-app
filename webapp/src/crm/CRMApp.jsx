import React from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { ArrowLeft, Users, Target, Briefcase, CheckSquare, BarChart3, Settings } from 'lucide-react';

// Import CRM components
import CustomerList from './components/CustomerList';
import CustomerEdit from './components/CustomerEdit';
import CustomerShow from './components/CustomerShow';
import CustomerCreate from './components/CustomerCreate';
import LeadList from './components/LeadList';
import LeadCreate from './components/LeadCreate';
import LeadEdit from './components/LeadEdit';
import DealList from './components/DealList';
import DealCreate from './components/DealCreate';
import DealEdit from './components/DealEdit';
import TaskList from './components/TaskList';
import TaskCreate from './components/TaskCreate';
import TaskEdit from './components/TaskEdit';
import CRMDashboard from './components/CRMDashboard';

// Custom AppBar with back button
const CustomAppBar = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  
  return (
    <div className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/${companyId}`)}
            className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">SwedPrime CRM</h1>
        </div>
      </div>
    </div>
  );
};

// Custom Sidebar Component
const CustomSidebar = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const location = window.location.pathname;
  
  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: `/admin/${companyId}/crm`,
      relativePath: '',
      description: 'CRM Overview'
    },
    {
      label: 'Customers',
      icon: Users,
      path: `/admin/${companyId}/crm/customers`,
      relativePath: 'customers',
      description: 'Manage customers'
    },
    {
      label: 'Leads',
      icon: Target,
      path: `/admin/${companyId}/crm/leads`,
      relativePath: 'leads',
      description: 'Track potential customers'
    },
    {
      label: 'Deals',
      icon: Briefcase,
      path: `/admin/${companyId}/crm/deals`,
      relativePath: 'deals',
      description: 'Manage sales opportunities'
    },
    {
      label: 'Tasks',
      icon: CheckSquare,
      path: `/admin/${companyId}/crm/tasks`,
      relativePath: 'tasks',
      description: 'Track follow-ups and tasks'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: `/admin/${companyId}/crm/settings`,
      relativePath: 'settings',
      description: 'CRM configuration'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      {/* CRM Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SwedPrime CRM</h2>
            <p className="text-sm text-gray-500">Customer Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.path || location.includes(item.relativePath);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.relativePath)}
              className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
              }`} />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h4>
          <p className="text-xs text-gray-600 mb-2">Get support with your CRM</p>
          <button className="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

const CRMApp = () => {
  const { companyId: _companyId } = useParams();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <CustomSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* AppBar */}
        <CustomAppBar />
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="" element={<CRMDashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/create" element={<CustomerCreate />} />
            <Route path="customers/:id/edit" element={<CustomerEdit />} />
            <Route path="customers/:id" element={<CustomerShow />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="leads/create" element={<LeadCreate />} />
            <Route path="leads/:id/edit" element={<LeadEdit />} />
            <Route path="deals" element={<DealList />} />
            <Route path="deals/create" element={<DealCreate />} />
            <Route path="deals/:id/edit" element={<DealEdit />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="tasks/create" element={<TaskCreate />} />
            <Route path="tasks/:id/edit" element={<TaskEdit />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default CRMApp;