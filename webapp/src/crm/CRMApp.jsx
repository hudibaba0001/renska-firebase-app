import React, { useMemo } from 'react';
import { Admin, Resource } from 'react-admin';
import firebaseDataProvider from 'ra-data-firebase-client';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase/init';

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

const Dashboard = () => <div>CRM Dashboard</div>;
const Settings = () => <div>CRM Settings</div>;

const CRMApp = () => {
  const { companyId } = useParams();

  // Configure the data provider for Firestore v9+
  const dataProvider = useMemo(() => {
    return firebaseDataProvider({
      db,
      auth,
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
    });
  }, [db, auth, companyId]);

  return (
    <Admin 
      dataProvider={dataProvider}
      layout={CRMLayout}
      title="Reniska CRM"
      disableTelemetry
    >
      {/* Dashboard */}
      <Resource 
        name="dashboard" 
        list={Dashboard}
        icon={HomeIcon}
        options={{ label: 'Dashboard' }}
      />

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
  );
};

export default CRMApp; 