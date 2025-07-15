import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/init';
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
import { logger } from '../utils/logger';

// BookingsListPage component for the Bookings tab
function BookingsListPage({ tenantId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock bookings data - in production, this would fetch from Firestore
    const loadBookings = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock bookings data
      const mockBookings = [
        {
          id: 'booking_001',
          customerName: 'Anna Andersson',
          customerEmail: 'anna@example.com',
          service: 'Regular Cleaning',
          date: '2024-01-15',
          time: '10:00',
          status: 'confirmed',
          amount: 1200,
          address: 'Storgatan 1, Stockholm'
        },
        {
          id: 'booking_002',
          customerName: 'Erik Eriksson',
          customerEmail: 'erik@example.com',
          service: 'Deep Cleaning',
          date: '2024-01-18',
          time: '14:00',
          status: 'pending',
          amount: 2500,
          address: 'Kungsgatan 5, Stockholm'
        },
        {
          id: 'booking_003',
          customerName: 'Maria Larsson',
          customerEmail: 'maria@example.com',
          service: 'Move-in Cleaning',
          date: '2024-01-20',
          time: '09:00',
          status: 'completed',
          amount: 3200,
          address: 'Vasagatan 12, Stockholm'
        }
      ];
      
      setBookings(mockBookings);
      setLoading(false);
    };

    loadBookings();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-500 font-mono">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-mono">Recent Bookings</h3>
          <p className="text-gray-600 font-mono">Manage customer bookings for this tenant</p>
        </div>
        <Badge color="info" className="font-mono">
          {bookings.length} Total
        </Badge>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-bold text-gray-900 font-mono">{booking.customerName}</h4>
                    <Badge 
                      color={
                        booking.status === 'confirmed' ? 'success' : 
                        booking.status === 'pending' ? 'warning' : 
                        'gray'
                      }
                      className="font-mono"
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <p className="text-gray-600">Service: <span className="font-medium">{booking.service}</span></p>
                      <p className="text-gray-600">Date: <span className="font-medium">{booking.date} at {booking.time}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount: <span className="font-medium text-brand">{booking.amount} SEK</span></p>
                      <p className="text-gray-600">Email: <span className="font-medium">{booking.customerEmail}</span></p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mt-2 font-mono">
                    <span className="text-sm">📍 {booking.address}</span>
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="xs" color="gray" className="font-mono">
                    View Details
                  </Button>
                  {booking.status === 'pending' && (
                    <Button size="xs" color="success" className="font-mono">
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 font-mono mb-2">No bookings yet</h3>
            <p className="text-gray-600 font-mono">This tenant hasn't received any bookings yet.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function TenantDetailPage() {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        setError(null);
        
        logger.debug('TenantDetail', 'Fetching tenant data for ID:', tenantId);
        const tenantDoc = await getDoc(doc(db, 'companies', tenantId));
        
        if (!tenantDoc.exists()) {
          setError('Tenant not found');
          toast.error('Tenant not found');
          return;
        }
        
        const tenantData = { id: tenantDoc.id, ...tenantDoc.data() };
        logger.info('TenantDetail', 'Tenant data loaded successfully');
        setTenant(tenantData);
        
      } catch (err) {
        logger.error('TenantDetail', 'Error fetching tenant data:', err);
        setError(err.message);
        toast.error('Failed to load tenant details');
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenant();
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen font-mono">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto mb-4" />
            <p className="text-gray-500 font-mono">Loading tenant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-background min-h-screen font-mono">
        <PageHeader 
          title="Tenant Details" 
          backLink="/super-admin/tenants"
        />
        <Alert color="failure" className="mt-6">
          <div className="flex items-center">
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
        </Alert>
      </div>
    );
  }

  const getStatusColor = () => {
    if (tenant?.subscription?.active) return 'success';
    if (tenant?.subscription?.status === 'trial') return 'warning';
    return 'failure';
  };

  const getStatusText = () => {
    if (tenant?.subscription?.active) {
      if (tenant?.subscription?.status === 'trial') return 'Trial Active';
      return 'Active';
    }
    return 'Suspended';
  };

  return (
    <div className="p-6 bg-background min-h-screen font-mono">
      <PageHeader 
        title={tenant?.name || 'Tenant Details'} 
        subtitle={`Manage configuration, bookings, and billing for ${tenant?.name || 'this tenant'}`}
        backLink="/super-admin/tenants"
      />
      
      {/* Tenant Overview Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-mono">{tenant?.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm font-mono text-gray-600">
                    <GlobeAltIcon className="inline h-4 w-4 mr-1" />
                    /booking/{tenant?.slug}
                  </p>
                  <Badge color={getStatusColor()} className="font-mono">
                    {getStatusText()}
                  </Badge>
                  <Badge color="info" className="font-mono">
                    {tenant?.subscription?.plan || 'Basic'} Plan
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                color="gray" 
                size="sm" 
                onClick={() => window.open(`/booking/${tenant?.slug}`, '_blank')}
                className="font-mono"
              >
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                View Booking Page
              </Button>
              <Button 
                color="gray" 
                size="sm" 
                onClick={() => window.open(`/admin/${tenant?.slug}`, '_blank')}
                className="font-mono"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Admin Panel
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand font-mono">
                {tenant?.subscription?.trialDays || 0}
              </div>
              <div className="text-sm text-gray-600 font-mono">Trial Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand font-mono">
                {new Date(tenant?.createdAt?.toDate?.() || Date.now()).toLocaleDateString('sv-SE')}
              </div>
              <div className="text-sm text-gray-600 font-mono">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand font-mono">
                {tenant?.settings?.rutPercentage || 50}%
              </div>
              <div className="text-sm text-gray-600 font-mono">RUT Deduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand font-mono">
                {tenant?.billing?.contactEmail ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600 font-mono">Billing Contact</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs 
          aria-label="Tenant management tabs" 
          style="underline"
          onActiveTabChange={(tab) => setActiveTab(tab)}
        >
          <Tabs.Item 
            active={activeTab === 'config'} 
            title="Configuration"
            icon={DocumentTextIcon}
          >
            <div className="p-6">
              <CompanyConfigPage companyId={tenantId} />
            </div>
          </Tabs.Item>
          
          <Tabs.Item 
            active={activeTab === 'bookings'} 
            title="Bookings"
            icon={CalendarDaysIcon}
          >
            <div className="p-6">
              <BookingsListPage tenantId={tenantId} />
            </div>
          </Tabs.Item>
          
          <Tabs.Item 
            active={activeTab === 'billing'} 
            title="Billing"
            icon={CreditCardIcon}
          >
            <div className="p-6">
              <AdminBillingPage />
            </div>
          </Tabs.Item>
        </Tabs>
      </Card>
    </div>
  );
} 