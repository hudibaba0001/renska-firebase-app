import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Progress, 
  Table,
  Spinner
} from 'flowbite-react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  DocumentCheckIcon,
  XMarkIcon,
  ChartBarIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function CompanyMetrics({ companyId }) {
  const [loading, setLoading] = useState(true);
  const [metrics] = useState({
    formInteractions: 0,
    completedForms: 0,
    abandonedForms: 0,
    abandonmentRate: 0,
    averageOrderPrice: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeCustomers: 0,
    inactiveCustomers: 0
  });
  
  // Mock data for top services to prevent rendering errors
  const [topServices] = useState([
    {
      name: 'House Cleaning',
      revenue: 15000,
      bookings: 25
    },
    {
      name: 'Window Cleaning',
      revenue: 8000,
      bookings: 12
    },
    {
      name: 'Garden Maintenance',
      revenue: 5000,
      bookings: 8
    }
  ]);

  useEffect(() => {
    // Simplified version - just set loading to false
    setLoading(false);
  }, [companyId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  // Key metrics for company dashboard
  const companyStats = [
    {
      name: 'Form Interactions',
      value: metrics.formInteractions,
      change: '+12%',
      changeType: 'positive',
      icon: CursorArrowRaysIcon,
      color: 'blue',
      description: 'total clicks'
    },
    {
      name: 'Completed Forms',
      value: metrics.completedForms,
      change: '+8%',
      changeType: 'positive',
      icon: DocumentCheckIcon,
      color: 'green',
      description: 'successful bookings'
    },
    {
      name: 'Abandonment Rate',
      value: formatPercentage(metrics.abandonmentRate),
      change: '-5%',
      changeType: 'positive',
      icon: XMarkIcon,
      color: 'red',
      description: 'forms abandoned'
    },
    {
      name: 'Average Order Price',
      value: formatCurrency(metrics.averageOrderPrice),
      change: '+15%',
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'purple',
      description: 'per booking'
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(metrics.monthlyRevenue),
      change: '+22%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'green',
      description: 'this month'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      change: '+18%',
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'blue',
      description: 'all time'
    },
    {
      name: 'Active Customers',
      value: metrics.activeCustomers,
      change: '+10%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'green',
      description: 'last 90 days'
    },
    {
      name: 'Customer Activity',
      value: formatPercentage(metrics.activeCustomers / (metrics.activeCustomers + metrics.inactiveCustomers) * 100),
      change: '+5%',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'yellow',
      description: 'engagement rate'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Company Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {companyStats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.changeType === "positive" && (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              )}
              {stat.changeType === "negative" && (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${
                stat.changeType === "positive" ? "text-green-500" : 
                stat.changeType === "negative" ? "text-red-500" : "text-gray-500"
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Top Services Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">Top-Selling Services</h5>
          <Badge color="gray">{topServices.length} Services</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Service Name</th>
                <th scope="col" className="px-6 py-3">Total Revenue</th>
                <th scope="col" className="px-6 py-3">Bookings</th>
                <th scope="col" className="px-6 py-3">Avg. Price</th>
                <th scope="col" className="px-6 py-3">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((service, index) => (
                <tr key={service.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <Badge color="info" className="mr-2">#{index + 1}</Badge>
                      {service.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(service.revenue)}
                  </td>
                  <td className="px-6 py-4">
                    {service.bookings}
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(service.revenue / service.bookings)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Progress 
                        progress={Math.min((service.revenue / Math.max(...topServices.map(s => s.revenue))) * 100, 100)} 
                        size="sm" 
                        className="w-20 mr-2"
                      />
                      <span className="text-sm text-gray-500">
                        {((service.revenue / (topServices.reduce((sum, s) => sum + s.revenue, 0))) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
