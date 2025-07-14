import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Badge, 
  Progress, 
  Avatar, 
  Dropdown,
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export default function AdminDashboardPage() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [isNewCompany, setIsNewCompany] = useState(false);
  
  // Demo data for established companies
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

  // Fetch company data
  useEffect(() => {
    async function fetchCompanyData() {
      if (!companyId) return;
      
      try {
        const db = getFirestore();
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        
        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          
          // Check if company is new (created within the last hour)
          if (companyData.created) {
            const creationDate = companyData.created.toDate ? companyData.created.toDate() : new Date(companyData.created);
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);
            
            setIsNewCompany(creationDate > oneHourAgo);
          }
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanyData();
  }, [companyId]);

  const [recentBookings] = useState([
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
  ]);

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

  if (!companyId) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Error: No companyId found in route params.
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  // For new companies, show a welcome screen instead of demo data
  if (isNewCompany) {
    return (
      <div className="space-y-6 overflow-x-hidden w-full box-border">
        {/* Welcome Section for New Companies */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex flex-col items-center text-center py-6">
            <h1 className="text-3xl font-bold mb-4">Welcome to SwedPrime! 🎉</h1>
            <p className="text-xl max-w-2xl">
              Congratulations on setting up your account! Let's get started by configuring your cleaning services.
            </p>
          </div>
        </div>
        
        <Alert color="info">
          <div className="font-medium">
            Your account has been successfully created
          </div>
          <div className="mt-2">
            Follow the steps below to set up your cleaning business calculator.
          </div>
        </Alert>
        
        {/* Getting Started Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Configure Your Services</h3>
              <p className="text-gray-600 mb-4">Set up your pricing models, add-ons, and service options</p>
              <Button as={Link} to={`/admin/${companyId}/config`} color="blue">
                Configure Services
              </Button>
            </div>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Booking Form</h3>
              <p className="text-gray-600 mb-4">Build your first customer-facing booking calculator</p>
              <Button as={Link} to={`/admin/${companyId}/forms/new`} color="green">
                Create Form
              </Button>
            </div>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Manage Subscription</h3>
              <p className="text-gray-600 mb-4">Review your plan and payment details</p>
              <Button as={Link} to={`/admin/${companyId}/billing`} color="purple">
                Manage Billing
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`${action.bgColor} p-4 rounded-lg hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mr-3`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-medium ${action.textColor}`}>{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For established companies, show the regular dashboard with stats
  return (
    <div className="space-y-6 overflow-x-hidden w-full box-border">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-heading dark:text-white">Welcome back! 👋</h1>
            <p className="text-base text-text-main dark:text-white">
              Here's what's happening with your cleaning business today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-base text-text-main dark:text-white">Today's Revenue</p>
              <p className="text-2xl font-bold text-text-heading dark:text-white">2,340 kr</p>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-right">
              <p className="text-base text-text-main dark:text-white">New Bookings</p>
              <p className="text-2xl font-bold text-text-heading dark:text-white">7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-text-subtle dark:text-gray-400">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline mt-1">
                    <p className="text-2xl font-bold text-text-heading dark:text-white">
                      {stat.value}
                    </p>
                    {stat.unit && (
                      <span className="ml-1 text-base text-text-subtle dark:text-gray-400">
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
                <div className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                } flex items-center`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
                <span className="text-sm text-text-subtle dark:text-gray-400 ml-2">
                  {stat.description}
                </span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-heading dark:text-white">Quick Actions</h2>
                <p className="text-base text-text-subtle dark:text-gray-400">Common tasks to manage your business</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                >
                  <Link
                    to={action.href}
                    className={`block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md ${action.bgColor} dark:bg-gray-800`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${action.textColor} dark:text-white`}>
                          {action.title}
                        </h3>
                        <p className="text-base text-text-subtle dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Overview */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text-heading dark:text-white">
                Performance Overview
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-base mb-1">
                  <span className="text-base text-text-subtle dark:text-gray-400">Form Views</span>
                  <span className="font-medium">2,315</span>
                </div>
                <Progress progress={75} color="gray" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between text-base mb-1">
                  <span className="text-base text-text-subtle dark:text-gray-400">Conversions</span>
                  <span className="font-medium">151</span>
                </div>
                <Progress progress={45} color="green" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between text-base mb-1">
                  <span className="text-base text-text-subtle dark:text-gray-400">Revenue Goal</span>
                  <span className="font-medium">45,230 kr</span>
                </div>
                <Progress progress={68} color="yellow" size="sm" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-start space-x-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100">
                    Great Performance!
                  </h4>
                  <p className="text-base text-blue-700 dark:text-blue-200 mt-1">
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
            <h2 className="text-xl font-bold text-text-heading dark:text-white">Recent Bookings</h2>
            <p className="text-base text-text-subtle dark:text-gray-400">Latest customer bookings and their status</p>
          </div>
          <Button as={Link} to={`/admin/${companyId}/bookings`} color="gray" size="sm">
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left divide-y divide-gray-200">
            <thead className="bg-gray-100"><tr>
              <th className="px-4 py-3 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-text-heading dark:text-white">
                    <div className="flex items-center space-x-3">
                      <Avatar img={booking.avatar} size="sm" rounded />
                      <div>
                        <div className="font-semibold">{booking.customer}</div>
                        <div className="text-base text-text-subtle dark:text-gray-400">{booking.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{booking.service}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-text-subtle dark:text-gray-400" />
                      <span>{booking.date}</span>
                      <ClockIcon className="w-4 h-4 text-text-subtle dark:text-gray-400 ml-2" />
                      <span>{booking.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-semibold">{booking.amount}</span>
                  </td>
                  <td className="px-4 py-2">
                    <Badge color={getStatusColor(booking.status)} size="sm">
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Button color="gray" size="xs">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Dropdown arrowIcon={false} inline label={<span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer">•••</span>}>
                        <Dropdown.Item>Edit</Dropdown.Item>
                        <Dropdown.Item>Contact Customer</Dropdown.Item>
                        <Dropdown.Item>Cancel Booking</Dropdown.Item>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Calculator Performance */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-heading dark:text-white">Calculator Performance</h2>
            <p className="text-base text-text-subtle dark:text-gray-400">How your booking forms are performing</p>
          </div>
          <Button as={Link} to={`/admin/${companyId}/forms/new`} color="gray" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Calculator
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculatorStats.map((calc) => (
            <div
              key={calc.name}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-heading dark:text-white">{calc.name}</h3>
                <Badge color={calc.status === 'published' ? 'success' : 'warning'} size="sm">
                  {calc.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-base text-text-subtle dark:text-gray-400">Views</span>
                  <span className="font-medium">{calc.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-base text-text-subtle dark:text-gray-400">Conversions</span>
                  <span className="font-medium">{calc.conversions}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-base text-text-subtle dark:text-gray-400">Revenue</span>
                  <span className="font-medium">{calc.revenue}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-base text-green-600 font-medium">{calc.trend}</span>
                <div className="flex space-x-2">
                  <Button color="gray" size="xs">Edit</Button>
                  <Button color="gray" size="xs">View</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
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