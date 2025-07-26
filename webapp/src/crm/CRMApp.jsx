import React, { useMemo } from 'react';
import { Admin, Resource, Layout } from 'react-admin';
import { useParams, useNavigate } from 'react-router-dom';
import { createFirebaseDataProvider } from '../utils/firebaseDataProvider';
import { createFirebaseAuthProvider } from '../utils/firebaseAuthProvider';
import { AppBar, TitlePortal, Button } from 'react-admin';
import { ArrowBack, Users, Target, Briefcase, CheckSquare, BarChart3, Settings } from 'lucide-react';

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
    <AppBar>
      <TitlePortal />
      <Button
        label="Back to Admin Dashboard"
        onClick={() => navigate(`/admin/${companyId}`)}
        startIcon={<ArrowBack />}
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      />
    </AppBar>
  );
};

// Custom Sidebar Component
const CustomSidebar = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  
  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: `/admin/${companyId}/crm`,
      description: 'CRM Overview'
    },
    {
      label: 'Customers',
      icon: Users,
      path: `/admin/${companyId}/crm/customers`,
      description: 'Manage customers'
    },
    {
      label: 'Leads',
      icon: Target,
      path: `/admin/${companyId}/crm/leads`,
      description: 'Track potential customers'
    },
    {
      label: 'Deals',
      icon: Briefcase,
      path: `/admin/${companyId}/crm/deals`,
      description: 'Manage sales opportunities'
    },
    {
      label: 'Tasks',
      icon: CheckSquare,
      path: `/admin/${companyId}/crm/tasks`,
      description: 'Track follow-ups and tasks'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: `/admin/${companyId}/crm/settings`,
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
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{item.label}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
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

// Custom Layout with Sidebar
const CustomLayout = (props) => (
  <Layout
    {...props}
    appBar={CustomAppBar}
    sidebar={CustomSidebar}
    sx={{
      '& .RaLayout-content': {
        backgroundColor: '#f5f5f5',
        marginLeft: '256px', // 16rem = 256px
      },
      '& .RaLayout-appBar': {
        marginLeft: '256px',
      },
    }}
  />
);

const CRMApp = () => {
  const { companyId } = useParams();

  console.log('CRMApp: companyId =', companyId);

  // Create data provider with company filtering
  const dataProvider = useMemo(() => {
    if (!companyId) {
      console.error('CRMApp: No companyId provided');
      return null;
    }
    return createFirebaseDataProvider(companyId);
  }, [companyId]);

  // Create auth provider
  const authProvider = useMemo(() => {
    return createFirebaseAuthProvider();
  }, []);

  if (!dataProvider) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error: No company ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <Admin 
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={CustomLayout}
      title="SwedPrime CRM"
      disableTelemetry
      dashboard={CRMDashboard}
    >
      <Resource
        name="customers"
        list={CustomerList}
        edit={CustomerEdit}
        show={CustomerShow}
        create={CustomerCreate}
        options={{ label: 'Customers' }}
      />
      <Resource 
        name="leads" 
        list={LeadList} 
        create={LeadCreate} 
        edit={LeadEdit}
        options={{ label: 'Leads' }}
      />
      <Resource 
        name="deals" 
        list={DealList} 
        create={DealCreate} 
        edit={DealEdit}
        options={{ label: 'Deals' }}
      />
      <Resource 
        name="tasks" 
        list={TaskList} 
        create={TaskCreate} 
        edit={TaskEdit}
        options={{ label: 'Tasks' }}
      />
    </Admin>
  );
};

export default CRMApp;