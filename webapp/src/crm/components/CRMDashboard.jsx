import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getLeads, getLeadStats, getBookingLeads } from '../services/leadService';
import { getCustomers } from '../services/customerService';
import { getDeals } from '../services/dealService';
import { getTasks } from '../services/taskService';
import toast from 'react-hot-toast';

export default function CRMDashboard() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentLeads, setRecentLeads] = useState([]);
  const [bookingLeads, setBookingLeads] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [companyId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        leadStats,
        leadsData,
        bookingLeadsData,
        customersData,
        dealsData,
        tasksData
      ] = await Promise.all([
        getLeadStats(companyId),
        getLeads(companyId, { pageSize: 5 }),
        getBookingLeads(companyId),
        getCustomers(companyId, { limit: 5 }),
        getDeals(companyId, { pageSize: 5 }),
        getTasks(companyId, { pageSize: 5 })
      ]);

      setStats(leadStats);
      setRecentLeads(leadsData.leads || []);
      setBookingLeads(bookingLeadsData || []);
      setRecentCustomers(customersData.customers || []);
      setRecentDeals(dealsData.deals || []);
      setRecentTasks(tasksData.tasks || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-purple-100 text-purple-800',
      closed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure">
        <span className="font-medium">Error!</span> {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
        <Button href={`/crm/${companyId}/leads/new`} className="bg-blue-600 hover:bg-blue-700">
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue || 0)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Closed Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Booking Calculator Leads - Prominent Section */}
      {bookingLeads.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Booking Calculator Leads
            </h2>
            <Badge color="blue" className="text-sm">
              {bookingLeads.length} new
            </Badge>
          </div>
          
          <div className="space-y-3">
            {bookingLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="font-medium">{formatCurrency(lead.value)}</span>
                    {lead.useRut && (
                      <span className="ml-2 text-green-600">• RUT Applied</span>
                    )}
                    {lead.area && (
                      <span className="ml-2">• {lead.area}m²</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(lead.createdAt)}
                  </span>
                  <Button 
                    size="sm" 
                    href={`/crm/${companyId}/leads/${lead.id}`}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {bookingLeads.length > 5 && (
            <div className="mt-4 text-center">
              <Button 
                href={`/crm/${companyId}/leads?source=booking-calculator`}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View All Booking Leads ({bookingLeads.length})
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <Button 
              size="sm" 
              href={`/crm/${companyId}/leads`}
              className="bg-gray-600 hover:bg-gray-700"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Customers */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
            <Button 
              size="sm" 
              href={`/crm/${companyId}/customers`}
              className="bg-gray-600 hover:bg-gray-700"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(customer.totalSpent || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            href={`/crm/${companyId}/leads/new`}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add New Lead
          </Button>
          <Button 
            href={`/crm/${companyId}/customers/new`}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserGroupIcon className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button 
            href={`/crm/${companyId}/deals/new`}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
            Create Deal
          </Button>
        </div>
      </Card>
    </div>
  );
} 