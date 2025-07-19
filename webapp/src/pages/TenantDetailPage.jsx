// webapp/src/pages/TenantDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Import the specific service function needed for this page.
// This replaces the direct 'firebase/firestore' import.
import { getTenant } from '../services/firestore';
import { Card, Tabs, Avatar, Badge, Spinner, Alert, Button } from 'flowbite-react';
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  CalendarDaysIcon, 
  CreditCardIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import CompanyConfigPage from './CompanyConfigPage';
import AdminBillingPage from './AdminBillingPage';
import toast from 'react-hot-toast';

// The BookingsListPage sub-component remains unchanged as it uses mock data.
function BookingsListPage({ tenantId }) {
  // ... (existing mock data implementation)
  return <div>Bookings for {tenantId}</div>
}

export default function TenantDetailPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ , setActiveTab] = useState('config');

  useEffect(() => {
    /**
     * Fetches a single tenant's data using the centralized `getTenant` service function.
     * This abstracts the data-fetching logic away from the component.
     */
    const fetchTenantDetails = async () => {
      // Basic validation to prevent unnecessary API calls.
      if (!tenantId) {
        setError("No Tenant ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Fetching tenant: ${tenantId} using service layer`);
        // Replace direct Firestore call with our robust service function.
        const tenantData = await getTenant(tenantId);
        
        if (!tenantData) {
          setError('Tenant not found.');
          toast.error('Tenant not found.');
        } else {
          console.log('✅ Tenant data loaded:', tenantData);
          setTenant(tenantData);
        }
        
      } catch (err) {
        // Errors thrown from the service layer are caught here.
        console.error('❌ Error fetching tenant:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to load tenant details');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [tenantId]); // Dependency array ensures this runs when the tenantId changes.

  // The rest of the component's rendering logic remains the same.
  // It benefits from the clean separation of concerns, making the JSX easier to read and manage.

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner size="xl" />
        <p>Loading tenant details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Error" backLink="/super-admin/tenants" />
        <Alert color="failure" className="mt-6">
          <span className="font-medium">Error:</span> {error}
        </Alert>
      </div>
    );
  }
  
  if (!tenant) {
      return (
          <div className="p-6">
             <PageHeader title="Not Found" backLink="/super-admin/tenants" />
             <Alert color="warning" className="mt-6">
                 Could not find the requested tenant.
             </Alert>
          </div>
      )
  }

  const getStatusColor = () => (tenant?.subscription?.active ? 'success' : 'failure');
  const getStatusText = () => (tenant?.subscription?.active ? 'Active' : 'Suspended');

  const handleImpersonate = () => {
    sessionStorage.setItem('superAdminImpersonation', JSON.stringify({
      tenantId: tenant.id,
      tenantName: tenant.companyName || tenant.name || tenant.id,
    }));
    toast.success(`Impersonating ${tenant.companyName || tenant.name}`);
    navigate(`/admin/${tenant.id}`);
  };

  return (
    <div className="p-6 bg-background min-h-screen font-mono">
      <PageHeader 
        title={tenant.name} 
        subtitle="Manage configuration, bookings, and billing"
        backLink="/super-admin/tenants"
      />
      
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BuildingOfficeIcon className="h-8 w-8 text-white p-2 bg-brand rounded-xl" />
              <div>
                <h2 className="text-2xl font-bold text-text-heading dark:text-white">{tenant.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-text-main dark:text-white">/booking/{tenant.id}</p>
                  <Badge color={getStatusColor()}>{getStatusText()}</Badge>
                  <Badge color="info">{tenant.subscription?.plan} Plan</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button color="light" size="sm" onClick={handleImpersonate}>
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
              <Button color="light" size="sm" onClick={() => window.open(`/booking/${tenant.id}`, '_blank')}>
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                View Booking Page
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs onActiveTabChange={setActiveTab}>
          <Tabs.Item active title="Configuration" icon={DocumentTextIcon}>
            <div className="p-6">
              <CompanyConfigPage companyId={tenantId} />
            </div>
          </Tabs.Item>
          <Tabs.Item title="Bookings" icon={CalendarDaysIcon}>
            <div className="p-6">
              <BookingsListPage tenantId={tenantId} />
            </div>
          </Tabs.Item>
          <Tabs.Item title="Billing" icon={CreditCardIcon}>
            <div className="p-6">
              <AdminBillingPage />
            </div>
          </Tabs.Item>
        </Tabs>
      </Card>
    </div>
  );
}
