import React, { useState } from 'react';
import { Link, useLocation, useParams, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const { companyId } = useParams();
  const location = useLocation();
  
  // Check for super admin impersonation
  const impersonationData = JSON.parse(sessionStorage.getItem('superAdminImpersonation') || 'null');
  const isImpersonating = impersonationData && impersonationData.tenantId === companyId;

  const navigation = [
    {
      name: 'Dashboard',
      href: `/admin/${companyId}`,
      icon: '📊',
      current: location.pathname === `/admin/${companyId}`
    },
    {
      name: 'Form Builder',
      href: `/admin/${companyId}/forms/new`,
      icon: '🛠️',
      current: location.pathname.includes('/forms')
    },
    {
      name: 'Bookings',
      href: `/admin/${companyId}/bookings`,
      icon: '📅',
      current: location.pathname.includes('/bookings')
    },
    {
      name: 'Analytics',
      href: `/admin/${companyId}/analytics`,
      icon: '📈',
      current: location.pathname.includes('/analytics')
    },
    {
      name: 'Settings',
      href: `/admin/${companyId}/config`,
      icon: '⚙️',
      current: location.pathname.includes('/config')
    }
  ];

  return (
    <div className="min-h-screen bg-background font-mono text-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:relative lg:z-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">SwedPrime</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {companyId?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
            <div>
              <h2 className="font-medium text-gray-900 capitalize">
                {companyId?.replace('-', ' ') || 'Company'}
              </h2>
              <p className="text-sm text-gray-500">Premium Plan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="mt-3 space-y-2">
            <Link
              to={`/admin/${companyId}/forms/new`}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <span className="mr-3">➕</span>
              New Calculator
            </Link>
          </div>
        </div>

        {/* Bottom User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Super Admin Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-red-600 text-white px-4 py-2 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🦹‍♀️</span>
              <span>
                Super Admin Mode: Impersonating <strong>{impersonationData.tenantName}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('superAdminImpersonation');
                window.location.href = '/super-admin/tenants';
              }}
              className="underline hover:no-underline"
            >
              Exit Impersonation
            </button>
          </div>
        )}
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <span className="sr-only">Open sidebar</span>
                ☰
              </button>
              
              {/* Breadcrumbs */}
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link to={`/admin/${companyId}`} className="text-gray-500 hover:text-gray-700">
                      Dashboard
                    </Link>
                  </li>
                  {location.pathname.includes('/forms') && (
                    <>
                      <li className="text-gray-300">/</li>
                      <li className="text-gray-900 font-medium">Form Builder</li>
                    </>
                  )}
                </ol>
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    🔍
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <span className="sr-only">Notifications</span>
                🔔
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
} 