import React, { useMemo } from 'react';
import { Admin, Resource, Layout } from 'react-admin';
import { useParams, useNavigate } from 'react-router-dom';
import { createFirebaseDataProvider } from '../utils/firebaseDataProvider';
import { createFirebaseAuthProvider } from '../utils/firebaseAuthProvider';
import { AppBar, TitlePortal, Button } from 'react-admin';
import { ArrowBack } from '@mui/icons-material';

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

// Custom Layout
const CustomLayout = (props) => (
  <Layout
    {...props}
    appBar={CustomAppBar}
    sx={{
      '& .RaLayout-content': {
        backgroundColor: '#f5f5f5',
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