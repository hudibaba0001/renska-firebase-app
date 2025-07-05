import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { companyId } = useParams();

  const stats = [
    {
      name: 'Active Calculators',
      value: '3',
      change: '+2 this month',
      changeType: 'positive',
      icon: '🛠️'
    },
    {
      name: 'Total Bookings',
      value: '127',
      change: '+12% from last month',
      changeType: 'positive',
      icon: '📅'
    },
    {
      name: 'Revenue This Month',
      value: '45,230 kr',
      change: '+8% from last month',
      changeType: 'positive',
      icon: '💰'
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.5% from last month',
      changeType: 'positive',
      icon: '📈'
    }
  ];

  const recentActivity = [
    {
      type: 'booking',
      title: 'New booking from Anna Andersson',
      description: 'Hemstädning - 75m² - 1,200 kr',
      time: '2 hours ago',
      icon: '📅'
    },
    {
      type: 'calculator',
      title: 'Calculator "Premium Cleaning" published',
      description: 'Now live at /booking/demo-company/premium-cleaning',
      time: '1 day ago',
      icon: '🚀'
    },
    {
      type: 'payment',
      title: 'Payment received',
      description: 'Erik Svensson - 950 kr',
      time: '2 days ago',
      icon: '💳'
    },
    {
      type: 'calculator',
      title: 'New calculator created',
      description: 'Window Cleaning Calculator',
      time: '3 days ago',
      icon: '🛠️'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Calculator',
      description: 'Build a custom booking form for your services',
      href: `/admin/${companyId}/forms/new`,
      icon: '➕',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'View All Bookings',
      description: 'Manage customer bookings and schedules',
      href: `/admin/${companyId}/bookings`,
      icon: '📋',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed performance metrics',
      href: `/admin/${companyId}/analytics`,
      icon: '📊',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Company Settings',
      description: 'Configure your company profile and preferences',
      href: `/admin/${companyId}/config`,
      icon: '⚙️',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your cleaning business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <span className={`text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600">Common tasks to manage your business</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className={`p-4 rounded-lg text-white transition-colors ${action.color} hover:scale-105 transform transition-transform`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm opacity-90 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  to={`/admin/${companyId}/activity`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Overview */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Calculators</h2>
                <p className="text-gray-600">Manage your booking forms and calculators</p>
              </div>
              <Link
                to={`/admin/${companyId}/forms/new`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Calculator
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Example Calculators */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Hemstädning Premium</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Published
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Per-m² tiered pricing with frequency multipliers
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/${companyId}/forms/hemstadning-premium`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    to={`/booking/${companyId}/hemstadning-premium`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Preview
                  </Link>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Window Cleaning</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Draft
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Window-based pricing with minimum total
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/${companyId}/forms/window-cleaning`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                <Link
                  to={`/admin/${companyId}/forms/new`}
                  className="text-center"
                >
                  <div className="text-3xl text-gray-400 mb-2">➕</div>
                  <p className="text-sm text-gray-600">Create New Calculator</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 