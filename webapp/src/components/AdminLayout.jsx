import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ companyId, children }) {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: `/admin/${companyId}`,
      icon: HomeIcon,
      current: location.pathname === `/admin/${companyId}`
    },
    {
      name: 'Form Builder',
      href: `/admin/${companyId}/forms`,
      icon: WrenchScrewdriverIcon,
      current: location.pathname.includes('/forms')
    },
    {
      name: 'Bookings',
      href: `/admin/${companyId}/bookings`,
      icon: CalendarIcon,
      current: location.pathname.includes('/bookings')
    },
    {
      name: 'Field Management',
      href: `/admin/${companyId}/fms`,
      icon: ClockIcon,
      current: location.pathname.includes('/fms')
    },
    {
      name: 'Analytics',
      href: `/admin/${companyId}/analytics`,
      icon: ChartBarIcon,
      current: location.pathname.includes('/analytics')
    },
    {
      name: 'Customers',
      href: `/admin/${companyId}/customers`,
      icon: UsersIcon,
      current: location.pathname.includes('/customers')
    },
    {
      name: 'CRM',
      href: `/admin/${companyId}/crm-data`,
      icon: ClipboardDocumentListIcon,
      current: location.pathname.includes('/crm')
    },
    {
      name: 'Settings',
      href: `/admin/${companyId}/settings`,
      icon: Cog6ToothIcon,
      current: location.pathname.includes('/settings')
    },
    {
      name: 'Payment Settings',
      href: `/admin/${companyId}/payment-settings`,
      icon: CreditCardIcon,
      current: location.pathname.includes('/payment-settings')
    },
    {
      name: 'Coupons',
      href: `/admin/${companyId}/coupons`,
      icon: TicketIcon,
      current: location.pathname.includes('/coupons')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="px-4 py-5">
          <Link to={`/admin/${companyId}`} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">SwedPrime</span>
          </Link>
        </div>
        
        <div className="px-2 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 ${
                item.current
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${
                item.current ? 'text-blue-700' : 'text-gray-400'
              }`} />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Help Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-xs text-gray-600 mb-3">
              Check our documentation or contact support for assistance.
            </p>
            <a
              href="/support"
              className="block w-full bg-white text-blue-600 text-sm text-center py-2 px-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
            >
              Get Support
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}