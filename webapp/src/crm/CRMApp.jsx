import React, { useMemo } from 'react';
import { Admin, Resource } from 'react-admin';
import firebaseDataProvider from 'ra-data-firebase-client';
import { useParams } from 'react-router-dom';
import firebase from '../firebase/init';

// Import CRM components
import CustomerList from './components/CustomerList';
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

const CRMApp = () => {
  const { companyId } = useParams();

  // Configure the data provider for Firestore v8 compat
  const dataProvider = useMemo(() => {
    return firebaseDataProvider(
      firebase,
      {
        firestore: true,
        realtime: false,
        logging: false,
        rootRef: '',
        watch: [],
        dontAddIdFieldToDoc: false,
        overrideGetListQuery: (resource, params) => {
          return {
            ...params,
            filter: {
              ...params.filter,
              companyId,
            },
          };
        },
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
  }, [firebase, companyId]);

  return (
    <Admin dataProvider={dataProvider} title="Reniska CRM">
      <Resource
        name="customers"
        list={CustomerList}
        edit={CustomerEdit}
        show={CustomerShow}
      />
      <Resource name="leads" list={LeadList} create={LeadCreate} edit={LeadEdit} />
      <Resource name="deals" list={DealList} create={DealCreate} edit={DealEdit} />
      <Resource name="tasks" list={TaskList} create={TaskCreate} edit={TaskEdit} />
      <Resource name="reports" list={ReportList} />
      <Resource name="settings" list={Settings} />
    </Admin>
  );
};

export default CRMApp; 