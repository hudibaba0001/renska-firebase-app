import React, { useState, useMemo, useEffect } from 'react';
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
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { Link } from 'react-router-dom';
import { SystemAlertsCenter } from '../components/NotificationCenter';
import ReportExporter from '../components/ReportExporter';
import ErrorBoundary from '../components/ErrorBoundary';
import { getAllTenants } from '../services/firestore';

// Import chart library - We'll use Chart.js via react-chartjs-2
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);



export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const lastUpdated = new Date();
  
  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('SuperAdminDashboardPage: Fetching companies...');
      const fetchedCompanies = await getAllTenants();
      console.log('SuperAdminDashboardPage: Fetched companies:', fetchedCompanies);
      setCompanies(fetchedCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const activeCompanies = companies.filter(c => c.subscription?.active !== false).length;
    const suspendedCompanies = companies.filter(c => c.subscription?.active === false).length;
    const totalRevenue = companies.reduce((sum, c) => sum + (c.subscription?.amount || 0), 0);
    
    return {
      activeCompanies,
      suspendedCompanies,
      mrr: totalRevenue,
      arr: totalRevenue * 12,
      churnRate: 2.5, // Mock for now
      cac: 1200, // Mock for now
      ltv: 15000, // Mock for now
      totalUsers: companies.length * 10 // Mock calculation
    };
  }, [companies]);
  
  const refresh = () => {
    fetchCompanies();
  };
  
  // Chart data and options
  const [mrrData, setMrrData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'MRR (SEK)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });
  
  const [churnData, setChurnData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Churn Rate (%)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });
  
  const [companyStatusData, setCompanyStatusData] = useState({
    labels: ['Active', 'Suspended', 'Trial', 'Churned'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  });
  
  const [ltvCacData, setLtvCacData] = useState({
    labels: ['2024', '2025'],
    datasets: [
      {
        label: 'LTV (SEK)',
        data: [0, 0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'CAC (SEK)',
        data: [0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Update chart data when companies change
  useEffect(() => {
    if (companies.length > 0) {
      const { mrr, activeCompanies, suspendedCompanies, churnRate, ltv, cac } = metrics;
      
      // Update MRR chart with mock historical data
      setMrrData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'MRR (SEK)',
            data: [mrr * 0.7, mrr * 0.75, mrr * 0.8, mrr * 0.85, mrr * 0.9, mrr * 0.95, mrr],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      });
      
      // Update churn rate chart
      setChurnData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Churn Rate (%)',
            data: [5.2, 4.8, 4.5, 4.2, 3.9, 3.7, churnRate],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      });
      
      // Update company status distribution
      setCompanyStatusData({
        labels: ['Active', 'Suspended', 'Trial', 'Churned'],
        datasets: [
          {
            data: [activeCompanies, suspendedCompanies, 3, 5],
            backgroundColor: [
              'rgba(75, 192, 192, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)',
            ],
            borderColor: [
              'rgb(75, 192, 192)',
              'rgb(255, 159, 64)',
              'rgb(54, 162, 235)',
              'rgb(255, 99, 132)',
            ],
            borderWidth: 1,
          },
        ],
      });
      
      // Update LTV:CAC ratio chart
      setLtvCacData({
        labels: ['2024', '2025'],
        datasets: [
          {
            label: 'LTV (SEK)',
            data: [ltv * 0.8, ltv],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'CAC (SEK)',
            data: [cac * 1.2, cac],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      });
    }
    }, [companies, metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate trend indicators
  const getTrend = (value, target, isHigherBetter = true) => {
    if (value === target) return "neutral";
    return (value > target) === isHigherBetter ? "positive" : "negative";
  };

  // Key metrics for the stats grid
  const stats = [
    {
      name: 'Active Companies',
      value: metrics.activeCompanies,
      target: 10,
      trend: getTrend(metrics.activeCompanies, 10),
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      name: 'Suspended Companies',
      value: metrics.suspendedCompanies,
      target: 2,
      trend: getTrend(metrics.suspendedCompanies, 2, false),
      icon: XCircleIcon,
      color: 'yellow'
    },
    {
      name: 'Monthly Recurring Revenue',
      value: formatCurrency(metrics.mrr),
      target: 50000,
      trend: getTrend(metrics.mrr, 50000),
      icon: BanknotesIcon,
      color: 'green'
    },
    {
      name: 'Annual Recurring Revenue',
      value: formatCurrency(metrics.arr),
      target: 600000,
      trend: getTrend(metrics.arr, 600000),
      icon: CreditCardIcon,
      color: 'purple'
    },
    {
      name: 'Churn Rate',
      value: formatPercentage(metrics.churnRate),
      target: 5,
      trend: getTrend(metrics.churnRate, 5, false),
      icon: ArrowTrendingUpIcon,
      color: 'red'
    },
    {
      name: 'Customer Acquisition Cost',
      value: formatCurrency(metrics.cac),
      target: 6000,
      trend: getTrend(metrics.cac, 6000, false),
      icon: BanknotesIcon,
      color: 'indigo'
    },
    {
      name: 'Lifetime Value',
      value: formatCurrency(metrics.ltv),
      target: 20000,
      trend: getTrend(metrics.ltv, 20000),
      icon: CreditCardIcon,
      color: 'green'
    },
    {
      name: 'Total Active Users',
      value: metrics.totalActiveUsers,
      target: 100,
      trend: getTrend(metrics.totalActiveUsers, 100),
      icon: UserGroupIcon,
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-6 overflow-x-hidden w-full box-border">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SwedPrime Superadmin Dashboard</h1>
            <p className="text-base text-purple-100">
              Platform overview and performance metrics
            </p>
            {lastUpdated && (
              <p className="text-sm text-purple-200 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString('sv-SE')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              color="purple"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {loading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <ArrowPathIcon className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <ReportExporter type="superadmin" />
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-px h-12 bg-purple-400"></div>
              <div className="text-right">
                <p className="text-base text-purple-100">Today's Date</p>
                <p className="text-xl font-bold text-white">July 18, 2025</p>
              </div>
              <div className="w-px h-12 bg-purple-400"></div>
              <div className="text-right">
                <p className="text-base text-purple-100">Fiscal Quarter</p>
                <p className="text-xl font-bold text-white">Q3 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === "positive" && (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              )}
              {stat.trend === "negative" && (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${
                stat.trend === "positive" ? "text-green-500" : 
                stat.trend === "negative" ? "text-red-500" : "text-gray-500"
              }`}>
                {stat.trend === "positive" ? "On target" : 
                 stat.trend === "negative" ? "Below target" : "Neutral"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">Monthly Recurring Revenue (MRR)</h5>
          <div className="h-80">
            <ErrorBoundary fallbackMessage="Unable to load MRR chart">
              <Line options={chartOptions} data={mrrData} />
            </ErrorBoundary>
          </div>
        </Card>

        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">Churn Rate Trend</h5>
          <div className="h-80">
            <ErrorBoundary fallbackMessage="Unable to load churn rate chart">
              <Line options={chartOptions} data={churnData} />
            </ErrorBoundary>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">Company Status Distribution</h5>
          <div className="h-80 flex justify-center items-center">
            <div style={{ width: '80%', height: '80%' }}>
              <ErrorBoundary fallbackMessage="Unable to load company status chart">
                <Pie options={chartOptions} data={companyStatusData} />
              </ErrorBoundary>
            </div>
          </div>
        </Card>

        <Card className="w-full h-96">
          <h5 className="text-lg font-bold">LTV vs CAC</h5>
          <div className="h-80">
            <ErrorBoundary fallbackMessage="Unable to load LTV vs CAC chart">
              <Bar options={chartOptions} data={ltvCacData} />
            </ErrorBoundary>
          </div>
        </Card>
      </div>

      {/* Recent Companies */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">Recent Companies</h5>
          <Button size="sm" color="purple" as={Link} to="/superadmin/companies">
            View All
          </Button>
        </div>
        <ErrorBoundary fallbackMessage="Unable to load recent companies table">
          {companies && companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Company Name</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Subscription</th>
                    <th scope="col" className="px-6 py-3">MRR</th>
                    <th scope="col" className="px-6 py-3">Users</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.slice(0, 5).map((company) => {
                    // Defensive programming - ensure company has required properties
                    if (!company || !company.id) {
                      return null;
                    }
                    
                    return (
                      <tr key={company.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {company.companyName || "Unnamed Company"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={company.subscriptionStatus === 'active' ? 'success' : 'warning'}>
                            {company.subscriptionStatus || "Unknown"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {company.subscriptionPlan || "No Plan"}
                        </td>
                        <td className="px-6 py-4">
                          {formatCurrency(company.subscriptionAmount || 0)}
                        </td>
                        <td className="px-6 py-4">
                          {company.userCount || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Button size="xs" as={Link} to={`/superadmin/companies/${company.id}`}>
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="md" className="mr-2" />
                  Loading companies...
                </div>
              ) : (
                "No companies found"
              )}
            </div>
          )}
        </ErrorBoundary>
      </Card>

      {/* System Alerts */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">System Alerts</h5>
          <Badge color="gray">Live</Badge>
        </div>
        <SystemAlertsCenter />
      </Card>
    </div>
  );
}
