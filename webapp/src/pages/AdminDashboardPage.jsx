import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../firebase/init';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Card, 
  Button, 
  Badge, 
  Progress, 
  Avatar, 
  Dropdown,
  Table,
  Alert,
  Spinner
} from 'flowbite-react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  UserGroupIcon,
  CreditCardIcon,
  CalendarIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
  const { companyId } = useParams();
  const [_, setTimeRange] = useState('7d');
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');

  // Fetch company services
  useEffect(() => {
    async function fetchServices() {
      if (!companyId) return;
      
      setServicesLoading(true);
      setServicesError('');
      try {
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          const companyData = companySnap.data();
          setServices(companyData.services || []);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServicesError('Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    }
    
    fetchServices();
  }, [companyId]);

  // Simulate real-time data updates
  const [stats] = useState([
    {
      name: 'Total Revenue',
      value: '45,230',
      unit: 'kr',
      change: '+12.5%',
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'blue',
      description: 'vs last month'
    },
    {
      name: 'Active Bookings',
      value: '127',
      unit: '',
      change: '+23',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'green',
      description: 'this month'
    },
    {
      name: 'Conversion Rate',
      value: '3.2',
      unit: '%',
      change: '+0.5%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'yellow',
      description: 'vs last month'
    },
    {
      name: 'Active Calculators',
      value: '3',
      unit: '',
      change: '+1',
      changeType: 'positive',
      icon: CogIcon,
      color: 'purple',
      description: 'published'
    }
  ]);

  const recentBookings = [
    {
      id: 'BK-2024-001',
      customer: 'Anna Andersson',
      service: 'Hemstädning Premium',
      amount: '1,200 kr',
      status: 'confirmed',
      date: '2024-01-15',
      time: '10:00',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 'BK-2024-002',
      customer: 'Erik Svensson',
      service: 'Window Cleaning',
      amount: '950 kr',
      status: 'pending',
      date: '2024-01-16',
      time: '14:30',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 'BK-2024-003',
      customer: 'Maria Johansson',
      service: 'Deep Clean',
      amount: '1,850 kr',
      status: 'completed',
      date: '2024-01-14',
      time: '09:00',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const calculatorStats = [
    {
      name: 'Hemstädning Premium',
      views: 1247,
      conversions: 89,
      revenue: '28,450 kr',
      status: 'published',
      trend: '+15%'
    },
    {
      name: 'Window Cleaning',
      views: 623,
      conversions: 34,
      revenue: '12,800 kr',
      status: 'published',
      trend: '+8%'
    },
    {
      name: 'Deep Clean Special',
      views: 445,
      conversions: 28,
      revenue: '15,200 kr',
      status: 'draft',
      trend: '+12%'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Calculator',
      description: 'Build a custom booking form for your services',
      href: `/admin/${companyId}/forms/new`,
      icon: PlusIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Detailed performance metrics and insights',
      href: `/admin/${companyId}/analytics`,
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Manage Bookings',
      description: 'Review and process customer bookings',
      href: `/admin/${companyId}/bookings`,
      icon: DocumentTextIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Customer Management',
      description: 'View and manage customer relationships',
      href: `/admin/${companyId}/customers`,
      icon: UserGroupIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'failure';
      default: return 'gray';
    }
  };

  const getStatColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100">
              Here's what's happening with your cleaning business today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Today's Revenue</p>
              <p className="text-2xl font-bold">2,340 kr</p>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-right">
              <p className="text-sm text-blue-100">New Bookings</p>
              <p className="text-2xl font-bold">7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.unit && (
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                      {stat.unit}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getStatColor(stat.color)}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <div className={`flex items-center text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {stat.description}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                <p className="text-gray-500 dark:text-gray-400">Common tasks to manage your business</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Card
                  key={action.title}
                  className={`block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md ${action.bgColor} dark:bg-gray-800`}
                >
                  <Link
                    to={action.href}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${action.textColor} dark:text-white`}>
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Overview */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Overview
              </h3>
              <Dropdown
                arrowIcon={false}
                inline
                label={<span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs cursor-pointer">Last 7 days</span>}
              >
                <Dropdown.Item onClick={() => setTimeRange('24h')}>Last 24 hours</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange('7d')}>Last 7 days</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange('30d')}>Last 30 days</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange('90d')}>Last 90 days</Dropdown.Item>
              </Dropdown>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Form Views</span>
                  <span className="font-medium">2,315</span>
                </div>
                <Progress progress={75} color="blue" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Conversions</span>
                  <span className="font-medium">151</span>
                </div>
                <Progress progress={45} color="green" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Revenue Goal</span>
                  <span className="font-medium">45,230 kr</span>
                </div>
                <Progress progress={68} color="yellow" size="sm" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-start space-x-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Great Performance!
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                    Your conversion rate increased by 12% this week. Keep up the excellent work!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
            <p className="text-gray-500 dark:text-gray-400">Latest customer bookings and their status</p>
          </div>
          <Button as={Link} to={`/admin/${companyId}/bookings`} color="blue" size="sm">
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Customer</Table.HeadCell>
              <Table.HeadCell>Service</Table.HeadCell>
              <Table.HeadCell>Date & Time</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {recentBookings.map((booking) => (
                <Table.Row key={booking.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-3">
                      <Avatar img={booking.avatar} size="sm" rounded />
                      <div>
                        <div className="font-semibold">{booking.customer}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.id}</div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{booking.service}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{booking.date}</span>
                      <ClockIcon className="w-4 h-4 text-gray-400 ml-2" />
                      <span>{booking.time}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-semibold">{booking.amount}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(booking.status)} size="sm">
                      {booking.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Button color="gray" size="xs">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Dropdown arrowIcon={false} inline label={<span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs cursor-pointer">•••</span>}>
                        <Dropdown.Item>Edit</Dropdown.Item>
                        <Dropdown.Item>Contact Customer</Dropdown.Item>
                        <Dropdown.Item>Cancel Booking</Dropdown.Item>
                      </Dropdown>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Calculator Performance */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calculator Performance</h2>
            <p className="text-gray-500 dark:text-gray-400">How your booking forms are performing</p>
          </div>
          <Button as={Link} to={`/admin/${companyId}/forms/new`} color="blue" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Calculator
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculatorStats.map((calc) => (
            <Card
              key={calc.name}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{calc.name}</h3>
                <Badge color={calc.status === 'published' ? 'success' : 'warning'} size="sm">
                  {calc.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-medium">{calc.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Conversions</span>
                  <span className="font-medium">{calc.conversions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-medium">{calc.revenue}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-green-600 font-medium">{calc.trend}</span>
                <div className="flex space-x-2">
                  <Button color="gray" size="xs">Edit</Button>
                  <Button color="gray" size="xs">View</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Configured Services */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configured Services</h2>
            <p className="text-gray-500 dark:text-gray-400">Your available cleaning services</p>
          </div>
          <Button as={Link} to={`/admin/${companyId}/config`} color="blue" size="sm">
            <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
            Configure Services
          </Button>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : servicesError ? (
          <Alert color="failure" className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="ml-2">{servicesError}</span>
          </Alert>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">No Services Configured</p>
            <p className="text-sm mb-4">Set up your first cleaning service to get started</p>
            <Button as={Link} to={`/admin/${companyId}/config`} color="blue">
              <PlusIcon className="h-4 w-4 mr-1" />
              Add First Service
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{service.name || 'Unnamed Service'}</h3>
                  <Badge color={service.enabled !== false ? "success" : "gray"} size="sm">
                    {service.enabled !== false ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{service.description || 'No description'}</p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="font-medium">{service.basePrice || 0} DKK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pricing:</span>
                    <span className="capitalize">{service.pricingModel?.replace('_', ' ') || 'fixed'}</span>
                  </div>
                  {service.pricingModel === 'per_sqm' && service.pricePerSqm && (
                    <div className="flex justify-between">
                      <span>Per SQM:</span>
                      <span className="font-medium">{service.pricePerSqm} DKK</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 font-medium">Ready to use</span>
                  <Button as={Link} to={`/admin/${companyId}/config`} color="gray" size="xs">
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* System Alerts */}
      <Alert color="info" className="border-l-4 border-blue-500">
        <ExclamationTriangleIcon className="w-5 h-5" />
        <span className="font-medium">System Update:</span> New analytics features are now available! 
        <Link to={`/admin/${companyId}/analytics`} className="underline font-medium ml-1">
          Check them out →
        </Link>
      </Alert>
    </div>
  );
} 