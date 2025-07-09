// webapp/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Outlet, Navigate, useParams } from 'react-router-dom';
import { Flowbite } from 'flowbite-react';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import CompanyConfigPage from './pages/CompanyConfigPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import BookingPage from './pages/BookingPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import SuperAdminLayout from './components/SuperAdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBillingPage from './pages/AdminBillingPage';
import SignupPage from './pages/SignupPage';
import FormBuilderPage from './pages/FormBuilderPage';
import SetupPage from './pages/SetupPage';
import SetupSuperAdminPage from './pages/SetupSuperAdminPage';
import RequireAuth from './components/RequireAuth';
import RequireSuperAdmin from './components/RequireSuperAdmin';
import { AdminDashboard } from './pages/BookingPage';
import TenantListPage from './pages/TenantListPage';
import TenantOnboardPage from './pages/TenantOnboardPage';
import TenantDetailPage from './pages/TenantDetailPage';
import WidgetPage from './pages/WidgetPage';
import IframeTestPage from './pages/IframeTestPage';

export default function App() {
  return (
    <div className="min-h-screen bg-background font-mono">
      <Flowbite>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="setup" element={<SetupPage />} />
            <Route path="setup-super-admin" element={<SetupSuperAdminPage />} />
          </Route>

          {/* Booking Routes (Public) */}
          <Route path="/booking/reniska" element={<BookingPage />} />
          <Route path="/booking/:companyId/:formSlug" element={<BookingPage />} />

          {/* Super-Admin Routes */}
          <Route 
            path="/super-admin/*" 
            element={
              <RequireSuperAdmin>
                <SuperAdminRoutes />
              </RequireSuperAdmin>
            } 
          />

          {/* Admin Routes with Modern Layout */}
          <Route path="/admin/:companyId" element={
            <RequireAuth>
              <AdminDashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="forms" element={<FormBuilderRedirect />} />
            <Route path="forms/:formId" element={<FormBuilderPage />} />
            <Route path="config" element={<CompanyConfigPage />} />
            <Route path="billing" element={<AdminBillingPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
          </Route>

          {/* Legacy Admin Routes */}
          <Route path="/admin/companies" element={
            <RequireAuth>
              <AdminCompaniesPage />
            </RequireAuth>
          } />
          <Route path="/admin/reniska" element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          } />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Ubuntu Mono, monospace',
            },
          }}
        />
      </Flowbite>
    </div>
  );
}

// Form Builder Redirect Component
function FormBuilderRedirect() {
  const { companyId } = useParams();
  return <Navigate to={`/admin/${companyId}/forms/new`} replace />;
}

// Super-Admin Routes Component
function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="tenants" element={<TenantListPage />} />
        <Route path="tenants/new" element={<TenantOnboardPage />} />
        <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
        <Route path="global-config" element={<GlobalConfigPage />} />
        <Route path="plans" element={<PlansManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="users" element={<UserManagementPage />} />
      </Route>
    </Routes>
  );
}

// Public Layout Component
function PublicLayout() {
  return (
    <>
      <header className="bg-brand text-white px-6 py-4 shadow-lg">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold hover:text-brand-light transition-colors">
            SwedPrime SaaS
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="hover:text-brand-light transition-colors">
              💳 Pricing
            </Link>
            <Link to="/login" className="hover:text-brand-light transition-colors">
              Admin Login
            </Link>
            <Link to="/admin/demo-company" className="bg-brand-light hover:bg-brand-dark px-3 py-1 rounded transition-colors">
              🚀 Demo
            </Link>
            <Link to="/super-admin" className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors">
              ⚡ Super Admin
            </Link>
          </div>
        </nav>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        <Outlet />
      </main>
      
      <footer className="bg-brand-dark text-white text-center py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm">© 2025 SwedPrime SaaS Platform</p>
          <p className="text-xs text-brand-light mt-1">Multi-tenant cleaning business management</p>
        </div>
      </footer>
    </>
  );
}

// Super-Admin Page Components
function SuperAdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage all tenants, plans, and global configuration</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">🏢</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Tenants</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">💰</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">15,600 SEK</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">📊</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">248</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">⚠️</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Issues</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/super-admin/tenants/new"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">🆕</span>
                <div>
                  <p className="font-medium text-gray-900">Add New Tenant</p>
                  <p className="text-sm text-gray-500">Onboard a new company</p>
                </div>
              </Link>
              <Link
                to="/super-admin/global-config"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">⚙️</span>
                <div>
                  <p className="font-medium text-gray-900">Global Settings</p>
                  <p className="text-sm text-gray-500">Configure system-wide options</p>
                </div>
              </Link>
              <Link
                to="/super-admin/plans"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <p className="font-medium text-gray-900">Manage Plans</p>
                  <p className="text-sm text-gray-500">Update pricing and features</p>
                </div>
              </Link>
              <Link
                to="/super-admin/audit-logs"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">📄</span>
                <div>
                  <p className="font-medium text-gray-900">View Audit Logs</p>
                  <p className="text-sm text-gray-500">Track system activity</p>
                </div>
              </Link>
              {/* View Tenants */}
              <Link
                to="/super-admin/tenants"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">🏢</span>
                <div>
                  <p className="font-medium text-gray-900">View Tenants</p>
                  <p className="text-sm text-gray-500">Manage existing companies</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CDN</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Degraded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalConfigPage() {
  return <div className="text-center p-8"><h2 className="text-xl font-bold">Global Configuration (Coming Soon)</h2></div>;
}

function PlansManagementPage() {
  return <div className="text-center p-8"><h2 className="text-xl font-bold">Plans Management (Coming Soon)</h2></div>;
}

function AuditLogsPage() {
  return <div className="text-center p-8"><h2 className="text-xl font-bold">Audit Logs (Coming Soon)</h2></div>;
}

function UserManagementPage() {
  return <div className="text-center p-8"><h2 className="text-xl font-bold">User Management (Coming Soon)</h2></div>;
}

// Placeholder Admin Pages
function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
          address: 'Storgatan 1, Stockholm',
          phone: '+46 70 123 4567',
          notes: 'Please use eco-friendly products'
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
          address: 'Kungsgatan 5, Stockholm',
          phone: '+46 70 987 6543',
          notes: 'Large apartment, extra time needed'
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
          address: 'Vasagatan 12, Stockholm',
          phone: '+46 70 555 7890',
          notes: 'Keys available from 8:30 AM'
        },
        {
          id: 'booking_004',
          customerName: 'Johan Svensson',
          customerEmail: 'johan@example.com',
          service: 'Window Cleaning',
          date: '2024-01-22',
          time: '11:00',
          status: 'confirmed',
          amount: 800,
          address: 'Drottninggatan 8, Stockholm',
          phone: '+46 70 111 2233',
          notes: 'Third floor, access from courtyard'
        },
        {
          id: 'booking_005',
          customerName: 'Sofia Lindström',
          customerEmail: 'sofia@example.com',
          service: 'Office Cleaning',
          date: '2024-01-25',
          time: '18:00',
          status: 'pending',
          amount: 1800,
          address: 'Sveavägen 20, Stockholm',
          phone: '+46 70 444 5566',
          notes: 'After hours cleaning, key code: 1234'
        }
      ];
      
      setBookings(mockBookings);
      setLoading(false);
    };

    loadBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 font-mono">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-mono">Bookings Management</h1>
          <p className="text-gray-600 font-mono">Manage and track all customer bookings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
            <span className="text-sm font-medium text-gray-500">Total: </span>
            <span className="text-lg font-bold text-blue-600">{filteredBookings.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 font-mono">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 font-mono">{booking.customerName}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    <span className="mr-1">{getStatusIcon(booking.status)}</span>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-mono">
                  <div>
                    <p className="text-gray-600">📧 {booking.customerEmail}</p>
                    <p className="text-gray-600">📞 {booking.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">🧹 {booking.service}</p>
                    <p className="text-gray-600">📅 {booking.date} at {booking.time}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">💰 <span className="font-bold text-green-600">{booking.amount} SEK</span></p>
                    <p className="text-gray-600">📍 {booking.address}</p>
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 font-mono">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-mono text-sm">
                  View Details
                </button>
                {booking.status === 'pending' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-mono text-sm">
                    Confirm
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-mono text-sm">
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2 font-mono">No bookings found</h2>
          <p className="text-gray-600 font-mono">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No bookings have been created yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

function AdminAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalBookings: 0,
      totalRevenue: 0,
      avgBookingValue: 0,
      conversionRate: 0,
      growthRate: 0
    },
    bookingsByService: [],
    revenueByMonth: [],
    conversionFunnel: [],
    topAreas: [],
    customerInsights: {}
  });

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock analytics data
      const mockData = {
        overview: {
          totalBookings: 156,
          totalRevenue: 187500,
          avgBookingValue: 1202,
          conversionRate: 12.8,
          growthRate: 18.5
        },
        bookingsByService: [
          { service: 'Regular Cleaning', count: 68, percentage: 43.6, revenue: 81600 },
          { service: 'Deep Cleaning', count: 42, percentage: 26.9, revenue: 105000 },
          { service: 'Move-in/Move-out', count: 28, percentage: 17.9, revenue: 89600 },
          { service: 'Window Cleaning', count: 12, percentage: 7.7, revenue: 9600 },
          { service: 'Office Cleaning', count: 6, percentage: 3.9, revenue: 10800 }
        ],
        revenueByMonth: [
          { month: 'Aug', revenue: 12500, bookings: 15 },
          { month: 'Sep', revenue: 18200, bookings: 22 },
          { month: 'Oct', revenue: 24800, bookings: 31 },
          { month: 'Nov', revenue: 31200, bookings: 39 },
          { month: 'Dec', revenue: 28900, bookings: 35 },
          { month: 'Jan', revenue: 33600, bookings: 42 }
        ],
        conversionFunnel: [
          { stage: 'Page Views', count: 1240, percentage: 100 },
          { stage: 'Started Form', count: 248, percentage: 20 },
          { stage: 'Completed Form', count: 186, percentage: 15 },
          { stage: 'Confirmed Booking', count: 156, percentage: 12.6 }
        ],
        topAreas: [
          { area: 'Stockholm City', bookings: 45, revenue: 54000 },
          { area: 'Södermalm', bookings: 32, revenue: 38400 },
          { area: 'Östermalm', bookings: 28, revenue: 42000 },
          { area: 'Vasastan', bookings: 21, revenue: 25200 },
          { area: 'Norrmalm', bookings: 18, revenue: 21600 }
        ],
        customerInsights: {
          averageCustomerLifetime: 3.2,
          repeatCustomerRate: 34.5,
          customerSatisfaction: 4.7,
          averageResponseTime: 2.3
        }
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    loadAnalyticsData();
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (rate) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (rate) => {
    return rate >= 0 ? '↗️' : '↘️';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 font-mono">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-mono">Analytics Dashboard</h1>
          <p className="text-gray-600 font-mono">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 font-mono">Total Bookings</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{analyticsData.overview.totalBookings}</div>
          <div className={`text-sm font-mono ${getGrowthColor(analyticsData.overview.growthRate)}`}>
            {getGrowthIcon(analyticsData.overview.growthRate)} {analyticsData.overview.growthRate}% vs prev period
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 font-mono">Total Revenue</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
          <div className="text-sm text-green-600 font-mono">↗️ +23.1% vs prev period</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 font-mono">Avg Booking Value</h3>
            <span className="text-2xl">💳</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{formatCurrency(analyticsData.overview.avgBookingValue)}</div>
          <div className="text-sm text-blue-600 font-mono">↗️ +5.2% vs prev period</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 font-mono">Conversion Rate</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{analyticsData.overview.conversionRate}%</div>
          <div className="text-sm text-green-600 font-mono">↗️ +2.1% vs prev period</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 font-mono">Customer Rating</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{analyticsData.customerInsights.customerSatisfaction}/5</div>
          <div className="text-sm text-green-600 font-mono">↗️ +0.3 vs prev period</div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Month */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mono">Revenue by Month</h3>
          <div className="space-y-4">
            {analyticsData.revenueByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-mono text-sm text-gray-600">{item.month}</div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.revenue / 35000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="font-mono text-sm font-bold text-gray-900 min-w-20">{formatCurrency(item.revenue)}</div>
                  <div className="font-mono text-xs text-gray-500 min-w-16">{item.bookings} bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Service */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mono">Bookings by Service</h3>
          <div className="space-y-4">
            {analyticsData.bookingsByService.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-mono text-sm text-gray-700">{item.service}</div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="font-mono text-xs text-gray-500 min-w-12">{item.count}</div>
                  <div className="font-mono text-xs text-gray-500 min-w-16">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel and Top Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mono">Conversion Funnel</h3>
          <div className="space-y-4">
            {analyticsData.conversionFunnel.map((stage, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-mono text-sm text-gray-700">{stage.stage}</div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-600 h-3 rounded-full" 
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                  <div className="font-mono text-sm font-bold text-gray-900 min-w-16">{stage.count}</div>
                  <div className="font-mono text-xs text-gray-500 min-w-16">{stage.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Areas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mono">Top Areas</h3>
          <div className="space-y-4">
            {analyticsData.topAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-mono text-sm text-gray-700">📍 {area.area}</div>
                <div className="flex items-center space-x-4">
                  <div className="font-mono text-sm font-bold text-gray-900">{area.bookings}</div>
                  <div className="font-mono text-xs text-green-600">{formatCurrency(area.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mono">Customer Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 font-mono">{analyticsData.customerInsights.averageCustomerLifetime}</div>
            <div className="text-sm text-gray-600 font-mono">Avg Customer Lifetime (months)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 font-mono">{analyticsData.customerInsights.repeatCustomerRate}%</div>
            <div className="text-sm text-gray-600 font-mono">Repeat Customer Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 font-mono">{analyticsData.customerInsights.customerSatisfaction}/5</div>
            <div className="text-sm text-gray-600 font-mono">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 font-mono">{analyticsData.customerInsights.averageResponseTime}h</div>
            <div className="text-sm text-gray-600 font-mono">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCustomersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Customers</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">👥</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h2>
        <p className="text-gray-600">Customer management interface coming soon...</p>
      </div>
    </div>
  );
}
