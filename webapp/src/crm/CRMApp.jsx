import React from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { ArrowLeft, Users, Target, Briefcase, CheckSquare, BarChart3, Settings } from 'lucide-react';

// Import CRM components from modular structure
import { CustomerList, CustomerCreate, CustomerEdit, CustomerShow } from './modules/customers';
import { LeadList, LeadCreate, LeadEdit, LeadShow } from './modules/leads';
import { DealList, DealCreate, DealEdit, DealShow } from './modules/deals';
import { TaskList, TaskCreate, TaskEdit, TaskShow } from './modules/tasks';
import CRMDashboard from './components/CRMDashboard';

// Custom AppBar with back button
const CustomAppBar = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/admin/${companyId}`)}
              className="flex items-center space-x-2 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Tillbaka till Admin</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SwedPrime CRM</h1>
                <p className="text-slate-300 text-sm">Customer Relationship Management</p>
              </div>
            </div>
          </div>
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
      description: 'CRM Översikt',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      label: 'Kunder',
      icon: Users,
      path: `/admin/${companyId}/crm/customers`,
      relativePath: 'customers',
      description: 'Hantera kunder',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Leads',
      icon: Target,
      path: `/admin/${companyId}/crm/leads`,
      relativePath: 'leads',
      description: 'Spåra potentiella kunder',
      color: 'from-orange-500 to-red-500'
    },
    {
      label: 'Affärer',
      icon: Briefcase,
      path: `/admin/${companyId}/crm/deals`,
      relativePath: 'deals',
      description: 'Hantera försäljningsmöjligheter',
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Uppgifter',
      icon: CheckSquare,
      path: `/admin/${companyId}/crm/tasks`,
      relativePath: 'tasks',
      description: 'Spåra uppföljningar och uppgifter',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      label: 'Inställningar',
      icon: Settings,
      path: `/admin/${companyId}/crm/settings`,
      relativePath: 'settings',
      description: 'CRM-konfiguration',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-full shadow-lg">
      {/* CRM Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">SwedPrime CRM</h2>
            <p className="text-sm text-gray-600">Kundhantering</p>
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
              className={`w-full flex items-center space-x-4 p-4 text-left rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg transform scale-105' 
                  : 'hover:bg-gray-50 text-gray-700 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isActive 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <item.icon className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-left">{item.label}</div>
                <div className={`text-sm ${
                  isActive ? 'text-white text-opacity-80' : 'text-gray-500'
                }`}>{item.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Behöver hjälp?</h4>
          <p className="text-xs text-gray-600 mb-3">Få support med din CRM</p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm py-2 px-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm">
            Kontakta Support
          </button>
        </div>
      </div>
    </div>
  );
};

const CRMApp = () => {
  const { companyId: _companyId } = useParams();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <CustomSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* AppBar */}
        <CustomAppBar />
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="" element={<CRMDashboard />} />
              <Route path="customers" element={<CustomerList companyId={_companyId} />} />
              <Route path="customers/create" element={<CustomerCreate companyId={_companyId} />} />
              <Route path="customers/:id/edit" element={<CustomerEdit companyId={_companyId} />} />
              <Route path="customers/:id" element={<CustomerShow companyId={_companyId} />} />
              <Route path="leads" element={<LeadList companyId={_companyId} />} />
              <Route path="leads/create" element={<LeadCreate companyId={_companyId} />} />
              <Route path="leads/:id/edit" element={<LeadEdit companyId={_companyId} />} />
              <Route path="leads/:id" element={<LeadShow companyId={_companyId} />} />
              <Route path="deals" element={<DealList companyId={_companyId} />} />
              <Route path="deals/create" element={<DealCreate companyId={_companyId} />} />
              <Route path="deals/:id/edit" element={<DealEdit companyId={_companyId} />} />
              <Route path="deals/:id" element={<DealShow companyId={_companyId} />} />
              <Route path="tasks" element={<TaskList companyId={_companyId} />} />
              <Route path="tasks/create" element={<TaskCreate companyId={_companyId} />} />
              <Route path="tasks/:id/edit" element={<TaskEdit companyId={_companyId} />} />
              <Route path="tasks/:id" element={<TaskShow companyId={_companyId} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMApp;