
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
  Spinner,
  Modal
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
  TrashIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'; 
// import { 
//   getAllServicesForCompany
// } from '../services/firestore';
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { getRecentBookings, getCompanyMetrics } from '../services/analytics';
import CompanyMetrics from '../components/CompanyMetrics';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [isNewCompany, setIsNewCompany] = useState(false);
  // const [services, setServices] = useState([]); // Removed unused services state
  const [recentBookings, setRecentBookings] = useState([]);
  const [calculators, setCalculators] = useState([]);
  const [realStats, setRealStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    conversionRate: 0,
    activeCalculators: 0
  });
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [calculatorToDelete, setCalculatorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const stats = [
    {
      name: 'Total Revenue',
      value: realStats.totalRevenue.toLocaleString(),
      unit: 'kr',
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'blue',
      description: 'vs last month'
    },
    {
      name: 'Active Bookings',
      value: realStats.activeBookings.toString(),
      unit: '',
      change: '+8',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'green',
      description: 'this month'
    },
    {
      name: 'Conversion Rate',
      value: realStats.conversionRate.toFixed(1),
      unit: '%',
      change: '+2.1%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'yellow',
      description: 'vs last month'
    },
    {
      name: 'Active Calculators',
      value: realStats.activeCalculators.toString(),
      unit: '',
      change: `+${realStats.activeCalculators}`,
      changeType: realStats.activeCalculators > 0 ? 'positive' : 'neutral',
      icon: DocumentDuplicateIcon,
      color: 'purple',
      description: 'published'
    }
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      if (!companyId) return;
      setLoading(true);
      
      let calculatorsData = []; // Declare outside try block
      
      try {
        console.log('Fetching dashboard data for company:', companyId);
        
        // Get company data from Firestore directly
        const db = getFirestore();
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        const companyData = companyDoc.exists() ? companyDoc.data() : null;
        console.log('Company data:', companyData);
        
        // Get services (commented out as not used in current design)
        // const fetchedServices = await getAllServicesForCompany(companyId);
        // console.log('Fetched services:', fetchedServices);
        
        // Get calculators from subcollection
        const calculatorsRef = collection(db, 'companies', companyId, 'calculators');
        console.log('Fetching calculators from:', `companies/${companyId}/calculators`);
        const calculatorsSnapshot = await getDocs(calculatorsRef);
        calculatorsData = calculatorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched calculators:', calculatorsData);
        console.log('Calculator count:', calculatorsData.length);
        
        // Get bookings and metrics
        const [
          bookingsData,
          metricsData
        ] = await Promise.allSettled([
          getRecentBookings(companyId, { limit: 3 }),
          getCompanyMetrics(companyId)
        ]);

        if (companyData?.created) {
            const creationDate = companyData.created.toDate ? companyData.created.toDate() : new Date(companyData.created);
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);
            setIsNewCompany(creationDate > oneHourAgo);
        }

        // setServices(fetchedServices);
        setCalculators(calculatorsData);
        setRecentBookings(bookingsData.status === 'fulfilled' ? bookingsData.value : []);

        const publishedCalculators = calculatorsData.filter(calc => calc.status === 'published');
        console.log('Published calculators:', publishedCalculators);
        
        // Use default values if metrics fail to load
        const safeMetrics = metricsData.status === 'fulfilled' ? metricsData.value : {
          totalRevenue: 0,
          totalBookings: 0,
          abandonmentRate: 0
        };
        
        setRealStats({
          totalRevenue: safeMetrics.totalRevenue,
          activeBookings: safeMetrics.totalBookings,
          conversionRate: safeMetrics.abandonmentRate, // Example, might need better metric
          activeCalculators: publishedCalculators.length
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Even if there's an error, we might have partial data
        if (calculatorsData.length > 0) {
          setCalculators(calculatorsData);
          const publishedCalculators = calculatorsData.filter(calc => calc.status === 'published');
          setRealStats(prev => ({
            ...prev,
            activeCalculators: publishedCalculators.length
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [companyId]);

  // Generate real calculator stats from fetched data
  const calculatorStats = calculators.map(calc => ({
    id: calc.id,
    name: calc.name || 'Unnamed Calculator',
    views: calc.views || 0,
    conversions: calc.conversions || 0,
    revenue: calc.revenue || '0 kr',
    status: calc.status || 'draft',
    trend: calc.trend || '+0%',
    slug: calc.slug,
    publishedAt: calc.publishedAt
  }));

  console.log('Calculator stats generated:', calculatorStats);
  console.log('Calculator stats length:', calculatorStats.length);

  const quickActions = [
    {
      title: 'Create Calculator',
      description: 'Build a new booking form',
      href: `/admin/${companyId}/forms/new`,
      icon: PlusIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Performance insights',
      href: `/admin/${companyId}/analytics`,
      icon: ChartBarIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Field Management',
      description: 'Manage jobs and crews',
      href: `/admin/${companyId}/fms`,
      icon: ClockIcon,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'CRM',
      description: 'Customer management',
      href: `/admin/${companyId}/crm-data`,
      icon: UsersIcon,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Manage Bookings',
      description: 'Review customer bookings',
      href: `/admin/${companyId}/bookings`,
      icon: DocumentTextIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
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
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || colors.blue;
  };

  // Delete calculator function
  const handleDeleteCalculator = (calculator) => {
    setCalculatorToDelete(calculator);
    setShowDeleteModal(true);
  };

  const confirmDeleteCalculator = async () => {
    if (!calculatorToDelete) return;
    
    setDeleting(true);
    try {
      const db = getFirestore();
      const calculatorRef = doc(db, 'companies', companyId, 'calculators', calculatorToDelete.id);
      await deleteDoc(calculatorRef);
      
      // Remove from local state
      setCalculators(prev => prev.filter(calc => calc.id !== calculatorToDelete.id));
      
      toast.success('Calculator deleted successfully');
      setShowDeleteModal(false);
      setCalculatorToDelete(null);
    } catch (error) {
      console.error('Error deleting calculator:', error);
      toast.error('Failed to delete calculator');
    } finally {
      setDeleting(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section for New Companies */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
          <div className="flex flex-col items-center text-center py-6">
            <h1 className="text-3xl font-bold mb-4">Welcome to SwedPrime! 🎉</h1>
            <p className="text-xl max-w-2xl">
              Congratulations on setting up your account! Let's get started by configuring your cleaning services.
            </p>
          </div>
        </div>
        
        <Alert color="info" className="mb-6">
          <div className="font-medium">
            Your account has been successfully created
          </div>
          <div className="mt-2">
            Follow the steps below to set up your cleaning business calculator.
          </div>
        </Alert>
        
        {/* Getting Started Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`${action.bgColor} p-4 rounded-lg hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color === 'blue' ? 'from-blue-500 to-blue-600' : action.color === 'green' ? 'from-green-500 to-green-600' : action.color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'} mr-3`}>
                    {action.icon && typeof action.icon === 'function' ? 
                      <action.icon className="w-5 h-5 text-white" /> : 
                      <ChartBarIcon className="w-5 h-5 text-white" />}
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

  // For established companies, show the professional dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button as={Link} to={`/admin/${companyId}/forms/new`} color="blue" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Calculator
            </Button>
            <Button as={Link} to={`/admin/${companyId}/fms`} color="indigo" size="sm">
              <ClockIcon className="w-4 h-4 mr-2" />
              Field Management
            </Button>
            <Button as={Link} to={`/admin/${companyId}/crm-data`} color="gray" size="sm">
              <UsersIcon className="w-4 h-4 mr-2" />
              CRM
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.unit && (
                    <span className="ml-1 text-sm text-gray-500">{stat.unit}</span>
                  )}
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  } flex items-center`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{stat.description}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                {stat.icon && typeof stat.icon === 'function' ? 
                  <stat.icon className="w-5 h-5 text-white" /> : 
                  <ChartBarIcon className="w-5 h-5 text-white" />}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions - Compact */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className={`${action.bgColor} p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatColor(action.color)}`}>
                      {action.icon && typeof action.icon === 'function' ? 
                        <action.icon className="w-4 h-4 text-white" /> : 
                        <ChartBarIcon className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h3 className={`font-medium text-sm ${action.textColor}`}>
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Overview - Compact */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Form Views</span>
                  <span className="font-medium">2,315</span>
                </div>
                <Progress progress={75} color="gray" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Conversions</span>
                  <span className="font-medium">151</span>
                </div>
                <Progress progress={45} color="green" size="sm" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Revenue Goal</span>
                  <span className="font-medium">45,230 kr</span>
                </div>
                <Progress progress={68} color="yellow" size="sm" />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Great Performance!
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Conversion rate increased by 12% this week.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Bookings - Compact */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Button as={Link} to={`/admin/${companyId}/bookings`} color="gray" size="sm">
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Avatar img={booking.avatar} size="sm" rounded />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                        <div className="text-xs text-gray-500">{booking.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{booking.service}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3 text-gray-400" />
                      <span>{booking.date}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{booking.amount}</td>
                  <td className="px-3 py-2">
                    <Badge color={getStatusColor(booking.status)} size="sm">
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <Button size="xs" color="gray">
                        <EyeIcon className="w-3 h-3" />
                      </Button>
                      <Dropdown arrowIcon={false} inline label={<span className="inline-block px-1 py-1 bg-gray-100 rounded text-xs cursor-pointer">•••</span>}>
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

      {/* Calculator Performance - Compact */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Calculator Performance</h2>
          <Button as={Link} to={`/admin/${companyId}/forms/new`} color="blue" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Calculator
          </Button>
        </div>

        {calculatorStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculatorStats.map((calc) => (
              <div
                key={calc.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{calc.name}</h3>
                  <Badge color={calc.status === 'published' ? 'success' : 'warning'} size="sm">
                    {calc.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{calc.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Conversions</span>
                    <span className="font-medium">{calc.conversions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">{calc.revenue}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-medium">{calc.trend}</span>
                  <div className="flex space-x-1">
                    <Button as={Link} to={`/admin/${companyId}/forms/${calc.id}`} size="xs" color="gray">Edit</Button>
                    {calc.status === 'published' && calc.slug && (
                      <Button as={Link} to={`/booking/${companyId}/${calc.slug}`} size="xs" color="gray" target="_blank">Live</Button>
                    )}
                    <Button 
                      onClick={() => handleDeleteCalculator(calc)} 
                      size="xs" color="failure"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CogIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Calculators Yet</h3>
            <p className="text-xs text-gray-500 mb-3">
              Create your first booking calculator to start accepting customer bookings.
            </p>
            <Button as={Link} to={`/admin/${companyId}/forms/new`} color="blue" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Calculator
            </Button>
          </div>
        )}
      </Card>

      {/* Enhanced Company Metrics */}
      <CompanyMetrics companyId={companyId} />

      {/* System Alerts */}
      <Alert color="info" className="border-l-4 border-blue-500">
        <ExclamationTriangleIcon className="w-5 h-5" />
        <span className="font-medium">System Update:</span> New analytics features are now available! 
        <Link to={`/admin/${companyId}/analytics`} className="underline font-medium ml-1">
          Check them out →
        </Link>
      </Alert>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Delete Calculator</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Calculator
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete "{calculatorToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={confirmDeleteCalculator} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Calculator'}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}