import React, { useMemo } from 'react';
import { Admin, Resource } from 'react-admin';
import firebaseDataProvider from 'ra-data-firebase-client';
import { useParams } from 'react-router-dom';
import firebase from '../firebase/init';
import { loadCRMDemoData } from '../scripts/loadCRMDemoData';

// Import CRM components
import CustomerList from './components/CustomerList';
import CustomerCreate from './components/CustomerCreate';
import CustomerEdit from './components/CustomerEdit';
import CustomerShow from './components/CustomerShow';

import LeadList from './components/LeadList';
import LeadCreate from './components/LeadCreate';
import LeadEdit from './components/LeadEdit';

import DealList from './components/DealList';
import DealCreate from './components/DealCreate';
import DealEdit from './components/DealEdit';

import TaskList from './components/TaskList';
import TaskCreate from './components/TaskCreate';
import TaskEdit from './components/TaskEdit';

import ReportList from './components/ReportList';
import Settings from './components/Settings';

// Import icons
import { 
  UsersIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  CalendarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

// Custom layout for CRM
import CRMLayout from './components/CRMLayout';

const Dashboard = () => {
  const { companyId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const handleLoadDemoData = async () => {
    setLoading(true);
    try {
      await loadCRMDemoData(companyId);
      setLoaded(true);
      alert('Demo data loaded successfully! Refresh the page to see the data.');
    } catch (error) {
      console.error('Error loading demo data:', error);
      alert('Error loading demo data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>CRM Dashboard</h1>
      
      {/* Demo Data Button */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>🚀 Quick Start</h3>
        <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
          Load demo data to see how the CRM works with real data
        </p>
        <button
          onClick={handleLoadDemoData}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? 'Loading...' : loaded ? '✅ Demo Data Loaded' : '📊 Load Demo Data'}
        </button>
        {loaded && (
          <p style={{ marginTop: '0.5rem', fontSize: '12px', color: '#28a745' }}>
            Demo data loaded! Navigate to Customers, Leads, Deals, or Tasks to see the data.
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Customers</h3>
          <p>Manage your customer relationships</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Leads</h3>
          <p>Track potential customers</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Deals</h3>
          <p>Monitor sales opportunities</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Tasks</h3>
          <p>Manage your activities</p>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('CRMApp ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: 'red' }}>
          <h2>Something went wrong in the CRMApp.</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const CRMApp = () => {
  const { companyId } = useParams();

  console.log('[CRMApp] Rendering with companyId:', companyId);

  // Configure the data provider for Firestore v8 compat
  const dataProvider = useMemo(() => {
    try {
      console.log('[CRMApp] Creating dataProvider...');
      const provider = firebaseDataProvider(
        firebase,
        {
          firestore: true,
          logging: false,
          rootRef: '',
          watch: [],
          dontAddIdFieldToDoc: false,
          // Add a filter for companyId to all list queries
          overrideGetListQuery: (resource, params) => {
            return {
              ...params,
              filter: {
                ...params.filter,
                companyId,
              },
            };
          },
          // Add companyId to all create/update
          overrideCreateDoc: (resource, params) => ({
            ...params.data,
            companyId,
          }),
          overrideUpdateDoc: (resource, params) => ({
            ...params.data,
            companyId,
          }),
        }
      );
      console.log('[CRMApp] dataProvider created successfully');
      return provider;
    } catch (err) {
      console.error('[CRMApp] Error creating dataProvider:', err);
      return null;
    }
  }, [firebase, companyId]);

  if (!dataProvider) {
    console.log('[CRMApp] No dataProvider available, showing error...');
    return (
      <div style={{ padding: 32, color: 'red' }}>
        <h2>Error initializing CRM</h2>
        <p>Failed to create data provider. Please check the console for details.</p>
      </div>
    );
  }

  console.log('[CRMApp] Rendering <Admin> with dataProvider:', dataProvider);

  return (
    <ErrorBoundary>
      <Admin 
        dataProvider={dataProvider}
        layout={CRMLayout}
        title="Reniska CRM"
        disableTelemetry
        dashboard={Dashboard}
        basename={`/admin/${companyId}/crm`}
      >

        {/* Customers */}
        <Resource 
          name="customers" 
          list={CustomerList}
          create={CustomerCreate}
          edit={CustomerEdit}
          show={CustomerShow}
          icon={UsersIcon}
          options={{ label: 'Customers' }}
        />

        {/* Leads */}
        <Resource 
          name="leads" 
          list={LeadList}
          create={LeadCreate}
          edit={LeadEdit}
          icon={UserPlusIcon}
          options={{ label: 'Leads' }}
        />

        {/* Deals */}
        <Resource 
          name="deals" 
          list={DealList}
          create={DealCreate}
          edit={DealEdit}
          icon={ChartBarIcon}
          options={{ label: 'Deals' }}
        />

        {/* Tasks */}
        <Resource 
          name="tasks" 
          list={TaskList}
          create={TaskCreate}
          edit={TaskEdit}
          icon={ClipboardDocumentListIcon}
          options={{ label: 'Tasks' }}
        />

        {/* Reports */}
        <Resource 
          name="reports" 
          list={ReportList}
          icon={ChartBarIcon}
          options={{ label: 'Reports' }}
        />

        {/* Settings */}
        <Resource 
          name="settings" 
          list={Settings}
          icon={Cog6ToothIcon}
          options={{ label: 'Settings' }}
        />
      </Admin>
    </ErrorBoundary>
  );
};

export default CRMApp; 