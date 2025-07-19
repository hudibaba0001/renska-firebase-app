// webapp/src/App.jsx
import React from 'react';
import { Routes, Route, Link, Outlet, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import CompanyConfigPage from './pages/CompanyConfigPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import BookingPage from './pages/BookingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBillingPage from './pages/AdminBillingPage';
import AdminPaymentSettings from './pages/AdminPaymentSettings'; // Import the new page
import SignupPage from './pages/SignupPage';
import FormBuilderPage from './pages/FormBuilderPage';
import SetupPage from './pages/SetupPage';
import SetupSuperAdminPage from './pages/SetupSuperAdminPage';
import TenantListPage from './pages/TenantListPage';
import TenantOnboardPage from './pages/TenantOnboardPage';
import TenantDetailPage from './pages/TenantDetailPage';
import PaymentPage from './pages/PaymentPage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';

// Import Layout and Auth Components
import AdminLayout from './components/AdminLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import SuperAdminLayout from './components/SuperAdminLayout';
import RequireAuth from './components/RequireAuth';
import RequireSuperAdmin from './components/RequireSuperAdmin';

export default function App() {
  return (
    <div className="min-h-screen bg-background font-mono">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="setup" element={<SetupPage />} />
          <Route path="setup-super-admin" element={<SetupSuperAdminPage />} />
        </Route>

        {/* Booking Routes (Public) */}
        <Route path="/booking/:companyId/:formSlug" element={<BookingPage />} />
        <Route path="/booking/:companyId" element={<BookingPage />} />

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
        <Route
          path="/admin/:companyId"
          element={
            <RequireAuth>
              <AdminDashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="forms" element={<FormBuilderRedirect />} />
          <Route path="forms/:formId" element={<FormBuilderPage />} />
          <Route path="config" element={<CompanyConfigPage />} />
          <Route path="billing" element={<AdminBillingPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="payment-settings" element={<AdminPaymentSettings />} /> {/* CORRECTED ROUTE */}
        </Route>

        {/* Legacy Admin Routes */}
        <Route
          path="/admin/companies"
          element={
            <RequireAuth>
              <AdminCompaniesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/reniska"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        />
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
    </div>
  );
}

// Helper and placeholder components below...

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

// Placeholder Page Components
function GlobalConfigPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">Global Configuration (Coming Soon)</h2></div>; }
function PlansManagementPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">Plans Management (Coming Soon)</h2></div>; }
function AuditLogsPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">Audit Logs (Coming Soon)</h2></div>; }
function UserManagementPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">User Management (Coming Soon)</h2></div>; }
function AdminBookingsPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">Bookings Management (Placeholder)</h2></div>; }
function AdminAnalyticsPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">Analytics (Placeholder)</h2></div>; }
function AdminCustomersPage() { return <div className="text-center p-8"><h2 className="text-xl font-bold">Customers (Placeholder)</h2></div>; }
